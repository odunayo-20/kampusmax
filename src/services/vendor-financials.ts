import { getCurrentUser, getVendorByUserId } from "@/services/users";
import { getVendorAccess, getVendorPermissions } from "@/services/vendor-dashboard";
import { notificationsMock } from "@/data/vendor-dashboard";
import { VENDOR_DASHBOARD_GATE } from "@/types/vendor-dashboard";
import type { VendorNotification } from "@/types/vendor-dashboard";
import {
  vendorOrderSlices,
  getVendorOrderSlice,
} from "@/data/vendor-orders";
import type {
  VendorOrder,
  VendorEscrowState,
  VendorRefundStatus,
} from "@/types/vendor-orders";
import {
  VENDOR_FULFILLMENT_STATUS,
  VENDOR_PAYMENT_STATUS,
  VENDOR_ESCROW_STATE,
  VENDOR_REFUND_STATUS,
  VENDOR_DISPUTE_STATUS,
  VENDOR_ORDER_EVENT,
} from "@/types/vendor-orders";
import {
  financialsStore,
  INITIAL_PAYOUT_ACCOUNT,
} from "@/data/vendor-financials";
import {
  VendorFinancialTransaction,
  VendorFinancialTxType,
  VendorFinancialTxStatus,
  VendorFinSign,
  FinancialSummaryCard,
  FinancialSummaryTone,
  EscrowReadiness,
  EscrowBucket,
  VendorPayoutAccount,
  VendorPayout,
  VendorPayoutStatus,
  VendorStatement,
  VendorStatementLine,
  VendorStatementQuery,
  VendorFinancialQuery,
  VendorFinancialPage,
  PayoutRequestInput,
  PayoutRequestResult,
  VendorFinancialResultCode,
  VendorFinancialPermissions,
  VendorFinancialPermissionKey,
  VendorFinancialOverview,
  VENDOR_FINANCIAL_LIMITS,
} from "@/types/vendor-financials";
import { VENDOR_FINANCIAL_TX_TYPE, VENDOR_FINANCIAL_TX_STATUS, VENDOR_FIN_SIGN, VENDOR_FINANCIAL_SORT, VENDOR_FINANCIAL_RESULT } from "@/types/vendor-financials";
import { formatNaira } from "@/lib/utils";

// ============================================================
// VENDOR FINANCIALS SERVICE  (Module 14)
// ============================================================
//
// SECURITY: All balances and ledger entries are COMPUTED BY THIS SERVICE
// from the vendor order slices. The frontend never computes money.
// Ownership is derived from the authenticated vendor (v8). IDOR-safe.
// Idempotency: every payout request requires a client-supplied key that
// survives retries; duplicate keys return the existing record.

// ── Ownership / access ──────────────────────────────────────

function ownerVendorId(): string | null {
  const user = getCurrentUser();
  const vendor = getVendorByUserId(user.id);
  const access = getVendorAccess();
  if (!vendor || !access.canUseDashboard || access.kind !== VENDOR_DASHBOARD_GATE.APPROVED) {
    return null;
  }
  return vendor.id;
}

export function getVendorFinancialPermissions(): VendorFinancialPermissions {
  const base = getVendorPermissions();
  const account = getPayoutAccount();
  return {
    "financials.view": base.canViewFinancials,
    "transactions.view": base.canViewFinancials,
    "payouts.view": base.canViewFinancials,
    "payouts.request": base.canViewFinancials && account.status === "verified",
    "payout_account.manage": false,
  } satisfies Record<VendorFinancialPermissionKey, boolean>;
}

// ── Platform clock (backend-authoritative) ───────────────────

function nowIso(): string {
  return new Date("2026-08-29T12:00:00.000Z").toISOString();
}

// ── Derivation helpers ──────────────────────────────────────

function getV8Slices(): VendorOrder[] {
  const vendorId = ownerVendorId();
  if (!vendorId) return [];
  return vendorOrderSlices.filter((s) => s.vendorId === vendorId);
}

function getPaymentPaidAt(slice: VendorOrder): string {
  const paidEvent = slice.timeline.find((e) => e.kind === VENDOR_ORDER_EVENT.PAYMENT_PAID);
  return paidEvent?.at ?? slice.updatedAt;
}

