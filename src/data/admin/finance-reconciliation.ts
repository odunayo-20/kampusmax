// ============================================================
// ADMIN FINANCE RECONCILIATION & REPORTS DATA (Module 46)
// ============================================================
//
// Read-only reconciliation + reporting layer. NOT a source of truth: it only
// READS the real stores that own money records and compares them:
//
//   - orders (src/data/orders.ts)              → order payments + stored fees
//   - wallet (src/data/wallet.ts)              → customer funding, purchases,
//                                                 refunds, withdrawals, balances
//   - vendor-financials (INITIAL_PAYOUTS)      → vendor bank payouts
//   - freelancer-financials (INITIAL_FL_PAYOUTS) → freelancer bank payouts
//   - service-provider-financials             → service-provider payouts
//   - payout-management (Module 45 ledger)     → normalized recipient rows
//
// There is NO seeded/PRNG generation. Every value below is computed at runtime
// from the record sets above. Payout account numbers are never touched here.
//
// DOMAIN SEPARATION:
//   - customer transactions/funding    > /admin/transactions  (Module 44)
//   - recipient payouts                > /admin/payouts       (Module 45)
//   - reconciliation + financial reports > /admin/finance     (THIS module)
//   - fabricated PRNG finance surfaces (commerce.ts / finance.ts / wallet /
//     withdrawals services) are NEVER consumed.
//
// KNOWN SEED-STATE FACTS surfaced honestly by the checks (not papered over):
//   - w1 ledger credits − debits (159,500) ≠ stored balance + pending (163,000)
//     → a −₦3,500 variance in the wallet store's own bookkeeping.
//   - the orders store marks refunded orders paymentStatus = "refunded"
//     (never "paid"), so "GMV (paid)" is 5 orders (176,776) and refunded
//     orders (200,813) are tracked separately — money collected then refunded.
//   - wallet purchase debits wt3/wt4/wt5 reference orders KMP-3847/KMP-4102
//     that were paid via Paystack in the orders store; wallet-paid order
//     KMP-4180 has no wallet refund leg; wt6 refund references KMP-3901 which
//     does not exist in the orders store.
//   - stored per-order platform fees are not a single rate (~2.3% on paid
//     orders) while the commission_rate setting advertises 8%.
// ============================================================

import type {
  ManagedFinanceKpis,
  ManagedFinanceOverview,
  ManagedFinanceReport,
  ManagedFinanceReportId,
  ManagedFinanceSeries,
  ManagedReconciliationCheck,
  ManagedReconciliationResult,
  ManagedReconciliationRow,
  ManagedReconciliationSide,
  ManagedReconciliationSummary,
} from "@/types/admin";
import { MANAGED_FINANCE_REPORT_IDS } from "@/types/admin";
import { mockOrders } from "@/data/orders";
import { walletTransactions, wallets } from "@/data/wallet";
import { INITIAL_PAYOUTS } from "@/data/vendor-financials";
import { INITIAL_FL_PAYOUTS } from "@/data/freelancer-financials";
import { INITIAL_SP_PAYOUTS } from "@/data/service-provider-financials";
import { marketplaceServiceProviders } from "@/data/service-marketplace";
import { payoutDataset } from "@/data/admin/payout-management";
import type { Order } from "@/types";
import type { WalletTransaction } from "@/types";

// ============================================================
// SMALL HELPERS
// ============================================================

const sum = (xs: number[]): number => xs.reduce((a, b) => a + b, 0);

const isPaid = (o: Order): boolean => o.paymentStatus === "paid";
const isRefunded = (o: Order): boolean => o.paymentStatus === "refunded";
/** Paid AND not cancelled — the money was collected and no refund followed. */
const isRetained = (o: Order): boolean =>
  isPaid(o) && o.status !== "cancelled";

const orderLabel = (o: Order): string =>
  `Order ${o.id} · ${o.vendorId} · ${o.paymentMethod} · ${o.status}`;

