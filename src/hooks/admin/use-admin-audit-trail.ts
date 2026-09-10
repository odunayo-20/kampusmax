"use client";

// ============================================================
// ADMIN AUDIT TRAIL HOOKS (Module 48)
// ============================================================
//
// TanStack Query wrappers over the read-only audit-trail service.
// Keys are neither user- nor campus-scoped: the console is gated to
// SUPER_ADMIN/ADMIN by nav permissions. Because audit records are
// IMMUTABLE there are no mutation hooks. `gcTime` is kept short so
// sensitive activity is not retained in the browser cache, and the
// list relies on normal mount/window-focus refetch (never polling)
// to reveal events recorded by mutations elsewhere in the console.
// ============================================================

import { useQuery } from "@tanstack/react-query";
import { adminKeys } from "@/lib/query-keys";
import { adminAuditTrailService } from "@/services/admin";
import type { AdminAuditQuery } from "@/types/admin";
import { useAdminSession } from "@/lib/admin/admin-auth-context";

const AUDIT_GC_TIME = 60 * 1000;

function useActor() {
  const { admin } = useAdminSession();
  if (!admin) {
    throw new Error("Admin audit hooks require an authenticated admin session");
  }
  return admin;
}

export function useAdminAuditEvents(query?: AdminAuditQuery) {
  useActor();
  return useQuery({
    queryKey: adminKeys.auditTrail.list(query ?? {}),
    queryFn: () => adminAuditTrailService.list(query),
    gcTime: AUDIT_GC_TIME,
  });
}

export function useAdminAuditEvent(id: string | null) {
  useActor();
  return useQuery({
    queryKey: adminKeys.auditTrail.detail(id ?? "none"),
    queryFn: () => (id ? adminAuditTrailService.getById(id) : null),
    enabled: !!id,
    gcTime: AUDIT_GC_TIME,
  });
}

export function useAdminAuditMetrics() {
  useActor();
  return useQuery({
    queryKey: adminKeys.auditTrail.metrics(),
    queryFn: () => adminAuditTrailService.getMetrics(),
    gcTime: AUDIT_GC_TIME,
  });
}

export function useAdminAuditActors() {
  useActor();
  return useQuery({
    queryKey: adminKeys.auditTrail.actors(),
    queryFn: () => adminAuditTrailService.getActorOptions(),
    gcTime: AUDIT_GC_TIME,
  });
}