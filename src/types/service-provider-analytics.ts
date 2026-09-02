// ============================================================
// SERVICE PROVIDER ANALYTICS TYPES  (Module 21)
// ============================================================
//
// Read-only, owner-scoped analytics computed by the service provider
// analytics service from the provider's own bookings, services and reviews.
//
// SECURITY PRINCIPLES:
//   - Values are computed BY THE SERVICE (the mock "backend"). The UI never
//     derives money or counts — it renders exactly what is returned.
//   - Ownership is derived from the authenticated service provider record
//     (sp1) via the same requireOwner() gate used by other provider modules.
//     Period windows are resolved to the Lagos timezone, matching the booking
//     engine so day/trend boundaries agree by construction.

// ── Analytics period (mirrors the financials period model) ───

export const SP_ANALYTICS_PERIOD = {
  TODAY: "today",
  SEVEN_DAYS: "7d",
  THIRTY_DAYS: "30d",
  THIS_MONTH: "this_month",
  LAST_MONTH: "last_month",
  CUSTOM: "custom",
} as const;

export type SpAnalyticsPeriodKey = ValuesOf<typeof SP_ANALYTICS_PERIOD>;

export interface SpAnalyticsPeriod {
  key: SpAnalyticsPeriodKey;
  /** Custom range start (ISO date) — only used when key === "custom". */
  from?: string;
  /** Custom range end (ISO date) — only used when key === "custom". */
  to?: string;
}

// ── Resolved window (backend-computed) ───────────────────────

export interface SpAnalyticsWindow {
  periodLabel: string;
  from: string;
  to: string;
}

// ── KPI cards ────────────────────────────────────────────────

export type SpAnalyticsKpiTone = "neutral" | "positive" | "negative" | "info" | "gold";

export interface SpAnalyticsKpi {
  key: string;
  label: string;
  /** Always a string — the service formats money/counts so components are dumb. */
  value: string;
  /** Optional rich sublabel rendered by the card. */
  sublabel?: string;
  tone: SpAnalyticsKpiTone;
}

// ── Status distribution (donut) ──────────────────────────────

export interface SpStatusSlice {
  status: string;
  label: string;
  count: number;
  /** 0..1 fraction of the bucket total (width/angle share). */
  fraction: number;
  /** SVG fill colour (dash colour). */
  color: string;
}

export interface SpAnalyticsStatus {
  slices: SpStatusSlice[];
  total: number;
}

// ── Booking trend (daily series) ─────────────────────────────

export interface SpTrendPoint {
  /** Day label ("Mon 1".."Sun 7") derived in the booking timezone. */
  key: string;
  label: string;
  /** Bookings that started on that Lagos day (regardless of status). */
  bookings: number;
  /** Gross revenue of those bookings (sum of confirmed amounts). */
  revenue: number;
}

// ── Category performance (ranked) ────────────────────────────

export interface SpCategoryMetric {
  categoryId: string;
  categoryName: string;
  bookings: number;
  revenue: number;
}

// ── Conversion funnel ────────────────────────────────────────

export interface SpFunnelStep {
  key: string;
  label: string;
  /** Booking statuses that count towards this step. */
  count: number;
  /** Conversion rate from the first (fully-scoped) step, 0..1. */
  fromTop: number;
  /** Percentage of the previous step's value, 0..1. */
  fromPrevious: number;
}

// ── Peak day ────────────────────────────────────────────────

export interface SpPeakDay {
  weekday: string;
  bookings: number;
  revenue: number;
  /** 0..1 share of the best day. */
  share: number;
}

// ── Overview + breakdown bundles ─────────────────────────────

export interface SpAnalyticsOverview {
  window: SpAnalyticsWindow;
  kpis: SpAnalyticsKpi[];
  status: SpAnalyticsStatus;
  trend: SpTrendPoint[];
  categories: SpCategoryMetric[];
  funnel: SpFunnelStep[];
  peakDay: SpPeakDay;
  /** Known distribution-category names in case categoryName falls back. */
  topCategoryId: string;
}

export interface SpAnalyticsBookingsTableRow {
  id: string;
  reference: string;
  serviceName: string;
  categoryName: string;
  status: string;
  /** Gross amount, formatted by the service. */
  amount: string;
  /** Lagos wall-clock start "EEE d MMM, h:mma". */
  start: string;
}

export interface SpAnalyticsBookingsPage {
  window: SpAnalyticsWindow;
  totals: {
    bookings: number;
    revenue: string;
    completed: string;
    cancelled: string;
  };
  rows: SpAnalyticsBookingsTableRow[];
}

export interface SpAnalyticsEarnings {
  window: SpAnalyticsWindow;
  kpis: SpAnalyticsKpi[];
  trend: SpTrendPoint[];
  categories: SpCategoryMetric[];
  /** Top services by revenue (ranked). */
  services: { serviceId: string; serviceName: string; revenue: string; bookings: number }[];
}

type ValuesOf<T> = T[keyof T];