const txLabel = (t: WalletTransaction): string =>
  `${t.type.replace(/_/g, " ")} · ${t.reference ?? t.id}`;

/** Local recipient taxonomy: Module 45 is vendor/freelancer; SP payouts add a third vertical. */
export type FinancePayoutKind = "vendor" | "freelancer" | "service_provider";

export interface FinancePayoutRow {
  id: string;
  reference: string | null;
  kind: FinancePayoutKind;
  recipientName: string;
  recipientHref: string | null;
  status: string;
  amount: number;
  fee: number;
  createdAt: string;
  source: string;
}

// ============================================================
// PAYOUT LEDGER (all real payout stores, incl. service providers)
// ============================================================

const spProvider =
  marketplaceServiceProviders.find((p) => p.id === "sp1") ?? null;

function buildPayoutRows(): FinancePayoutRow[] {
  const rows: FinancePayoutRow[] = [];

  for (const row of payoutDataset.rows) {
    rows.push({
      id: row.id,
      reference: row.reference,
      kind: row.recipientType,
      recipientName: row.recipientName,
      recipientHref: row.recipientHref,
      status: row.status,
      amount: row.amount,
      fee: row.fee,
      createdAt: row.createdAt,
      source: row.source,
    });
  }

  for (const p of INITIAL_SP_PAYOUTS) {
    rows.push({
      id: p.id,
      reference: p.reference ?? null,
      kind: "service_provider",
      recipientName: spProvider?.displayName ?? "Service provider",
      recipientHref: spProvider ? "/admin/freelancers/sp1" : null,
      status:
        p.status === "successful"
          ? "successful"
          : p.status === "processing"
            ? "processing"
            : p.status === "failed"
              ? "failed"
              : "pending",
      amount: p.amount,
      fee: p.fee,
      createdAt: p.requestedAt,
      source: "service_provider_financials",
    });
  }

  rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return rows;
}

export const financePayoutRows: FinancePayoutRow[] = buildPayoutRows();

// ============================================================
// OVERVIEW
// ============================================================

const paidOrders = mockOrders.filter(isPaid);
const retainedOrders = mockOrders.filter(isRetained);
const refundedOrders = mockOrders.filter(isRefunded);
const pendingOrders = mockOrders.filter((o) => o.paymentStatus === "pending");

const orderGmv = sum(paidOrders.map((o) => o.total));
const refundedOrderTotal = sum(refundedOrders.map((o) => o.total));
const pendingOrderTotal = sum(pendingOrders.map((o) => o.total));
const allOrderFees = sum(mockOrders.map((o) => o.platformFee));
const retainedFees = sum(retainedOrders.map((o) => o.platformFee));
const refundedOrderFees = sum(refundedOrders.map((o) => o.platformFee));

const completedDeposits = walletTransactions
  .filter((t) => t.type === "deposit" && t.status === "completed")
  .reduce((a, t) => a + t.amount, 0);

const walletRefundCompleted = walletTransactions
  .filter((t) => t.type === "refund" && t.status === "completed")
  .reduce((a, t) => a + t.amount, 0);

const payoutStatus = (status: string) => status;

const payoutsByStatus = (statuses: string[]): number =>
  financePayoutRows
    .filter((r) => statuses.includes(payoutStatus(r.status)))
    .reduce((a, r) => a + r.amount, 0);

const payoutsDelivered = payoutsByStatus(["successful"]);
const payoutsInFlight =
  payoutsByStatus(["processing"]) + payoutsByStatus(["pending"]);

const heldInWallet = sum(wallets.map((w) => w.balance));

function byVendor(pick: (o: Order) => number): ManagedFinanceSeries[] {
  const map = new Map<string, number>();
  for (const o of mockOrders) {
    map.set(o.vendorId, (map.get(o.vendorId) ?? 0) + pick(o));
  }
  const template: Record<string, string> = {
    v1: "v1 · TechHub Owo",
    v2: "v2 · StyleByChi",
    v3: "v3 · CampusBites",
  };
  return [...map.entries()]
    .map(([vendorId, value]) => ({
      label: template[vendorId] ?? vendorId,
      value,
    }))
    .sort((a, b) => b.value - a.value);
}

