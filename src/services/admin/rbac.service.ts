import {
  AdminRoleKey,
  RbacRole,
  ResourcePermission,
  RolePermissionMatrix,
} from "@/types/admin";
import { apiDelay } from "@/lib/admin/api";
import {
  buildRbacRoles,
  countGrantedPermissions,
  RESOURCE_ACTIONS,
  RBAC_RESOURCES,
  totalApplicablePermissions,
} from "@/data/admin/rbac";

// ------------------------------------------------------------
// CONTRACT (future NestJS resource: /admin/permissions)
//
// The prototype keeps role matrices in memory. When the real RBAC
// backend lands, `permissions` map to guard decorators like
// @RequirePermissions("products.approve") and this service becomes
// an HTTP client - no UI changes needed.
//
// NOTE ON AUTHORIZATION: this mock service cannot prove WHO is
// calling `updatePermissions`. Any ADMIN holding a session can edit
// the ADMIN / CAMPUS_ADMIN matrices (role escalation). Caller-side
// authorization (only SUPER_ADMIN may change role matrices) is a
// backend boundary that must be enforced by the future API — see
// KAMPUSMAX_SECURITY_AUDIT.md.
// ------------------------------------------------------------

const ZERO_ROW: ResourcePermission = {
  view: false,
  create: false,
  edit: false,
  delete: false,
  approve: false,
  suspend: false,
  manage: false,
};

const KNOWN_RESOURCES = new Set<string>(RBAC_RESOURCES);

/**
 * Confines an incoming matrix to the RBAC catalog. Unknown resources
 * are rejected outright; missing rows throw; inapplicable or
 * non-boolean action values are coerced to false. The stored matrix is
 * therefore always a well-formed whitelist, never data echoed verbatim
 * from the client (mass-assignment guard).
 */
export function sanitizePermissionMatrix(
  permissions: RolePermissionMatrix
): RolePermissionMatrix {
  Object.keys(permissions).forEach((key) => {
    if (!KNOWN_RESOURCES.has(key)) {
      throw new Error(`Unknown resource "${key}" in permission matrix.`);
    }
  });

  const clean = {} as RolePermissionMatrix;
  for (const resource of RBAC_RESOURCES) {
    const incoming = (permissions as Record<string, unknown>)[resource];
    if (incoming === undefined || incoming === null) {
      throw new Error(
        `Permission matrix is missing resource "${resource}".`
      );
    }
    if (typeof incoming !== "object" || Array.isArray(incoming)) {
      throw new Error(`Permission matrix row for "${resource}" is invalid.`);
    }
    const rowValue = incoming as Record<string, unknown>;
    const out: ResourcePermission = { ...ZERO_ROW };
    RESOURCE_ACTIONS[resource].forEach((action) => {
      out[action] = rowValue[action] === true;
    });
    clean[resource] = out;
  }
  return clean;
}

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
      role.permissions = sanitizePermissionMatrix(permissions);
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
