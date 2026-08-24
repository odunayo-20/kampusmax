import type { BadgeVariant } from "@/components/admin/StatusBadge";
import type {
  ManagedReviewStatus,
  ManagedReviewTargetType,
  ReviewReportReason,
  ReviewReportStatus,
} from "@/types/admin";

// ------------------------------------------------------------
// REVIEW STATUS
// ------------------------------------------------------------

export const REVIEW_STATUS_LABELS: Record<ManagedReviewStatus, string> = {
  published: "Published",
  reported: "Reported",
  hidden: "Hidden",
  removed: "Removed",
  under_review: "Under review",
};

export function reviewStatusLabel(status: ManagedReviewStatus): string {
  return REVIEW_STATUS_LABELS[status] ?? status;
}

export function reviewStatusVariant(
  status: ManagedReviewStatus
): BadgeVariant {
  switch (status) {
    case "published":
      return "success";
    case "reported":
      return "error";
    case "hidden":
      return "warning";
    case "under_review":
      return "info";
    default:
      return "neutral"; // removed
  }
}

export const REVIEW_STATUS_FILTER_ORDER: ManagedReviewStatus[] = [
  "published",
  "reported",
  "hidden",
  "under_review",
  "removed",
];

/** Which moderation transitions each status allows. */
export function reviewActionsFor(r: {
  status: ManagedReviewStatus;
  reportsCount: number;
}): {
  hide?: boolean;
  restore?: boolean;
  remove?: boolean;
  investigate?: boolean;
} {
  switch (r.status) {
    case "published":
      return { hide: true, remove: true, investigate: r.reportsCount > 0 };
    case "reported":
    case "under_review":
      return { hide: true, remove: true, investigate: true };
    case "hidden":
      return { restore: true, remove: true, investigate: r.reportsCount > 0 };
    case "removed":
      return {};
  }
}

// ------------------------------------------------------------
// TARGETS / REPORTS
// ------------------------------------------------------------

export function reviewTargetTypeLabel(
  type: ManagedReviewTargetType
): string {
  return type === "product" ? "Product" : "Vendor";
}

export const REVIEW_REPORT_REASON_LABELS: Record<ReviewReportReason, string> = {
  fake_review: "Suspected fake review",
  offensive: "Offensive language",
  unfair: "Unfair / inaccurate",
  spam: "Spam or duplicate",
  irrelevant: "Irrelevant content",
  other: "Other",
};

export const REVIEW_REPORT_STATUS_LABELS: Record<ReviewReportStatus, string> = {
  open: "Open",
  reviewing: "Reviewing",
  actioned: "Actioned",
  dismissed: "Dismissed",
};

export function reviewReportStatusVariant(
  status: ReviewReportStatus
): BadgeVariant {
  switch (status) {
    case "open":
      return "error";
    case "reviewing":
      return "warning";
    case "actioned":
      return "success";
    default:
      return "neutral"; // dismissed
  }
}
