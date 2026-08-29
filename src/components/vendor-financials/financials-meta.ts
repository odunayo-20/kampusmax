import type { BadgeVariant } from "@/components/admin/StatusBadge";
import type {
  VendorFinancialTxType,
  VendorFinancialTxStatus,
  VendorFinSign,
  VendorPayoutStatus,
  VendorPayoutAccountStatus,
} from "@/types/vendor-financials";

// ============================================================
// FINANCIALS UI META (Module 14)
// ============================================================
// Labels and badge variants for transaction types, statuses, payout statuses
// and account statuses. Single source of truth for rendering.

export const TX_TYPE_LABELS: Record<VendorFinancialTxType, string> = {
  order_payment: "Order payment",
  platform_fee: "Platform fee",
  refund: "Refund",
  adjustment: "Adjustment",
  payout: "Payout",
  escrow_hold: "Escrow hold",
  escrow_release: "Escrow release",
};

export function txTypeLabel(type: VendorFinancialTxType): string {
  return TX_TYPE_LABELS[type] ?? type.replace(/_/g, " ");
}

export const TX_STATUS_LABELS: Record<VendorFinancialTxStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  successful: "Successful",
  failed: "Failed",
  reversed: "Reversed",
  refunded: "Refunded",
  disputed: "Disputed",
};

export function txStatusLabel(status: VendorFinancialTxStatus): string {
  return TX_STATUS_LABELS[status] ?? status;
}

export function txStatusVariant(status: VendorFinancialTxStatus): BadgeVariant {
  switch (status) {
    case "pending":
    case "processing":
      return "warning";
    case "successful":
      return "success";
    case "failed":
    case "reversed":
      return "error";
    case "refunded":
      return "neutral";
    case "disputed":
      return "error";
  }
}

export const SIGN_LABELS: Record<VendorFinSign, string> = {
  credit: "Credit",
  debit: "Debit",
};

export function signIcon(sign: VendorFinSign): "arrow-up" | "arrow-down" {
  return sign === "credit" ? "arrow-up" : "arrow-down";
}

export const PAYOUT_STATUS_LABELS: Record<VendorPayoutStatus, string> = {
  processing: "Processing",
  successful: "Successful",
  failed: "Failed",
};

export function payoutStatusLabel(status: VendorPayoutStatus): string {
  return PAYOUT_STATUS_LABELS[status] ?? status;
}

export function payoutStatusVariant(status: VendorPayoutStatus): BadgeVariant {
  switch (status) {
    case "processing":
      return "info";
    case "successful":
      return "success";
    case "failed":
      return "error";
  }
}

export const PAYOUT_ACCOUNT_STATUS_LABELS: Record<VendorPayoutAccountStatus, string> = {
  verified: "Verified",
  pending_verification: "Pending verification",
  failed: "Failed",
  restricted: "Restricted",
  missing: "Not set up",
};

export function payoutAccountStatusLabel(status: VendorPayoutAccountStatus): string {
  return PAYOUT_ACCOUNT_STATUS_LABELS[status] ?? status;
}

export function payoutAccountStatusVariant(status: VendorPayoutAccountStatus): BadgeVariant {
  switch (status) {
    case "verified":
      return "success";
    case "pending_verification":
      return "warning";
    case "failed":
      return "error";
    case "restricted":
      return "error";
    case "missing":
      return "neutral";
  }
}

export const SORT_LABELS: Record<string, string> = {
  newest: "Newest first",
  oldest: "Oldest first",
  amount_desc: "Amount (high to low)",
  amount_asc: "Amount (low to high)",
};

export const TX_TYPE_OPTIONS = [
  { value: "all", label: "All types" },
  { value: "escrow_hold", label: "Escrow hold" },
  { value: "escrow_release", label: "Escrow release" },
  { value: "platform_fee", label: "Platform fee" },
  { value: "refund", label: "Refund" },
  { value: "payout", label: "Payout" },
  { value: "adjustment", label: "Adjustment" },
] as const;

export const TX_STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "successful", label: "Successful" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
  { value: "disputed", label: "Disputed" },
] as const;

export const SIGN_OPTIONS = [
  { value: "all", label: "All" },
  { value: "credit", label: "Credits" },
  { value: "debit", label: "Debits" },
] as const;

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "amount_desc", label: "Amount ↓" },
  { value: "amount_asc", label: "Amount ↑" },
] as const;