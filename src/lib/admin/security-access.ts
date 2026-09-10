// ============================================================
// ADMIN SECURITY CENTER ACCESS (Module 51)
// ============================================================
//
// The Security Center consumes the Module 48 audit trail (privileged
// admin activity) and is restricted to FULL OPERATORS — the same
// tier that can view audit logs, RBAC, and platform settings.
//
// IMPORTANT (§29 of the Module 51 spec): the RBAC matrix does NOT
// contain a `security` resource today. Inventing `security.view` /
// `security.manage` permission names here would fabricate backend
// capabilities. Instead this helper reuses the EXISTING nav-level
// authorization model: the `security` nav key is granted to
// SUPER_ADMIN/ADMIN (`ROLE_NAV_ACCESS`) and excluded from
// CAMPUS_ADMIN, mirroring `auditLogs`/`settings`. A future NestJS
// security resource may add explicit permissions; until then this is
// the honest gate.
// ============================================================

import type { AdminRole } from "@/types/admin";
import { canSeeSection } from "./permissions";

/**
 * Whether an operator may open the Security Center. Backed by the
 * same nav-authorization table as the rest of the admin console.
 */
export function canAccessSecurityCenter(role: AdminRole): boolean {
  return canSeeSection(role, "security");
}

/**
 * The security consent surface is read-only evidence of privileged
 * actions. There are NO session-revocation / mass-logout / forced
 * suspend actions in the prototype (the backend has no session API),
 * so this module ships zero mutations. Anything that looks like an
 * action here is a deep link into an authoritative module
 * (audit-logs detail, users console, trust & safety).
 */
export const SECURITY_CENTER_IS_READ_ONLY: true = true;