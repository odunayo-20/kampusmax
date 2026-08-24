import {
  mockPayments,
  mockVendors,
  mockWalletAccounts,
  mockWalletTxns,
  mockWithdrawals,
} from "./commerce";
import { intBetween, seededRandom } from "@/lib/admin/api";
import type {
  FinanceFundPool,
  FinanceOverview,
  ManagedFinanceTxn,
  ManagedFinanceTxnType,
  ManagedWithdrawalDetail,
  ManagedWithdrawalTimelineEvent,
} from "@/types/admin";

/**
 * Wallet & finance dataset (/admin/wallet, /admin/withdrawals).
 *
 * Derives every headline figure from the shared commerce mocks so the
 * console numbers reconcile with the payments ledger and wallet
 * tables. Pool attribution (platform / vendor / customer) is explicit
 * on each transaction to keep future backend reconciliation simple.
 */

function mapTxnType(seedType: string, i: number): ManagedFinanceTxnType {
  switch (seedType) {
    case "deposit":
      return "wallet_funding";
    case "purchase":
      return "purchase";
    case "refund":
      return "refund";
    case "vendor_payout":
      return "vendor_payout";
    case "withdrawal":
      return "withdrawal";
    case "commission":
      return "platform_fee";
    default:
      // adjustment: alternate between loyalty rewards and fee tweaks
      return i % 2 === 0 ? "loyalty_reward" : "platform_fee";
  }
}

function poolFor(type: ManagedFinanceTxnType, ownerType: string): FinanceFundPool {
  if (type === "platform_fee" || type === "loyalty_reward") return "platform";
  return ownerType === "vendor" ? "vendor" : "customer";
}

