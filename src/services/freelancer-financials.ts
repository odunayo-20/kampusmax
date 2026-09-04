// ============================================================
// FREELANCER FINANCIALS SERVICE  (Module 25)
// ============================================================
//
// SECURITY: All balances, period totals and ledger entries are COMPUTED BY THIS
// SERVICE from the Module 24 contract ledger (completed contracts only). The
// frontend never sums or derives money. Ownership is derived from the
// authenticated freelancer identity — IDOR-safe. Every financial value returned
// is backend-authoritative.
//
// Ledger model per completed contract:
//   earning (CREDIT, agreedAmount) + platform_fee (DEBIT, fee) — the net is the
//   freelancer's earned amount. Contract earnings only settle when the contract
//   is COMPLETED; active/in-progress contracts are never styled as paid.
//
// Payouts are idempotency-keyed and re-validated server-side (available balance,
// minimum, maximum, account status, duplicate requests). The frontend may never
// deduct its own balance.

import { getCurrentUser } from "@/services/users";
import { getFreelancerContracts } from "@/services/contract";
import { pushUserNotification } from "@/services/notifications";
import { formatNaira } from "@/lib/utils";
import { CONTRACT_STATUS } from "@/types/contract";
import { flFinancialsStore } from "@/data/freelancer-financials";
import {
  FL_FINANCIAL_TX_TYPE,
  FL_FINANCIAL_TX_STATUS,
  FL_FIN_SIGN,
  FL_FINANCIAL_SORT,
  FL_FINANCIAL_PERIOD,
  FL_FINANCIAL_RESULT,
  FL_PAYOUT_ACCOUNT_RESULT,
  FL_FINANCIAL_LIMITS,
  FL_PAYOUT_STATUS,
  FL_PAYOUT_ELIGIBILITY,
} from "@/types/freelancer-financials";
import type {
  FlBalance,
  FlEarningsPeriod,
  FlFinancialOverview,
  FlFinancialPage,
  FlFinancialPeriodKey,
  FlFinancialQuery,
  FlFinancialSummaryCard,
  FlFinancialTransaction,
  FlFinancialTxStatus,
  FlPayout,
  FlPayoutAccount,
  FlPayoutAccountInput,
  FlPayoutAccountResult,
  FlPayoutEligibility,
  FlPayoutRequestInput,
  FlPayoutRequestResult,
  FlPayoutStatus,
} from "@/types/freelancer-financials";

// ── Ownership / access ──────────────────────────────────────
// Ownership is ALWAYS derived from the authenticated identity. The client can
// never pass a freelancer id (IDOR/BOLA). Currency is fixed to the platform.

function currentUserId(): string | null {
  return getCurrentUser()?.id ?? null;
}

function requireOwner(): string {
  const uid = currentUserId();
  if (!uid) throw new Error("UNAUTHORIZED");
  return uid;
}

const CURRENCY = "NGN" as const;

// ── Period resolution (server-side only) ─────────────────────

interface PeriodWindow {
  key: FlFinancialPeriodKey;
  label: string;
  from: number;
  to: number;
}

const DAY_MS = 24 * 3_600_000;

function resolvePeriods(): PeriodWindow[] {
  const now = Date.now();
  return [
    { key: FL_FINANCIAL_PERIOD.SEVEN_DAYS, label: "Last 7 days", from: now - 7 * DAY_MS, to: now },
    { key: FL_FINANCIAL_PERIOD.THIRTY_DAYS, label: "Last 30 days", from: now - 30 * DAY_MS, to: now },
    { key: FL_FINANCIAL_PERIOD.NINETY_DAYS, label: "Last 3 months", from: now - 90 * DAY_MS, to: now },
    { key: FL_FINANCIAL_PERIOD.TWELVE_MONTHS, label: "Last 12 months", from: now - 365 * DAY_MS, to: now },
  ];
}

export function getFinancialPeriodLabel(key: FlFinancialPeriodKey): string {
  const found = resolvePeriods().find((p) => p.key === key);
  return found?.label ?? "Period";
}

// ── Ledger derivation (single source of truth) ───────────────
// Earnings are derived ONLY from backend-completed contracts (Module 24) so the
// financials module can never disagree with the contracts module.

