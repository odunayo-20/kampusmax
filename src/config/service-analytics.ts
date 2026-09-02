// ============================================================
// SERVICE PROVIDER ANALYTICS CONFIG  (Module 21)
// ============================================================
// Presentation constants for the Analytics module: status colours & labels,
// the conversion funnel step definitions, and the available period presets.
//
// These are rule/PRESENTATION metadata only. Numeric totals and conversions
// are computed by the service provider analytics service; this file never
// defines money movement or claim decisions.

import type { BookingStatus } from "@/types/booking";
import type { SpAnalyticsPeriodKey } from "@/types/service-provider-analytics";

/** Arbitrary banner about what Analytics reports (reads like a module subtitle). */
export const SP_ANALYTICS_SUBTITLE =
  "Understand demand, performance and seasonality for your services";

// ── Status presentational mapping ────────────────────────────

/** Booking statuses the analytics funnel/donut are bucketed across. */
export const SP_ANALYTICS_STATUS_ORDER: BookingStatus[] = [
  "completed",
  "confirmed",
  "pending",
  "in_progress",
  "cancelled",
  "declined",
];

export const SP_ANALYTICS_STATUS_META: Record<
  BookingStatus,
  { label: string; color: string }
> = {
  completed: { label: "Completed", color: "#16A34A" },
  confirmed: { label: "Confirmed", color: "#1769FF" },
  pending: { label: "Pending", color: "#F5B942" },
  in_progress: { label: "In progress", color: "#0B1F3A" },
  cancelled: { label: "Cancelled", color: "#EF4444" },
  declined: { label: "Declined", color: "#94A3B8" },
};

// ── Conversion funnel steps (order matters) ──────────────────

export interface SpAnalyticsFunnelStepDef {
  key: string;
  label: string;
  statuses: BookingStatus[];
}

/** Top "all bookings" step vs each materialised booking bucket. */
export const SP_ANALYTICS_FUNNEL: SpAnalyticsFunnelStepDef[] = [
  { key: "incoming", label: "Incoming requests", statuses: ["confirmed", "in_progress", "completed", "cancelled", "declined", "pending"] },
  { key: "accepted", label: "Accepted", statuses: ["confirmed", "in_progress", "completed"] },
  { key: "started", label: "In progress", statuses: ["in_progress", "completed"] },
  { key: "completed", label: "Completed", statuses: ["completed"] },
];

// ── Period presets & labels ──────────────────────────────────

export const SP_ANALYTICS_PERIOD_OPTIONS: { value: SpAnalyticsPeriodKey; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "this_month", label: "This month" },
  { value: "last_month", label: "Last month" },
  { value: "custom", label: "Custom range" },
];

export const SP_ANALYTICS_PERIOD_LABELS: Record<SpAnalyticsPeriodKey, string> = {
  today: "Today",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  this_month: "This month",
  last_month: "Last month",
  custom: "Custom range",
};

export const SP_ANALYTICS_PERIOD_PRESETS: Record<
  Exclude<SpAnalyticsPeriodKey, "custom">,
  string
> = {
  today: "today",
  "7d": "7d",
  "30d": "30d",
  this_month: "this_month",
  last_month: "last_month",
};