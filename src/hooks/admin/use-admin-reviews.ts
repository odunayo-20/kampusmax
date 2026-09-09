"use client";

// ============================================================
// ADMIN REVIEW MANAGEMENT HOOKS (Module 41)
// ============================================================
//
// TanStack Query wrappers over the read-only review-management service.
// Keys are scope-qualified by the acting operator's campus so a
// campus-scoped admin's cache can never leak rows/counts across campus
// boundaries. The console is deliberately read-only — no review store
// exposes admin moderation transitions, so there are no mutation hooks.
// ============================================================

import { useQuery } from "@tanstack/react-query";
import { adminKeys } from "@/lib/query-keys";
import { reviewManagementService } from "@/services/admin";
import type { ManagedReviewListQuery } from "@/types/admin";
import { useAdminSession } from "@/lib/admin/admin-auth-context";

function useActor() {
  const { admin } = useAdminSession();
  if (!admin) {
    throw new Error("Admin review hooks require an authenticated admin session");
  }
  return admin;
}

export function useAdminReviews(query: ManagedReviewListQuery) {
  const admin = useActor();
  return useQuery({
    queryKey: adminKeys.reviews.list(query, admin.campusId),
    queryFn: () => reviewManagementService.list(query),
  });
}

export function useAdminReviewCounts() {
  const admin = useActor();
  return useQuery({
    queryKey: adminKeys.reviews.counts(admin.campusId),
    queryFn: () => reviewManagementService.getCounts(),
  });
}

export function useAdminReviewFacets() {
  const admin = useActor();
  return useQuery({
    queryKey: adminKeys.reviews.facets(admin.campusId),
    queryFn: () => reviewManagementService.getFacets(),
  });
}

export function useAdminReview(id: string) {
  const admin = useActor();
  return useQuery({
    queryKey: adminKeys.reviews.detail(id, admin.campusId),
    queryFn: () => reviewManagementService.getById(id),
  });
}