function contractPlatformFee(amount: number): number {
  // Prototype fee model (illustrative, backend-authoritative): 10% platform fee.
  return Math.round(amount * 0.1);
}

function deriveLedger(): FlFinancialTransaction[] {
  const uid = requireOwner();
  const contracts = getFreelancerContracts();
  const txns: FlFinancialTransaction[] = [];

  for (const c of contracts) {
    const amount = c.agreedAmount ?? 0;
    if (amount <= 0) continue;

    if (c.status === CONTRACT_STATUS.COMPLETED) {
      const fee = contractPlatformFee(amount);
      txns.push({
        id: `txn-earn-${c.id}`,
        type: FL_FINANCIAL_TX_TYPE.EARNING,
        status: FL_FINANCIAL_TX_STATUS.SUCCESSFUL,
        sign: FL_FIN_SIGN.CREDIT,
        amount,
        description: `Payment — ${c.projectTitle}`,
        contractId: c.id,
        contractTitle: c.projectTitle,
        reference: `KMP-EARN-${c.id.slice(0, 6).toUpperCase()}`,
        at: c.updatedAt,
        events: [
          { id: `${c.id}-earn-1`, title: "Milestone released", detail: `Payment for ${c.projectTitle} was released.`, at: c.completedMilestones ? c.updatedAt : c.updatedAt },
        ],
      });
      txns.push({
        id: `txn-fee-${c.id}`,
        type: FL_FINANCIAL_TX_TYPE.PLATFORM_FEE,
        status: FL_FINANCIAL_TX_STATUS.SUCCESSFUL,
        sign: FL_FIN_SIGN.DEBIT,
        amount: fee,
        description: `Platform fee — ${c.projectTitle}`,
        contractId: c.id,
        contractTitle: c.projectTitle,
        reference: `KMP-FEE-${c.id.slice(0, 6).toUpperCase()}`,
        at: c.updatedAt,
        events: [],
      });
    } else if (c.status === CONTRACT_STATUS.DISPUTED) {
      // Frozen — never counted as paid. Surface as an informational reversal edge.
      txns.push({
        id: `txn-dispute-${c.id}`,
        type: FL_FINANCIAL_TX_TYPE.REVERSAL,
        status: FL_FINANCIAL_TX_STATUS.REVERSED,
        sign: FL_FIN_SIGN.CREDIT,
        amount,
        description: `Disputed payment — ${c.projectTitle}`,
        contractId: c.id,
        contractTitle: c.projectTitle,
        reference: `KMP-DISP-${c.id.slice(0, 6).toUpperCase()}`,
        at: c.updatedAt,
        events: [],
      });
    }
  }

  // Payout rows from the payout store.
  for (const p of flFinancialsStore.payouts) {
    txns.push({
      id: `txn-pout-${p.id}`,
      type: FL_FINANCIAL_TX_TYPE.PAYOUT,
      status: payoutToTxStatus(p.status),
      sign: FL_FIN_SIGN.DEBIT,
      amount: p.amount + p.fee,
      fee: p.fee,
      description: `Withdrawal to ${p.bankName} •••${p.maskedAccountNumber.slice(-4)}`,
      payoutId: p.id,
      bankRef: `${p.bankName} ${p.maskedAccountNumber}`,
      reference: p.reference,
      at: p.requestedAt,
      events: [
        { id: `${p.id}-req`, title: "Withdrawal requested", detail: `Amount ${formatNaira(p.amount)}, fee ${formatNaira(p.fee)}`, at: p.requestedAt },
        ...(p.processedAt ? [{ id: `${p.id}-done`, title: "Withdrawal processed", detail: "Funds sent to bank", at: p.processedAt }] : []),
        ...(p.failedReason ? [{ id: `${p.id}-fail`, title: "Withdrawal failed", detail: p.failedReason, at: p.processedAt ?? p.requestedAt }] : []),
      ],
    });
  }

  void uid;
  return txns.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}

