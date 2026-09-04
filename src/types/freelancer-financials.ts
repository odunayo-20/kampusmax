// ============================================================
// FREELANCER FINANCIALS — EARNINGS, TRANSACTIONS & PAYOUTS (Module 25)
// ============================================================
//
// SECURITY MODEL (backend-authoritative):
//   - Balances, ledger entries, payout eligibility and period totals are
//     COMPUTED BY THE BACKEND (the service layer here stands in for it). The
//     frontend only renders returned values; it NEVER sums or derives money.
//   - Ownership is always derived from the authenticated freelancer identity.
//     A client can never pass another freelancer's id (IDOR/BOLA protection).
//   - Transactions are immutable. There is no edit/delete/change surface.
//   - Bank/payout details are returned MASKED only. No secrets in storage/URLs.
//   - Payout submissions are idempotency-protected and re-validated server-side
//     (available balance, minimum, maximum, account status, duplicate requests).
//   - Earnings are derived from backend-completed FREELANCE CONTRACTS (Module 24)
//     so the financials module can never disagree with the contracts module.
//   - Currency is fixed to the platform account (NGN). Never client-chosen.

// ── Transaction types (spec §11) ─────────────────────────────

export const FL_FINANCIAL_TX_TYPE = {
  EARNING: "earning", // Milestone/contract payment earned (completed contract)
  PLATFORM_FEE: "platform_fee",
  PAYOUT: "payout",
  REFUND: "refund",
  REVERSAL: "reversal",
  ADJUSTMENT: "adjustment",
} as const;

export type FlFinancialTxType = ValuesOf<typeof FL_FINANCIAL_TX_TYPE>;

// ── Transaction statuses (spec §12) ──────────────────────────
// Money movement safety: a pending/processing entry is NEVER styled as
// successful. Failed/reversed/refunded/cancelled entries are terminal.

export const FL_FINANCIAL_TX_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  SUCCESSFUL: "successful",
  COMPLETED: "completed",
  FAILED: "failed",
  REVERSED: "reversed",
  REFUNDED: "refunded",
  CANCELLED: "cancelled",
} as const;

export type FlFinancialTxStatus = ValuesOf<typeof FL_FINANCIAL_TX_STATUS>;

// ── Direction ────────────────────────────────────────────────

export const FL_FIN_SIGN = {
  CREDIT: "credit", // money IN for the freelancer
  DEBIT: "debit", // money OUT for the freelancer
} as const;

export type FlFinSign = ValuesOf<typeof FL_FIN_SIGN>;

// ── Ledger / transaction row ─────────────────────────────────
// One row is one backend ledger entry. Amounts are freelancer-relevant values
// (gross, gross amount earned from a contract; fee is platform's cost).

export interface FlFinancialTransaction {
  id: string;
  type: FlFinancialTxType;
  status: FlFinancialTxStatus;
  sign: FlFinSign;
  amount: number;
  fee?: number;
  /** Human description rendered by the UI (backend-provided). */
  description: string;
  /** Related contract id when this entry belongs to a contract (Module 24). */
  contractId?: string;
  /** Related contract title for display. */
  contractTitle?: string;
  payoutId?: string;
  reference: string;
  bankRef?: string;
  at: string;
  /** Backend event notes for the detail timeline. */
  events: { id: string; title: string; detail?: string; at: string }[];
}

// ── Financial summary cards ──────────────────────────────────

export type FlFinancialSummaryTone = "neutral" | "positive" | "negative" | "info";

export interface FlFinancialSummaryCard {
  key: string;
  label: string;
  value: number;
  sublabel?: string;
  tone: FlFinancialSummaryTone;
}

// ── Balance (backend-computed) ───────────────────────────────

export interface FlBalance {
  currency: "NGN";
  available: number;
  pending: number;
  /** Last time the backend computed/refreshed this balance. */
  asOf: string;
}

// ── Payout account / method ───────────────────────────────────

export const FL_PAYOUT_ACCOUNT_STATUS = {
  VERIFIED: "verified",
  PENDING_VERIFICATION: "pending_verification",
  FAILED: "failed",
  RESTRICTED: "restricted",
  MISSING: "missing",
} as const;

export type FlPayoutAccountStatus = ValuesOf<typeof FL_PAYOUT_ACCOUNT_STATUS>;

export interface FlPayoutAccount {
  bankName: string;
  bankCode: string;
  accountName: string;
  /** Backend-masked, display-only. Never a full number. */
  maskedAccountNumber: string;
  status: FlPayoutAccountStatus;
  verifiedAt?: string;
  currency: "NGN";
  restrictions?: string[];
}

// ── Payout account update input / result ─────────────────────
// No manual verification is offered: the backend owns verification. The client
// may submit details, which always move the account to pending_verification.

export interface FlPayoutAccountInput {
  bankName: string;
  accountName: string;
  accountNumber: string;
}

