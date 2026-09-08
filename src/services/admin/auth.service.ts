// ============================================================
// ADMIN AUTH SERVICE (Module 34)
//
// Backend surrogate for the future NestJS /admin/auth endpoints. This
// module is the AUTHORIZATION BOUNDARY for the admin console in the
// mock stack: the UI (AdminShell guard, nav) only hides things for UX,
// while every admin session — and eventually every admin read/write —
// resolves through here. Token issuance is deterministic (the adminId
// is embedded) so sessions survive hot reloads and address changes the
// same way the customer auth tokens do; in the real backend this is a
// signed session token verified by the API gateway.
// ============================================================

import type { AdminProfile, AdminRole } from "@/types/admin";
import { mockAdmins } from "@/data/admin/people";
import {
  ACTIVE_ADMINS,
  ADMIN_CREDENTIALS,
  ADMIN_DEMO_CREDENTIALS,
} from "@/data/admin/auth";

const TOKEN_PREFIX = "adm_tok_";

export type AdminAuthFailCode =
  | "INVALID_CREDENTIALS"
  | "ACCOUNT_DISABLED"
  | "FORBIDDEN";

export type AdminAuthResult =
  | { success: true; admin: AdminProfile; token: string }
  | { success: false; code: AdminAuthFailCode; message: string };

export interface AdminLoginInput {
  email: string;
  password: string;
}

export interface AdminAuthService {
  /** POST /admin/auth/login */
  login(input: AdminLoginInput): Promise<AdminAuthResult>;
  /** GET /admin/auth/session (token in cookie/header) */
  getCurrentSession(token: string): Promise<{ admin: AdminProfile } | null>;
  /** POST /admin/auth/logout */
  logout(token: string): Promise<{ success: true }>;
  /**
   * Demo-only account switch. Mirrors a support tool where a Super Admin
   * inspects the console as another operator. Enforced server-side here:
   * only a SUPER_ADMIN session may switch, and only to an active account.
   */
  switchAccount(token: string, adminId: string): Promise<AdminAuthResult>;
  /** GET /admin/auth/admins — active roster for the switcher. */
  listActiveAdmins(): Promise<AdminProfile[]>;
  getDemoCredentials(): {
    email: string;
    password: string;
    roleLabel: string;
    campus?: string;
  }[];
}

function issueToken(adminId: string): string {
  const stamp = Date.now().toString(36);
  const nonce = Math.random().toString(36).slice(2, 10);
  return `${TOKEN_PREFIX}${stamp}_${adminId}_${nonce}`;
}

function decodeAdminId(token: string): string | null {
  if (!token.startsWith(TOKEN_PREFIX)) return null;
  const body = token.slice(TOKEN_PREFIX.length).split("_");
  if (body.length < 2 || !body[1]) return null;
  return body[1];
}

export function createMockAdminAuthService(): AdminAuthService {
  function resolveByToken(token: string): AdminProfile | null {
    const adminId = decodeAdminId(token);
    if (!adminId) return null;
    const credential = ADMIN_CREDENTIALS.find((c) => c.adminId === adminId);
    if (!credential || credential.status !== "active") return null;
    return mockAdmins.find((a) => a.id === adminId) ?? null;
  }

  function resolveByEmail(email: string) {
    const normalized = email.trim().toLowerCase();
    const credential = ADMIN_CREDENTIALS.find(
      (c) => c.email.toLowerCase() === normalized
    );
    const admin = credential
      ? (mockAdmins.find((a) => a.id === credential.adminId) ?? null)
      : null;
    return { credential, admin };
  }

  return {
    async login({ email, password }) {
      const { credential, admin } = resolveByEmail(email);
      if (!credential || !admin) {
        return {
          success: false,
          code: "INVALID_CREDENTIALS",
          message: "Invalid email or password.",
        };
      }
      if (credential.status === "deactivated") {
        return {
          success: false,
          code: "ACCOUNT_DISABLED",
          message: "This operator account has been deactivated.",
        };
      }
      if (credential.password !== password) {
        return {
          success: false,
          code: "INVALID_CREDENTIALS",
          message: "Invalid email or password.",
        };
      }
      return { success: true, admin, token: issueToken(credential.adminId) };
    },

    async getCurrentSession(token) {
      const admin = resolveByToken(token);
      return admin ? { admin } : null;
    },

    async logout() {
      // Session is client-held; the backend simply retires the token.
      return { success: true };
    },

    async switchAccount(token, adminId) {
      const current = resolveByToken(token);
      if (!current) {
        return {
          success: false,
          code: "FORBIDDEN",
          message: "Your session is no longer valid. Please sign in again.",
        };
      }
      if (current.role !== "SUPER_ADMIN") {
        return {
          success: false,
          code: "FORBIDDEN",
          message: "Only a Super Admin may switch operator accounts.",
        };
      }
      const credential = ADMIN_CREDENTIALS.find((c) => c.adminId === adminId);
      const target = mockAdmins.find((a) => a.id === adminId) ?? null;
      if (!credential || !target || credential.status !== "active") {
        return {
          success: false,
          code: "INVALID_CREDENTIALS",
          message: "That operator account is unavailable.",
        };
      }
      return { success: true, admin: target, token: issueToken(target.id) };
    },

    async listActiveAdmins() {
      return ACTIVE_ADMINS;
    },

    getDemoCredentials() {
      return ADMIN_DEMO_CREDENTIALS;
    },
  };
}

export function isSuperAdminRole(role: AdminRole): boolean {
  return role === "SUPER_ADMIN";
}