function isPaidSecured(slice: VendorOrder): boolean {
  return slice.paymentStatus === VENDOR_PAYMENT_STATUS.PAID && slice.escrow.state !== VENDOR_ESCROW_STATE.NONE;
}

function isRefundedOrPending(slice: VendorOrder): boolean {
  return slice.refund.status === VENDOR_REFUND_STATUS.REFUNDED ||
    slice.refund.status === VENDOR_REFUND_STATUS.PENDING ||
    slice.refund.status === VENDOR_REFUND_STATUS.APPROVED ||
    slice.refund.status === VENDOR_REFUND_STATUS.PROCESSING ||
    slice.refund.status === VENDOR_REFUND_STATUS.REQUESTED;
}

function isFrozenDispute(slice: VendorOrder): boolean {
  return slice.dispute.status !== VENDOR_DISPUTE_STATUS.NONE &&
    slice.dispute.status !== VENDOR_DISPUTE_STATUS.RESOLVED &&
    slice.dispute.status !== VENDOR_DISPUTE_STATUS.CLOSED;
}

// ── Ledger derivation (single source of truth) ───────────────

function deriveLedger(): VendorFinancialTransaction[] {
  const slices = getV8Slices();
  const txns: VendorFinancialTransaction[] = [];

  for (const slice of slices) {
    // Include slices that had payment captured (escrow not NONE) OR have a refund
    const hadPayment = slice.escrow.state !== VENDOR_ESCROW_STATE.NONE;
    const hasRefund = slice.refund.amount && slice.refund.amount > 0;
    if (!hadPayment && !hasRefund) continue;

    const vendorSubtotal = slice.totals.vendorSubtotal;
    const platformFee = slice.totals.platformFee;
    const paidAt = getPaymentPaidAt(slice);
    const escrowState = slice.escrow.state;
    const isReleased = escrowState === VENDOR_ESCROW_STATE.RELEASED;
    const isDisputed = isFrozenDispute(slice);
    const isRefundPending = isRefundedOrPending(slice);
    const isPaid = slice.paymentStatus === VENDOR_PAYMENT_STATUS.PAID;

    // 1) Escrow Hold — funds secured in escrow (vendor's gross earnings)
    // Only for slices that were paid (not for refund-pending/refunded where hold was reversed)
    if (isPaid && !isRefundPending) {
      const holdStatus: VendorFinancialTxStatus = isReleased
        ? VENDOR_FINANCIAL_TX_STATUS.SUCCESSFUL
        : isDisputed
        ? VENDOR_FINANCIAL_TX_STATUS.DISPUTED
        : VENDOR_FINANCIAL_TX_STATUS.PENDING;

      txns.push({
        id: `txn-esc-${slice.id}`,
        type: VENDOR_FINANCIAL_TX_TYPE.ESCROW_HOLD,
        status: holdStatus,
        sign: VENDOR_FIN_SIGN.CREDIT,
        amount: vendorSubtotal,
        description: `Escrow hold — Order ${slice.id}`,
        orderId: slice.id,
        reference: `ESC-${slice.id}`,
        at: paidAt,
        events: slice.timeline
          .filter((e) => e.kind === VENDOR_ORDER_EVENT.PLACED || e.kind === VENDOR_ORDER_EVENT.PAYMENT_PAID)
          .map((e, i) => ({ id: `${slice.id}-evt-${i}`, title: e.title, detail: e.detail, at: e.at })),
      });
    }

    // 2) Platform Fee — charged on every slice that had payment captured
    const feeStatus: VendorFinancialTxStatus = slice.refund.status === VENDOR_REFUND_STATUS.REFUNDED
      ? VENDOR_FINANCIAL_TX_STATUS.REFUNDED
      : isRefundPending
      ? VENDOR_FINANCIAL_TX_STATUS.PENDING
      : VENDOR_FINANCIAL_TX_STATUS.SUCCESSFUL;

    if (hadPayment) {
      txns.push({
        id: `txn-fee-${slice.id}`,
        type: VENDOR_FINANCIAL_TX_TYPE.PLATFORM_FEE,
        status: feeStatus,
        sign: VENDOR_FIN_SIGN.DEBIT,
        amount: platformFee,
        description: `Platform fee — Order ${slice.id}`,
        orderId: slice.id,
        reference: `FEE-${slice.id}`,
        at: paidAt,
        events: [],
      });
    }

    // 3) Escrow Release — only for released slices
    if (isReleased) {
      txns.push({
        id: `txn-rel-${slice.id}`,
        type: VENDOR_FINANCIAL_TX_TYPE.ESCROW_RELEASE,
        status: VENDOR_FINANCIAL_TX_STATUS.SUCCESSFUL,
        sign: VENDOR_FIN_SIGN.CREDIT,
        amount: vendorSubtotal,
        description: `Escrow release — Order ${slice.id}`,
        orderId: slice.id,
        reference: `REL-${slice.id}`,
        at: slice.escrow.updatedAt ?? slice.updatedAt,
        events: slice.timeline
          .filter((e) => e.kind === VENDOR_ORDER_EVENT.COMPLETED)
          .map((e, i) => ({ id: `${slice.id}-rel-${i}`, title: e.title, detail: e.detail, at: e.at })),
      });
    }

    // 4) Refund rows
    if (hasRefund) {
      const refundStatus: VendorFinancialTxStatus =
        slice.refund.status === VENDOR_REFUND_STATUS.REFUNDED
          ? VENDOR_FINANCIAL_TX_STATUS.REFUNDED
          : VENDOR_FINANCIAL_TX_STATUS.PENDING;

      txns.push({
        id: `txn-ref-${slice.id}`,
        type: VENDOR_FINANCIAL_TX_TYPE.REFUND,
        status: refundStatus,
        sign: VENDOR_FIN_SIGN.DEBIT,
        amount: slice.refund.amount!,
        description: `Refund — ${slice.refund.reason ?? "Customer refund"}`,
        orderId: slice.id,
        reference: `REF-${slice.id}`,
        at: slice.refund.requestedAt ?? slice.updatedAt,
        events: slice.timeline
          .filter((e) => e.kind === VENDOR_ORDER_EVENT.REFUND_REQUESTED)
          .map((e, i) => ({ id: `${slice.id}-ref-${i}`, title: e.title, detail: e.detail, at: e.at })),
      });
    }
  }

  // 5) Payout rows from store
  for (const p of financialsStore.payouts) {
    txns.push({
      id: `txn-pout-${p.id}`,
      type: VENDOR_FINANCIAL_TX_TYPE.PAYOUT,
      status: p.status === "successful" ? VENDOR_FINANCIAL_TX_STATUS.SUCCESSFUL :
        p.status === "processing" ? VENDOR_FINANCIAL_TX_STATUS.PROCESSING :
        VENDOR_FINANCIAL_TX_STATUS.FAILED,
      sign: VENDOR_FIN_SIGN.DEBIT,
      amount: p.amount + p.fee,
      fee: p.fee,
      description: `Payout to ${p.bankName} •••${p.maskedAccountNumber.slice(-4)}`,
      reference: p.reference,
      payoutId: p.id,
      bankRef: `${p.bankName} ${p.maskedAccountNumber}`,
      at: p.requestedAt,
      events: [
        { id: `${p.id}-req`, title: "Payout requested", detail: `Amount ${formatNaira(p.amount)}, fee ${formatNaira(p.fee)}`, at: p.requestedAt },
        ...(p.processedAt ? [{ id: `${p.id}-done`, title: "Payout processed", detail: "Funds sent to bank", at: p.processedAt }] : []),
        ...(p.failedReason ? [{ id: `${p.id}-fail`, title: "Payout failed", detail: p.failedReason, at: p.processedAt ?? p.requestedAt }] : []),
      ],
    });
  }

  // Sort newest first
  return txns.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}

