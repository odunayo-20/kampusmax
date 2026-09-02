# Module 21 — Service Provider Analytics (Report)

**Status:** Complete · **Build:** ✔ `npm run build` green (webpack; TypeScript pass; 3 new
routes) · **Type-check:** ✔ `node --max-old-space-size=2048 node_modules/typescript/bin/tsc --noEmit`
clean (ran via `node` because `npx tsc` crashes this 5.9 GB machine with the stack-overrun code
`0xC0000409`; `node_modules/typescript/bin/tsc` on the same engine is stable) · **Runtime:** ✔ domain
assertions on a transient route (deleted after the run) · **Smoke:** ✔ analytics + shell routes 200
on `next dev :3000` (webpack mode; Turbopack stays OOM-prone here)

## 1. Scope (no written M21 spec — mirrors M18–M20 conventions)

Read-only, owner-scoped **Analytics** for the service provider: an Overview page plus Bookings and
Earnings drill-downs under `/service-provider/analytics*`, replacing the sidebar's locked
placeholder. The service layer is **backend-authoritative** — every KPI, percentage, trend point
and category total is computed there from the owner's own bookings; the UI only renders returned
(pre-formatted) values and never derives money or counts.

- **KPI strip (preformatted)** — bookings + completed/cancelled summary, gross revenue, acceptance
  %, completion %, and average rating (review-derived; `—` with "No reviews yet" when the provider
  has no active service or no reviews).
- **Status donut** — dependency-free SVG donut of booking-status shares with a legend; fractions
  are backend-computed.
- **Daily trend** — one point per Lagos day across the window (zero-filled, so 31 bars for 30 d),
  plotted with the shared `ChartCard` area/bar renderer (area for revenue).
- **Category performance** — ranked horizontal bars by revenue, grouped by resolving each booking's
  `serviceId` through the marketplace service store → `catN` → category display name.
- **Conversion funnel** — Incoming → Accepted → In progress → Completed with step counts, % of
  incoming and % of previous step.
- **Busiest day** — weekday with the most bookings, revenue and share of weekly volume.
- **Period window** — Today / 7 d / 30 d / This month / Last month / Custom, resolved **server-side**
  in Africa/Lagos (UTC+1) so trend boundaries agree with the booking engine.
- **Bookings drill-down** — period summary tiles + full table (reference, service, category, status,
  amount, Lagos start label) deep-linking to the existing booking detail.
- **Earnings drill-down** — revenue KPIs (gross, completed revenue, avg booking value, acceptance %,
  unique customers), daily revenue trend, category bars and top-6 services by revenue.

## 2. Routes (all new, under `/service-provider/analytics`, all `robots: noindex`)

```
/service-provider/analytics                         (overview)
/service-provider/analytics/bookings                (drill-down table)
/service-provider/analytics/earnings                (revenue analysis)
```

`SERVICE_PROVIDER_DASHBOARD_SECTIONS` in `src/lib/utils.ts` gains `/service-provider/analytics`, so
the analytics pages render inside the full dashboard shell (public-profile detection unchanged). The
sidebar "Analytics" placeholder (`placeholder: true`, Lock badge) is removed and the item is now a
live link.

## 3. Files created / extended

**Types — `src/types/service-provider-analytics.ts`**
`SP_ANALYTICS_PERIOD` + `SpAnalyticsPeriod`/`Key`, `SpAnalyticsWindow`, `SpAnalyticsKpi`/`Tone`
(value is a pre-formatted string — components stay dumb), `SpStatusSlice`/`SpAnalyticsStatus`,
`SpTrendPoint` (per-day bookings + revenue), `SpCategoryMetric`, `SpFunnelStep` (fromTop / fromPrevious),
`SpPeakDay`, `SpAnalyticsOverview`, `SpAnalyticsBookingsPage` (+ row type), `SpAnalyticsEarnings`.

**Config — `src/config/service-analytics.ts`**
`SP_ANALYTICS_SUBTITLE`; status order + `SP_ANALYTICS_STATUS_META` (label + SVG color per
`BookingStatus`); `SP_ANALYTICS_FUNNEL` step definitions (statuses per step); period option/label/
preset lists. Presentation constants only — no money or claim logic.

**Service facade — `src/services/service-provider-analytics.ts`**
Owner-scoped (`getSpProfileRecord` → providerId; throws `UNAUTHORIZED`); Lagos clock +
`resolveAnalyticsWindow` (today = Lagos UTC-day start; custom range sanitised to a day window;
syncs keyLabel). Booking set = the owner's `getBookingsForProvider(providerId, "all")` filtered to
the window. `dailyTrend` zero-fills every day in the window. Category resolution joins booking
`serviceId` → `getServiceById` (marketplace) → `spServiceCategoryName`. Public API:
`getSpAnalyticsOverview(period = 30 d)`, `getSpAnalyticsBookings(period)`, `getSpAnalyticsEarnings(period)`.

**Cross-module (extended)**
`ServiceProviderSidebar.tsx` — Analytics link live · `src/lib/utils.ts` — analytics section in
`SERVICE_PROVIDER_DASHBOARD_SECTIONS`.