export function buildFinanceTransactions(): ManagedFinanceTxn[] {
  const rows: ManagedFinanceTxn[] = mockWalletTxns.map((txn, i) => {
    const type = mapTxnType(txn.type, i);
    return {
      id: txn.id,
      type,
      pool: poolFor(type, txn.ownerType),
      ownerName: txn.ownerName,
      ownerType: txn.ownerType,
      direction: txn.direction,
      amount: txn.amount,
      status: txn.status,
      reference: txn.reference,
      balanceAfter: txn.balanceAfter,
      orderId: type === "purchase" || type === "refund" ? `KMP-${2400 + (i % 38)}` : null,
      createdAt: txn.createdAt,
    };
  });

  // Deterministic loyalty reward coverage even if the seed rolled no
  // adjustments onto the even indices.
  if (!rows.some((r) => r.type === "loyalty_reward")) {
    rows.push({
      id: "wtx-lty-1",
      type: "loyalty_reward",
      pool: "platform",
      ownerName: mockWalletAccounts.find((a) => a.ownerType === "user")?.ownerName ?? "Amina Yusuf",
      ownerType: "user",
      direction: "credit",
      amount: 1250,
      status: "completed",
      reference: "WTX-LOYALTY",
      balanceAfter:
        mockWalletAccounts.find((a) => a.ownerType === "user")?.balance ?? 0,
      orderId: null,
      createdAt: rows[rows.length - 1]?.createdAt ?? new Date().toISOString(),
    });
  }

  return rows.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function buildFinanceOverview(txns: ManagedFinanceTxn[]): FinanceOverview {
  // Payments ledger aggregates.
  let gross = 0;
  let refunds = 0;
  let earnings = 0;
  for (const p of mockPayments) {
    if (p.status !== "successful") continue;
    if (p.type === "order_payment") gross += p.amount;
    if (p.type === "refund") refunds += p.amount;
    earnings += p.fee;
  }

  // Wallet liabilities by owner type.
  let customerLiability = 0;
  let vendorHeld = 0;
  let customerAccounts = 0;
  for (const acct of mockWalletAccounts) {
    if (acct.ownerType === "user") {
      customerLiability += acct.balance;
      customerAccounts += 1;
    } else {
      vendorHeld += acct.balance;
    }
  }

  // Withdrawal exposure.
  let completedAmount = 0;
  let pendingAmount = 0;
  let pendingCount = 0;
  for (const w of mockWithdrawals) {
    if (w.status === "completed") completedAmount += w.amount + w.fee;
    if (w.status === "pending" || w.status === "processing" || w.status === "approved") {
      pendingAmount += w.amount + w.fee;
      pendingCount += 1;
    }
  }

  // Platform float: fees earned minus money already returned out.
  const pendingTxnAmount = txns
    .filter((t) => t.status === "pending")
    .reduce((sum, t) => sum + t.amount, 0);
  const available = Math.max(0, earnings - refunds - completedAmount);

  return {
    platform: {
      balance: available + pendingTxnAmount,
      available,
      pending: pendingTxnAmount,
      earnings,
    },
    vendor: {
      payable: pendingAmount, // approved/processing/pending payouts owed
      walletHeld: vendorHeld,
    },
    customer: {
      liability: customerLiability,
      accounts: customerAccounts,
    },
    revenue: {
      gross,
      refunds,
      net: gross - refunds,
    },
    withdrawals: {
      completedAmount,
      pendingCount,
      pendingAmount,
    },
  };
}

/**
 * Full detail payload for /admin/withdrawals/[id]: the request plus the
 * vendor's wallet context, activity history, lifecycle timeline and
 * previous payout requests.
 */
export function buildWithdrawalDetail(id: string): ManagedWithdrawalDetail | null {
  const request = mockWithdrawals.find((w) => w.id === id.trim().toLowerCase());
  if (!request) return null;

  const vendor = mockVendors.find((v) => v.id === request.vendorId);
  const matchesVendor = (ownerName: string, ownerEmail?: string) =>
    ownerName === request.vendorName || (vendor != null && ownerEmail === vendor.email);

  const account = mockWalletAccounts.find(
    (a) => a.ownerType === "vendor" && matchesVendor(a.ownerName, a.ownerEmail)
  );

  const history = buildFinanceTransactions()
    .filter((t) => t.ownerType === "vendor" && t.ownerName === request.vendorName)
    .slice(0, 8);

  const previous = mockWithdrawals
    .filter((w) => w.vendorId === request.vendorId && w.id !== request.id)
    .sort(
      (a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
    )
    .slice(0, 6);

  return JSON.parse(
    JSON.stringify({
      request,
      vendorBalance: account?.balance ?? null,
      vendorWalletId: account?.id ?? null,
      campusId: account?.campusId ?? null,
      timeline: buildWithdrawalTimeline(request),
      history,
      previous,
    })
  ) as ManagedWithdrawalDetail;
}

function buildWithdrawalTimeline(
  request: (typeof mockWithdrawals)[number]
): ManagedWithdrawalTimelineEvent[] {
  const rand = seededRandom(Number(request.id.replace(/\D+/g, "")) * 13 + 7);
  const events: ManagedWithdrawalTimelineEvent[] = [];

  const requestedMs = new Date(request.requestedAt).getTime();
  const processedMs = request.processedAt
    ? new Date(request.processedAt).getTime()
    : null;
  // Terminal events land after the request; intermediate steps interpolate.
  const span =
    processedMs != null
      ? Math.max(processedMs - requestedMs, 60 * 60_000)
      : intBetween(rand, 12, 48) * 60 * 60_000;

  const at = (fraction: number): string =>
    new Date(requestedMs + Math.round(span * fraction)).toISOString();

  let n = 0;
  const push = (
    kind: ManagedWithdrawalTimelineEvent["kind"],
    label: string,
    detail: string | null,
    fraction: number
  ) => {
    n += 1;
    events.push({ id: `wevt-${n}`, kind, label, detail, at: at(fraction) });
  };

  push("requested", "Payout requested", `${request.bankName} · ${request.accountNumberMasked}`, 0);

  switch (request.status) {
    case "pending":
      push("review", "Awaiting review", "Queued for finance review", 1);
      break;
    case "processing":
      push("review", "Marked as processing", "Transfer being prepared", 0.4);
      break;
    case "approved":
      push("review", "Marked as processing", "Transfer being prepared", 0.3);
      push("decision", "Approved", "Cleared for bank transfer", 0.75);
      break;
    case "completed":
      push("review", "Marked as processing", "Transfer being prepared", 0.25);
      push("decision", "Approved", "Bank transfer released to vendor", 0.55);
      push("completed", "Completed", `Settled incl. ${request.fee} naira fee`, 1);
      break;
    case "rejected":
      push("rejected", "Rejected", request.note ?? "Rejected by finance", 0.6);
      break;
    case "failed":
      push("decision", "Approved", "Bank transfer attempted", 0.45);
      push("failed", "Transfer failed", request.note ?? "Bank returned the transfer", 1);
      break;
  }

  return events;
}