// ── Summary computation ──────────────────────────────────────

function computeSummary(): FinancialSummaryCard[] {
  const slices = getV8Slices();

  let totalEarnings = 0;
  let releasedTotal = 0;
  let pendingEscrow = 0;
  let frozenTotal = 0;
  let refundPendingTotal = 0;

  for (const slice of slices) {
    if (!isPaidSecured(slice)) continue;

    const vSub = slice.totals.vendorSubtotal;
    const escrowState = slice.escrow.state;

    if (escrowState === VENDOR_ESCROW_STATE.RELEASED) {
      releasedTotal += vSub;
      totalEarnings += vSub;
    } else if (isFrozenDispute(slice)) {
      frozenTotal += vSub;
      totalEarnings += vSub;
    } else if (isRefundedOrPending(slice)) {
      refundPendingTotal += slice.refund.amount ?? vSub;
      // excluded from totalEarnings
    } else {
      // funds_held, release_eligible, awaiting_fulfillment (in-transit)
      pendingEscrow += vSub;
      totalEarnings += vSub;
    }
  }

  // Payouts reduce available
  const successfulPayouts = financialsStore.payouts
    .filter((p) => p.status === "successful")
    .reduce((sum, p) => sum + p.amount + p.fee, 0);
  const processingPayouts = financialsStore.payouts
    .filter((p) => p.status === "processing")
    .reduce((sum, p) => sum + p.amount + p.fee, 0);

  const available = releasedTotal - successfulPayouts - processingPayouts;
  const pendingBalance = pendingEscrow + processingPayouts;

  // Last successful payout
  const lastSuccessful = [...financialsStore.payouts]
    .filter((p) => p.status === "successful")
    .sort((a, b) => new Date(b.processedAt ?? b.requestedAt).getTime() - new Date(a.processedAt ?? a.requestedAt).getTime())[0];

  return [
    {
      key: "available",
      label: "Available Balance",
      value: Math.max(0, available),
      sublabel: "Ready to withdraw",
      tone: "positive",
    },
    {
      key: "pending",
      label: "Pending Balance",
      value: pendingBalance,
      sublabel: "In escrow + processing payouts",
      tone: "info",
    },
    {
      key: "totalEarnings",
      label: "Total Earnings",
      value: totalEarnings,
      sublabel: "All time (net of fees)",
      tone: "neutral",
    },
    {
      key: "lastPayout",
      label: "Last Payout",
      value: lastSuccessful?.amount ?? 0,
      sublabel: lastSuccessful ? `Processed ${new Date(lastSuccessful.processedAt ?? lastSuccessful.requestedAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}` : "No payouts yet",
      tone: "neutral",
    },
  ];
}

