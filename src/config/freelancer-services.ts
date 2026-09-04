// ============================================================
// FREELANCER SERVICES CONFIG  (Module 23B)
// ============================================================
// Presentation constants for the freelancer services manager.
// No business logic, no money math — labels, filter options and
// display metadata only. Every status/visibility value is
// backend-authoritative.

import type {
  FreelancerServiceDeliveryUnit,
  FreelancerServicePricing,
  FreelancerServiceStatus,
  FreelancerServiceVisibility,
} from "@/types/freelancer-services";
import { FREELANCER_SERVICE_STATUS } from "@/types/freelancer-services";

// ── Status badges ───────────────────────────────────────────
// Maps a backend status to a stable badge tone + label + helper text.
// Colours pair a label with an icon, never colour alone.

export interface ServiceStatusMeta {
  label: string;
  tone: "default" | "success" | "warning" | "error" | "info" | "outline";
  hint: string;
}

export const FREELANCER_SERVICE_STATUS_META: Record<FreelancerServiceStatus, ServiceStatusMeta> = {
  [FREELANCER_SERVICE_STATUS.DRAFT]: {
    label: "Draft",
    tone: "outline",
    hint: "Saved but not yet offered to clients.",
  },
  [FREELANCER_SERVICE_STATUS.SUBMITTED]: {
    label: "Submitted",
    tone: "info",
    hint: "Queued for review.",
  },
  [FREELANCER_SERVICE_STATUS.UNDER_REVIEW]: {
    label: "Under Review",
    tone: "warning",
    hint: "Our team is reviewing this service.",
  },
  [FREELANCER_SERVICE_STATUS.PUBLISHED]: {
    label: "Published",
    tone: "success",
    hint: "Visible and discoverable by clients.",
  },
  [FREELANCER_SERVICE_STATUS.PAUSED]: {
    label: "Paused",
    tone: "warning",
    hint: "Hidden from clients but can be resumed.",
  },
  [FREELANCER_SERVICE_STATUS.REJECTED]: {
    label: "Rejected",
    tone: "error",
    hint: "Did not pass review. Edit and resubmit.",
  },
  [FREELANCER_SERVICE_STATUS.ARCHIVED]: {
    label: "Archived",
    tone: "default",
    hint: "No longer offered.",
  },
};

// ── Filter tabs (statuses that can be filtered) ─────────────

export const FREELANCER_SERVICE_FILTER_TABS: {
  value: FreelancerServiceStatus | "all";
  label: string;
}[] = [
  { value: "all", label: "All" },
  { value: FREELANCER_SERVICE_STATUS.PUBLISHED, label: "Published" },
  { value: FREELANCER_SERVICE_STATUS.DRAFT, label: "Draft" },
  { value: FREELANCER_SERVICE_STATUS.UNDER_REVIEW, label: "Under Review" },
  { value: FREELANCER_SERVICE_STATUS.PAUSED, label: "Paused" },
  { value: FREELANCER_SERVICE_STATUS.REJECTED, label: "Rejected" },
  { value: FREELANCER_SERVICE_STATUS.ARCHIVED, label: "Archived" },
];

// ── Pricing model labels ────────────────────────────────────

export const FREELANCER_SERVICE_PRICING_LABEL: Record<FreelancerServicePricing, string> = {
  fixed: "Fixed price",
  starting_at: "Starting at",
  hourly: "Hourly rate",
  project: "Project rate",
};

export const FREELANCER_SERVICE_PRICING_OPTIONS: {
  value: FreelancerServicePricing;
  label: string;
}[] = [
  { value: "fixed", label: "Fixed price" },
  { value: "starting_at", label: "Starting at" },
  { value: "hourly", label: "Hourly rate" },
  { value: "project", label: "Project rate" },
];

// ── Delivery unit labels ────────────────────────────────────

export const FREELANCER_SERVICE_DELIVERY_OPTIONS: {
  value: FreelancerServiceDeliveryUnit;
  label: string;
}[] = [
  { value: "hours", label: "Hours" },
  { value: "days", label: "Days" },
  { value: "weeks", label: "Weeks" },
];

// ── Visibility ──────────────────────────────────────────────

export const FREELANCER_SERVICE_VISIBILITY_LABEL: Record<FreelancerServiceVisibility, string> = {
  visible: "Visible",
  hidden: "Hidden",
};

// ── Allowed external image URL schemes (safe URL validation) ─

export const FREELANCER_SERVICE_SAFE_SCHEMES = ["https:", "http:", "data:"] as const;