const feeByVendor = byVendor((o) => o.platformFee);
const orderByVendor = byVendor((o) => o.total);

const SCOPE_NOTE =
  "Every figure traces to a real record in the orders, wallet, vendor-financials, freelancer-financials or service-provider-financials stores. These are independent prototype stores, so the platform-level pipeline does not perfectly close: the reconciliation page quantifies the variances instead of hiding them. Jobs and contracts carry no payment records (proposal-only / agreedAmount without money movement) and are excluded.";

export function buildFinanceOverview(): ManagedFinanceOverview {
  const kpis: ManagedFinanceKpis = {
    collected: orderGmv + completedDeposits,
    gmv: orderGmv,
    platformFees: allOrderFees,
    retainedFees,
    refunds: refundedOrderTotal + walletRefundCompleted,
    payoutsDelivered,
    payoutsInFlight,
    heldInWallet,
  };

  const paidPaystack = sum(
    paidOrders.filter((o) => o.paymentMethod === "paystack").map((o) => o.total)
  );
  const paidWallet = sum(
    paidOrders.filter((o) => o.paymentMethod === "wallet").map((o) => o.total)
  );

  const incoming: ManagedFinanceSeries[] = [
    { label: "Order payments — Paystack", value: paidPaystack },
    { label: "Order payments — Wallet", value: paidWallet },
    { label: "Wallet deposits — completed", value: completedDeposits },
  ];

  const distributed: ManagedFinanceSeries[] = [
    { label: "Recipient payouts — delivered", value: payoutsDelivered },
    { label: "Refunds issued", value: refundedOrderTotal + walletRefundCompleted },
  ];

  const retained: ManagedFinanceSeries[] = [
    { label: "Platform fees — retained orders", value: retainedFees },
    { label: "Platform fees — refunded orders", value: refundedOrderFees },
    { label: "Platform fees — pending COD", value: allOrderFees - retainedFees - refundedOrderFees },
  ];

  return {
    asOf: new Date().toISOString(),
    kpis,
    incoming,
    distributed,
    retained,
    feeByVendor,
    orderByVendor,
    scopeNote: SCOPE_NOTE,
  };
}

export const financeOverview: ManagedFinanceOverview = buildFinanceOverview();

// ============================================================
// RECONCILIATION CHECKS
// ============================================================

const rowOfOrder = (o: Order): ManagedReconciliationRow => ({
  id: o.id,
  label: orderLabel(o),
  amount: o.total,
  createdAt: o.createdAt,
  status: `${o.paymentStatus} / ${o.status}`,
});

const rowOfTx = (t: WalletTransaction): ManagedReconciliationRow => ({
  id: t.id,
  label: txLabel(t),
  amount: t.amount,
  createdAt: t.createdAt,
  status: t.status,
});

const side = (
  label: string,
  amount: number,
  rows: ManagedReconciliationRow[]
): ManagedReconciliationSide => ({ label, amount, rows });

