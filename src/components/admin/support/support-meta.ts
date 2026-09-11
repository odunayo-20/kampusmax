import type { BadgeVariant } from "@/components/admin/StatusBadge";
import type {
  SupportEscalationTarget,
  SupportTicketCategory,
  SupportTicketPriority,
  SupportTicketStatus,
} from "@/types/admin";

// ------------------------------------------------------------
// STATUS
// ------------------------------------------------------------

export const SUPPORT_STATUS_LABELS: Record<SupportTicketStatus, string> = {
  open: "Open",
  pending: "Pending",
  in_progress: "In progress",
  waiting_on_customer: "Waiting on customer",
  resolved: "Resolved",
  closed: "Closed",
};

export function supportStatusLabel(status: SupportTicketStatus): string {
  return SUPPORT_STATUS_LABELS[status] ?? status;
}

export function supportStatusVariant(status: SupportTicketStatus): BadgeVariant {
  switch (status) {
    case "open":
      return "error";
    case "pending":
      return "warning";
    case "in_progress":
      return "blue";
    case "waiting_on_customer":
      return "info";
    case "resolved":
      return "success";
    case "closed":
      return "neutral";
  }
}

export const SUPPORT_STATUS_FILTER_ORDER: SupportTicketStatus[] = [
  "open",
  "pending",
  "in_progress",
  "waiting_on_customer",
  "resolved",
  "closed",
];

/** Statuses still open for admin action. */
export function supportIsOpenForActions(status: SupportTicketStatus): boolean {
  return status !== "resolved" && status !== "closed";
}

// ------------------------------------------------------------
// PRIORITY
// ------------------------------------------------------------

export const SUPPORT_PRIORITY_LABELS: Record<SupportTicketPriority, string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
  urgent: "Urgent",
};

export function supportPriorityLabel(priority: SupportTicketPriority): string {
  return SUPPORT_PRIORITY_LABELS[priority] ?? priority;
}

export function supportPriorityVariant(
  priority: SupportTicketPriority
): BadgeVariant {
  switch (priority) {
    case "urgent":
      return "error";
    case "high":
      return "warning";
    case "normal":
      return "info";
    case "low":
      return "neutral";
  }
}

export const SUPPORT_PRIORITY_FILTER_ORDER: SupportTicketPriority[] = [
  "urgent",
  "high",
  "normal",
  "low",
];

// ------------------------------------------------------------
// CATEGORY
// ------------------------------------------------------------

export const SUPPORT_CATEGORY_LABELS: Record<SupportTicketCategory, string> = {
  account: "Account",
  marketplace: "Marketplace",
  payments: "Payments",
  freelancer: "Freelancer",
  service_provider: "Service provider",
  employer: "Employer",
  verification: "Verification",
  technical: "Technical",
  other: "Other",
};

export function supportCategoryLabel(
  category: SupportTicketCategory
): string {
  return SUPPORT_CATEGORY_LABELS[category] ?? category;
}

export function supportCategoryVariant(
  category: SupportTicketCategory
): BadgeVariant {
  switch (category) {
    case "payments":
      return "gold";
    case "verification":
      return "info";
    case "freelancer":
    case "employer":
    case "service_provider":
      return "blue";
    case "technical":
      return "neutral";
    case "account":
      return "warning";
    default:
      return "neutral";
  }
}

export const SUPPORT_CATEGORY_FILTER_ORDER: SupportTicketCategory[] = [
  "marketplace",
  "payments",
  "account",
  "verification",
  "freelancer",
  "service_provider",
  "employer",
  "technical",
  "other",
];

// ------------------------------------------------------------
// ESCALATION TARGETS
// ------------------------------------------------------------

export const SUPPORT_ESCALATION_LABELS: Record<
  SupportEscalationTarget,
  string
> = {
  finance: "Finance",
  trust_safety: "Trust & Safety",
  verification: "Verification",
  technical_operations: "Technical operations",
  vendor_operations: "Vendor operations",
  management: "Management",
};

export function supportEscalationLabel(
  target: SupportEscalationTarget
): string {
  return SUPPORT_ESCALATION_LABELS[target] ?? target;
}

export const SUPPORT_ESCALATION_FILTER_ORDER: SupportEscalationTarget[] = [
  "finance",
  "trust_safety",
  "verification",
  "technical_operations",
  "vendor_operations",
  "management",
];