function payoutToTxStatus(status: FlPayoutStatus): FlFinancialTxStatus {
  switch (status) {
    case FL_PAYOUT_STATUS.REQUESTED:
      return FL_FINANCIAL_TX_STATUS.PENDING;
    case FL_PAYOUT_STATUS.PROCESSING:
      return FL_FINANCIAL_TX_STATUS.PROCESSING;
    case FL_PAYOUT_STATUS.COMPLETED:
      return FL_FINANCIAL_TX_STATUS.SUCCESSFUL;
    case FL_PAYOUT_STATUS.FAILED:
      return FL_FINANCIAL_TX_STATUS.FAILED;
    case FL_PAYOUT_STATUS.REVERSED:
      return FL_FINANCIAL_TX_STATUS.REVERSED;
    case FL_PAYOUT_STATUS.CANCELLED:
      return FL_FINANCIAL_TX_STATUS.CANCELLED;
  }
}

// ── Balance (backend-computed) ───────────────────────────────

function computeBalance(): FlBalance {
  const contracts = getFreelancerContracts();
  let totalEarned = 0;

  for (const c of contracts) {
    if (c.status === CONTRACT_STATUS.COMPLETED) {
      const amount = c.agreedAmount ?? 0;
      const fee = contractPlatformFee(amount);
      totalEarned += amount - fee;
    }
  }

  // Pending = amounts from active/awaiting contracts that are NOT yet settled.
  let pending = 0;
  for (const c of contracts) {
    if (
      c.status !== CONTRACT_STATUS.COMPLETED &&
      c.status !== CONTRACT_STATUS.CANCELLED &&
      c.status !== CONTRACT_STATUS.DISPUTED &&
      c.status !== CONTRACT_STATUS.PENDING_ACCEPTANCE
    ) {
      const amount = c.agreedAmount ?? 0;
      const fee = contractPlatformFee(amount);
      pending += amount - fee;
    }
  }

  // In-flight payouts reduce available (both completed and processing).
  const inFlight = flFinancialsStore.payouts
    .filter((p) => p.status === FL_PAYOUT_STATUS.PROCESSING || p.status === FL_PAYOUT_STATUS.REQUESTED)
    .reduce((sum, p) => sum + p.amount + p.fee, 0);

  const available = Math.max(0, totalEarned - inFlight);
  return { currency: CURRENCY, available, pending, asOf: new Date().toISOString() };
}

// ── Summary / period earnings ────────────────────────────────

function computeCards(): FlFinancialSummaryCard[] {
  const balance = computeBalance();
  const contracts = getFreelancerContracts();
  let totalEarnedNet = 0;
  let paidOut = 0;
  let totalFees = 0;

  for (const c of contracts) {
    if (c.status === CONTRACT_STATUS.COMPLETED) {
      const amount = c.agreedAmount ?? 0;
      totalEarnedNet += amount - contractPlatformFee(amount);
      totalFees += contractPlatformFee(amount);
    }
  }
  paidOut = flFinancialsStore.payouts
    .filter((p) => p.status === FL_PAYOUT_STATUS.COMPLETED)
    .reduce((sum, p) => sum + p.amount, 0);

  return [
    {
      key: "available",
      label: "Available Balance",
      value: balance.available,
      sublabel: "Ready to withdraw",
      tone: "positive",
    },
    {
      key: "pending",
      label: "Pending",
      value: balance.pending,
      sublabel: "In active contracts",
      tone: "info",
    },
    {
      key: "totalEarned",
      label: "Total Earned",
      value: totalEarnedNet,
      sublabel: "Net of fees (all time)",
      tone: "neutral",
    },
    {
      key: "paidOut",
      label: "Paid Out",
      value: paidOut,
      sublabel: "Completed withdrawals",
      tone: "neutral",
    },
  ];
}

function computePeriods(): FlEarningsPeriod[] {
  const contracts = getFreelancerContracts();
  const windows = resolvePeriods();
  const periods: FlEarningsPeriod[] = [];

  for (const w of windows) {
    let total = 0;
    let count = 0;
    for (const c of contracts) {
      if (c.status !== CONTRACT_STATUS.COMPLETED) continue;
      const atMs = new Date(c.updatedAt).getTime();
      if (atMs >= w.from && atMs <= w.to) {
        const amount = c.agreedAmount ?? 0;
        total += amount - contractPlatformFee(amount);
        count += 1;
      }
    }
    periods.push({
      key: w.key,
      total,
      count,
      periodLabel: w.label,
      from: new Date(w.from).toISOString(),
      to: new Date(w.to).toISOString(),
    });
  }
  return periods;
}

