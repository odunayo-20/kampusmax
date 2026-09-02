// ============================================================
// SERVICE PROVIDER ANALYTICS UI META  (Module 21)
// ============================================================
// Labels, tones and badge variants for analytics buckets/periods.
// Single source of truth for presentational mapping.

import { SP_ANALYTICS_STATUS_META, SP_ANALYTICS_PERIOD_OPTIONS } from "@/config/service-analytics";
import type { BadgeVariant } from "@/components/admin/StatusBadge";
import type { BookingStatus } from "@/types/booking";
import type { SpAnalyticsPeriodKey } from "@/types/service-provider-analytics";

/** Analytics booking-status label. */
export function spAnalyticsStatusLabel(status: BookingStatus | string): string {
  const meta = SP_ANALYTICS_STATUS_META[status as BookingStatus];
  return meta ? meta.label : status;
}

/** Analytics booking-status badge variant. */
export function spAnalyticsStatusVariant(status: BookingStatus | string): BadgeVariant {
  switch (status) {
    case "completed":
      return "success";
    case "confirmed":
      return "blue";
    case "pending":
      return "warning";
    case "in_progress":
      return "info";
    case "cancelled":
    case "declined":
      return "error";
    default:
      return "neutral";
  }
}

/** Analytics period presets for the dropdown. */
export const SP_ANALYTICS_PERIOD_OPTIONS_FOR_UI = SP_ANALYTICS_PERIOD_OPTIONS;

export const SP_ANALYTICS_PERIOD_OPTION_KEYS = SP_ANALYTICS_PERIOD_OPTIONS.map((o) => o.value);

export type { SpAnalyticsPeriodKey };
