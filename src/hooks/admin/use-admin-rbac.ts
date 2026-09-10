"use client";

// ============================================================
// ADMIN ROLES & PERMISSIONS HOOKS (Module 49)
// ============================================================
//
// TanStack Query wrappers over the mock rbac service
// (`/admin/permissions` console + role detail). Keys are neither
// user- nor campus-scoped: the RBAC surface is restricted to full
// operators (SUPER_ADMIN/ADMIN) via nav permissions, so there is no
// campus shard. Mutations invalidate the whole `adminKeys.rbac`
// tree so the console and any open detail page refresh together.
//
// SECURITY NOTE: this data is DISPLAY/EDIT state only. The NestJS
// backend is the authority for what each permission maps to; the
// prototype never treats these matrices as enforcement.
// ============================================================

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminKeys } from "@/lib/query-keys";
import { rbacService } from "@/services/admin";
import { useAdminSession } from "@/lib/admin/admin-auth-context";
import type { AdminRoleKey, RolePermissionMatrix } from "@/types/admin";

function useActor() {
  const { admin } = useAdminSession();
  if (!admin) {
    throw new Error("Admin RBAC hooks require an authenticated admin session");
  }
  return admin;
}

export function useAdminRbacRoles() {
  useActor();
  return useQuery({
    queryKey: adminKeys.rbac.roles(),
    queryFn: () => rbacService.listRoles(),
  });
}

export function useAdminRbacRole(key: AdminRoleKey) {
  useActor();
  return useQuery({
    queryKey: adminKeys.rbac.detail(key),
    queryFn: () => rbacService.getRole(key),
  });
}

export function useUpdateRolePermissions() {
  useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      key,
      permissions,
    }: {
      key: AdminRoleKey;
      permissions: RolePermissionMatrix;
    }) => rbacService.updatePermissions(key, permissions),
    mutationKey: adminKeys.rbac.mutation(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminKeys.rbac.all });
    },
  });
}

export function useResetRolePermissions() {
  useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (key: AdminRoleKey) => rbacService.resetRole(key),
    mutationKey: adminKeys.rbac.mutation(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminKeys.rbac.all });
    },
  });
}