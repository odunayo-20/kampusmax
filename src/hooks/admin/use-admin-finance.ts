"use client";

// ============================================================
// ADMIN FINANCE RECONCILIATION & REPORTS HOOKS (Module 46)
// ============================================================
//
// TanStack Query wrappers over the finance-management service.
// Keys are NOT campus-scoped — finance records are restricted to full
// operators (ADMIN/SUPER_ADMIN) at the nav-permission layer, so there
// is no campus shard to leak across. Read-only namespace: the backend
// exposes no fee/settlement/invoice ledger and no payout or refund
// actions, so the console only reads the owning stores.
// ============================================================

import { useQuery } from "@tanstack/react-query";
import { adminKeys } from "@/lib/query-keys";
import { financeConsoleService } from "@/services/admin";
import type { ManagedFinanceReportId } from "@/types/admin";
import { useAdminSession } from "@/lib/admin/admin-auth-context";

function useActor() {
  const { admin } = useAdminSession();
  if (!admin) {
    throw new Error("Admin finance hooks require an authenticated admin session");
  }
  return admin;
}

export function useAdminFinanceOverview() {
  useActor();
  return useQuery({
    queryKey: adminKeys.finance.overview(),
    queryFn: () => financeConsoleService.getOverview(),
  });
}

export function useAdminFinanceReconciliation() {
  useActor();
  return useQuery({
    queryKey: adminKeys.finance.reconciliation(),
    queryFn: () => financeConsoleService.getReconciliation(),
  });
}

export function useAdminFinanceReport(id: ManagedFinanceReportId) {
  useActor();
  return useQuery({
    queryKey: adminKeys.finance.report(id),
    queryFn: () => financeConsoleService.getReport(id),
  });
}