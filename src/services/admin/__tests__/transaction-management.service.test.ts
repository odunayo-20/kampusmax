import { describe, expect, it } from "vitest";
import { createTransactionManagementService } from "@/services/admin/transaction-management.service";

// ------------------------------------------------------------
// ADMIN TRANSACTIONS SERVICE TESTS
//
// The ledger is derived from REAL stores only (no PRNG): the 8 orders
// in src/data/orders.ts become order_payment rows and the 4 qualifying
// wallet records (wt1, wt2, wt20 deposits + wt6 refund) become
// wallet_funding/refund rows. Everything else in the wallet store is
// excluded by design (purchases/wire transfers stay in the Wallet
// console; payouts land in Module 45).
//
//   - 12 rows total  (8 order_payment + 3 wallet_funding + 1 refund)
//   - statuses       → successful 8, pending 2, refunded 2, rest 0
//   - volumes        → total ₦572,639 from real amounts
//   - no mutations   → the interface is read-only by design
// ------------------------------------------------------------

const svc = createTransactionManagementService();

describe("list", () => {
  it("returns every ledger row (12) with real merged fields", async () => {
    const page = await svc.list({ page: 1, pageSize: 25 });
    expect(page.total).toBe(12);
    expect(page.items.length).toBe(12);

    const byId = new Map(page.items.map((t) => [t.id, t]));

    const order = byId.get("KMP-3847");
    expect(order?.type).toBe("order_payment");
    expect(order?.vendorName).toBe("TechHub Owo");
    expect(order?.customerName).toBe("Adebayo Oluwaseun");
    expect(order?.amount).toBe(22038);
    expect(order?.reference).toBeNull(); // orders store records no payment reference

    const code = byId.get("KMP-4310");
    expect(code?.status).toBe("pending");
    expect(code?.method).toBe("cod");

    const refunded = byId.get("KMP-4055");
    expect(refunded?.status).toBe("refunded");
    expect(refunded?.sourceStatus).toBe("refunded");

    const funding = byId.get("wt2");
    expect(funding?.type).toBe("wallet_funding");
    expect(funding?.status).toBe("successful");
    expect(funding?.method).toBe("paystack");
    expect(funding?.reference).toBe("DEP-2025-002");

    const refund = byId.get("wt6");
    expect(refund?.type).toBe("refund");
    expect(refund?.amount).toBe(12000);
    expect(refund?.reference).toBe("REF-2025-001");
    expect(refund?.orderId).toBe("KMP-3901");

    for (const row of page.items) {
      expect(typeof row.createdAt).toBe("string");
      expect(row.amount).toBeGreaterThanOrEqual(0);
      expect(["order_payment", "wallet_funding", "refund"]).toContain(row.type);
      expect(row.gatewayRef).toBeNull(); // honest: no gateway verification in prototype
      expect(Boolean(row.statusNote)).toBe(true);
    }
  });

  it("buckets by status exactly like the seed state", async () => {
    const successful = await svc.list({ status: "successful", pageSize: 25 });
    expect(successful.total).toBe(8);

    const pending = await svc.list({ status: "pending" });
    expect(pending.total).toBe(2);

    const refunded = await svc.list({ status: "refunded" });
    expect(refunded.items.map((t) => t.id).sort()).toEqual(["KMP-4055", "KMP-4180"]);

    const empty = ["processing", "failed", "cancelled"];
    for (const status of empty) {
      const res = await svc.list({ status: status as never });
      expect(res.total).toBe(0);
    }
  });

  it("filters by type and method", async () => {
    const orders = await svc.list({ type: "order_payment" });
    expect(orders.total).toBe(8);
    expect(orders.items.every((t) => t.type === "order_payment")).toBe(true);

    const funding = await svc.list({ type: "wallet_funding" });
    expect(funding.items.map((t) => t.id).sort()).toEqual(["wt1", "wt2", "wt20"]);

    const refunds = await svc.list({ type: "refund" });
    expect(refunds.items.map((t) => t.id)).toEqual(["wt6"]);

    const paystack = await svc.list({ method: "paystack" });
    expect(paystack.total).toBe(6); // 5 orders + wt2
    const wallet = await svc.list({ method: "wallet" });
    expect(wallet.total).toBe(3); // KMP-4215, KMP-4180, wt6
    const cod = await svc.list({ method: "cod" });
    expect(cod.items.map((t) => t.id)).toEqual(["KMP-4310"]);
    const bank = await svc.list({ method: "bank_transfer" });
    expect(bank.items.map((t) => t.id).sort()).toEqual(["wt1", "wt20"]);
  });

  it("searches identity fields case-insensitively", async () => {
    const byVendor = await svc.list({ search: "TechHub" });
    expect(byVendor.items.map((t) => t.id).sort()).toEqual(["KMP-3847", "KMP-4055", "KMP-4298"]);

    const byRef = await svc.list({ search: "REF-2025-001" });
    expect(byRef.items.map((t) => t.id)).toEqual(["wt6"]);

    const byCustomer = await svc.list({ search: "adebayo" });
    expect(byCustomer.total).toBe(12);

    const none = await svc.list({ search: "zzz-no-match" });
    expect(none.total).toBe(0);
    expect(none.items).toEqual([]);
  });

  it("sorts by amount and date", async () => {
    const byAmountAsc = await svc.list({ sortBy: "amount", sortDir: "asc", pageSize: 25 });
    expect(byAmountAsc.items[0].amount).toBe(5550); // KMP-4298
    expect(byAmountAsc.items[0].id).toBe("KMP-4298");

    const byAmountDesc = await svc.list({ sortBy: "amount", sortDir: "desc", pageSize: 25 });
    expect(byAmountDesc.items[0].amount).toBe(187500); // KMP-4055 laptop

    const newest = await svc.list({ sortDir: "desc", pageSize: 25 });
    expect(newest.items[0].id).toBe("wt20"); // 2025-01-15T14:00Z — latest real record
    expect(newest.items[newest.items.length - 1].id).toBe("wt1"); // 2025-01-05
  });

  it("paginates and clamps out-of-range pages", async () => {
    const first = await svc.list({ page: 1, pageSize: 5 });
    expect(first.items.length).toBe(5);
    expect(first.totalPages).toBe(3);

    const second = await svc.list({ page: 2, pageSize: 5 });
    const ids = new Set([...first.items, ...second.items].map((t) => t.id));
    expect(ids.size).toBe(10);

    const clamped = await svc.list({ page: 99, pageSize: 5 });
    expect(clamped.page).toBe(clamped.totalPages);
  });
});

