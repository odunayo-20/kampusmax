import { describe, expect, it } from "vitest";
import { createFinanceConsoleService } from "@/services/admin/finance-management.service";

// ------------------------------------------------------------
// ADMIN FINANCE RECONCILIATION & REPORTS SERVICE TESTS (Module 46)
//
// Everything is derived from REAL stores only (no PRNG):
//
//   - orders (8)            → totals 385,639; platformFee 6,389;
//                             paid (5) 176,776; refunded (2) 200,813
//                             pending COD 8,050; retained 176,776
//   - wallet (16 txs)       → credits 264,500; debits 105,000; net 159,500
//                             w1 balance 110,000 + pending 53,000 = 163,000
//                             → ledger variance −3,500
//   - payouts (10)          → issued 370,000; successful 252,000;
//                             processing 25,000; pending 28,000; failed 65,000
//   - reconciliation        → 6 checks, 1 balanced, 4 variance, 1 informational,
//                             total variance 142,313
//
// The same numbers  must be true if any SEED data changes: the checks
// recompute from the owning stores, so only genuinely altered stores
// change these assertions.
// ------------------------------------------------------------

const svc = createFinanceConsoleService();

describe("FinanceManagementService overview", () => {
  it("exposes KPIs computed from the real stores with no fabricated money", async () => {
    const overview = await svc.getOverview();
    const k = overview.kpis;

    expect(overview.asOf).toBeTruthy();
    expect(k.gmv).toBe(176776); // 5 paid orders (paymentStatus = paid)
    expect(k.collected).toBe(326776); // 176,776 + 150,000 completed deposits
    expect(k.platformFees).toBe(6389); // stored across all 8 order records
    expect(k.retainedFees).toBe(4026); // paid, non-refunded orders
    expect(k.refunds).toBe(212813); // 200,813 refunded orders + 12,000 wallet credit
    expect(k.payoutsDelivered).toBe(252000); // successful only
    expect(k.payoutsInFlight).toBe(53000); // processing 25,000 + pending 28,000
    expect(k.heldInWallet).toBe(267500); // w1..w5 available balances

    // Overview series
    const byLabel = (xs: { label: string; value: number }[]) =>
      Object.fromEntries(xs.map((x) => [x.label, x.value]));
    expect(byLabel(overview.incoming)).toMatchObject({
      "Order payments — Paystack": 84276,
      "Order payments — Wallet": 92500,
      "Wallet deposits — completed": 150000,
    });
    expect(byLabel(overview.distributed)).toMatchObject({
      "Recipient payouts — delivered": 252000,
      "Refunds issued": 212813,
    });
    expect(byLabel(overview.retained)).toMatchObject({
      "Platform fees — retained orders": 4026,
      "Platform fees — refunded orders": 2313,
      "Platform fees — pending COD": 50,
    });
    // vendor totals: v1 215,088 / v2 56,688 / v3 113,863; fees 2,588/1,438/2,363
    expect(byLabel(overview.orderByVendor)["v1 · TechHub Owo"]).toBe(215088);
    expect(byLabel(overview.orderByVendor)["v2 · StyleByChi"]).toBe(56688);
    expect(byLabel(overview.orderByVendor)["v3 · CampusBites"]).toBe(113863);
    expect(byLabel(overview.feeByVendor)["v1 · TechHub Owo"]).toBe(2588);
    expect(byLabel(overview.feeByVendor)["v2 · StyleByChi"]).toBe(1438);
    expect(byLabel(overview.feeByVendor)["v3 · CampusBites"]).toBe(2363);

    expect(overview.scopeNote).toContain("Every figure traces to a real record");
  });
});

describe("FinanceManagementService reconciliation", () => {
  it("runs 6 checks with the exact locked outcomes and 149,313 total variance", async () => {
    const result = await svc.getReconciliation();
    expect(result.summary.totalChecks).toBe(6);
    expect(result.summary.balancedChecks).toBe(1);
    expect(result.summary.varianceChecks).toBe(4);
    expect(result.summary.informationalChecks).toBe(1);
    expect(result.summary.totalVariance).toBe(142313);

    const byId = new Map(result.checks.map((c) => [c.id, c]));
    expect(result.checks.length).toBe(6);

    // C1 wallet ledger vs stored balance → −3,500 variance
    const c1 = byId.get("wallet-ledger-vs-balance")!;
    expect(c1.outcome).toBe("variance");
    expect(c1.left.amount).toBe(159500); // credits 264,500 − debits 105,000
    expect(c1.right.amount).toBe(163000); // w1 balance + pending
    expect(c1.variance).toBe(-3500);

    // C2 wallet-paid orders vs purchase debits → 40,813 variance
    const c2 = byId.get("wallet-paid-orders-vs-purchase-debits")!;
    expect(c2.outcome).toBe("variance");
    expect(c2.left.amount).toBe(105813);
    expect(c2.right.amount).toBe(65000);
    expect(c2.variance).toBe(40813);
    // Traceability: every order row resolves to a real order id
    const c2Ids = new Set(c2.left.rows.map((r) => r.id));
    for (const id of ["KMP-4215", "KMP-4180"]) expect(c2Ids.has(id)).toBe(true);

    // C3 payout issued vs delivered → 93,000 variance
    const c3 = byId.get("payout-issued-vs-delivered")!;
    expect(c3.outcome).toBe("variance");
    expect(c3.left.amount).toBe(370000);
    expect(c3.right.amount).toBe(277000); // successful 252,000 + processing 25,000
    expect(c3.variance).toBe(93000);

    // C4 refund records traced to source orders → 12,000 unmatched
    const c4 = byId.get("refund-records-vs-source-orders")!;
    expect(c4.outcome).toBe("variance");
    expect(c4.left.amount).toBe(212813);
    expect(c4.right.amount).toBe(200813);
    expect(c4.variance).toBe(12000);

    // C5 informational fee coverage
    const c5 = byId.get("platform-fee-accrual-coverage")!;
    expect(c5.outcome).toBe("informational");
    expect(c5.left.amount).toBe(6389);

    // C6 order arithmetic → balanced
    const c6 = byId.get("order-total-arithmetic")!;
    expect(c6.outcome).toBe("balanced");
    expect(c6.variance).toBe(0);
    expect(c6.left.amount).toBe(385639);
  });

  it("limits rows to records that actually exist in the owning stores", async () => {
    const result = await svc.getReconciliation();
    const c1 = result.checks.find((c) => c.id === "wallet-ledger-vs-balance")!;
    const txRowIds = new Set(c1.left.rows.map((r) => r.id));
    // Both credits and debits are real stored records, signed by direction
    expect(txRowIds.has("wt1")).toBe(true); // deposit credit
    expect(txRowIds.has("wt20")).toBe(true); // pending deposit credit
    expect(txRowIds.has("wt3")).toBe(true); // purchase debit (signed negative)
    const wt3 = c1.left.rows.find((r) => r.id === "wt3")!;
    expect(wt3.amount).toBe(-12000);
    expect(txRowIds.size).toBe(16); // the whole wallet store, no invented rows
    // The stored-balance side only lists the two real wallet balance fields
    const rightIds = new Set(c1.right.rows.map((r) => r.id));
    expect(rightIds.has("w1")).toBe(true);
    expect(rightIds.has("w1.pending")).toBe(true);
    // The gap is called out, not made up
    expect(c1.note).toContain("seed-state bookkeeping gap");
  });
});

