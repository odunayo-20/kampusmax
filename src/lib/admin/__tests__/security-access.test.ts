import { describe, expect, it } from "vitest";
import { ROLE_NAV_ACCESS } from "@/lib/admin/permissions";
import { canAccessSecurityCenter } from "@/lib/admin/security-access";
import type { AdminRole } from "@/types/admin";

const FULL_OPERATORS: AdminRole[] = ["SUPER_ADMIN", "ADMIN"];

describe("canAccessSecurityCenter", () => {
  it("grants access to full operators via nav authorization (SUPER_ADMIN/ADMIN)", () => {
    for (const role of FULL_OPERATORS) {
      expect(canAccessSecurityCenter(role)).toBe(true);
    }
  });

  it("denies CAMPUS_ADMIN (excluded from the explicit nav list)", () => {
    expect(canAccessSecurityCenter("CAMPUS_ADMIN")).toBe(false);
  });

  it("mirrors nav authorization exactly — the security gate is ROLE_NAV_ACCESS", () => {
    const roles: AdminRole[] = ["SUPER_ADMIN", "ADMIN", "CAMPUS_ADMIN"];
    for (const role of roles) {
      const access = ROLE_NAV_ACCESS[role];
      const expected = access === "*" || access.includes("security");
      expect(canAccessSecurityCenter(role)).toBe(expected);
    }
  });

  it("does NOT invent a `security` RBAC resource — gates on role tier only, like audit-logs/settings", () => {
    // Guard: if a future `security` RBAC resource is added, this test
    // must be revisited (the gate intentionally reuses nav tier today).
    const campusList = ROLE_NAV_ACCESS.CAMPUS_ADMIN;
    expect(Array.isArray(campusList)).toBe(true);
    if (Array.isArray(campusList)) {
      expect(campusList).not.toContain("security");
    }
  });
});