function walletLedgerCheck(): ManagedReconciliationCheck {
  const signedRow = (t: WalletTransaction): ManagedReconciliationRow => ({
    id: t.id,
    label: txLabel(t),
    amount: t.direction === "credit" ? t.amount : -t.amount,
    createdAt: t.createdAt,
    status: `${t.type} · ${t.direction}`,
  });
  const allRows = walletTransactions
    .map(signedRow)
    .sort((a, b) => a.createdAt!.localeCompare(b.createdAt!));

  const credits = sum(
    walletTransactions
      .filter((t) => t.direction === "credit")
      .map((t) => t.amount)
  );
  const debits = sum(
    walletTransactions
      .filter((t) => t.direction === "debit")
      .map((t) => t.amount)
  );
  const ledgerBalance = credits - debits;

  const w1 = wallets.find((w) => w.id === "w1")!;
  const claimed = w1.balance + w1.pendingAmount;

  return {
    id: "wallet-ledger-vs-balance",
    title: "Wallet ledger credits − debits vs stored balances",
    description:
      "Reconciling the w1 ledger: every credit and debit in the wallet store should equal the wallet's stored available + pending balance.",
    scope: "Wallet store — w1 (the only wallet with a transaction history)",
    outcome: ledgerBalance === claimed ? "balanced" : "variance",
    left: side(
      "Ledger credits + debits (net)",
      ledgerBalance,
      allRows
    ),
    right: side(
      "Stored balance (available + pending)",
      claimed,
      [
        {
          id: "w1",
          label: "w1 available balance",
          amount: w1.balance,
          createdAt: w1.createdAt,
          status: "wallet.balance",
        },
        {
          id: "w1.pending",
          label: "w1 pending balance",
          amount: w1.pendingAmount,
          createdAt: w1.createdAt,
          status: "wallet.pendingAmount",
        },
      ]
    ),
    variance: ledgerBalance - claimed,
    note: `The real ledger nets to ₦${ledgerBalance.toLocaleString("en-NG")} (every credit and debit of the wallet store, listed with credits positive and debits negative) but the wallet store declares ₦${claimed.toLocaleString("en-NG")} available + pending. The ₦${Math.abs(ledgerBalance - claimed).toLocaleString("en-NG")} difference is a genuine seed-state bookkeeping gap in the wallet store — surfaced, not adjusted.`,
  };
}

function orderWalletChargeCheck(): ManagedReconciliationCheck {
  const walletPaidOrders = mockOrders.filter((o) => o.paymentMethod === "wallet");
  const purchaseRows = walletTransactions
    .filter((t) => t.type === "purchase")
    .map(rowOfTx);

  const walletPaidTotal = sum(walletPaidOrders.map((o) => o.total));
  const purchaseTotal = sum(purchaseRows.map((r) => r.amount));

  return {
    id: "wallet-paid-orders-vs-purchase-debits",
    title: "Wallet-paid orders vs wallet purchase charges",
    description:
      "Every order marked wallet in the orders store should be backed by matching wallet purchase debits in the wallet store.",
    scope: "Orders store (paymentMethod = wallet) ↔ wallet store (type = purchase)",
    outcome: walletPaidTotal === purchaseTotal ? "balanced" : "variance",
    left: side("Wallet-paid order totals", walletPaidTotal, walletPaidOrders.map(rowOfOrder)),
    right: side("Wallet purchase debits", purchaseTotal, purchaseRows),
    variance: walletPaidTotal - purchaseTotal,
    note: "Only wt21 (₦8,500) matches a wallet order (KMP-4215, total ₦92,500). wt3/wt4/wt5 are wallet debits against orders KMP-3847/KMP-4102 that the orders store records as Paystack-paid, and the refunded wallet order KMP-4180 (₦13,313) has no wallet refund leg at all.",
  };
}

function payoutDisbursementCheck(): ManagedReconciliationCheck {
  const all = financePayoutRows;
  const delivered = all.filter((r) => r.status === "successful" || r.status === "processing");
  const issued = sum(all.map((r) => r.amount));
  const moved = sum(delivered.map((r) => r.amount));

  return {
    id: "payout-issued-vs-delivered",
    title: "Payout records issued vs funds delivered",
    description:
      "Payout records across the wallet, vendor-financials, freelancer-financials and service-provider-financials stores vs the money actually delivered (or in transit) to recipients.",
    scope: "All real payout stores (wallet + vendor + freelancer + service-provider)",
    outcome: issued === moved ? "balanced" : "variance",
    left: side("Payout records issued", issued, all.map((r) => ({
      id: r.id,
      label: `${r.kind.replace(/_/g, " ")} payout · ${r.recipientName}`,
      amount: r.amount,
      createdAt: r.createdAt,
      status: r.status,
      href: r.recipientHref ?? undefined,
    }))),
    right: side("Delivered or processing", moved, delivered.map((r) => ({
      id: r.id,
      label: `${r.kind.replace(/_/g, " ")} payout · ${r.recipientName}`,
      amount: r.amount,
      createdAt: r.createdAt,
      status: r.status,
      href: r.recipientHref ?? undefined,
    }))),
    variance: issued - moved,
    note: "The variance is the payout pipeline itself: ₦28,000 pending plus ₦65,000 failed (never delivered to the recipient — FLPOUT-4001 and SPOUT-2001). Pending is expected; failed is actionable but has no retry endpoint in the prototype.",
  };
}

