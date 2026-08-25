import {
  AdminRoleKey,
  RbacRole,
  RolePermissionMatrix,
} from "@/types/admin";
import { apiDelay } from "@/lib/admin/api";
import {
  buildRbacRoles,
  countGrantedPermissions,
  totalApplicablePermissions,
} from "@/data/admin/rbac";

// ------------------------------------------------------------
// CONTRACT (future NestJS resource: /admin/permissions)
//
// The prototype keeps role matrices in memory. When the real RBAC
// backend lands, `permissions` map to guard decorators like
// @RequirePermissions("products.approve") and this service becomes
// an HTTP client - no UI changes needed.
// ------------------------------------------------------------

export interface AdminRbacService {
  listRoles(): Promise<RbacRole[]>;
  getRole(key: AdminRoleKey): Promise<RbacRole | null>;
  /** Mock persistence for matrix edits. */
  updatePermissions(
    key: AdminRoleKey,
    permissions: RolePermissionMatrix
  ): Promise<RbacRole>;
  resetRole(key: AdminRoleKey): Promise<RbacRole>;
}

export function createMockRbacService(): AdminRbacService {
  let roles = buildRbacRoles();

  function requireRole(key: AdminRoleKey): RbacRole {
    const role = roles.find((r) => r.key === key);
    if (!role) throw new Error(`Role ${key} not found`);
    return role;
  }

  return {
    async listRoles() {
      await apiDelay(160);
      return JSON.parse(JSON.stringify(roles)) as RbacRole[];
    },

    async getRole(key) {
      await apiDelay(140);
      const role = roles.find((r) => r.key === key);
      return role
        ? (JSON.parse(JSON.stringify(role)) as RbacRole)
        : null;
    },

    async updatePermissions(key, permissions) {
      await apiDelay(300);
      const role = requireRole(key);
      if (role.key === "SUPER_ADMIN")
        throw new Error(
          "Super Admin always retains full access - its matrix is locked."
        );
      role.permissions = JSON.parse(
        JSON.stringify(permissions)
      ) as RolePermissionMatrix;
      return JSON.parse(JSON.stringify(role)) as RbacRole;
    },

    async resetRole(key) {
      await apiDelay(300);
      const defaults = buildRbacRoles().find((r) => r.key === key);
      if (!defaults) throw new Error(`Role ${key} not found`);
      const role = requireRole(key);
      role.permissions = defaults.permissions;
      return JSON.parse(JSON.stringify(role)) as RbacRole;
    },
  };
}

export { countGrantedPermissions, totalApplicablePermissions };