export const FL_PAYOUT_ACCOUNT_RESULT = {
  OK: "ok",
  INVALID_INPUT: "invalid_input",
  MISSING: "missing",
} as const;

export type FlPayoutAccountResultCode = ValuesOf<typeof FL_PAYOUT_ACCOUNT_RESULT>;

export interface FlPayoutAccountResult {
  ok: boolean;
  code: FlPayoutAccountResultCode;
  account?: FlPayoutAccount;
  error?: string;
}

// ── Payout eligibility (spec §22) ─────────────────────────────

export const FL_PAYOUT_ELIGIBILITY = {
  ELIGIBLE: "eligible",
  BELOW_MINIMUM: "below_minimum",
  ACCOUNT_VERIFICATION_REQUIRED: "account_verification_required",
  PAYOUT_METHOD_REQUIRED: "payout_method_required",
  TEMPORARILY_DISABLED: "temporarily_disabled",
  PENDING_PAYOUT: "pending_payout",
  RESTRICTED: "restricted",
} as const;

export type FlPayoutEligibilityStatus =
  ValuesOf<typeof FL_PAYOUT_ELIGIBILITY>;

export interface FlPayoutEligibility {
  status: FlPayoutEligibilityStatus;
  canRequest: boolean;
  reason?: string;
  minimumAmount?: number;
  maximumAmount?: number;
  available?: number;
}

// ── Payout request / history (spec §29) ───────────────────────

export const FL_PAYOUT_STATUS = {
  REQUESTED: "requested",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
  REVERSED: "reversed",
  CANCELLED: "cancelled",
} as const;

export type FlPayoutStatus = ValuesOf<typeof FL_PAYOUT_STATUS>;

export interface FlPayout {
  id: string;
  amount: number;
  fee: number;
  status: FlPayoutStatus;
  bankName: string;
  maskedAccountNumber: string;
  requestedAt: string;
  processedAt?: string;
  expectedAt?: string;
  failedReason?: string;
  reversalReason?: string;
  reference: string;
  idempotencyKey: string;
  /** Backend event notes for the payout detail timeline. */
  events: { id: string; title: string; detail?: string; at: string }[];
}

// ── Transaction query / pagination ───────────────────────────

export const FL_FINANCIAL_SORT = {
  NEWEST: "newest",
  OLDEST: "oldest",
  AMOUNT_DESC: "amount_desc",
  AMOUNT_ASC: "amount_asc",
} as const;

export type FlFinancialSort = ValuesOf<typeof FL_FINANCIAL_SORT>;

export interface FlFinancialQuery {
  search?: string;
  type?: FlFinancialTxType | "all";
  status?: FlFinancialTxStatus | "all";
  sign?: FlFinSign | "all";
  from?: string; // ISO date
  to?: string; // ISO date
  sort?: FlFinancialSort;
  page?: number;
  pageSize?: number;
}

export interface FlFinancialPage<T> {
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

export interface FlPayoutRequestInput {
  amount: number;
  payoutMethodId: string;
  idempotencyKey: string;
  confirmed: boolean; // backend requires an explicit confirmation flag
}

export const FL_FINANCIAL_RESULT = {
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
  STALE_BALANCE: "stale_balance",
  PENDING_PAYOUT: "pending_payout",
} as const;

export type FlFinancialResultCode = ValuesOf<typeof FL_FINANCIAL_RESULT>;

export interface FlPayoutRequestResult {
  ok: boolean;
  code: FlFinancialResultCode;
  payout?: FlPayout;
  available?: number;
  error?: string;
}

// ── Financial limits / platform rules (presentation constants) ─
// The SERVICE re-validates every value; these only inform the forms.

export const FL_FINANCIAL_LIMITS = {
  MIN_PAYOUT: 2000,
  MAX_PAYOUT: 2_000_000,
  PAYOUT_FEE: 50,
  IDEMPOTENCY_WINDOW_HOURS: 24,
} as const;

// ── Financial period (server-resolved) ───────────────────────

export const FL_FINANCIAL_PERIOD = {
  SEVEN_DAYS: "7d",
  THIRTY_DAYS: "30d",
  NINETY_DAYS: "90d",
  TWELVE_MONTHS: "12m",
} as const;

export type FlFinancialPeriodKey = ValuesOf<typeof FL_FINANCIAL_PERIOD>;

export interface FlEarningsPeriod {
  key: FlFinancialPeriodKey;
  /** Backend-computed earnings total for the period. */
  total: number;
  /** Number of settled (completed) earnings in the period. */
  count: number;
  periodLabel: string;
  from: string;
  to: string;
}

// ── Overview bundle ──────────────────────────────────────────

export interface FlFinancialOverview {
  balance: FlBalance;
  cards: FlFinancialSummaryCard[];
  periods: FlEarningsPeriod[];
  recentTransactions: FlFinancialTransaction[];
  account: FlPayoutAccount;
  pendingPayout: FlPayout | null;
}

type ValuesOf<T> = T[keyof T];
