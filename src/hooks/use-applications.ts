"use client";

import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import {
  applicationKeys,
  dashboardKeys,
  EmployerApplicationListQuery,
  jobKeys,
} from "@/lib/query-keys";
import {
  acceptApplication,
  getEmployerApplication,
  getEmployerApplicationsPage,
  getEmployerApplicationsSummary,
  rejectApplication,
  reviewApplication,
  shortlistApplication,
} from "@/services/opportunity";
import { getOrCreateDirectConversation } from "@/services/messages";
import type {
  EmployerApplicationStatus,
  EmployerApplicationsPage,
  EmployerApplicationSummary,
  OpportunityResult,
} from "@/types/opportunity";
import { APPLICATIONS_PAGE_SIZE } from "@/config/applications";

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
// Employer reads (owner-scoped)
// ────────────────────────────────────────────────────────────────

/** Employer application list — proposals on the owner's own jobs only. */
export function useEmployerApplications(filters: EmployerApplicationListQuery) {
  const { status, user } = useAuth();
  const userId = user?.id ?? null;
  const enabled = status === "authenticated" && !!userId;

  return useQuery({
    queryKey: applicationKeys.list(userId ?? "", filters),
    enabled,
    queryFn: async (): Promise<EmployerApplicationsPage> => {
      await delay();
      return getEmployerApplicationsPage({
        jobId: filters.jobId,
        status: filters.status,
        sort: filters.sort as never,
        search: filters.search,
        page: filters.page,
        size: filters.size ?? APPLICATIONS_PAGE_SIZE,
      });
    },
  });
}

/**
 * Owner-scoped single application. Non-existent and non-owned are identical
 * (NOT_FOUND) so the detail route never reveals other employers' candidates.
 */
export function useEmployerApplication(id: string) {
  const { status, user } = useAuth();
  const userId = user?.id ?? null;
  const enabled = status === "authenticated" && !!userId && !!id;

  return useQuery({
    queryKey: applicationKeys.detail(userId ?? "", id),
    enabled,
    queryFn: async (): Promise<EmployerApplicationSummary> => {
      await delay(0);
      const application = getEmployerApplication(id);
      if (!application) {
        throw Object.assign(new Error("Application not found"), {
          code: "NOT_FOUND",
        });
      }
      return application;
    },
  });
}

/** Per-status counts for the employer's filter tabs. */
export function useEmployerApplicationsSummary() {
  const { status, user } = useAuth();
  const userId = user?.id ?? null;
  const enabled = status === "authenticated" && !!userId;

  return useQuery({
    queryKey: applicationKeys.summary(userId ?? ""),
    enabled,
    queryFn: async (): Promise<
      Record<EmployerApplicationStatus | "all", number>
    > => {
      await delay(0);
      return getEmployerApplicationsSummary();
    },
  });
}

// ────────────────────────────────────────────────────────────────
// Employer mutations (owner-scoped, store-owned transitions)
// ────────────────────────────────────────────────────────────────

function invalidateApplicationData(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: applicationKeys.all });
  queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
}

function invalidateApplicationAndJobs(
  queryClient: ReturnType<typeof useQueryClient>
) {
  invalidateApplicationData(queryClient);
  queryClient.invalidateQueries({ queryKey: jobKeys.all });
}

/** SUBMITTED → UNDER_REVIEW */
export function useReviewApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await delay();
      throwIfNotOk(reviewApplication(id));
    },
    onSuccess: () => invalidateApplicationData(queryClient),
  });
}

/** SUBMITTED | UNDER_REVIEW → SHORTLISTED */
export function useShortlistApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await delay();
      throwIfNotOk(shortlistApplication(id));
    },
    onSuccess: () => invalidateApplicationData(queryClient),
  });
}

/** SUBMITTED | UNDER_REVIEW | SHORTLISTED → REJECTED (optional reason) */
export function useRejectApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      reason,
    }: {
      id: string;
      reason?: string;
    }): Promise<void> => {
      await delay();
      throwIfNotOk(rejectApplication(id, reason));
    },
    onSuccess: () => invalidateApplicationData(queryClient),
  });
}

/**
 * Hire: → ACCEPTED + job closed + PENDING_ACCEPTANCE contract created
 * (store-owned). Invalidates applications AND jobs (status/count changes).
 */
export function useAcceptApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await delay();
      throwIfNotOk(acceptApplication(id));
    },
    onSuccess: () => invalidateApplicationAndJobs(queryClient),
  });
}

// ────────────────────────────────────────────────────────────────
// Candidate messaging
// ────────────────────────────────────────────────────────────────

/**
 * Resolves the direct conversation between the authenticated employer and a
 * candidate, creating it first if needed (sync store, no artificial delay so
 * navigation into /chat/[id] isn't blocked). Returns null when the candidate
 * can't be messaged (unauthenticated or an unknown user id).
 */
export function useCandidateConversation() {
  const { user } = useAuth();
  const senderId = user?.id ?? null;

  return useCallback(
    async (candidateId: string): Promise<string | null> => {
      if (!senderId) return null;
      const result = getOrCreateDirectConversation(senderId, candidateId);
      return result ? result.conversation.id : null;
    },
    [senderId]
  );
}