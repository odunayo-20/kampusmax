import { describe, expect, it } from "vitest";
import { createPayoutManagementService } from "@/services/admin/payout-management.service";

// ------------------------------------------------------------
// ADMIN PAYOUTS SERVICE TESTS (Module 45)
//
// The payout ledger is derived from REAL stores only (no PRNG):
//
//   - walletTransactions `vendor_payout` records  → wt8 (completed,
//     PAY-2025-001, ₦45,000), wt23 (pending, PAY-2025-002, ₦28,000)
//   - vendor-financials INITIAL_PAYOUTS          → POUT-2001 (successful,
//     ₦9,000), POUT-2000 (processing, ₦25,000) — both vendor v8
//   - freelancer-financials INITIAL_FL_PAYOUTS    → FLPOUT-4003 (completed,
//     ₦120,000), FLPOUT-4002 (completed, ₦60,000), FLPOUT-4001 (failed,
//     ₦50,000) — freelancer sp1
//
//   - 7 rows total (4 vendor + 3 freelancer)
//   - statuses    → successful 4, pending 1, processing 1, failed 1,
//                   reversed 0, cancelled 0
//   - volumes     → total ₦337,000, successful ₦234,000, pending ₦28,000
//   - no mutations → the interface is read-only by design
// ------------------------------------------------------------

const svc = createPayoutManagementService();