function deriveEscrowReadiness(): EscrowReadiness {
  const slices = getV8Slices();
  const buckets: EscrowBucket[] = [];
  let frozenTotal = 0;
  let refundPendingTotal = 0;

  const bucketOrder: { state: VendorEscrowState; key: string; label: string; variant: EscrowBucket["variant"] }[] = [
    { state: VENDOR_ESCROW_STATE.RELEASED, key: "released", label: "Released", variant: "success" },
    { state: VENDOR_ESCROW_STATE.RELEASE_ELIGIBLE, key: "release_eligible", label: "Ready to release", variant: "success" },
    { state: VENDOR_ESCROW_STATE.FUNDS_HELD, key: "funds_held", label: "Funds held", variant: "info" },
    { state: VENDOR_ESCROW_STATE.AWAITING_FULFILLMENT, key: "awaiting_fulfillment", label: "In transit / awaiting", variant: "info" },
  ];

  for (const b of bucketOrder) {
    const matching = slices.filter((s) => isPaidSecured(s) && s.escrow.state === b.state && !isRefundedOrPending(s) && !isFrozenDispute(s));
    if (matching.length === 0) continue;
    buckets.push({
      key: b.key,
      label: b.label,
      variant: b.variant,
      total: matching.reduce((sum, s) => sum + s.totals.vendorSubtotal, 0),
      count: matching.length,
      orders: matching.map((s) => ({ id: s.id, amount: s.totals.vendorSubtotal, at: s.escrow.updatedAt ?? s.updatedAt })),
    });
  }

  // Frozen (disputed)
  const frozen = slices.filter((s) => isPaidSecured(s) && isFrozenDispute(s));
  if (frozen.length > 0) {
    frozenTotal = frozen.reduce((sum, s) => sum + s.totals.vendorSubtotal, 0);
    buckets.push({
      key: "frozen",
      label: "Frozen (dispute)",
      variant: "error",
      total: frozenTotal,
      count: frozen.length,
      orders: frozen.map((s) => ({ id: s.id, amount: s.totals.vendorSubtotal, at: s.dispute.openedAt ?? s.updatedAt })),
    });
  }

  // Refund pending
  const refundPending = slices.filter((s) => isPaidSecured(s) && isRefundedOrPending(s));
  if (refundPending.length > 0) {
    refundPendingTotal = refundPending.reduce((sum, s) => sum + (s.refund.amount ?? 0), 0);
    buckets.push({
      key: "refund_pending",
      label: "Refund pending",
      variant: "warning",
      total: refundPendingTotal,
      count: refundPending.length,
      orders: refundPending.map((s) => ({ id: s.id, amount: s.refund.amount ?? 0, at: s.refund.requestedAt ?? s.updatedAt })),
    });
  }

  return { buckets, frozenTotal, refundPendingTotal };
}

