import { describe, expect, it } from "vitest";
import { createMockRbacService } from "../rbac.service";
import {
  RESOURCE_ACTIONS,
  RBAC_RESOURCES,
  buildRbacRoles,
  countGrantedPermissions,
  totalApplicablePermissions,
} from "@/data/admin/rbac";
import { toPermissionIds } from "@/types/admin";
import type { AdminRoleKey, RbacRole, RolePermissionMatrix } from "@/types/admin";

const EXPECTED_SYSTEM_ROLES: AdminRoleKey[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "CAMPUS_ADMIN",
];

function make() {
  return createMockRbacService();
}

describe("Admin RBAC service (Module 49)", () => {
  it("lists the three seeded system roles - no fabricated roles", async () => {
    const svc = make();
    const roles = await svc.listRoles();
    expect(roles).toHaveLength(3);
    expect(roles.map((r) => r.key).sort()).toEqual(
      [...EXPECTED_SYSTEM_ROLES].sort()
    );
    roles.forEach((r) => {
      expect(r.isSystem).toBe(true);
      expect(r.membersCount).toBeGreaterThan(0);
      expect(r.description.length).toBeGreaterThan(0);
    });
  });

  it("exposes every seeded resource with an applicable action model", async () => {
    const svc = make();
    const [role] = await svc.listRoles();
    RBAC_RESOURCES.forEach((resource) => {
      const row = role.permissions[resource];
      expect(row).toBeDefined();
      RESOURCE_ACTIONS[resource].forEach((action) => {
        expect(typeof row[action]).toBe("boolean");
      });
    });
  });

  it("returns a deep clone so callers can never mutate the store", async () => {
    const svc = make();
    const before = await svc.listRoles();
    const [tampered] = await svc.listRoles();
    tampered.permissions.users.create = true;
    tampered.name = "Hacked";
    const after = await svc.listRoles();
    expect(after.find((r) => r.key === "SUPER_ADMIN")).toEqual(
      before.find((r) => r.key === "SUPER_ADMIN")
    );
    expect(after.find((r) => r.key === "SUPER_ADMIN")?.name).not.toBe("Hacked");
  });

  it("returns a role by key and null for an unknown key", async () => {
    const svc = make();
    const role = await svc.getRole("ADMIN");
    expect(role?.key).toBe("ADMIN");
    expect(await svc.getRole("SUPER_ADMIN")).not.toBeNull();
    expect(await svc.getRole("CAMPUS_ADMIN")).not.toBeNull();
    expect(await svc.getRole("MODERATOR" as AdminRoleKey)).toBeNull();
  });

  it("locks the SUPER_ADMIN matrix against edits", async () => {
    const svc = make();
    const admin = (await svc.getRole("ADMIN")) as RbacRole;
    await expect(
      svc.updatePermissions("SUPER_ADMIN", JSON.parse(JSON.stringify(admin.permissions)))
    ).rejects.toThrow(/Super Admin always retains full access/i);
  });

  it("persists a matrix edit for an editable role and reflects it on reads", async () => {
    const svc = make();
    const admin = (await svc.getRole("ADMIN")) as RbacRole;
    const edited: RolePermissionMatrix = JSON.parse(
      JSON.stringify(admin.permissions)
    );
    // Withdraw notifications.create from ADMIN.
    edited.notifications.create = false;

    const updated = await svc.updatePermissions("ADMIN", edited);
    expect(updated.permissions.notifications.create).toBe(false);
    expect(updated.permissions.notifications.view).toBe(true);

    const reread = (await svc.getRole("ADMIN")) as RbacRole;
    expect(reread.permissions.notifications.create).toBe(false);

    // Other roles are untouched.
    const campus = (await svc.getRole("CAMPUS_ADMIN")) as RbacRole;
    expect(countGrantedPermissions(campus.permissions)).toBe(30);
  });

  it("rejects edits for unknown role keys", async () => {
    const svc = make();
    const admin = (await svc.getRole("ADMIN")) as RbacRole;
    await expect(
      svc.updatePermissions("MODERATOR" as AdminRoleKey, admin.permissions)
    ).rejects.toThrow(/not found/i);
  });

  it("resets an edited role back to its seeded defaults", async () => {
    const svc = make();
    const admin = (await svc.getRole("ADMIN")) as RbacRole;
    const edited = JSON.parse(JSON.stringify(admin.permissions)) as RolePermissionMatrix;
    edited.notifications.create = false;
    await svc.updatePermissions("ADMIN", edited);

    const reset = await svc.resetRole("ADMIN");
    expect(reset.permissions.notifications.create).toBe(true);

    const defaults = buildRbacRoles().find((r) => r.key === "ADMIN");
    expect(reset.permissions).toEqual(defaults?.permissions);
  });

  it("rejects reset for unknown role keys", async () => {
    const svc = make();
    await expect(svc.resetRole("MODERATOR" as AdminRoleKey)).rejects.toThrow(
      /not found/i
    );
  });

  it("matches the deterministic seeded permission coverage", async () => {
    const svc = make();
    const roles = await svc.listRoles();
    const byKey = Object.fromEntries(roles.map((r) => [r.key, r])) as Record<
      AdminRoleKey,
      RbacRole
    >;

    expect(totalApplicablePermissions()).toBe(64);
    expect(countGrantedPermissions(byKey.SUPER_ADMIN.permissions)).toBe(64);
    expect(countGrantedPermissions(byKey.ADMIN.permissions)).toBe(59);
    expect(countGrantedPermissions(byKey.CAMPUS_ADMIN.permissions)).toBe(30);
  });

  it("maps the SUPER_ADMIN matrix to every applicable permission id", async () => {
    const svc = make();
    const role = (await svc.getRole("SUPER_ADMIN")) as RbacRole;
    const ids = toPermissionIds(role.permissions, RESOURCE_ACTIONS);
    expect(ids).toHaveLength(64);
    expect(ids).toContain("products.approve");
    expect(ids).toContain("users.suspend");
    expect(ids).toContain("withdrawals.approve");
  });

  it("does not grant inapplicable actions", async () => {
    const svc = make();
    const [role] = await svc.listRoles();
    RBAC_RESOURCES.forEach((resource) => {
      const row = role.permissions[resource];
      (Object.keys(row) as (keyof typeof row)[]).forEach((action) => {
        if (row[action as keyof typeof row]) {
          expect(RESOURCE_ACTIONS[resource]).toContain(action);
        }
      });
    });
  });
});