describe("list", () => {
  it("returns every payout row (7) with real merged fields", async () => {
    const page = await svc.list({ page: 1, pageSize: 25 });
    expect(page.total).toBe(7);
    expect(page.items.length).toBe(7);

    const byId = new Map(page.items.map((t) => [t.id, t]));

    const walletPayout = byId.get("wt8");
    expect(walletPayout?.status).toBe("successful");
    expect(walletPayout?.sourceStatus).toBe("completed");
    expect(walletPayout?.reference).toBe("PAY-2025-001");
    expect(walletPayout?.recipientType).toBe("vendor");
    expect(walletPayout?.recipientId).toBe("v1");
    expect(walletPayout?.recipientName).toBe("TechHub Owo");
    expect(walletPayout?.recipientHref).toBe("/admin/vendors/v1");
    expect(walletPayout?.method).toBe("wallet");
    expect(walletPayout?.amount).toBe(45000);
    expect(walletPayout?.fee).toBe(0);
    expect(walletPayout?.maskedAccountNumber).toBeNull();
    expect(walletPayout?.gatewayRef).toBeNull();

    const vendorPayout = byId.get("POUT-2001");
    expect(vendorPayout?.status).toBe("successful");
    expect(vendorPayout?.sourceStatus).toBe("successful");
    expect(vendorPayout?.reference).toBe("KMPPOUT-2001");
    expect(vendorPayout?.recipientId).toBe("v8");
    expect(vendorPayout?.recipientName).toBe("Adebayo's Gadgets");
    expect(vendorPayout?.method).toBe("bank_transfer");
    expect(vendorPayout?.bankName).toBe("Guaranty Trust Bank");
    expect(vendorPayout?.maskedAccountNumber).toBe("••••••••4317");
    expect(vendorPayout?.amount).toBe(9000);
    expect(vendorPayout?.fee).toBe(50);

    const freelancerPayout = byId.get("FLPOUT-4003");
    expect(freelancerPayout?.status).toBe("successful");
    expect(freelancerPayout?.sourceStatus).toBe("completed");
    expect(freelancerPayout?.reference).toBe("KMP-FLPOUT-4003");
    expect(freelancerPayout?.recipientType).toBe("freelancer");
    expect(freelancerPayout?.recipientId).toBe("sp1");
    expect(freelancerPayout?.recipientName).toBe("Adebayo Tech Services");
    expect(freelancerPayout?.recipientHref).toBe("/admin/freelancers/sp1");
    expect(freelancerPayout?.amount).toBe(120000);

    const failed = byId.get("FLPOUT-4001");
    expect(failed?.status).toBe("failed");
    expect(failed?.failedReason).toBeTruthy();

    for (const row of page.items) {
      expect(typeof row.createdAt).toBe("string");
      expect(row.amount).toBeGreaterThan(0);
      expect(["vendor", "freelancer"]).toContain(row.recipientType);
      expect(["wallet", "bank_transfer"]).toContain(row.method);
      expect(row.gatewayRef).toBeNull(); // honest: no provider verification in prototype
      expect(row.provider).toBeNull();
      expect(Boolean(row.statusNote)).toBe(true);
      // account numbers travel masked on the typed output (never unmasked)
      if (row.maskedAccountNumber) {
        expect(row.maskedAccountNumber).toMatch(/^\u2022{8}\d{4}$/);
      }
    }
  });

  it("buckets by status exactly like the seed state", async () => {
    const successful = await svc.list({ status: "successful", pageSize: 25 });
    expect(successful.total).toBe(4);
    expect(successful.items.map((t) => t.id).sort()).toEqual([
      "FLPOUT-4002",
      "FLPOUT-4003",
      "POUT-2001",
      "wt8",
    ]);

    const pending = await svc.list({ status: "pending" });
    expect(pending.items.map((t) => t.id)).toEqual(["wt23"]);

    const processing = await svc.list({ status: "processing" });
    expect(processing.items.map((t) => t.id)).toEqual(["POUT-2000"]);

    const failed = await svc.list({ status: "failed" });
    expect(failed.items.map((t) => t.id)).toEqual(["FLPOUT-4001"]);

    const empty = ["reversed", "cancelled"];
    for (const status of empty) {
      const res = await svc.list({ status: status as never });
      expect(res.total).toBe(0);
    }
  });

  it("filters by recipient type and method", async () => {
    const vendors = await svc.list({ type: "vendor" });
    expect(vendors.total).toBe(4);
    expect(vendors.items.every((t) => t.recipientType === "vendor")).toBe(true);
    expect(vendors.items.map((t) => t.id).sort()).toEqual([
      "POUT-2000",
      "POUT-2001",
      "wt23",
      "wt8",
    ]);

    const freelancers = await svc.list({ type: "freelancer" });
    expect(freelancers.total).toBe(3);
    expect(freelancers.items.map((t) => t.id).sort()).toEqual([
      "FLPOUT-4001",
      "FLPOUT-4002",
      "FLPOUT-4003",
    ]);

    const wallet = await svc.list({ method: "wallet" });
    expect(wallet.items.map((t) => t.id).sort()).toEqual(["wt23", "wt8"]);

    const bank = await svc.list({ method: "bank_transfer" });
    expect(bank.total).toBe(5);
    expect(bank.items.every((t) => t.method === "bank_transfer")).toBe(true);
  });

  it("searches identity fields case-insensitively", async () => {
    const byVendor = await svc.list({ search: "TechHub" });
    expect(byVendor.items.map((t) => t.id)).toEqual(["wt8"]);

    const byReference = await svc.list({ search: "PAY-2025-002" });
    expect(byReference.items.map((t) => t.id)).toEqual(["wt23"]);

    const byId = await svc.list({ search: "FLPOUT-4003" });
    expect(byId.items.map((t) => t.id)).toEqual(["FLPOUT-4003"]);

    const byRecipient = await svc.list({ search: "Adebayo" });
    expect(byRecipient.total).toBe(5); // v8 (2) + sp1 (3) recipient names
    expect(byRecipient.items.every((t) => t.recipientName.includes("Adebayo"))).toBe(true);

    const none = await svc.list({ search: "zzz-no-match" });
    expect(none.total).toBe(0);
    expect(none.items).toEqual([]);
  });

  it("sorts by amount (deterministic) and keeps real dates monotonic", async () => {
    const byAmountAsc = await svc.list({ sortBy: "amount", sortDir: "asc", pageSize: 25 });
    expect(byAmountAsc.items.map((t) => t.id)).toEqual([
      "POUT-2001", // 9000
      "POUT-2000", // 25000
      "wt23", // 28000
      "wt8", // 45000
      "FLPOUT-4001", // 50000
      "FLPOUT-4002", // 60000
      "FLPOUT-4003", // 120000
    ]);

    const byAmountDesc = await svc.list({ sortBy: "amount", sortDir: "desc", pageSize: 25 });
    expect(byAmountDesc.items[0].id).toBe("FLPOUT-4003");
    expect(byAmountDesc.items[byAmountDesc.items.length - 1].id).toBe("POUT-2001");

    const newest = await svc.list({ sortDir: "desc", pageSize: 25 });
    const times = newest.items.map((t) => new Date(t.createdAt).getTime());
    for (let i = 1; i < times.length; i += 1) {
      expect(times[i]).toBeLessThanOrEqual(times[i - 1]);
    }
    // Fixed-date store ordering is stable regardless of the relative freelancer dates:
    const indexOf = (id: string) => newest.items.findIndex((t) => t.id === id);
    expect(indexOf("POUT-2000")).toBeLessThan(indexOf("POUT-2001"));
    expect(indexOf("POUT-2001")).toBeLessThan(indexOf("wt23"));
    expect(indexOf("wt23")).toBeLessThan(indexOf("wt8"));
    expect(indexOf("FLPOUT-4003")).toBeLessThan(indexOf("FLPOUT-4002"));
    expect(indexOf("FLPOUT-4002")).toBeLessThan(indexOf("FLPOUT-4001"));
  });

  it("paginates and clamps out-of-range pages", async () => {
    const first = await svc.list({ page: 1, pageSize: 3 });
    expect(first.items.length).toBe(3);
    expect(first.totalPages).toBe(3);

    const second = await svc.list({ page: 2, pageSize: 1 });
    expect(second.items.length).toBe(1);

    const clamped = await svc.list({ page: 99, pageSize: 3 });
    expect(clamped.page).toBe(clamped.totalPages);
  });
});