// ── Public API ───────────────────────────────────────────────

export function getFinancialOverview(): VendorFinancialOverview {
  const vendorId = ownerVendorId();
  if (!vendorId) {
    throw new Error("UNAUTHORIZED");
  }

  const allTxns = deriveLedger();
  const recent = allTxns.slice(0, 5);

  return {
    cards: computeSummary(),
    escrow: deriveEscrowReadiness(),
    recentTransactions: recent,
    account: getPayoutAccount(),
  };
}

export function getPayoutAccount(): VendorPayoutAccount {
  const vendorId = ownerVendorId();
  if (!vendorId) throw new Error("UNAUTHORIZED");
  return INITIAL_PAYOUT_ACCOUNT;
}

export function getTransactions(query: VendorFinancialQuery = {}): VendorFinancialPage<VendorFinancialTransaction> {
  const vendorId = ownerVendorId();
  if (!vendorId) throw new Error("UNAUTHORIZED");

  const {
    search = "",
    type = "all",
    status = "all",
    sign = "all",
    from,
    to,
    sort = VENDOR_FINANCIAL_SORT.NEWEST,
    page = 1,
    pageSize = 10,
  } = query;

  let items = deriveLedger();

  if (search) {
    const q = search.toLowerCase();
    items = items.filter(
      (t) =>
        t.id.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.reference.toLowerCase().includes(q) ||
        (t.orderId ?? "").toLowerCase().includes(q) ||
        (t.payoutId ?? "").toLowerCase().includes(q)
    );
  }

  if (type !== "all") items = items.filter((t) => t.type === type);
  if (status !== "all") items = items.filter((t) => t.status === status);
  if (sign !== "all") items = items.filter((t) => t.sign === sign);
  if (from) items = items.filter((t) => t.at >= from);
  if (to) items = items.filter((t) => t.at <= to);

  switch (sort) {
    case VENDOR_FINANCIAL_SORT.OLDEST:
      items.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
      break;
    case VENDOR_FINANCIAL_SORT.AMOUNT_DESC:
      items.sort((a, b) => b.amount - a.amount);
      break;
    case VENDOR_FINANCIAL_SORT.AMOUNT_ASC:
      items.sort((a, b) => a.amount - b.amount);
      break;
    default:
      // NEWEST already sorted
      break;
  }

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const paged = items.slice((page - 1) * pageSize, page * pageSize);

  const totals = paged.reduce(
    (acc, t) => {
      if (t.sign === VENDOR_FIN_SIGN.CREDIT) acc.credit += t.amount;
      else acc.debit += t.amount;
      return acc;
    },
    { credit: 0, debit: 0 }
  );

  return { items: paged, total, page, pageSize, totalPages, totals };
}

export function getTransactionById(transactionId: string): VendorFinancialTransaction | null {
  const vendorId = ownerVendorId();
  if (!vendorId) return null;
  const all = deriveLedger();
  return all.find((t) => t.id === transactionId) ?? null;
}

export function getPayouts(query: { page?: number; pageSize?: number; status?: VendorPayoutStatus | "all" } = {}): VendorFinancialPage<VendorPayout> {
  const vendorId = ownerVendorId();
  if (!vendorId) throw new Error("UNAUTHORIZED");

  const { page = 1, pageSize = 10, status = "all" } = query;
  let items = [...financialsStore.payouts].sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());

  if (status !== "all") items = items.filter((p) => p.status === status);

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const paged = items.slice((page - 1) * pageSize, page * pageSize);

  // totals: credit is never for payouts, debit is sum
  const totals = paged.reduce(
    (acc, p) => {
      acc.debit += p.amount + p.fee;
      return acc;
    },
    { credit: 0, debit: 0 }
  );

  return { items: paged, total, page, pageSize, totalPages, totals };
}

