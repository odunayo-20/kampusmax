import type { VendorEscrowState } from "@/types/vendor-orders";

// ============================================================
// VENDOR FINANCIALS — STATEMENTS, PAYOUTS & TRANSACTIONS (Module 14)
// ============================================================
//
// SECURITY MODEL (backend-authoritative):
//   - Balances, ledger entries, payout eligibility and statement totals are
//     COMPUTED BY THE BACKEND (the service layer here stands in for it). The
//     frontend only renders returned values; it never sums or derives money.
//   - Ownership is always derived from the authenticated identity (symbol
//     {@link #authn}). A client can never pass another vendor's id.
//   - Transactions are immutable. There is no edit/delete/change surface.
//   - Bank/payout details are returned MASKED only. No secrets in storage/URLs.
//   - Payout submissions are idempotency-protected and re-validated server-side
//     (balance, minimum, account status, duplicate requests).

// ── Transaction types (spec §9) ──────────────────────────────

export const VENDOR_FINANCIAL_TX_TYPE = {
  ORDER_PAYMENT: "order_payment",
  PLATFORM_FEE: "platform_fee",
  REFUND: "refund",
  ADJUSTMENT: "adjustment",
  PAYOUT: "payout",
  ESCROW_HOLD: "escrow_hold",
  ESCROW_RELEASE: "escrow_release",
} as const;

export type VendorFinancialTxType = ValuesOf<typeof VENDOR_FINANCIAL_TX_TYPE>;

// ── Transaction statuses (spec §10) ──────────────────────────
// Money movement safety: a pending/processing/disputed entry is NEVER styled
// as successful. Failed/reversed entries are terminal and shown accordingly.

export const VENDOR_FINANCIAL_TX_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  SUCCESSFUL: "successful",
  FAILED: "failed",
  REVERSED: "reversed",
  REFUNDED: "refunded",
  DISPUTED: "disputed",
} as const;

export type VendorFinancialTxStatus = ValuesOf<typeof VENDOR_FINANCIAL_TX_STATUS>;

// ── Direction ────────────────────────────────────────────────

export const VENDOR_FIN_SIGN = {
  CREDIT: "credit", // money IN for the vendor
  DEBIT: "debit", // money OUT for the vendor
} as const;

export type VendorFinSign = ValuesOf<typeof VENDOR_FIN_SIGN>;

// ── Ledger / transaction row ─────────────────────────────────
// One row is one backend ledger entry. Amounts are net vendor-relevant values
// (platform fee already reflects the vendor's cost; no frontend derivation).

export interface VendorFinancialTransaction {
  id: string;
  type: VendorFinancialTxType;
  status: VendorFinancialTxStatus;
  sign: VendorFinSign;
  amount: number;
  fee?: number;
  /** Human description rendered by the UI (backend-provided). */
  description: string;
  /** Linked vendor order slice id when this entry belongs to an order. */
  orderId?: string;
  reference: string;
  bankRef?: string;
  payoutId?: string;
  at: string;
  /** Backend event notes for the detail timeline. */
  events: { id: string; title: string; detail?: string; at: string }[];
}

// ── Financial summary cards ──────────────────────────────────

export type FinancialSummaryTone = "neutral" | "positive" | "negative" | "info";

export interface FinancialSummaryCard {
  key: string;
  label: string;
  value: number;
  sublabel?: string;
  tone: FinancialSummaryTone;
}

// ── Escrow readiness (display-only; single column vs orders) ─
// These buckets are re-derived from the SAME vendor order slices the Orders
// module shows, so the two modules always agree. No release is offered here.

export interface EscrowBucket {
  key: string;
  label: string;
  variant: "info" | "warning" | "success" | "error" | "neutral";
  total: number;
  count: number;
  orders: { id: string; amount: number; at: string }[];
}

export interface EscrowReadiness {
  buckets: EscrowBucket[];
  frozenTotal: number;
  refundPendingTotal: number;
}

// ── Payout account ───────────────────────────────────────────

export const VENDOR_PAYOUT_ACCOUNT_STATUS = {
  VERIFIED: "verified",
  PENDING_VERIFICATION: "pending_verification",
  FAILED: "failed",
  RESTRICTED: "restricted",
  MISSING: "missing",
} as const;

