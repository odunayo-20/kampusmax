// ============================================================
// ADMIN PERMISSIONS SCAFFOLDING
//
// Deliberately minimal today: only coarse nav-level visibility per
// role. The structure below is where fine-grained RBAC plugs in
// later - e.g. a resource/action matrix returned by the API and
// enforced in `canPerform()` guards.
// ============================================================

import { AdminRole } from "@/types/admin";

export type AdminNavItemKey =
  | "dashboard"
  | "users"
  | "campuses"
  | "vendors"
  | "products"
  | "categories"
  | "orders"
  | "payments"
  | "wallet"
  | "withdrawals"
  | "promotions"
  | "campusFeed"
  | "reports"
  | "reviews"
  | "disputes"
  | "notifications"
  | "settings"
  | "permissions";

/**
 * Which sections each role can see. CAMPUS_ADMIN is scoped to their
 * campus data (enforced server-side later; the UI already passes
 * their campusId into service calls).
 */
export const ROLE_NAV_ACCESS: Record<AdminRole, AdminNavItemKey[] | "*"> = {
  SUPER_ADMIN: "*",
  ADMIN: "*",
  CAMPUS_ADMIN: [
    "dashboard",
    "users",
    "vendors",
    "products",
    "orders",
    "reviews",
    "disputes",
    "reports",
    "campusFeed",
    "notifications",
  ],
};

export function canSeeSection(
  role: AdminRole,
  key: AdminNavItemKey
): boolean {
  const access = ROLE_NAV_ACCESS[role];
  return access === "*" || access.includes(key);
}

/** Placeholder for future fine-grained checks (resource/action). */
export function canPerform(
  _role: AdminRole,
  _resource: string,
  _action: string
): boolean {
  // Mock phase: every signed-in operator may act. Replace with an
  // RBAC lookup once the API exposes permission sets per role.
  return true;
}
