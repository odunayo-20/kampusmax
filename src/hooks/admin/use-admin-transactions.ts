"use client";

// ============================================================
// ADMIN TRANSACTIONS & PAYMENTS HOOKS (Module 44)
// ============================================================
//
// TanStack Query wrappers over the transaction-management service.
// Keys are NOT campus-scoped — financial records are restricted to full
// operators (ADMIN/SUPER_ADMIN) at the nav-permission layer, so there
// is no campus shard to leak across. Read-only namespace: the backend
// exposes no transaction-level mutations (refunds are order/wallet-level).
// ============================================================

import { useQuery } from "@tanstack/react-query";
import { adminKeys } from "@/lib/query-keys";
import { transactionManagementService } from "@/services/admin";
import type { ManagedTransactionListQuery } from "@/types/admin";
import { useAdminSession } from "@/lib/admin/admin-auth-context";

function useActor() {
  const { admin } = useAdminSession();
  if (!admin) {
    throw new Error("Admin transaction hooks require an authenticated admin session");
  }
  return admin;
}

export function useAdminTransactions(query: ManagedTransactionListQuery) {
  useActor();
  return useQuery({
    queryKey: adminKeys.transactions.list(query),
    queryFn: () => transactionManagementService.list(query),
  });
}

export function useAdminTransaction(id: string) {
  useActor();
  return useQuery({
    queryKey: adminKeys.transactions.detail(id),
    queryFn: () => transactionManagementService.getById(id),
  });
}

export function useAdminTransactionCounts() {
  useActor();
  return useQuery({
    queryKey: adminKeys.transactions.counts(),
    queryFn: () => transactionManagementService.getCounts(),
  });
}

export function useAdminTransactionFacets() {
  useActor();
  return useQuery({
    queryKey: adminKeys.transactions.facets(),
    queryFn: () => transactionManagementService.getFacets(),
  });
}