function refundIntegrityCheck(): ManagedReconciliationCheck {
  const orderRefunds = refundedOrders.map(rowOfOrder);
  const walletRefunds = walletTransactions
    .filter((t) => t.type === "refund")
    .map(rowOfTx);
  const leftRows = [...orderRefunds, ...walletRefunds];

  const matched = sum(orderRefunds.map((r) => r.amount));
  const total = sum(leftRows.map((r) => r.amount));

  return {
    id: "refund-records-vs-source-orders",
    title: "Refund records vs real source orders",
    description:
      "Every refund record should trace to a real order. Order-level refunds carry their own order; wallet refund credits must reference an order that exists in the orders store.",
    scope: "Orders store (paymentStatus = refunded) ↔ wallet store (type = refund)",
    outcome: matched === total ? "balanced" : "variance",
    left: side("Refund records (all)", total, leftRows),
    right: side("Refunds backed by a real order", matched, orderRefunds),
    variance: total - matched,
    note: "Wallet refund wt6 (₦12,000) references order KMP-3901 which does not exist in the orders store. Separately, the wallet-paid refunded order KMP-4180 (₦13,313) has no wallet refund credit — the check cannot find its refund leg.",
  };
}

function feeAccrualCheck(): ManagedReconciliationCheck {
  const feeRows = mockOrders
    .filter((o) => o.platformFee > 0)
    .map((o) => ({
      id: o.id,
      label: orderLabel(o),
      amount: o.platformFee,
      createdAt: o.createdAt,
      status: `${o.paymentStatus} / ${o.status}`,
    }));

  return {
    id: "platform-fee-accrual-coverage",
    title: "Platform fee accrual coverage",
    description:
      "Platform fees stored per order vs any fee/settlement ledger. There is no fee ledger anywhere in the prototype — this check states the accrual is factual but untracked.",
    scope: "Orders store (platformFee fields)",
    outcome: "informational",
    left: side("Platform fees stored on orders", allOrderFees, feeRows),
    right: side("Fee ledger / accrual records", 0, []),
    variance: allOrderFees,
    note: `No fee or settlement ledger exists. Stored per-order fees are not a single rate — the effective rate on retained orders is ≈${((retainedFees / orderGmv) * 100).toFixed(2)}% while the commission_rate setting advertises 8%. Fees on refunded orders (₦${refundedOrderFees.toLocaleString("en-NG")}) have no defined revenue treatment.`,
  };
}

function orderArithmeticCheck(): ManagedReconciliationCheck {
  const okRows = mockOrders.map((o) => ({
    id: o.id,
    label: orderLabel(o),
    amount: o.total,
    createdAt: o.createdAt,
    status: "subtotal + fee + delivery − discount",
  }));

  const recomputed = sum(
    mockOrders.map(
      (o) => o.subtotal + o.platformFee + o.deliveryFee - o.discountAmount
    )
  );
  const stored = sum(mockOrders.map((o) => o.total));

  return {
    id: "order-total-arithmetic",
    title: "Order totals: stored vs recomputed",
    description:
      "For every order, the stored total must equal subtotal + platform fee + delivery fee − discount.",
    scope: "Orders store (all 8 records)",
    outcome: stored === recomputed ? "balanced" : "variance",
    left: side("Stored order totals", stored, okRows),
    right: side("Recomputed totals", recomputed, okRows),
    variance: stored - recomputed,
    note: "All 8 orders recompute exactly — the arithmetic identity holds with zero variance.",
  };
}

