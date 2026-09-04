// ============================================================
// FREELANCER FINANCIALS CONFIG  (Module 25)
// ============================================================
// Presentation metadata only — labels, icons, tone. No business logic, no money
// math. These are display constants keyed to backend-enum values.

import type {
  FlFinancialSummaryTone,
  FlFinancialTxStatus,
  FlFinancialTxType,
  FlPayoutAccountStatus,
  FlPayoutEligibilityStatus,
  FlPayoutStatus,
} from "@/types/freelancer-financials";
import {
  FL_FINANCIAL_TX_STATUS,
  FL_FINANCIAL_TX_TYPE,
  FL_PAYOUT_ACCOUNT_STATUS,
  FL_PAYOUT_ELIGIBILITY,
  FL_PAYOUT_STATUS,
} from "@/types/freelancer-financials";

// ── Transaction status presentation ──────────────────────────
// Never colour-only: every entry carries an icon + label + semantic tone.

export type FinancialToneClass = {
  label: string;
  tone: FlFinancialSummaryTone;
  icon: "check" | "clock" | "alert" | "cancel" | "rotate" | "refresh" | "minus" | "wallet";
};

export const FL_TX_STATUS_META: Record<FlFinancialTxStatus, FinancialToneClass> = {
  [FL_FINANCIAL_TX_STATUS.PENDING]: { label: "Pending", tone: "neutral", icon: "clock" },
  [FL_FINANCIAL_TX_STATUS.PROCESSING]: { label: "Processing", tone: "info", icon: "refresh" },
  [FL_FINANCIAL_TX_STATUS.SUCCESSFUL]: { label: "Successful", tone: "positive", icon: "check" },
  [FL_FINANCIAL_TX_STATUS.COMPLETED]: { label: "Completed", tone: "positive", icon: "check" },
  [FL_FINANCIAL_TX_STATUS.FAILED]: { label: "Failed", tone: "negative", icon: "alert" },
  [FL_FINANCIAL_TX_STATUS.REVERSED]: { label: "Reversed", tone: "negative", icon: "rotate" },
  [FL_FINANCIAL_TX_STATUS.REFUNDED]: { label: "Refunded", tone: "negative", icon: "minus" },
  [FL_FINANCIAL_TX_STATUS.CANCELLED]: { label: "Cancelled", tone: "neutral", icon: "cancel" },
};

// ── Transaction type presentation ────────────────────────────

export const FL_TX_TYPE_META: Record<FlFinancialTxType, { label: string }> = {
  [FL_FINANCIAL_TX_TYPE.EARNING]: { label: "Payment" },
  [FL_FINANCIAL_TX_TYPE.PLATFORM_FEE]: { label: "Platform fee" },
  [FL_FINANCIAL_TX_TYPE.PAYOUT]: { label: "Withdrawal" },
  [FL_FINANCIAL_TX_TYPE.REFUND]: { label: "Refund" },
  [FL_FINANCIAL_TX_TYPE.REVERSAL]: { label: "Reversal" },
  [FL_FINANCIAL_TX_TYPE.ADJUSTMENT]: { label: "Adjustment" },
};

// ── Payout method account status ─────────────────────────────

export const FL_PAYOUT_ACCOUNT_STATUS_META: Record<
  FlPayoutAccountStatus,
  { label: string; tone: FinancialToneClass["tone"] }
> = {
  [FL_PAYOUT_ACCOUNT_STATUS.VERIFIED]: { label: "Verified", tone: "positive" },
  [FL_PAYOUT_ACCOUNT_STATUS.PENDING_VERIFICATION]: { label: "Pending verification", tone: "info" },
  [FL_PAYOUT_ACCOUNT_STATUS.FAILED]: { label: "Verification failed", tone: "negative" },
  [FL_PAYOUT_ACCOUNT_STATUS.RESTRICTED]: { label: "Restricted", tone: "negative" },
  [FL_PAYOUT_ACCOUNT_STATUS.MISSING]: { label: "No payout method", tone: "neutral" },
};

// ── Payout status presentation ───────────────────────────────

export const FL_PAYOUT_STATUS_META: Record<FlPayoutStatus, FinancialToneClass> = {
  [FL_PAYOUT_STATUS.REQUESTED]: { label: "Requested", tone: "neutral", icon: "clock" },
  [FL_PAYOUT_STATUS.PROCESSING]: { label: "Processing", tone: "info", icon: "refresh" },
  [FL_PAYOUT_STATUS.COMPLETED]: { label: "Completed", tone: "positive", icon: "check" },
  [FL_PAYOUT_STATUS.FAILED]: { label: "Failed", tone: "negative", icon: "alert" },
  [FL_PAYOUT_STATUS.REVERSED]: { label: "Reversed", tone: "negative", icon: "rotate" },
  [FL_PAYOUT_STATUS.CANCELLED]: { label: "Cancelled", tone: "neutral", icon: "cancel" },
};

// ── Payout eligibility presentation ──────────────────────────

export const FL_PAYOUT_ELIGIBILITY_META: Record<
  FlPayoutEligibilityStatus,
  { label: string; tone: FinancialToneClass["tone"] }
> = {
  [FL_PAYOUT_ELIGIBILITY.ELIGIBLE]: { label: "Eligible", tone: "positive" },
  [FL_PAYOUT_ELIGIBILITY.BELOW_MINIMUM]: { label: "Below minimum", tone: "neutral" },
  [FL_PAYOUT_ELIGIBILITY.ACCOUNT_VERIFICATION_REQUIRED]: { label: "Verification required", tone: "info" },
  [FL_PAYOUT_ELIGIBILITY.PAYOUT_METHOD_REQUIRED]: { label: "Payout method required", tone: "info" },
  [FL_PAYOUT_ELIGIBILITY.TEMPORARILY_DISABLED]: { label: "Temporarily disabled", tone: "neutral" },
  [FL_PAYOUT_ELIGIBILITY.PENDING_PAYOUT]: { label: "Withdrawal in progress", tone: "info" },
  [FL_PAYOUT_ELIGIBILITY.RESTRICTED]: { label: "Restricted", tone: "negative" },
};

// ── Payout status tabs for history filters ───────────────────

export const FL_PAYOUT_FILTER_TABS: { key: FlPayoutStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: FL_PAYOUT_STATUS.PROCESSING, label: "Processing" },
  { key: FL_PAYOUT_STATUS.COMPLETED, label: "Completed" },
  { key: FL_PAYOUT_STATUS.FAILED, label: "Failed" },
  { key: FL_PAYOUT_STATUS.REVERSED, label: "Reversed" },
  { key: FL_PAYOUT_STATUS.CANCELLED, label: "Cancelled" },
];

// ── Filter / sort options for the transactions toolbar ───────

export const FL_TX_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All types" },
  ...(Object.entries(FL_TX_TYPE_META) as [FlFinancialTxType, { label: string }][]).map(([value, m]) => ({
    value,
    label: m.label,
  })),
];

export const FL_TX_STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All statuses" },
  ...(Object.entries(FL_TX_STATUS_META) as [FlFinancialTxStatus, FinancialToneClass][]).map(([value, m]) => ({
    value,
    label: m.label,
  })),
];

export const FL_SIGN_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "credit", label: "Credit" },
  { value: "debit", label: "Debit" },
];

export const FL_SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "amount_desc", label: "Amount: high to low" },
  { value: "amount_asc", label: "Amount: low to high" },
];