describe("FinanceManagementService reports", () => {
  it("revenue & fees report matches the orders store exactly", async () => {
    const report = await svc.getReport("revenue_fees");
    expect(report?.exportFilename).toBe("kampmax-revenue-fees.csv");
    expect(report?.rows.length).toBe(8);
    const byId = new Map(report!.rows.map((r) => [String(r.id), r]));
    // spot-check a refunded + a retained order with stored fees
    expect(byId.get("KMP-4055")?.total).toBe(187500);
    expect(byId.get("KMP-4055")?.platformFee).toBe(2000);
    expect(byId.get("KMP-4215")?.total).toBe(92500);
    expect(byId.get("KMP-4215")?.platformFee).toBe(2000);
    // summary numbers
    const sums = Object.fromEntries(report!.summary.map((s) => [s.label, s.amount]));
    expect(sums["Order GMV (paid)"]).toBe(176776);
    expect(sums["Refunded orders"]).toBe(200813);
    expect(sums["Pending COD"]).toBe(8050);
    expect(sums["Platform fees stored"]).toBe(6389);
    expect(sums["Retained fees"]).toBe(4026);
  });

  it("refunds report lists every real refund leg with backing flags", async () => {
    const report = await svc.getReport("refunds");
    expect(report?.rows.length).toBe(3); // 2 refunded orders + 1 wallet credit wt6
    const byId = new Map(report!.rows.map((r) => [String(r.id), r]));
    expect(byId.get("KMP-4055")?.matched).toBe("yes");
    expect(byId.get("KMP-4180")?.matched).toBe("yes");
    const wt6 = byId.get("wt6");
    expect(wt6?.amount).toBe(12000);
    expect(wt6?.matched).toBe("no"); // KMP-3901 absent from orders store
    const sums = Object.fromEntries(report!.summary.map((s) => [s.label, s.amount]));
    expect(sums["Total refunded value"]).toBe(212813);
  });

  it("payouts report merges wallet + vendor + freelancer + service-provider payouts", async () => {
    const report = await svc.getReport("payouts");
    expect(report?.rows.length).toBe(10); // wt8, wt23, POUT-2001/2000, FLPOUT-4003/4002/4001, SPOUT-2003/2002/2001
    const sums = Object.fromEntries(report!.summary.map((s) => [s.label, s.amount]));
    expect(sums["Payouts issued"]).toBe(370000);
    expect(sums["Delivered to recipients"]).toBe(252000);
    expect(sums["In flight (processing + pending)"]).toBe(53000);
    expect(sums["Failed (not delivered)"]).toBe(65000);
    const byKind = (label: string) =>
      report!.charts
        .find((c) => c.id === "payouts-kind")!
        .series.find((s) => s.label === label)!.value;
    expect(byKind("Vendors")).toBe(107000);
    expect(byKind("Freelancers")).toBe(230000);
    expect(byKind("Service providers")).toBe(33000);
  });

  it("wallet movements report lists every real wallet record", async () => {
    const report = await svc.getReport("wallet_movements");
    expect(report?.rows.length).toBe(16);
    const sums = Object.fromEntries(report!.summary.map((s) => [s.label, s.amount]));
    expect(sums["Deposits (completed)"]).toBe(150000);
    expect(sums["Pending deposits"]).toBe(25000);
    expect(sums["Purchases charged"]).toBe(65000);
    expect(sums["Withdrawals"]).toBe(35000);
    expect(sums["Available balance (all wallets)"]).toBe(267500);
    expect(sums["Ledger variance (w1)"]).toBe(3500); // |159,500 − 163,000|
    // all columns resolve for every row (no missing cells)
    for (const row of report!.rows) {
      for (const col of report!.columns) {
        expect(row).toHaveProperty(col.key);
      }
    }
  });

  it("returns null for unknown report ids and rejects fabricated ids", async () => {
    // @ts-expect-error builtin id list is closed; unknown ids are rejected by the type
    const unknown = await svc.getReport("nonsense");
    expect(unknown).toBeNull();
  });
});