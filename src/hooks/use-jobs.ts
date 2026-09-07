"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import {
  EmployerJobListQuery,
  JobListQuery,
  jobKeys,
} from "@/lib/query-keys";
import {
  closeJobForEmployer,
  createJobForEmployer,
  getDiscoverableOpportunity,
  getEmployerJob,
  getEmployerJobsPage,
  getEmployerJobsSummary,
  getOpportunitiesPage,
  getSavedJobsForUser,
  publishJobForEmployer,
  saveJobForUser,
  unsaveJobForUser,
  updateJobForEmployer,
} from "@/services/opportunity";
import type {
  Opportunity,
  OpportunityInput,
  OpportunityPage,
  OpportunityResult,
  OpportunityStatus,
} from "@/types/opportunity";
import { JOBS_PAGE_SIZE } from "@/config/jobs";

/**
 * Simulates network latency for the sync, in-memory store so the UI
 * exercises the same loading states it will against the real API.
 */
function delay(ms = 250): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Service calls return backend-style results. Mutations must THROW on a
 * non-ok result so TanStack Query's error/retry machinery works and the
 * friendly error mapper can translate the backend `code`.
 */
function throwIfNotOk(res: OpportunityResult, returnValue?: unknown): unknown {
  if (!res.ok) {
    throw Object.assign(new Error(res.message), { code: res.code });
  }
  return returnValue ?? res;
}

// ────────────────────────────────────────────────────────────────
// Marketplace reads (public discovery — OPEN only)
// ────────────────────────────────────────────────────────────────

/** Marketplace job list. Not user-scoped (public OPEN data only). */
export function useJobs(filters: JobListQuery) {
  const { status } = useAuth();
  const enabled = status === "authenticated";

  return useQuery({
    queryKey: jobKeys.list(filters),
    enabled,
    queryFn: async (): Promise<OpportunityPage> => {
      await delay();
      return getOpportunitiesPage({
        search: filters.search,
        categoryId: filters.categoryId,
        experience: filters.experience,
        arrangement: filters.arrangement as never,
        sort: filters.sort as never,
        page: filters.page,
        size: filters.size ?? JOBS_PAGE_SIZE,
      });
    },
  });
}

/**
 * Public job detail. Only discoverable (OPEN) jobs resolve; anything else —
 * draft, pending review or deleted — surfaces as NOT_FOUND so the UI never
 * reveals the existence of hidden postings.
 */
export function useJob(id: string) {
  const { status } = useAuth();
  const enabled = status === "authenticated" && !!id;

  return useQuery({
    queryKey: jobKeys.detail(id),
    enabled,
    queryFn: async (): Promise<Opportunity> => {
      await delay(0);
      const opportunity = getDiscoverableOpportunity(id);
      if (!opportunity) {
        throw Object.assign(new Error("Opportunity not found"), {
          code: "NOT_FOUND",
        });
      }
      return opportunity;
    },
  });
}

// ────────────────────────────────────────────────────────────────
// Saved jobs (per user)
// ────────────────────────────────────────────────────────────────

/** Saved job ids for the authenticated user. */
export function useSavedJobIds() {
  const { status, user } = useAuth();
  const userId = user?.id ?? null;
  const enabled = status === "authenticated" && !!userId;

  return useQuery({
    queryKey: jobKeys.saved(userId ?? ""),
    enabled,
    queryFn: async (): Promise<string[]> => {
      await delay(0);
      return getSavedJobsForUser().map((o) => o.id);
    },
  });
}

export function useSaveJob() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id ?? null;

  return useMutation({
    mutationFn: async (jobId: string) => {
      await delay(0);
      throwIfNotOk(saveJobForUser(jobId));
    },
    onSuccess: () => {
      if (userId) queryClient.invalidateQueries({ queryKey: jobKeys.saved(userId) });
    },
  });
}

export function useUnsaveJob() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id ?? null;

  return useMutation({
    mutationFn: async (jobId: string) => {
      await delay(0);
      throwIfNotOk(unsaveJobForUser(jobId));
    },
    onSuccess: () => {
      if (userId) queryClient.invalidateQueries({ queryKey: jobKeys.saved(userId) });
    },
  });
}

// ────────────────────────────────────────────────────────────────
// Employer reads (owner-scoped)
// ────────────────────────────────────────────────────────────────

/** Employer job list across spine statuses (owner-scoped). */
export function useEmployerJobs(filters: EmployerJobListQuery) {
  const { status, user } = useAuth();
  const userId = user?.id ?? null;
  const enabled = status === "authenticated" && !!userId;

  return useQuery({
    queryKey: jobKeys.employerList(userId ?? "", filters),
    enabled,
    queryFn: async (): Promise<OpportunityPage> => {
      await delay();
      return getEmployerJobsPage({
        status: filters.status as never,
        sort: filters.sort as never,
        page: filters.page,
        size: filters.size,
      });
    },
  });
}

/** Owner-scoped single job (any spine status). NOT_FOUND for non-owners. */
export function useEmployerJob(id: string) {
  const { status, user } = useAuth();
  const userId = user?.id ?? null;
  const enabled = status === "authenticated" && !!userId && !!id;

  return useQuery({
    queryKey: jobKeys.employerDetail(userId ?? "", id),
    enabled,
    queryFn: async (): Promise<Opportunity> => {
      await delay(0);
      const opportunity = getEmployerJob(id);
      if (!opportunity) {
        throw Object.assign(new Error("Job not found"), { code: "NOT_FOUND" });
      }
      return opportunity;
    },
  });
}

/** Per-status counts for the employer's filter tabs. */
export function useEmployerJobsSummary() {
  const { status, user } = useAuth();
  const userId = user?.id ?? null;
  const enabled = status === "authenticated" && !!userId;

  return useQuery({
    queryKey: jobKeys.employerCounts(userId ?? ""),
    enabled,
    queryFn: async (): Promise<Record<OpportunityStatus, number> & { all: number }> => {
      await delay(0);
      return getEmployerJobsSummary();
    },
  });
}

// ────────────────────────────────────────────────────────────────
// Employer mutations (owner-scoped, store-owned transitions)
// ────────────────────────────────────────────────────────────────

function invalidateAllJobs(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: jobKeys.all });
}

/** Creates a DRAFT job owned by the authenticated employer. */
export function useCreateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: OpportunityInput): Promise<Opportunity> => {
      await delay();
      return throwIfNotOk(createJobForEmployer(input)) as Opportunity;
    },
    onSuccess: () => invalidateAllJobs(queryClient),
  });
}

/** Updates a DRAFT job (owner + DRAFT only). */
export function useUpdateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: OpportunityInput }): Promise<Opportunity> => {
      await delay();
      return throwIfNotOk(updateJobForEmployer(id, input)) as Opportunity;
    },
    onSuccess: () => invalidateAllJobs(queryClient),
  });
}

/** DRAFT → PENDING_REVIEW (backend-owned transition, moderation = Module 32). */
export function usePublishJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<Opportunity> => {
      await delay();
      return throwIfNotOk(publishJobForEmployer(id)) as Opportunity;
    },
    onSuccess: () => invalidateAllJobs(queryClient),
  });
}

/** OPEN → CLOSED (owner retracts a live posting). */
export function useCloseJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<Opportunity> => {
      await delay();
      return throwIfNotOk(closeJobForEmployer(id)) as Opportunity;
    },
    onSuccess: () => invalidateAllJobs(queryClient),
  });
}