export function buildFinanceReconciliation(): ManagedReconciliationResult {
  const checks: ManagedReconciliationCheck[] = [
    walletLedgerCheck(),
    orderWalletChargeCheck(),
    payoutDisbursementCheck(),
    refundIntegrityCheck(),
    feeAccrualCheck(),
    orderArithmeticCheck(),
  ];

  const summary: ManagedReconciliationSummary = {
    totalChecks: checks.length,
    balancedChecks: checks.filter((c) => c.outcome === "balanced").length,
    varianceChecks: checks.filter((c) => c.outcome === "variance").length,
    informationalChecks: checks.filter((c) => c.outcome === "informational").length,
    totalVariance: Math.abs(
      sum(
        checks
          .filter((c) => c.outcome === "variance")
          .map((c) => c.variance)
      )
    ),
  };

  return { asOf: new Date().toISOString(), summary, checks, scopeNote: SCOPE_NOTE };
}

export const financeReconciliation: ManagedReconciliationResult =
  buildFinanceReconciliation();

// ============================================================
// REPORTS
// ============================================================

function payoutRowRecord(r: FinancePayoutRow): Record<string, string | number | null> {
  return {
    id: r.id,
    recipient: r.recipientName,
    recipientType: r.kind,
    amount: r.amount,
    fee: r.fee,
    status: r.status,
    reference: r.reference,
    source: r.source,
    createdAt: r.createdAt,
  };
}

function buildRevenueFeesReport(): ManagedFinanceReport {
  const paidMethod = (m: string) =>
    sum(paidOrders.filter((o) => o.paymentMethod === m).map((o) => o.total));

  return {
    id: "revenue_fees",
    title: "Revenue & platform fees",
    description:
      "Order revenue and the platform fees stored on each order — the money collected from customers and the fee retained by the platform.",
    summary: [
      { label: "Order GMV (paid)", amount: orderGmv, hint: "5 paid orders (paymentStatus = paid)" },
      { label: "Refunded orders", amount: refundedOrderTotal, hint: "2 orders, re-issued in full" },
      { label: "Pending COD", amount: pendingOrderTotal, hint: "1 unpaid order" },
      { label: "Platform fees stored", amount: allOrderFees, hint: "across all order records" },
      { label: "Retained fees", amount: retainedFees, hint: "paid, non-refunded orders" },
    ],
    charts: [
      { id: "gmv-vendor", title: "GMV by vendor (all order records)", kind: "bar", series: orderByVendor },
      { id: "fees-vendor", title: "Platform fees by vendor (all records)", kind: "hbar", series: feeByVendor },
      { id: "method-mix", title: "Payment method mix (paid orders)", kind: "bar", series: [
        { label: "Paystack", value: paidMethod("paystack") },
        { label: "Wallet", value: paidMethod("wallet") },
        { label: "COD (pending)", value: pendingOrderTotal },
      ] },
    ],
    columns: [
      { key: "id", label: "Order" },
      { key: "vendorId", label: "Vendor" },
      { key: "paymentMethod", label: "Method" },
      { key: "subtotal", label: "Subtotal", align: "right" },
      { key: "platformFee", label: "Fee", align: "right" },
      { key: "deliveryFee", label: "Delivery", align: "right" },
      { key: "discountAmount", label: "Discount", align: "right" },
      { key: "total", label: "Total", align: "right" },
      { key: "paymentStatus", label: "Payment" },
    ],
    rows: mockOrders.map((o) => ({
      id: o.id,
      vendorId: o.vendorId,
      paymentMethod: o.paymentMethod,
      subtotal: o.subtotal,
      platformFee: o.platformFee,
      deliveryFee: o.deliveryFee,
      discountAmount: o.discountAmount,
      total: o.total,
      paymentStatus: o.paymentStatus,
    })),
    exportFilename: "kampmax-revenue-fees.csv",
    scopeNote: "Purely the orders store — wallet funding is reported under wallet movements.",
  };
}

