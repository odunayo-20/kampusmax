import type { AdminProfile } from "@/types/admin";
import { mockAdmins } from "./people";

// ============================================================
// ADMIN CREDENTIALS (backend seed)
//
// Stands in for the future NestJS auth database. In the real backend
// only a password HASH would exist (never recoverable) alongside a
// signed session key. The `token` field here is the raw "secret" the
// surrogate signs into issued session tokens - keep it out of any UI.
//
// adm-003 is seeded as deactivated so the disabled-account path
// (401 / login rejection) can be exercised and verified.
// ============================================================

export interface AdminCredential {
  adminId: string;
  email: string;
  password: string;
  token: string;
  status: "active" | "deactivated";
}

export const ADMIN_DEMO_PASSWORD = "Kampmax@2026";

export const ADMIN_CREDENTIALS: AdminCredential[] = [
  {
    adminId: "adm-001",
    email: "adebayo@kampmax.ng",
    password: ADMIN_DEMO_PASSWORD,
    token: "ck_adm_001",
    status: "active",
  },
  {
    adminId: "adm-002",
    email: "chiamaka@kampmax.ng",
    password: ADMIN_DEMO_PASSWORD,
    token: "ck_adm_002",
    status: "active",
  },
  {
    adminId: "adm-003",
    email: "tunde.bakare@kampmax.ng",
    password: ADMIN_DEMO_PASSWORD,
    token: "ck_adm_003",
    status: "deactivated",
  },
  {
    adminId: "adm-004",
    email: "fatima.yusuf@kampmax.ng",
    password: ADMIN_DEMO_PASSWORD,
    token: "ck_adm_004",
    status: "active",
  },
  {
    adminId: "adm-005",
    email: "emeka.nwosu@kampmax.ng",
    password: ADMIN_DEMO_PASSWORD,
    token: "ck_adm_005",
    status: "active",
  },
];

/** Profiles that currently hold can receive new sessions. */
export function getActiveAdminCredentials(): AdminCredential[] {
  return ADMIN_CREDENTIALS.filter((c) => c.status === "active");
}

/** Roster limited to accounts that may actually sign in. */
export const ACTIVE_ADMINS: AdminProfile[] = mockAdmins.filter((a) =>
  getActiveAdminCredentials().some((c) => c.adminId === a.id)
);

/** Shown on the /admin/login page purely as a demo aid. */
export const ADMIN_DEMO_CREDENTIALS: {
  email: string;
  password: string;
  roleLabel: string;
  campus?: string;
}[] = [
  {
    email: "adebayo@kampmax.ng",
    password: ADMIN_DEMO_PASSWORD,
    roleLabel: "Super Admin (platform-wide)",
  },
  {
    email: "chiamaka@kampmax.ng",
    password: ADMIN_DEMO_PASSWORD,
    roleLabel: "Admin (platform-wide)",
  },
  {
    email: "fatima.yusuf@kampmax.ng",
    password: ADMIN_DEMO_PASSWORD,
    roleLabel: "Campus Admin (RUGIPO)",
    campus: "rugipo",
  },
];