export function requestPayout(input: PayoutRequestInput): PayoutRequestResult {
  const vendorId = ownerVendorId();
  if (!vendorId) return { ok: false, code: VENDOR_FINANCIAL_RESULT.FORBIDDEN, error: "Vendor not found" };

  const perms = getVendorFinancialPermissions();
  if (!perms["payouts.request"]) {
    return { ok: false, code: VENDOR_FINANCIAL_RESULT.ACCOUNT_NOT_VERIFIED, error: "Payout account not verified" };
  }

  const account = getPayoutAccount();
  if (account.status !== "verified") {
    return { ok: false, code: VENDOR_FINANCIAL_RESULT.ACCOUNT_NOT_VERIFIED, error: "Payout account not verified" };
  }
  if (account.restrictions?.length) {
    return { ok: false, code: VENDOR_FINANCIAL_RESULT.ACCOUNT_RESTRICTED, error: "Account has restrictions" };
  }

  // Idempotency
  if (financialsStore.idempotencyKeys.has(input.idempotencyKey)) {
    const existing = financialsStore.payouts.find((p) => p.idempotencyKey === input.idempotencyKey);
    return { ok: false, code: VENDOR_FINANCIAL_RESULT.DUPLICATE_REQUEST, payout: existing, error: "Duplicate request" };
  }

  if (!input.confirmed) {
    return { ok: false, code: VENDOR_FINANCIAL_RESULT.NOT_CONFIRMED, error: "Confirmation required" };
  }

  const available = computeAvailable();
  const min = VENDOR_FINANCIAL_LIMITS.MIN_PAYOUT;
  const max = VENDOR_FINANCIAL_LIMITS.MAX_PAYOUT;
  const fee = VENDOR_FINANCIAL_LIMITS.PAYOUT_FEE;

  if (input.amount < min) return { ok: false, code: VENDOR_FINANCIAL_RESULT.BELOW_MINIMUM, error: `Minimum payout is ${formatNaira(min)}` };
  if (input.amount > max) return { ok: false, code: VENDOR_FINANCIAL_RESULT.ABOVE_MAXIMUM, error: `Maximum payout is ${formatNaira(max)}` };
  if (input.amount + fee > available) return { ok: false, code: VENDOR_FINANCIAL_RESULT.INSUFFICIENT_BALANCE, error: `Insufficient balance. Available: ${formatNaira(available)}` };

  // Create payout
  const now = nowIso();
  const seq = financialsStore.payouts.length + 1;
  const payout: VendorPayout = {
    id: `POUT-${2000 + seq}`,
    amount: input.amount,
    fee,
    status: "processing",
    bankName: account.bankName,
    maskedAccountNumber: account.maskedAccountNumber,
    requestedAt: now,
    expectedAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    reference: `KMPPOUT-${2000 + seq}`,
    idempotencyKey: input.idempotencyKey,
  };

  financialsStore.payouts.unshift(payout);
  financialsStore.idempotencyKeys.add(input.idempotencyKey);

  // Notification
  pushVendorNotification({
    kind: "payout_update",
    title: "Payout requested",
    body: `Your payout of ${formatNaira(input.amount)} is being processed to ${account.bankName} •••${account.maskedAccountNumber.slice(-4)}.`,
    href: "/vendor/financials/payouts",
    read: false,
    createdAt: now,
  });

  return { ok: true, code: VENDOR_FINANCIAL_RESULT.OK, payout, available: available - input.amount - fee };
}

export function computeAvailable(): number {
  const slices = getV8Slices();
  let releasedTotal = 0;
  for (const slice of slices) {
    if (!isPaidSecured(slice)) continue;
    if (slice.escrow.state === VENDOR_ESCROW_STATE.RELEASED) releasedTotal += slice.totals.vendorSubtotal;
  }
  const successful = financialsStore.payouts.filter((p) => p.status === "successful").reduce((s, p) => s + p.amount + p.fee, 0);
  const processing = financialsStore.payouts.filter((p) => p.status === "processing").reduce((s, p) => s + p.amount + p.fee, 0);
  return Math.max(0, releasedTotal - successful - processing);
}

function pushVendorNotification(n: Omit<VendorNotification, "id">): void {
  const id = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  notificationsMock.notifications.items.unshift({ id, ...n });
  notificationsMock.notifications.unreadCount += 1;
}

