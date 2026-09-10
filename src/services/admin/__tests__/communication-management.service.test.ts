import { describe, expect, it } from "vitest";
import { createAdminCommunicationService } from "@/services/admin/communication-management.service";
import { notifications, pushNotificationRecord } from "@/data/notifications";
import { users } from "@/data/users";
import type {
  AdminCommunicationService,
  ManagedAdminNotificationAudience,
} from "@/types/admin";

// ------------------------------------------------------------
// ADMIN COMMUNICATIONS SERVICE TESTS (Module 47)
//
// Everything derives from REAL stores only (no PRNG):
//
//   - notifications (23)   → all userId "u1"; 11 unread, 12 read
//                            categories: orders 4, messages 3,
//                              marketplace 3, campus 4, payments 3,
//                              account 3, promotions 3, bookings 0
//                            types: order_update 4, message 3,
//                              marketplace 3, campus 4, payments 3,
//                              account 3, promotion 3, booking_update 0,
//                              system 0
//   - users (5)            → 2 students (u1, u4), 3 vendors (u2, u3, u5),
//                            all campus "rugipo"
//
// Dispatch writes through pushNotificationRecord so the shared store
// drives the same records the user notification center reads.
// ------------------------------------------------------------

const svc = createAdminCommunicationService();

const seedTotal = notifications.length;

describe("AdminCommunicationService overview", () => {
  it("exposes counts computed from the real notification store", async () => {
    const overview = await svc.getOverview();
    const c = overview.counts;

    expect(overview.inAppOnly).toBe(true);
    expect(seedTotal).toBe(23);
    expect(c.total).toBe(23);
    expect(c.unread).toBe(11);
    expect(c.read).toBe(12);
    expect(c.recipients).toBe(1);

    expect(c.byCategory.orders).toBe(4);
    expect(c.byCategory.messages).toBe(3);
    expect(c.byCategory.marketplace).toBe(3);
    expect(c.byCategory.campus).toBe(4);
    expect(c.byCategory.payments).toBe(3);
    expect(c.byCategory.account).toBe(3);
    expect(c.byCategory.promotions).toBe(3);
    expect(c.byCategory.bookings).toBe(0);

    expect(c.byType.order_update).toBe(4);
    expect(c.byType.message).toBe(3);
    expect(c.byType.marketplace).toBe(3);
    expect(c.byType.campus).toBe(4);
    expect(c.byType.payments).toBe(3);
    expect(c.byType.account).toBe(3);
    expect(c.byType.promotion).toBe(3);
    expect(c.byType.booking_update).toBe(0);
    expect(c.byType.system).toBe(0);
  });

  it("reports the real platform user registry and campus breakdown", async () => {
    const overview = await svc.getOverview();
    expect(users.length).toBe(5);
    expect(overview.platformUsers).toBe(5);
    expect(overview.campusBreakdown).toEqual([{ campusId: "rugipo", count: 5 }]);
    expect(overview.deliveryNote).toContain("In-app is the only wired delivery channel");
  });
});

describe("AdminCommunicationService list", () => {
  it("lists every seeded record with resolved recipient metadata", async () => {
    const page = await svc.list({ page: 1, pageSize: 10 });
    expect(page.total).toBe(23);
    expect(page.totalPages).toBe(3);
    expect(page.items.length).toBe(10);

    const n1 = page.items.find((r) => r.id === "n1")!;
    expect(n1).toMatchObject({
      recipientId: "u1",
      recipientName: "Adebayo Oluwaseun",
      recipientHref: "/admin/users/u1",
      type: "order_update",
      category: "orders",
      read: false,
      actionUrl: "/orders/KMP-4102",
    });
  });

  it("filters by type, category and unread/read state", async () => {
    const orders = await svc.list({ page: 1, pageSize: 20, category: "orders" });
    expect(orders.total).toBe(4);

    const payments = await svc.list({ page: 1, pageSize: 20, type: "payments" });
    expect(payments.total).toBe(3);

    const unread = await svc.list({ page: 1, pageSize: 20, read: "unread" });
    expect(unread.total).toBe(11);

    const read = await svc.list({ page: 1, pageSize: 20, read: "read" });
    expect(read.total).toBe(12);
  });

  it("searches title and message case-insensitively", async () => {
    const promo = await svc.list({ page: 1, pageSize: 20, search: "sale" });
    expect(promo.items.length).toBeGreaterThan(0);
    for (const r of promo.items) {
      const haystack = `${r.title} ${r.message}`.toLowerCase();
      expect(haystack).toContain("sale");
    }
  });

  it("sorts by createdAt descending by default and honors sortDir", async () => {
    const desc = await svc.list({ page: 1, pageSize: 5 });
    const times = desc.items.map((r) => new Date(r.createdAt).getTime());
    expect(times).toEqual([...times].sort((a, b) => b - a));

    const asc = await svc.list({ page: 1, pageSize: 5, sortDir: "asc" });
    const ascTimes = asc.items.map((r) => new Date(r.createdAt).getTime());
    expect(ascTimes).toEqual([...ascTimes].sort((a, b) => a - b));
  });

  it("paginates and clamps out-of-range pages", async () => {
    const last = await svc.list({ page: 99, pageSize: 10 });
    expect(last.items.length).toBe(3); // page 3 is the final page (23 = 10+10+3)
  });
});

