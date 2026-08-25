import {
  AdminRoleKey,
  RbacAction,
  RbacResource,
  RbacRole,
  ResourcePermission,
  RolePermissionMatrix,
} from "@/types/admin";

// ------------------------------------------------------------
// RBAC MOCK DATASET (/admin/permissions)
//
// Single source of truth for which actions are applicable per
// resource plus the seeded matrix for each role. Editing in the UI
// mutates an in-memory copy via rbac.service - nothing is enforced.
// ------------------------------------------------------------

/** Which of the seven actions make sense for each resource. */
export const RESOURCE_ACTIONS: Record<RbacResource, readonly RbacAction[]> = {
  users: ["view", "create", "edit", "delete", "suspend"],
  campuses: ["view", "create", "edit", "delete", "suspend"],
  vendors: ["view", "create", "edit", "delete", "approve", "suspend"],
  products: ["view", "create", "edit", "delete", "approve", "suspend"],
  categories: ["view", "create", "edit", "delete"],
  orders: ["view", "edit", "manage"],
  payments: ["view", "manage"],
  wallet: ["view", "manage"],
  withdrawals: ["view", "approve", "manage"],
  promotions: ["view", "create", "edit", "delete", "approve"],
  campus_content: ["view", "create", "edit", "delete", "approve", "suspend"],
  reviews: ["view", "delete", "approve", "suspend"],
  disputes: ["view", "edit", "manage"],
  notifications: ["view", "create", "edit", "delete", "manage"],
  reports: ["view", "manage"],
  settings: ["view", "edit", "manage"],
};

export const RBAC_RESOURCES: RbacResource[] = [
  "users",
  "campuses",
  "vendors",
  "products",
  "categories",
  "orders",
  "payments",
  "wallet",
  "withdrawals",
  "promotions",
  "campus_content",
  "reviews",
  "disputes",
  "notifications",
  "reports",
  "settings",
];

function row(
  resource: RbacResource,
  granted: readonly RbacAction[]
): ResourcePermission {
  const base: ResourcePermission = {
    view: false,
    create: false,
    edit: false,
    delete: false,
    approve: false,
    suspend: false,
    manage: false,
  };
  RESOURCE_ACTIONS[resource].forEach((a) => {
    base[a] = granted.includes(a);
  });
  return base;
}

const ALL_ACTIONS = Object.values(RESOURCE_ACTIONS).flat();

/** Everything applicable on every resource. */
function fullMatrix(): RolePermissionMatrix {
  return Object.fromEntries(
    RBAC_RESOURCES.map((r) => [r, row(r, ALL_ACTIONS)])
  ) as RolePermissionMatrix;
}

// ---------------- Seeded role matrices ----------------

const SUPER_ADMIN_PERMISSIONS: RolePermissionMatrix = fullMatrix();

const ADMIN_PERMISSIONS: RolePermissionMatrix = Object.fromEntries(
  RBAC_RESOURCES.map((r) => {
    switch (r) {
      case "campuses":
        // Platform admins work existing campuses; lifecycle stays with super admins.
        return [r, row(r, ["view", "edit"])];
      case "settings":
        return [r, row(r, ["view", "edit"])];
      case "reports":
        return [r, row(r, ["view"])];
      default:
        return [r, fullMatrix()[r]];
    }
  })
) as RolePermissionMatrix;

const CAMPUS_ADMIN_PERMISSIONS: RolePermissionMatrix = Object.fromEntries(
  RBAC_RESOURCES.map((r) => {
    switch (r) {
      case "users":
        return [r, row(r, ["view", "edit", "suspend"])];
      case "campuses":
        return [r, row(r, ["view"])];
      case "vendors":
        return [r, row(r, ["view", "approve"])];
      case "products":
        return [r, row(r, ["view", "approve", "suspend"])];
      case "categories":
        return [r, row(r, ["view"])];
      case "orders":
        return [r, row(r, ["view", "manage"])];
      case "payments":
        return [r, row(r, ["view"])];
      case "wallet":
        return [r, row(r, ["view"])];
      case "withdrawals":
        return [r, row(r, [])];
      case "promotions":
        return [r, row(r, ["view"])];
      case "campus_content":
        // Their home turf: full content moderation on their campus.
        return [
          r,
          row(r, ["view", "create", "edit", "delete", "approve", "suspend"]),
        ];
      case "reviews":
        return [r, row(r, ["view", "delete", "approve", "suspend"])];
      case "disputes":
        return [r, row(r, ["view", "edit"])];
      case "notifications":
        return [r, row(r, ["view", "create"])];
      case "reports":
        return [r, row(r, ["view"])];
      case "settings":
        return [r, row(r, [])];
      default:
        return [r, row(r, ["view"])];
    }
  })
) as RolePermissionMatrix;

export interface RbacDataset {
  roles: RbacRole[];
}

export function buildRbacRoles(): RbacRole[] {
  const roles: RbacRole[] = [
    {
      key: "SUPER_ADMIN",
      name: "Super Admin",
      description:
        "Unrestricted platform owner. Full access to every resource and action, including campus lifecycle and platform settings.",
      isSystem: true,
      membersCount: 2,
      permissions: SUPER_ADMIN_PERMISSIONS,
    },
    {
      key: "ADMIN",
      name: "Admin",
      description:
        "Day-to-day platform operator. Runs commerce, moderation and support across all campuses; cannot onboard or retire campuses or change global report tooling.",
      isSystem: true,
      membersCount: 7,
      permissions: ADMIN_PERMISSIONS,
    },
    {
      key: "CAMPUS_ADMIN",
      name: "Campus Admin",
      description:
        "Scoped to a single campus. Moderates campus content and reviews, approves local vendors and listings, and supports orders - with no financial payout access.",
      isSystem: true,
      membersCount: 29,
      permissions: CAMPUS_ADMIN_PERMISSIONS,
    },
  ];
  return roles.map((r) => ({
    ...r,
    permissions: JSON.parse(JSON.stringify(r.permissions)) as RolePermissionMatrix,
  }));
}

export function countGrantedPermissions(
  matrix: RolePermissionMatrix
): number {
  let total = 0;
  RBAC_RESOURCES.forEach((r) => {
    RESOURCE_ACTIONS[r].forEach((a) => {
      if (matrix[r][a]) total += 1;
    });
  });
  return total;
}

export function totalApplicablePermissions(): number {
  return ALL_ACTIONS.length;
}

export type { AdminRoleKey };