describe("getCounts / getFacets", () => {
  it("matches the list total and the real volume distribution", async () => {
    const counts = await svc.getCounts();
    expect(counts.all).toBe(12);
    expect(counts.byStatus).toEqual({
      successful: 8,
      pending: 2,
      processing: 0,
      failed: 0,
      refunded: 2,
      cancelled: 0,
    });
    expect(counts.byType).toEqual({
      order_payment: 8,
      wallet_funding: 3,
      refund: 1,
    });
    // Derived from the real amounts, never hard-coded.
    expect(counts.totalVolume).toBe(572639);
    expect(counts.successfulVolume).toBe(338776);
    expect(counts.pendingVolume).toBe(33050);
    expect(counts.refundedVolume).toBe(200813);
  });

  it("exposes only methods and types present in the ledger", async () => {
    const facets = await svc.getFacets();
    expect(facets.methods.map((m) => m.id).sort()).toEqual([
      "bank_transfer",
      "cod",
      "paystack",
      "wallet",
    ]);
    expect(facets.types.map((t) => t.id).sort()).toEqual([
      "order_payment",
      "refund",
      "wallet_funding",
    ]);
  });
});

describe("getById", () => {
  it("returns order payment detail with the real order timeline", async () => {
    const detail = await svc.getById("KMP-3847");
    expect(detail).not.toBeNull();
    if (!detail) return;

    expect(detail.transaction.type).toBe("order_payment");
    expect(detail.transaction.vendorName).toBe("TechHub Owo");
    expect(detail.order).not.toBeNull();
    expect(detail.order!.id).toBe("KMP-3847");
    expect(detail.order!.itemCount).toBe(2);
    expect(detail.order!.total).toBe(22038);
    expect(detail.activity.length).toBe(5); // real order timeline events
    expect(detail.activity[0].kind).toBe("initiated");
    expect(detail.gateway.tracked).toBe(false);
    expect(detail.actions.refundable).toBe(false);
  });

  it("returns refund detail with an absent source order (KMP-3901 missing)", async () => {
    const detail = await svc.getById("wt6");
    expect(detail).not.toBeNull();
    if (!detail) return;

    expect(detail.transaction.type).toBe("refund");
    expect(detail.transaction.reference).toBe("REF-2025-001");
    expect(detail.order).toBeNull(); // KMP-3901 is not in the orders store
    expect(detail.activity.length).toBe(2); // initiated + completed
  });

  it("carries refund context on cancelled/refunded orders", async () => {
    const detail = await svc.getById("KMP-4055");
    expect(detail).not.toBeNull();
    if (!detail) return;

    expect(detail.transaction.status).toBe("refunded");
    expect(detail.order!.status).toBe("cancelled");
    expect(detail.order!.cancelledAt).toBe("2025-01-13T09:00:00Z");
    expect(detail.order!.cancelReason).toBe("Item no longer available");
    expect(detail.activity.length).toBe(2); // placed + cancelled
  });

  it("returns null for unknown ids", async () => {
    expect(await svc.getById("pay-2025-0001")).toBeNull(); // old fabricated ids don't resolve
    expect(await svc.getById("KMP-9999")).toBeNull();
  });
});