export function getStatement(query: VendorStatementQuery = {}): VendorStatement {
  const vendorId = ownerVendorId();
  if (!vendorId) throw new Error("UNAUTHORIZED");

  // All transactions for the vendor; filter by month if provided
  const all = deriveLedger();
  const month = query.month ?? new Date("2026-08-29").toISOString().slice(0, 7); // "2026-08"
  const monthTxns = all.filter((t) => t.at.startsWith(month));

  // Group by type
  const byType = monthTxns.reduce((acc, t) => {
    const key = t.type;
    if (!acc[key]) acc[key] = { total: 0, count: 0 };
    if (t.sign === VENDOR_FIN_SIGN.CREDIT) acc[key].total += t.amount;
    else acc[key].total -= t.amount;
    acc[key].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  const lines: VendorStatementLine[] = [
    {
      key: "earnings",
      label: "Escrow holds (gross earnings)",
      value: byType[VENDOR_FINANCIAL_TX_TYPE.ESCROW_HOLD]?.total ?? 0,
      count: byType[VENDOR_FINANCIAL_TX_TYPE.ESCROW_HOLD]?.count ?? 0,
      tone: "positive" as FinancialSummaryTone,
    },
    {
      key: "fees",
      label: "Platform fees",
      value: byType[VENDOR_FINANCIAL_TX_TYPE.PLATFORM_FEE]?.total ?? 0,
      count: byType[VENDOR_FINANCIAL_TX_TYPE.PLATFORM_FEE]?.count ?? 0,
      tone: "negative" as FinancialSummaryTone,
    },
    {
      key: "releases",
      label: "Escrow releases",
      value: byType[VENDOR_FINANCIAL_TX_TYPE.ESCROW_RELEASE]?.total ?? 0,
      count: byType[VENDOR_FINANCIAL_TX_TYPE.ESCROW_RELEASE]?.count ?? 0,
      tone: "positive" as FinancialSummaryTone,
    },
    {
      key: "refunds",
      label: "Refunds",
      value: byType[VENDOR_FINANCIAL_TX_TYPE.REFUND]?.total ?? 0,
      count: byType[VENDOR_FINANCIAL_TX_TYPE.REFUND]?.count ?? 0,
      tone: "negative" as FinancialSummaryTone,
    },
    {
      key: "payouts",
      label: "Payouts",
      value: byType[VENDOR_FINANCIAL_TX_TYPE.PAYOUT]?.total ?? 0,
      count: byType[VENDOR_FINANCIAL_TX_TYPE.PAYOUT]?.count ?? 0,
      tone: "negative" as FinancialSummaryTone,
    },
    {
      key: "adjustments",
      label: "Adjustments",
      value: byType[VENDOR_FINANCIAL_TX_TYPE.ADJUSTMENT]?.total ?? 0,
      count: byType[VENDOR_FINANCIAL_TX_TYPE.ADJUSTMENT]?.count ?? 0,
      tone: "neutral" as FinancialSummaryTone,
    },
  ].filter((l) => l.count > 0);

  const openingBalance = 0; // would be derived from prior period in real backend
  const netMovement = lines.reduce((sum, l) => sum + l.value, 0);
  const closingBalance = openingBalance + netMovement;

  const periodStart = `${month}-01`;
  const periodEnd = new Date(new Date(periodStart).getFullYear(), new Date(periodStart).getMonth() + 1, 0).toISOString().split("T")[0];

  return {
    periodLabel: new Date(periodStart).toLocaleDateString("en-NG", { month: "long", year: "numeric" }),
    from: periodStart,
    to: periodEnd,
    lines,
    openingBalance,
    closingBalance,
    exportable: true,
    generatedAt: nowIso(),
  };
}

export function exportStatementCsv(query: VendorStatementQuery = {}): { ok: boolean; filename: string; csv: string } {
  const statement = getStatement(query);
  const rows: string[][] = [
    ["Type", "Status", "Amount (NGN)", "Fee (NGN)", "Description", "Order ID", "Reference", "Date"],
    ...deriveLedger()
      .filter((t) => t.at.startsWith(statement.from.slice(0, 7)))
      .map((t) => [
        t.type,
        t.status,
        String(t.amount),
        String(t.fee ?? 0),
        t.description,
        t.orderId ?? "",
        t.reference,
        t.at,
      ]),
  ];
  const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
  return { ok: true, filename: `kampmax-statement-${statement.periodLabel.replace(/\s+/g, "-")}.csv`, csv };
}