function buildRefundsReport(): ManagedFinanceReport {
  const orderRefundRows = refundedOrders.map((o) => ({
    id: o.id,
    source: "orders",
    amount: o.total,
    reference: "order.paymentStatus = refunded",
    orderId: o.id,
    matched: "yes",
    status: "completed",
    createdAt: o.createdAt,
  }));
  const walletRefundRows = walletTransactions
    .filter((t) => t.type === "refund")
    .map((t) => ({
      id: t.id,
      source: "wallet",
      amount: t.amount,
      reference: t.reference ?? t.id,
      orderId: t.orderId ?? null,
      matched: t.orderId && mockOrders.some((o) => o.id === t.orderId) ? "yes" : "no",
      status: t.status,
      createdAt: t.createdAt,
    }));

  return {
    id: "refunds",
    title: "Refunds",
    description:
      "Every refund record across the orders and wallet stores, with the source order it claims to refund.",
    summary: [
      { label: "Total refunded value", amount: refundedOrderTotal + walletRefundCompleted },
      { label: "Order refunds", amount: refundedOrderTotal, hint: "2 refunded orders" },
      { label: "Wallet refund credits", amount: walletRefundCompleted, hint: "wt6" },
      { label: "Unmatched wallet refund", amount: walletRefundCompleted, hint: "order KMP-3901 not in orders store" },
    ],
    charts: [
      { id: "refund-sources", title: "Refunds by source", kind: "hbar", series: [
        { label: "Refunded orders", value: refundedOrderTotal },
        { label: "Wallet refund credits", value: walletRefundCompleted },
      ] },
    ],
    columns: [
      { key: "id", label: "Record" },
      { key: "source", label: "Source store" },
      { key: "orderId", label: "Source order" },
      { key: "amount", label: "Amount", align: "right" },
      { key: "reference", label: "Reference" },
      { key: "matched", label: "Backed by real order" },
      { key: "status", label: "Status" },
      { key: "createdAt", label: "Created" },
    ],
    rows: [...orderRefundRows, ...walletRefundRows],
    exportFilename: "kampmax-refunds.csv",
    scopeNote: "Refund legs in both stores are listed at face value; backing is shown per record.",
  };
}

function buildPayoutsReport(): ManagedFinanceReport {
  const byKind = (kind: FinancePayoutKind) =>
    financePayoutRows.filter((r) => r.kind === kind).reduce((a, r) => a + r.amount, 0);
  const byStatus = (status: string) =>
    financePayoutRows.filter((r) => r.status === status).reduce((a, r) => a + r.amount, 0);

  return {
    id: "payouts",
    title: "Payouts to recipients",
    description:
      "Payout records across the wallet, vendor, freelancer and service-provider stores — issued, delivered, in-flight and failed.",
    summary: [
      { label: "Payouts issued", amount: sum(financePayoutRows.map((r) => r.amount)), hint: `${financePayoutRows.length} records` },
      { label: "Delivered to recipients", amount: payoutsDelivered },
      { label: "In flight (processing + pending)", amount: payoutsInFlight },
      { label: "Failed (not delivered)", amount: byStatus("failed") },
    ],
    charts: [
      { id: "payouts-kind", title: "Payouts by recipient", kind: "hbar", series: [
        { label: "Vendors", value: byKind("vendor") },
        { label: "Freelancers", value: byKind("freelancer") },
        { label: "Service providers", value: byKind("service_provider") },
      ] },
      { id: "payouts-status", title: "Payouts by status", kind: "bar", series: [
        { label: "Successful", value: byStatus("successful") },
        { label: "Processing", value: byStatus("processing") },
        { label: "Pending", value: byStatus("pending") },
        { label: "Failed", value: byStatus("failed") },
      ] },
    ],
    columns: [
      { key: "id", label: "Payout" },
      { key: "recipient", label: "Recipient" },
      { key: "recipientType", label: "Type" },
      { key: "amount", label: "Amount", align: "right" },
      { key: "fee", label: "Fee", align: "right" },
      { key: "status", label: "Status" },
      { key: "reference", label: "Reference" },
      { key: "source", label: "Source" },
      { key: "createdAt", label: "Requested" },
    ],
    rows: financePayoutRows.map(payoutRowRecord),
    exportFilename: "kampmax-payouts.csv",
    scopeNote: "Includes service-provider payouts (outside the Module 45 console) so the platform total is complete.",
  };
}