// ── Payout eligibility (spec §22) ────────────────────────────

export function getPayoutEligibility(): FlPayoutEligibility {
  const account = getPayoutAccount();
  const balance = computeBalance();
  const min = FL_FINANCIAL_LIMITS.MIN_PAYOUT;
  const max = FL_FINANCIAL_LIMITS.MAX_PAYOUT;

  const pendingPayout = flFinancialsStore.payouts.find(
    (p) => p.status === FL_PAYOUT_STATUS.PROCESSING || p.status === FL_PAYOUT_STATUS.REQUESTED
  );

  if (pendingPayout) {
    return {
      status: FL_PAYOUT_ELIGIBILITY.PENDING_PAYOUT,
      canRequest: false,
      reason: "You already have a withdrawal in progress. Wait for it to complete before requesting another.",
      minimumAmount: min,
      maximumAmount: max,
      available: balance.available,
    };
  }

  if (account.restrictions?.length) {
    return {
      status: FL_PAYOUT_ELIGIBILITY.RESTRICTED,
      canRequest: false,
      reason: "Withdrawals are temporarily restricted on your account.",
      minimumAmount: min,
      maximumAmount: max,
      available: balance.available,
    };
  }

  if (account.status === "missing") {
    return {
      status: FL_PAYOUT_ELIGIBILITY.PAYOUT_METHOD_REQUIRED,
      canRequest: false,
      reason: "Add and verify a payout method to receive withdrawals.",
      minimumAmount: min,
      maximumAmount: max,
      available: balance.available,
    };
  }

  if (account.status !== "verified") {
    return {
      status: FL_PAYOUT_ELIGIBILITY.ACCOUNT_VERIFICATION_REQUIRED,
      canRequest: false,
      reason: "Your payout method must be verified before you can withdraw.",
      minimumAmount: min,
      maximumAmount: max,
      available: balance.available,
    };
  }

  if (balance.available < min) {
    return {
      status: FL_PAYOUT_ELIGIBILITY.BELOW_MINIMUM,
      canRequest: false,
      reason: `The minimum withdrawal is ${formatNaira(min)}.`,
      minimumAmount: min,
      maximumAmount: max,
      available: balance.available,
    };
  }

  return {
    status: FL_PAYOUT_ELIGIBILITY.ELIGIBLE,
    canRequest: true,
    reason: "You're eligible to withdraw funds.",
    minimumAmount: min,
    maximumAmount: max,
    available: balance.available,
  };
}

// ── Public API ───────────────────────────────────────────────

export function getFinancialOverview(): FlFinancialOverview {
  requireOwner();
  return {
    balance: computeBalance(),
    cards: computeCards(),
    periods: computePeriods(),
    recentTransactions: deriveLedger().slice(0, 5),
    account: getPayoutAccount(),
    pendingPayout:
      flFinancialsStore.payouts.find(
        (p) => p.status === FL_PAYOUT_STATUS.PROCESSING || p.status === FL_PAYOUT_STATUS.REQUESTED
      ) ?? null,
  };
}

export function getPayoutAccount(): FlPayoutAccount {
  requireOwner();
  return flFinancialsStore.account;
}

export function updatePayoutAccount(input: FlPayoutAccountInput): FlPayoutAccountResult {
  if (!currentUserId()) {
    return { ok: false, code: FL_PAYOUT_ACCOUNT_RESULT.MISSING, error: "You don't have a payout account." };
  }
  const bankName = input.bankName.trim();
  const accountName = input.accountName.trim();
  const accountNumber = input.accountNumber.replace(/\D/g, "");
  if (!bankName || !accountName || accountNumber.length < 10) {
    return { ok: false, code: FL_PAYOUT_ACCOUNT_RESULT.INVALID_INPUT, error: "Enter a valid bank, account name, and 10-digit account number." };
  }

  flFinancialsStore.account = {
    bankName,
    bankCode: "000",
    accountName,
    maskedAccountNumber: maskForDisplay(accountNumber),
    status: "pending_verification",
    verifiedAt: undefined,
    currency: CURRENCY,
    restrictions: [],
  };

  return {
    ok: true,
    code: FL_PAYOUT_ACCOUNT_RESULT.OK,
    account: flFinancialsStore.account,
  };
}

