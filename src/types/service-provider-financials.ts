// ============================================================
// SERVICE PROVIDER FINANCIALS — EARNINGS, TRANSACTIONS & PAYOUTS (Module 20)
// ============================================================
//
// SECURITY MODEL (backend-authoritative):
//   - Balances, ledger entries, payout eligibility and period totals are
//     COMPUTED BY THE BACKEND (the service layer here stands in for it). The
//     frontend only renders returned values; it NEVER sums or derives money.
//   - Ownership is always derived from the authenticated provider record (via
//     the booking ledger). A client can never pass another provider's id.
//   - Transactions are immutable. There is no edit/delete/change surface.
//   - Bank/payout details are returned MASKED only. No secrets in storage/URLs.
//   - Payout submissions are idempotency-protected and re-validated server-side
//     (available balance, minimum, maximum, account status, duplicates).
//   - Financial periods are resolved server-side; the client only requests a
//     period key plus an optional custom range.

// ── Transaction types (spec §9) ──────────────────────────────

export const SP_FINANCIAL_TX_TYPE = {
  SERVICE_PAYMENT: "service_payment",
  PLATFORM_FEE: "platform_fee",
  PAYOUT: "payout",
  ADJUSTMENT: "adjustment",
  REFUND: "refund",
} as const;

export type SpFinancialTxType = ValuesOf<typeof SP_FINANCIAL_TX_TYPE>;

// ── Transaction statuses (spec §10) ──────────────────────────
// Money movement safety: a pending/processing/disputed/on_hold entry is NEVER
// styled as successful. Failed/reversed/refunded entries are terminal.

export const SP_FINANCIAL_TX_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  SUCCESSFUL: "successful",
  FAILED: "failed",
  REVERSED: "reversed",
  REFUNDED: "refunded",
  DISPUTED: "disputed",
  ON_HOLD: "on_hold",
} as const;

export type SpFinancialTxStatus = ValuesOf<typeof SP_FINANCIAL_TX_STATUS>;

// ── Direction ────────────────────────────────────────────────

export const SP_FIN_SIGN = {
  CREDIT: "credit", // money IN for the provider
  DEBIT: "debit", // money OUT for the provider
} as const;

export type SpFinSign = ValuesOf<typeof SP_FIN_SIGN>;

// ── Ledger / transaction row ─────────────────────────────────
// One row is one backend ledger entry. Amounts are provider-relevant values
// (the platform fee already reflects the provider's cost; no frontend math).

export interface SpFinancialTransaction {
  id: string;
  type: SpFinancialTxType;
  status: SpFinancialTxStatus;
  sign: SpFinSign;
  amount: number;
  fee?: number;
  /** Human description rendered by the UI (backend-provided). */
  description: string;
  /** Linked service booking id when this entry belongs to a booking. */
  orderId?: string;
  reference: string;
  bankRef?: string;
  payoutId?: string;
  at: string;
  /** Backend event notes for the detail timeline. */
  events: { id: string; title: string; detail?: string; at: string }[];
}

// ── Financial summary cards ──────────────────────────────────

export type SpFinancialSummaryTone = "neutral" | "positive" | "negative" | "info";

export interface SpFinancialSummaryCard {
  key: string;
  label: string;
  value: number;
  sublabel?: string;
  tone: SpFinancialSummaryTone;
}

// ── Financial period (server-resolved) ───────────────────────

export const SP_FINANCIAL_PERIOD = {
  TODAY: "today",
  SEVEN_DAYS: "7d",
  THIRTY_DAYS: "30d",
  THIS_MONTH: "this_month",
  LAST_MONTH: "last_month",
  CUSTOM: "custom",
} as const;

export type SpFinancialPeriodKey = ValuesOf<typeof SP_FINANCIAL_PERIOD>;

export interface SpFinancialPeriod {
  key: SpFinancialPeriodKey;
  /** Custom range start (ISO date) — only used when key === "custom". */
  from?: string;
  /** Custom range end (ISO date) — only used when key === "custom". */
  to?: string;
}

// ── Period earnings breakdown (backend-computed) ─────────────

export interface SpEarningsBreakdown {
  periodLabel: string;
  from: string;
  to: string;
  /** Total gross service revenue for the period (settled only). */
  gross: number;
  /** Total platform fees collected for the period. */
  platformFees: number;
  /** Total withholding/tax for the period (illustrative, back-computed). */
  tax: number;
  /** gross − platformFees − tax. */
  net: number;
  /** Number of settled bookings in the period. */
  settledCount: number;
  /** Total payouts (amount + fee) in the period. */
  payoutTotal: number;
  payoutCount: number;
}

// ── Payout account ───────────────────────────────────────────

export const SP_PAYOUT_ACCOUNT_STATUS = {
  VERIFIED: "verified",
  PENDING_VERIFICATION: "pending_verification",
  FAILED: "failed",
  RESTRICTED: "restricted",
  MISSING: "missing",
} as const;

export type SpPayoutAccountStatus = ValuesOf<typeof SP_PAYOUT_ACCOUNT_STATUS>;

