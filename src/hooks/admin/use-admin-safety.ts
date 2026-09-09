"use client";

// ============================================================
// ADMIN TRUST & SAFETY HOOKS (Module 42)
// ============================================================
//
// TanStack Query wrappers over the read-only trust-safety service.
// Keys are scope-qualified by the acting operator's campus so a
// campus-scoped admin's cache can never leak rows/counts across campus
// boundaries. The console is deliberately read-only — no report store
// exposes report-level triage transitions, so there are no mutation hooks.
// ============================================================

import { useQuery } from "@tanstack/react-query";
import { adminKeys } from "@/lib/query-keys";
import { trustSafetyService } from "@/services/admin";
import type { TrustSafetyReportListQuery } from "@/types/admin";
import { useAdminSession } from "@/lib/admin/admin-auth-context";

function useActor() {
  const { admin } = useAdminSession();
  if (!admin) {
    throw new Error(
      "Admin trust & safety hooks require an authenticated admin session"
    );
  }
  return admin;
}

export function useAdminSafetyReports(query: TrustSafetyReportListQuery) {
  const admin = useActor();
  return useQuery({
    queryKey: adminKeys.trustSafety.list(query, admin.campusId),
    queryFn: () => trustSafetyService.list(query),
  });
}

export function useAdminSafetyCounts() {
  const admin = useActor();
  return useQuery({
    queryKey: adminKeys.trustSafety.counts(admin.campusId),
    queryFn: () => trustSafetyService.getCounts(),
  });
}

export function useAdminSafetyFacets() {
  const admin = useActor();
  return useQuery({
    queryKey: adminKeys.trustSafety.facets(admin.campusId),
    queryFn: () => trustSafetyService.getFacets(),
  });
}

export function useAdminSafetyReport(id: string) {
  const admin = useActor();
  return useQuery({
    queryKey: adminKeys.trustSafety.detail(id, admin.campusId),
    queryFn: () => trustSafetyService.getById(id),
  });
}