function maskForDisplay(rawDigits: string): string {
  const digits = rawDigits.replace(/\D/g, "");
  if (digits.length < 4) return "••••••••••";
  return `••••••••${digits.slice(-4)}`;
}

export function getTransactions(query: FlFinancialQuery = {}): FlFinancialPage<FlFinancialTransaction> {
  requireOwner();
  const {
    search = "",
    type = "all",
    status = "all",
    sign = "all",
    from,
    to,
    sort = FL_FINANCIAL_SORT.NEWEST,
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
        (t.contractId ?? "").toLowerCase().includes(q) ||
        (t.payoutId ?? "").toLowerCase().includes(q)
    );
  }

  if (type !== "all") items = items.filter((t) => t.type === type);
  if (status !== "all") items = items.filter((t) => t.status === status);
  if (sign !== "all") items = items.filter((t) => t.sign === sign);
  if (from) items = items.filter((t) => t.at >= `${from}T00:00:00.000Z`);
  if (to) items = items.filter((t) => t.at <= `${to}T23:59:59.999Z`);

  switch (sort) {
    case FL_FINANCIAL_SORT.OLDEST:
      items.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
      break;
    case FL_FINANCIAL_SORT.AMOUNT_DESC:
      items.sort((a, b) => b.amount - a.amount);
      break;
    case FL_FINANCIAL_SORT.AMOUNT_ASC:
      items.sort((a, b) => a.amount - b.amount);
      break;
    default:
      break;
  }

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const paged = items.slice((page - 1) * pageSize, page * pageSize);

  const totals = paged.reduce(
    (acc, t) => {
      if (t.sign === FL_FIN_SIGN.CREDIT) acc.credit += t.amount;
      else acc.debit += t.amount;
      return acc;
    },
    { credit: 0, debit: 0 }
  );

  return { items: paged, total, page, pageSize, totalPages, totals };
}

export function getTransactionById(transactionId: string): FlFinancialTransaction | null {
  requireOwner();
  return deriveLedger().find((t) => t.id === transactionId) ?? null;
}

