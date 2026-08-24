import type { BadgeVariant } from "@/components/admin/StatusBadge";
import type {
  ManagedDisputeReason,
  ManagedDisputeStatus,
} from "@/types/admin";

// ------------------------------------------------------------
// DISPUTE STATUS
// ------------------------------------------------------------

export const DISPUTE_STATUS_LABELS: Record<ManagedDisputeStatus, string> = {
  open: "Open",
  under_review: "Under review",
  awaiting_customer: "Awaiting customer",
  awaiting_vendor: "Awaiting vendor",
  resolved: "Resolved",
  rejected: "Rejected",
  escalated: "Escalated",
};

export function disputeStatusLabel(status: ManagedDisputeStatus): string {
  return DISPUTE_STATUS_LABELS[status] ?? status;
}

export function disputeStatusVariant(
  status: ManagedDisputeStatus
): BadgeVariant {
  switch (status) {
    case "open":
      return "error";
    case "under_review":
      return "warning";
    case "awaiting_customer":
    case "awaiting_vendor":
      return "info";
    case "resolved":
      return "success";
    case "escalated":
      return "gold";
    default:
      return "neutral"; // rejected
  }
}

export const DISPUTE_STATUS_FILTER_ORDER: ManagedDisputeStatus[] = [
  "open",
  "under_review",
  "awaiting_customer",
  "awaiting_vendor",
  "escalated",
  "resolved",
  "rejected",
];

/** Statuses still open for admin action. */
export function disputeIsOpenForActions(status: ManagedDisputeStatus): boolean {
  return !(
    status === "resolved" ||
    status === "rejected"
  );
}

// ------------------------------------------------------------
// REASONS
// ------------------------------------------------------------

export const DISPUTE_REASON_LABELS: Record<ManagedDisputeReason, string> = {
  payment_issue: "Payment issue",
  missing_order: "Missing order",
  wrong_product: "Wrong product",
  damaged_product: "Damaged product",
  delivery_issue: "Delivery issue",
  refund_request: "Refund request",
  unauthorized_transaction: "Unauthorized transaction",
};

export function disputeReasonLabel(reason: ManagedDisputeReason): string {
  return DISPUTE_REASON_LABELS[reason] ?? reason;
}

export const DISPUTE_REASON_FILTER_ORDER: ManagedDisputeReason[] = [
  "missing_order",
  "payment_issue",
  "wrong_product",
  "damaged_product",
  "delivery_issue",
  "refund_request",
  "unauthorized_transaction",
];

export function disputeReasonVariant(
  reason: ManagedDisputeReason
): BadgeVariant {
  switch (reason) {
    case "unauthorized_transaction":
      return "error";
    case "payment_issue":
      return "warning";
    case "missing_order":
      return "info";
    case "damaged_product":
      return "gold";
    default:
      return "neutral";
  }
}