describe("getCounts / getFacets", () => {
  it("matches the list total and the real volume distribution", async () => {
    const counts = await svc.getCounts();
    expect(counts.all).toBe(7);
    expect(counts.byStatus).toEqual({
      successful: 4,
      pending: 1,
      processing: 1,
      failed: 1,
      reversed: 0,
      cancelled: 0,
    });
    expect(counts.byRecipientType).toEqual({ vendor: 4, freelancer: 3 });
    expect(counts.byMethod).toEqual({ wallet: 2, bank_transfer: 5 });
    // Derived from the real amounts, never hard-coded.
    expect(counts.totalVolume).toBe(337000);
    expect(counts.successfulVolume).toBe(234000);
    expect(counts.pendingVolume).toBe(28000);
  });

  it("exposes only methods and statuses present in the ledger", async () => {
    const facets = await svc.getFacets();
    expect(facets.methods.map((m) => m.id)).toEqual(["wallet", "bank_transfer"]);
    expect(facets.statuses.map((s) => s.id)).toEqual([
      "successful",
      "pending",
      "processing",
      "failed",
    ]);
  });
});

describe("getById", () => {
  it("returns wallet-payout detail with referenced orders and the real wallet", async () => {
    const detail = await svc.getById("wt8");
    expect(detail).not.toBeNull();
    if (!detail) return;

    expect(detail.payout.source).toBe("wallet_transaction");
    expect(detail.payout.recipientId).toBe("v1");
    expect(detail.recipient.recipientName).toBe("TechHub Owo");
    expect(detail.recipient.recipientHref).toBe("/admin/vendors/v1");

    expect(detail.referencedOrders.map((o) => o.id)).toEqual([
      "KMP-3847",
      "KMP-3848",
      "KMP-3849",
    ]);
    expect(detail.referencedOrders[0].existsInOrdersStore).toBe(true);
    expect(detail.referencedOrders[0].vendorName).toBe("TechHub Owo");
    expect(detail.referencedOrders[1].existsInOrdersStore).toBe(false);
    expect(detail.referencedOrders[2].existsInOrdersStore).toBe(false);

    expect(detail.timeline.length).toBe(2); // initiated + completed
    expect(detail.timeline[0].kind).toBe("initiated");
    expect(detail.timeline[1].kind).toBe("completed");

    expect(detail.wallet).not.toBeNull();
    expect(detail.wallet!.walletId).toBe("w1");
    expect(detail.wallet!.ownerName).toBe("Adebayo Oluwaseun");
    expect(detail.wallet!.balance).toBe(110000);
    expect(detail.wallet!.pendingAmount).toBe(53000);

    expect(detail.gateway.tracked).toBe(false);
    expect(detail.actions.supported).toBe(false);
  });

  it("resolves wt23 to its first real referenced order's vendor (StyleByChi)", async () => {
    const detail = await svc.getById("wt23");
    expect(detail).not.toBeNull();
    if (!detail) return;

    expect(detail.payout.recipientId).toBe("v2");
    expect(detail.payout.recipientName).toBe("StyleByChi");
    expect(detail.payout.status).toBe("pending");

    expect(detail.referencedOrders.map((o) => o.id)).toEqual(["KMP-4102", "KMP-4215"]);
    expect(detail.referencedOrders.every((o) => o.existsInOrdersStore)).toBe(true);
    expect(detail.referencedOrders[0].vendorName).toBe("StyleByChi");
    expect(detail.referencedOrders[1].vendorName).toBe("CampusBites");

    expect(detail.timeline.length).toBe(1); // pending → initiated only
    expect(detail.timeline[0].kind).toBe("initiated");
  });

  it("returns vendor-payout detail with masked bank info and real timestamps", async () => {
    const detail = await svc.getById("POUT-2001");
    expect(detail).not.toBeNull();
    if (!detail) return;

    expect(detail.payout.source).toBe("vendor_financials");
    expect(detail.payout.status).toBe("successful");
    expect(detail.recipient.recipientId).toBe("v8");
    expect(detail.recipient.recipientName).toBe("Adebayo's Gadgets");
    expect(detail.recipient.recipientHref).toBe("/admin/vendors/v8");
    expect(detail.payout.maskedAccountNumber).toBe("••••••••4317");
    expect(detail.payout.maskedAccountNumber).toMatch(/^\u2022{8}\d{4}$/);
    expect(detail.referencedOrders).toEqual([]);
    expect(detail.wallet).toBeNull();
    expect(detail.timeline.length).toBe(2); // requested + processed
    expect(detail.timeline.map((t) => t.kind)).toEqual(["initiated", "completed"]);
  });

  it("shows the expected/processing timestamps for the processing payout", async () => {
    const detail = await svc.getById("POUT-2000");
    expect(detail).not.toBeNull();
    if (!detail) return;

    expect(detail.payout.status).toBe("processing");
    expect(detail.payout.expectedAt).toBe("2026-08-29T23:59:59.000Z");
    expect(detail.timeline.map((t) => t.kind)).toEqual(["initiated", "expected"]);
  });

  it("returns freelancer-payout detail with the store event log", async () => {
    const detail = await svc.getById("FLPOUT-4003");
    expect(detail).not.toBeNull();
    if (!detail) return;

    expect(detail.payout.source).toBe("freelancer_financials");
    expect(detail.recipient.recipientId).toBe("sp1");
    expect(detail.recipient.recipientName).toBe("Adebayo Tech Services");
    expect(detail.recipient.recipientHref).toBe("/admin/freelancers/sp1");
    expect(detail.payout.fee).toBe(50);
    expect(detail.timeline.length).toBe(2); // requested + processed
    expect(detail.timeline[0].title).toBe("Withdrawal requested");
    expect(detail.timeline[1].kind).toBe("completed");
    expect(detail.wallet).toBeNull();
  });

  it("carries the real failure reason on the failed freelancer payout", async () => {
    const detail = await svc.getById("FLPOUT-4001");
    expect(detail).not.toBeNull();
    if (!detail) return;

    expect(detail.payout.status).toBe("failed");
    expect(detail.payout.failedReason).toContain("bank");
    expect(detail.timeline.map((t) => t.kind)).toEqual(["initiated", "failed"]);
  });

  it("returns null for unknown or out-of-domain ids", async () => {
    expect(await svc.getById("POUT-9999")).toBeNull();
    expect(await svc.getById("wt1")).toBeNull(); // deposit record — not a payout
    expect(await svc.getById("wdr-2025-0001")).toBeNull(); // fabricated id doesn't resolve
  });
});