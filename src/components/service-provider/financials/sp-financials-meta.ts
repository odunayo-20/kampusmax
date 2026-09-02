import type { BadgeVariant } from "@/components/admin/StatusBadge";
import type {
  SpFinancialTxType,
  SpFinancialTxStatus,
  SpFinSign,
  SpPayoutStatus,
  SpPayoutAccountStatus,
  SpFinancialPeriodKey,
} from "@/types/service-provider-financials";

// ============================================================
// SERVICE PROVIDER FINANCIALS UI META (Module 20)
// ============================================================
// Labels and badge variants for transaction types, statuses, payout statuses,
// payout account statuses and financial periods. Single source of truth.

export const SP_TX_TYPE_LABELS: Record<SpFinancialTxType, string> = {
  service_payment: "Service payment",
  platform_fee: "Platform fee",
  payout: "Payout",
  adjustment: "Adjustment",
  refund: "Refund",
};

export function spTxTypeLabel(type: SpFinancialTxType): string {
  return SP_TX_TYPE_LABELS[type] ?? type.replace(/_/g, " ");
}

export const SP_TX_STATUS_LABELS: Record<SpFinancialTxStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  successful: "Successful",
  failed: "Failed",
  reversed: "Reversed",
  refunded: "Refunded",
  disputed: "Disputed",
  on_hold: "On hold",
};

export function spTxStatusLabel(status: SpFinancialTxStatus): string {
  return SP_TX_STATUS_LABELS[status] ?? status;
}

export function spTxStatusVariant(status: SpFinancialTxStatus): BadgeVariant {
  switch (status) {
    case "pending":
    case "processing":
      return "warning";
    case "successful":
      return "success";
    case "failed":
    case "reversed":
    case "disputed":
    case "on_hold":
      return "error";
    case "refunded":
      return "neutral";
  }
}

export const SP_SIGN_LABELS: Record<SpFinSign, string> = {
  credit: "Credit",
  debit: "Debit",
};

export function spSignIcon(sign: SpFinSign): "arrow-up" | "arrow-down" {
  return sign === "credit" ? "arrow-up" : "arrow-down";
}

export const SP_PAYOUT_STATUS_LABELS: Record<SpPayoutStatus, string> = {
  processing: "Processing",
  successful: "Successful",
  failed: "Failed",
};

export function spPayoutStatusLabel(status: SpPayoutStatus): string {
  return SP_PAYOUT_STATUS_LABELS[status] ?? status;
}

export function spPayoutStatusVariant(status: SpPayoutStatus): BadgeVariant {
  switch (status) {
    case "processing":
      return "info";
    case "successful":
      return "success";
    case "failed":
      return "error";
  }
}

export const SP_PAYOUT_ACCOUNT_STATUS_LABELS: Record<SpPayoutAccountStatus, string> = {
  verified: "Verified",
  pending_verification: "Pending verification",
  failed: "Failed",
  restricted: "Restricted",
  missing: "Not set up",
};

export function spPayoutAccountStatusLabel(status: SpPayoutAccountStatus): string {
  return SP_PAYOUT_ACCOUNT_STATUS_LABELS[status] ?? status;
}

export function spPayoutAccountStatusVariant(status: SpPayoutAccountStatus): BadgeVariant {
  switch (status) {
    case "verified":
      return "success";
    case "pending_verification":
      return "warning";
    case "failed":
    case "restricted":
      return "error";
    case "missing":
      return "neutral";
  }
}

export const SP_PERIOD_LABELS: Record<SpFinancialPeriodKey, string> = {
  today: "Today",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  this_month: "This month",
  last_month: "Last month",
  custom: "Custom range",
};

export const SP_PERIOD_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "this_month", label: "This month" },
  { value: "last_month", label: "Last month" },
  { value: "custom", label: "Custom range" },
] as const;

export const SP_SORT_LABELS: Record<string, string> = {
  newest: "Newest first",
  oldest: "Oldest first",
  amount_desc: "Amount (high to low)",
  amount_asc: "Amount (low to high)",
};

export const SP_TX_TYPE_OPTIONS = [
  { value: "all", label: "All types" },
  { value: "service_payment", label: "Service payment" },
  { value: "platform_fee", label: "Platform fee" },
  { value: "payout", label: "Payout" },
  { value: "adjustment", label: "Adjustment" },
  { value: "refund", label: "Refund" },
] as const;

export const SP_TX_STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "successful", label: "Successful" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
  { value: "disputed", label: "Disputed" },
  { value: "on_hold", label: "On hold" },
] as const;

export const SP_SIGN_OPTIONS = [
  { value: "all", label: "All" },
  { value: "credit", label: "Credits" },
  { value: "debit", label: "Debits" },
] as const;

export const SP_SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "amount_desc", label: "Amount ↓" },
  { value: "amount_asc", label: "Amount ↑" },
] as const;