describe("AdminCommunicationService getById", () => {
  it("returns a row for an existing id and null for unknown ids", async () => {
    const row = await svc.getById("n15");
    expect(row).toMatchObject({
      id: "n15",
      type: "payments",
      category: "payments",
      title: "Payment Successful",
    });

    const missing = await svc.getById("does-not-exist");
    expect(missing).toBeNull();
  });
});

describe("AdminCommunicationService audience preview", () => {
  it("computes recipient counts from the real user registry", async () => {
    const previews: [ManagedAdminNotificationAudience, number][] = [
      ["all_users", 5],
      ["customers", 2],
      ["vendors", 3],
    ];
    for (const [audience, expected] of previews) {
      const p = await svc.getAudiencePreview(audience);
      expect(p.recipients).toBe(expected);
      expect(p.channel).toBe("in_app");
      expect(p.users.length).toBe(expected);
    }
  });

  it("scopes campus and specific_user by the real ids", async () => {
    const campus = await svc.getAudiencePreview("campus", "rugipo");
    expect(campus.recipients).toBe(5);

    const noCampus = await svc.getAudiencePreview("campus");
    expect(noCampus.recipients).toBe(0); // honest — no campus shard selected

    const specific = await svc.getAudiencePreview("specific_user", null, "u2");
    expect(specific.recipients).toBe(1);
    expect(specific.users[0]).toMatchObject({
      userId: "u2",
      role: "vendor",
      campusId: "rugipo",
    });
  });

  it("returns zero recipients for impossible targeting", async () => {
    const unknown = await svc.getAudiencePreview("specific_user", null, "ghost");
    expect(unknown.recipients).toBe(0);
  });
});

describe("AdminCommunicationService create", () => {
  const baseline = notifications.length;

  it("dispatches real records into the shared store (one per recipient)", async () => {
    const result = await svc.create({
      title: "Semester promo is live",
      message: "Use code CAMPUS10 at checkout.",
      type: "system",
      category: "account",
      audience: "all_users",
      actionUrl: "/marketplace",
    });

    expect(result.channel).toBe("in_app");
    expect(result.created).toBe(5); // u1..u5
    expect(result.notificationIds).toHaveLength(5);
    expect(notifications.length).toBe(baseline + 5);
  });

  it("dispatches to a single user via specific_user", async () => {
    const before = notifications.length;
    const result = await svc.create({
      title: "Personal update",
      message: "Your store is approved.",
      type: "account",
      category: "account",
      audience: "specific_user",
      userId: "u3",
    });
    expect(result.created).toBe(1);
    expect(notifications.length).toBe(before + 1);
    const created = notifications[0];
    expect(created.userId).toBe("u3");
    expect(created.type).toBe("account");
    expect(created.category).toBe("account");
  });

  it("rejects unsupported type/category combinations", async () => {
    const before = notifications.length;
    await expect(
      svc.create({
        title: "x",
        message: "y",
        type: "message", // chat-domain — not admin composable
        category: "messages",
        audience: "all_users",
      })
    ).rejects.toThrow(/Unsupported/);
    expect(notifications.length).toBe(before);
  });

  it("rejects unsafe action links", async () => {
    const before = notifications.length;
    await expect(
      svc.create({
        title: "x",
        message: "y",
        type: "system",
        category: "account",
        audience: "all_users",
        actionUrl: "javascript:alert(1)",
      })
    ).rejects.toThrow(/safe internal route/);
    expect(notifications.length).toBe(before);
  });

  it("rejects audiences with no reachable recipients", async () => {
    const before = notifications.length;
    await expect(
      svc.create({
        title: "x",
        message: "y",
        type: "system",
        category: "account",
        audience: "campus",
        campusId: "oau", // no users are on oau in the user registry
      })
    ).rejects.toThrow(/no reachable recipients/);
    expect(notifications.length).toBe(before);
  });

  it("validates title/message presence and length", async () => {
    const before = notifications.length;
    await expect(
      svc.create({
        title: "  ",
        message: "x",
        type: "system",
        category: "account",
        audience: "all_users",
      })
    ).rejects.toThrow(/Title is required/);

    await expect(
      svc.create({
        title: "x",
        message: "",
        type: "system",
        category: "account",
        audience: "all_users",
      })
    ).rejects.toThrow(/Message is required/);

    await expect(
      svc.create({
        title: "a".repeat(121),
        message: "x",
        type: "system",
        category: "account",
        audience: "all_users",
      })
    ).rejects.toThrow(/Title must be 120/);
    expect(notifications.length).toBe(before);
  });
});