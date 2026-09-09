"use client";

// ============================================================
// ADMIN VERIFICATION & KYC OPERATIONS HOOKS (Module 43)
// ============================================================
//
// TanStack Query wrappers over the verification-management service.
// Keys are scope-qualified by the acting operator's campus so a
// campus-scoped admin's cache can never leak rows/counts across
// campus boundaries. Vendor approve/reject mutations invalidate the
// whole `adminKeys.verifications` tree AND the `adminKeys.vendors`
// tree — the verdict lands in the shared overlay both consoles read.
// ============================================================

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminKeys } from "@/lib/query-keys";
import { verificationManagementService } from "@/services/admin";
import type { ManagedVerificationListQuery } from "@/types/admin";
import { useAdminSession } from "@/lib/admin/admin-auth-context";

function useActor() {
  const { admin } = useAdminSession();
  if (!admin) {
    throw new Error("Admin verification hooks require an authenticated admin session");
  }
  return admin;
}

export function useAdminVerifications(query: ManagedVerificationListQuery) {
  const admin = useActor();
  return useQuery({
    queryKey: adminKeys.verifications.list(query, admin.campusId),
    queryFn: () => verificationManagementService.list(query, { actor: admin }),
  });
}

export function useAdminVerificationCounts() {
  const admin = useActor();
  return useQuery({
    queryKey: adminKeys.verifications.counts(admin.campusId),
    queryFn: () => verificationManagementService.getCounts({ actor: admin }),
  });
}

export function useAdminVerificationTypes() {
  const admin = useActor();
  return useQuery({
    queryKey: adminKeys.verifications.types(admin.campusId),
    queryFn: () => verificationManagementService.getTypes({ actor: admin }),
  });
}

export function useAdminVerification(id: string) {
  const admin = useActor();
  return useQuery({
    queryKey: adminKeys.verifications.detail(id, admin.campusId),
    queryFn: () => verificationManagementService.getById(id, { actor: admin }),
  });
}

function useTreeInvalidator() {
  const queryClient = useQueryClient();
  return {
    invalidate: () => {
      void queryClient.invalidateQueries({ queryKey: adminKeys.verifications.all });
      void queryClient.invalidateQueries({ queryKey: adminKeys.vendors.all });
    },
  };
}

export function useAdminVerificationApproveMutation() {
  const { invalidate } = useTreeInvalidator();
  const admin = useActor();
  return useMutation({
    mutationFn: (id: string) => verificationManagementService.approve(id, { actor: admin }),
    onSuccess: invalidate,
  });
}

export function useAdminVerificationRejectMutation() {
  const { invalidate } = useTreeInvalidator();
  const admin = useActor();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      verificationManagementService.reject(id, reason, { actor: admin }),
    onSuccess: invalidate,
  });
}