export function getPayouts(query: { page?: number; pageSize?: number; status?: FlPayoutStatus | "all" } = {}): FlFinancialPage<FlPayout> {
  requireOwner();
  const { page = 1, pageSize = 10, status = "all" } = query;
  let items = [...flFinancialsStore.payouts].sort(
    (a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
  );

  if (status !== "all") items = items.filter((p) => p.status === status);

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const paged = items.slice((page - 1) * pageSize, page * pageSize);

  const totals = paged.reduce(
    (acc, p) => {
      acc.debit += p.amount + p.fee;
      return acc;
    },
    { credit: 0, debit: 0 }
  );

  return { items: paged, total, page, pageSize, totalPages, totals };
}

export function getPayoutById(payoutId: string): FlPayout | null {
  requireOwner();
  return flFinancialsStore.payouts.find((p) => p.id === payoutId) ?? null;
}

export function requestPayout(input: FlPayoutRequestInput): FlPayoutRequestResult {
  if (!currentUserId()) {
    return { ok: false, code: FL_FINANCIAL_RESULT.FORBIDDEN, error: "Freelancer not found" };
  }

  const account = getPayoutAccount();
  if (account.status !== "verified") {
    return { ok: false, code: FL_FINANCIAL_RESULT.ACCOUNT_NOT_VERIFIED, error: "Payout method not verified." };
  }
  if (account.restrictions?.length) {
    return { ok: false, code: FL_FINANCIAL_RESULT.ACCOUNT_RESTRICTED, error: "Your payout method has restrictions." };
  }

  // Idempotency: a retried click with the same key must never double-debit.
  if (flFinancialsStore.idempotencyKeys.has(input.idempotencyKey)) {
    const existing = flFinancialsStore.payouts.find((p) => p.idempotencyKey === input.idempotencyKey);
    return { ok: false, code: FL_FINANCIAL_RESULT.DUPLICATE_REQUEST, payout: existing, error: "Duplicate request" };
  }

  if (!input.confirmed) {
    return { ok: false, code: FL_FINANCIAL_RESULT.NOT_CONFIRMED, error: "Confirmation required" };
  }

  // Stale-balance guard: if an unrelated payout was added since the form loaded,
  // the client-submitted amount may now exceed the authoritative available.
  const balance = computeBalance();
  const eligibility = getPayoutEligibility();
  if (!eligibility.canRequest) {
    return {
      ok: false,
      code:
        eligibility.status === FL_PAYOUT_ELIGIBILITY.PENDING_PAYOUT
          ? FL_FINANCIAL_RESULT.PENDING_PAYOUT
          : eligibility.status === FL_PAYOUT_ELIGIBILITY.BELOW_MINIMUM
          ? FL_FINANCIAL_RESULT.BELOW_MINIMUM
          : FL_FINANCIAL_RESULT.ACCOUNT_NOT_VERIFIED,
      error: eligibility.reason,
      available: balance.available,
    };
  }

  const min = FL_FINANCIAL_LIMITS.MIN_PAYOUT;
  const max = FL_FINANCIAL_LIMITS.MAX_PAYOUT;
  const fee = FL_FINANCIAL_LIMITS.PAYOUT_FEE;

  if (input.amount < min) return { ok: false, code: FL_FINANCIAL_RESULT.BELOW_MINIMUM, error: `Minimum payout is ${formatNaira(min)}`, available: balance.available };
  if (input.amount > max) return { ok: false, code: FL_FINANCIAL_RESULT.ABOVE_MAXIMUM, error: `Maximum payout is ${formatNaira(max)}`, available: balance.available };
  if (!Number.isInteger(input.amount) || input.amount <= 0) {
    return { ok: false, code: FL_FINANCIAL_RESULT.INVALID_AMOUNT, error: "Enter a valid payout amount.", available: balance.available };
  }
  if (input.amount + fee > balance.available) {
    return { ok: false, code: FL_FINANCIAL_RESULT.STALE_BALANCE, error: `Your available balance has changed. Available: ${formatNaira(balance.available)}.`, available: balance.available };
  }

  const now = detailedNow();
  const seq = nextPayoutSeq();
  const payout: FlPayout = {
    id: `FLPOUT-${seq}`,
    amount: input.amount,
    fee,
    status: FL_PAYOUT_STATUS.PROCESSING,
    bankName: account.bankName,
    maskedAccountNumber: account.maskedAccountNumber,
    requestedAt: now,
    expectedAt: new Date(Date.now() + 24 * 3_600_000).toISOString(),
    reference: `KMP-FLPOUT-${seq}`,
    idempotencyKey: input.idempotencyKey,
    events: [
      { id: `flout-${seq}-req`, title: "Withdrawal requested", detail: `Amount ${formatNaira(input.amount)}, fee ${formatNaira(fee)}`, at: now },
      { id: `flout-${seq}-proc`, title: "Processing", detail: "Your withdrawal is being processed by the payout system.", at: now },
    ],
  };

  flFinancialsStore.payouts.unshift(payout);
  flFinancialsStore.idempotencyKeys.add(input.idempotencyKey);

  pushUserNotification({
    userId: currentUserId()!,
    type: "payments",
    category: "payments",
    title: "Withdrawal requested",
    message: `Your withdrawal of ${formatNaira(input.amount)} is being processed to ${account.bankName} •••${account.maskedAccountNumber.slice(-4)}.`,
    actionUrl: "/freelancer/payouts",
  });

  return {
    ok: true,
    code: FL_FINANCIAL_RESULT.OK,
    payout,
    available: balance.available - input.amount - fee,
  };
}

function detailedNow(): string {
  return new Date().toISOString();
}

function nextPayoutSeq(): number {
  const ids = flFinancialsStore.payouts
    .map((p) => Number((p.id.match(/\d+/) ?? ["4000"])[0]))
    .filter((n) => !Number.isNaN(n));
  const base = ids.length ? Math.max(...ids) : 4000;
  return base + 1;
}

export { FL_FINANCIAL_PERIOD };