function buildWalletMovementsReport(): ManagedFinanceReport {
  const byType = (type: string) =>
    walletTransactions
      .filter((t) => t.type === type)
      .reduce((a, t) => a + t.amount, 0);

  const w1 = wallets.find((w) => w.id === "w1")!;
  const credits = sum(
    walletTransactions.filter((t) => t.direction === "credit").map((t) => t.amount)
  );
  const debits = sum(
    walletTransactions.filter((t) => t.direction === "debit").map((t) => t.amount)
  );

  return {
    id: "wallet_movements",
    title: "Wallet movements",
    description:
      "All recorded customer wallet movements plus current balances — funding, spending, withdrawals, refunds, loyalty, transfers and payouts into wallets.",
    summary: [
      { label: "Deposits (completed)", amount: completedDeposits },
      { label: "Pending deposits", amount: byType("deposit") - completedDeposits },
      { label: "Purchases charged", amount: byType("purchase") },
      { label: "Withdrawals", amount: byType("withdrawal") },
      { label: "Available balance (all wallets)", amount: heldInWallet },
      { label: "Ledger variance (w1)", amount: Math.abs(credits - debits - w1.balance - w1.pendingAmount) },
    ],
    charts: [
      { id: "movements-type", title: "Movements by type (w1 ledger)", kind: "bar", series: [
        { label: "Deposits", value: byType("deposit") },
        { label: "Purchases", value: byType("purchase") },
        { label: "Withdrawals", value: byType("withdrawal") },
        { label: "Payouts in", value: byType("vendor_payout") },
        { label: "Refunds", value: byType("refund") },
        { label: "Loyalty", value: byType("loyalty_reward") },
        { label: "Transfers", value: byType("transfer") },
      ] },
      { id: "balances", title: "Wallet balances", kind: "hbar", series: wallets
        .map((w) => ({ label: w.id, value: w.balance }))
        .sort((a, b) => b.value - a.value) },
    ],
    columns: [
      { key: "id", label: "Record" },
      { key: "type", label: "Type" },
      { key: "direction", label: "Direction" },
      { key: "amount", label: "Amount", align: "right" },
      { key: "status", label: "Status" },
      { key: "reference", label: "Reference" },
      { key: "createdAt", label: "Created" },
    ],
    rows: walletTransactions
      .map((t) => ({
        id: t.id,
        type: t.type,
        direction: t.direction,
        amount: t.amount,
        status: t.status,
        reference: t.reference ?? null,
        createdAt: t.createdAt,
      }))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    exportFilename: "kampmax-wallet-movements.csv",
    scopeNote: "Wallet store only; customer funding is already counted in the revenue report.",
  };
}

export function buildFinanceReport(
  id: ManagedFinanceReportId
): ManagedFinanceReport | null {
  switch (id) {
    case "revenue_fees":
      return buildRevenueFeesReport();
    case "refunds":
      return buildRefundsReport();
    case "payouts":
      return buildPayoutsReport();
    case "wallet_movements":
      return buildWalletMovementsReport();
    default:
      return null;
  }
}

export const FINANCE_REPORT_OPTIONS: {
  id: ManagedFinanceReportId;
  label: string;
}[] = [...MANAGED_FINANCE_REPORT_IDS].map((id) => ({
  id,
  label:
    id === "revenue_fees"
      ? "Revenue & fees"
      : id === "refunds"
        ? "Refunds"
        : id === "payouts"
          ? "Payouts"
          : "Wallet movements",
}));