**UI — `src/components/service-provider/analytics/` (8 new)**
`sp-analytics-meta.ts` (status label/badge-variant maps) · `SpAnalyticsSkeleton` ·
`SpAnalyticsSubnav` (Overview / Bookings / Earnings) · `SpAnalyticsPeriodBar` (period Select +
custom date range + resolved window caption) · `SpAnalyticsKpiCards` (tones incl. gold) ·
`SpAnalyticsStatusDonut` (donut + legend; `No bookings` empty state) · `SpAnalyticsTrendChart` ·
`SpAnalyticsCategoryChart` (both reuse the shared admin `ChartCard`) · `SpAnalyticsFunnelCard` ·
`SpAnalyticsPeakDayCard` · `SpAnalyticsBookingsTable` (StatusBadge reuse).

**Pages — 3** under `src/app/(main)/service-provider/analytics/` (client pages with
skeleton/error/empty states; whole section is `noindex, nofollow`).

## 4. Seed math (verified on the transient route)

Provider sp1, 30-day window (2026-08-03 → 2026-09-02):

| Item | Value |
|---|---|
| Bookings in window | **13** (8 completed · 2 confirmed · 1 pending · 1 in-progress · 1 cancelled) |
| Gross revenue | **₦47,000** |
| Acceptance | **92%** (12/13) |
| Completion | **75%** of accepted |
| Funnel | 13 → 11 accepted → 9 in-progress/completed → **8 completed** |
| Average rating | **4.8** (5 reviews) |
| Busiest day | **Thu** · 3 bookings · ₦13,000 · 23% share |
| Category mix | Repairs & Maintenance **11 / ₦43,000** · Technology & IT **2 / ₦4,000** |
| Earnings consistency | daily-revenue trend sums to **₦47,000 = gross KPI** ✔ |
| Completed revenue / avg value / unique customers | ₦31,000 / ₦3,875 / 11 |
| Top services | msvc1 Phone Screen Replacement ₦25,000 (5) · msvc2 Laptop Diagnostics ₦18,000 (6) · msvc3 Software Setup ₦4,000 (2) |

## 5. Security & privacy

- Ownership always derived from the authenticated provider record — a client can never pass another
  provider's id (no IDOR). Service throws `UNAUTHORIZED` otherwise.
- The frontend receives pre-formatted strings and never performs sums/derivations; money math is
  confined to the service layer.
- Section is `robots: noindex, nofollow`; nothing sensitive in URLs (bookings drill-down reuses the
  generic booking reference id, already UUID-style).
- Period windows are resolved in the booking timezone — same day boundaries as the booking engine,
  no viewer-clock skew.

## 6. Accessibility

SVG donut is `role="img"` with a visible legend list (not color-only); trend/category charts reuse
the shared ChartCard hit-rect hover/focus behaviour; the bookings table uses real `<th>` scoping and
row hover affordance; skeleton/empty/error states are text-announced; form controls carry
`aria-label`s.

## 7. Expected backend endpoints (service layer already mirrors these)

`GET /me/analytics/overview?period=[today|7d|30d|this_month|last_month|custom&from&to]` ·
`GET /me/analytics/bookings?period=…` · `GET /me/analytics/earnings?period=…`.

## 8. Deferred (explicitly out of scope)

Real event tracking / pageview instrumentation (profile views remain the static dashboard metric),
forecasts or ML "growth predictions", campaign/source attribution, multi-provider platform analytics,
real imagery-based trend smoothing, and any write-path analytics features (nothing in this module
mutates state).

## 9. Verification

- `node --max-old-space-size=2048 node_modules/typescript/bin/tsc --noEmit` — clean.
  (Transient env note: `npx tsc` crashes here with `0xC0000409`; the in-repo `typescript` package
  invoked directly is stable. Earlier in this session the stale dev-generated type
  `.next/dev/types/app/api/dev-m20-assert/route.ts` — left over from the deleted M20 assert route —
  made tsc fail until `.next/dev/types/app/api/dev-m20-assert` was removed; dev regenerates it.)
- `npm run build` — green; **3 new routes** in the manifest (`analytics`, `analytics/bookings`,
  `analytics/earnings`); no vendor/admin/marketplace regressions.
- Runtime domain pass (transient `/api/dev-m21-assert` route, deleted afterwards) — all checks
  matched the seed math in §4 incl. naira-prefixed amounts and trend-summed gross.
- Smoke — analytics routes + `/service-provider` shell + `/service-provider/financials` all return
  200 on `next dev :3000`. Dev instance left running (`webpack` mode) for inspection.

## 10. Documented deviations

- **No written M21 spec was provided**, so scope follows the M18–M20 conventions (read-only,
  service-derived analytics; no TanStack Query; no `eslint.config.*`; gates are tsc + build).
- **No chart library**: charts reuse the existing dependency-free `ChartCard` + one new SVG donut.
- **Profile views** keep the static dashboard value (no real instrumentation surface exists yet).
- Deferred pipelines (out-pageview/report exports, historical pre-module trend baseline beyond
  seed data) are explicitly out of scope rather than stubbed.

## 11. Suggested next module

**Module 22 — Admin finance & dispute queue** (already recommended by M20 §12 and now more urgent:
analytics surfaces `problem_reported` and cancelled volume): an admin workbench consuming
`problem_reported` bookings and `failed` payouts, provider-side problem acknowledgement, and
notification/review hooks — followed by real payments hooks the financials endpoint mirror
anticipates.