export interface SpPayoutAccount {
  bankName: string;
  bankCode: string;
  accountName: string;
  /** Backend-masked, display-only. Never a full number. */
  maskedAccountNumber: string;
  status: SpPayoutAccountStatus;
  verifiedAt?: string;
  currency: "NGN";
  restrictions?: string[];
}

// ── Payout account update input / result ─────────────────────
// No manual verification is offered: the backend owns verification. The client
// may submit details, which always move the account to pending_verification.

export interface SpPayoutAccountInput {
  bankName: string;
  accountName: string;
  accountNumber: string;
}

export const SP_PAYOUT_ACCOUNT_RESULT = {
  OK: "ok",
  INVALID_INPUT: "invalid_input",
  MISSING: "missing",
} as const;

export type SpPayoutAccountResultCode = ValuesOf<typeof SP_PAYOUT_ACCOUNT_RESULT>;

export interface SpPayoutAccountResult {
  ok: boolean;
  code: SpPayoutAccountResultCode;
  account?: SpPayoutAccount;
  error?: string;
}

// ── Payout request / history ─────────────────────────────────

export const SP_PAYOUT_STATUS = {
  PROCESSING: "processing",
  SUCCESSFUL: "successful",
  FAILED: "failed",
} as const;

export type SpPayoutStatus = ValuesOf<typeof SP_PAYOUT_STATUS>;

export interface SpPayout {
  id: string;
  amount: number;
  fee: number;
  status: SpPayoutStatus;
  bankName: string;
  maskedAccountNumber: string;
  requestedAt: string;
  processedAt?: string;
  expectedAt?: string;
  failedReason?: string;
  reference: string;
  idempotencyKey: string;
}

// ── Transaction query / pagination ───────────────────────────

export const SP_FINANCIAL_SORT = {
  NEWEST: "newest",
  OLDEST: "oldest",
  AMOUNT_DESC: "amount_desc",
  AMOUNT_ASC: "amount_asc",
} as const;

export type SpFinancialSort = ValuesOf<typeof SP_FINANCIAL_SORT>;

export interface SpFinancialQuery {
  search?: string;
  type?: SpFinancialTxType | "all";
  status?: SpFinancialTxStatus | "all";
  sign?: SpFinSign | "all";
  from?: string; // ISO date
  to?: string; // ISO date
  sort?: SpFinancialSort;
  page?: number;
  pageSize?: number;
}

export interface SpFinancialPage<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  totals: { credit: number; debit: number };
}

// ── Payout request input / result ────────────────────────────
// idempotencyKey is REQUIRED server-side so a retried click can never double
// debit. The frontend generates one key per intended submission.

export interface SpPayoutRequestInput {
  amount: number;
  idempotencyKey: string;
  confirmed: boolean; // backend requires an explicit confirmation flag
}

export const SP_FINANCIAL_RESULT = {
  OK: "ok",
  NOT_FOUND: "not_found",
  FORBIDDEN: "forbidden",
  ACCOUNT_NOT_VERIFIED: "account_not_verified",
  ACCOUNT_RESTRICTED: "account_restricted",
  INVALID_AMOUNT: "invalid_amount",
  BELOW_MINIMUM: "below_minimum",
  ABOVE_MAXIMUM: "above_maximum",
  INSUFFICIENT_BALANCE: "insufficient_balance",
  DUPLICATE_REQUEST: "duplicate_request",
  NOT_CONFIRMED: "not_confirmed",
} as const;

export type SpFinancialResultCode = ValuesOf<typeof SP_FINANCIAL_RESULT>;

export interface SpPayoutRequestResult {
  ok: boolean;
  code: SpFinancialResultCode;
  payout?: SpPayout;
  available?: number;
  error?: string;
}

// ── Financial limits / platform rules (presentation constants) ─
// The SERVICE re-validates every value; these only inform the forms.

export const SP_FINANCIAL_LIMITS = {
  MIN_PAYOUT: 2000,
  MAX_PAYOUT: 2_000_000,
  PAYOUT_FEE: 50,
  IDEMPOTENCY_WINDOW_HOURS: 24,
} as const;

// ── Permission model (presentation; backend remains authoritative) ─

export const SP_FINANCIAL_PERMISSION_KEYS = [
  "financials.view",
  "transactions.view",
  "payouts.view",
  "payouts.request",
  "payout_account.manage",
] as const;

export type SpFinancialPermissionKey = (typeof SP_FINANCIAL_PERMISSION_KEYS)[number];
export type SpFinancialPermissions = Record<SpFinancialPermissionKey, boolean>;

// ── Overview bundle ──────────────────────────────────────────

export interface SpFinancialOverview {
  cards: SpFinancialSummaryCard[];
  breakdown: SpEarningsBreakdown;
  /** All-time, unfiltered ledger (newest first) for the "recent" panel. */
  recentTransactions: SpFinancialTransaction[];
  account: SpPayoutAccount;
}

// ── CSV export result ────────────────────────────────────────
// Backend-generated string; the client only triggers the file download.

export interface SpCsvExport {
  ok: boolean;
  filename: string;
  csv: string;
}

type ValuesOf<T> = T[keyof T];