export type VendorPayoutAccountStatus = ValuesOf<typeof VENDOR_PAYOUT_ACCOUNT_STATUS>;

export interface VendorPayoutAccount {
  bankName: string;
  bankCode: string;
  accountName: string;
  /** Backend-masked, display-only. Never a full number. */
  maskedAccountNumber: string;
  status: VendorPayoutAccountStatus;
  verifiedAt?: string;
  currency: "NGN";
  restrictions?: string[];
}

// ── Payout request / history ─────────────────────────────────

export const VENDOR_PAYOUT_STATUS = {
  PROCESSING: "processing",
  SUCCESSFUL: "successful",
  FAILED: "failed",
} as const;

export type VendorPayoutStatus = ValuesOf<typeof VENDOR_PAYOUT_STATUS>;

export interface VendorPayout {
  id: string;
  amount: number;
  fee: number;
  status: VendorPayoutStatus;
  bankName: string;
  maskedAccountNumber: string;
  requestedAt: string;
  processedAt?: string;
  expectedAt?: string;
  failedReason?: string;
  reference: string;
  idempotencyKey: string;
}

// ── Statement ────────────────────────────────────────────────

export interface VendorStatementQuery {
  month?: string; // "YYYY-MM" — platform period (backend-authoritative)
}

export interface VendorStatementLine {
  key: string;
  label: string;
  value: number;
  count: number;
  tone: FinancialSummaryTone;
}

export interface VendorStatement {
  periodLabel: string;
  from: string;
  to: string;
  lines: VendorStatementLine[];
  openingBalance: number;
  closingBalance: number;
  exportable: boolean;
  generatedAt: string;
}

// ── Transaction query / pagination ───────────────────────────

export const VENDOR_FINANCIAL_SORT = {
  NEWEST: "newest",
  OLDEST: "oldest",
  AMOUNT_DESC: "amount_desc",
  AMOUNT_ASC: "amount_asc",
} as const;

export type VendorFinancialSort = ValuesOf<typeof VENDOR_FINANCIAL_SORT>;

export interface VendorFinancialQuery {
  search?: string;
  type?: VendorFinancialTxType | "all";
  status?: VendorFinancialTxStatus | "all";
  sign?: VendorFinSign | "all";
  from?: string; // ISO date
  to?: string; // ISO date
  sort?: VendorFinancialSort;
  page?: number;
  pageSize?: number;
}

export interface VendorFinancialPage<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  totals: { credit: number; debit: number };
}

// ── Payout request input / result ────────────────────────────
// idempotencyKey is REQUIRED server-side so a retried click can never double
// debit. The frontend generates one key per inten ed submission.

export interface PayoutRequestInput {
  amount: number;
  idempotencyKey: string;
  confirmed: boolean; // backend requires an explicit confirmation flag
}

export const VENDOR_FINANCIAL_RESULT = {
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

export type VendorFinancialResultCode = ValuesOf<typeof VENDOR_FINANCIAL_RESULT>;

export interface PayoutRequestResult {
  ok: boolean;
  code: VendorFinancialResultCode;
  payout?: VendorPayout;
  available?: number;
  error?: string;
}

// ── Financial limits / platform rules (presentation constants) ─
// The SERVICE re-validates every value; these only inform the forms.

export const VENDOR_FINANCIAL_LIMITS = {
  MIN_PAYOUT: 5000,
  MAX_PAYOUT: 5_000_000,
  PAYOUT_FEE: 50,
  IDEMPOTENCY_WINDOW_HOURS: 24,
} as const;

// ── Permission model (presentation; backend remains authoritative) ─

export const VENDOR_FINANCIAL_PERMISSION_KEYS = [
  "financials.view",
  "transactions.view",
  "payouts.view",
  "payouts.request",
  "payout_account.manage",
] as const;

export type VendorFinancialPermissionKey = (typeof VENDOR_FINANCIAL_PERMISSION_KEYS)[number];
export type VendorFinancialPermissions = Record<VendorFinancialPermissionKey, boolean>;

// ── Overview bundle ──────────────────────────────────────────

export interface VendorFinancialOverview {
  cards: FinancialSummaryCard[];
  escrow: EscrowReadiness;
  recentTransactions: VendorFinancialTransaction[];
  account: VendorPayoutAccount;
}

type ValuesOf<T> = T[keyof T];

export type { VendorEscrowState };