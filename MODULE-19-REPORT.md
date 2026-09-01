# Module 19 — Service Provider Orders & Fulfilment (Report)

**Status:** Complete · **Build:** ✔ production build green (81 routes, reused; 0 new) ·
**Type-check:** ✔ `npx tsc --noEmit` clean · **Runtime:** ✔ 60/60 domain assertions on `next dev`
(transient route, since deleted) · **Smoke:** ✔ prod on `:3019`

## 1. Scope (per the M19 spec)

Service orders & fulfilment on top of the Module 18 booking domain. The booking is the order
object this module. Additions:

- **Customer completion gate** on subjective services: the provider completes → the order moves to
  "awaiting confirmation" → the customer confirms (or reports a problem); objective services are
  auto-confirmed on completion and immediately enter the review window.
- **Problem reporting**: customers can report an issue on a completed-but-unconfirmed order
  (category, description, optional evidence). Reported issues are **handed to Kampmax support**
  (`problem.assignedTo = "kampmax_support"`) and flip the escrow readiness to **disputed** — the
  dispute/resolution engine itself is deferred (see §9).
- **Review window**: reviews open on confirmed-complete orders and stay open **14 booking-timezone
  days** after completion (`REVIEW_WINDOW_DAYS`); one review per booking.
- **Completion evidence**: providers may attach proof (images / one PDF; ≤4 files, ≤5 MB each) when
  completing for evidence-eligible service categories.
- **Payments & escrow readiness**: read-only projection — `payment`/`escrow` state labels plus an
  illustrative settlement breakdown (8% platform fee) once an order is confirmed. **No money moves.**
- **Powered-up booking lists**: 5-tab customer view (Upcoming / In progress / Completed / Cancelled /
  All) and 6-tab provider view (Pending / Upcoming / In progress / Completed / Cancelled / All),
  both with a backend-driven filter bar (search, service, provider, date window, sort), pagination,
  live tab counts, and a provider summary strip (pending / today / in progress / completed).
- **Notifications**: completion (auto vs must-confirm), completion-confirmed, issue-reported, and
  review-received push to the right dashboard for both parties.

The order keeps the demo-free price model of M18 (fixed / range / starting-from); no money is
collected or settled in this module.

## 2. Routes

**Zero new routes.** `/customer/bookings*` and `/service-provider/bookings*` are reused; the new
behaviour renders inside the existing auth-gated views and detail pages (people retain their
bookmarked URLs). `SERVICE_PROVIDER_DASHBOARD_SECTIONS` unchanged.

## 3. Files created / extended

**Config (new) — `src/config/service-order.ts`**
Single source of truth for fulfilment presentation/rule metadata: `SERVICE_ORDER_STATUSES` +
`SERVICE_ORDER_RESERVED_STATUSES` (`expired`/`disputed`, understood defensively, never emitted),
`SERVICE_ORDER_LIFECYCLE` flow, `FULFILLMENT_CONFIRMATION_META`,
`CUSTOMER_CONFIRMATION_HEADING/BODY`, category rules
(`COMPLETION_CONFIRMATION_REQUIRED_CATEGORY_IDS` = cat1/cat8/cat9 ·
`COMPLETION_EVIDENCE_ALLOWED_CATEGORY_IDS` = cat3–cat6), `REVIEW_WINDOW_DAYS` = 14,
`SERVICE_PROBLEM_CATEGORIES`, `PROBLEM_ASSIGNED_TO` = `"kampmax_support"`,
`PAYMENT_STATE_LABELS` + `ESCROW_STATE_LABELS`, `SETTLEMENT_DISCLAIMER`, `PLATFORM_FEE_RATE` = 0.08,
`EVIDENCE_KIND_LABELS`, `EVIDENCE_LIMITS` (≤4 files, ≤5 MB, jpeg/png/webp + pdf). UI and store agree
by construction; the UI never writes statuses.

**Types — `src/types/booking.ts`**
Two new timeline kinds (`completion_confirmed` / `problem_reported` / `reviewed`),
`ServiceBooking.fulfillment: BookingFulfillment` (non-optional), `BookingEvidence(kind)`,
`FulfillmentConfirmationStatus`, `ServiceProblemCategory`, `BookingProblem` (`assignedTo:
"kampmax_support"`), `BookingReview(Input)`, `BookingPaymentState` / `BookingEscrowState`,
`BookingSettlementBreakdown`, `BookingRescheduleHistoryEntry`, `BookingFulfillment` bins
(confirmation + problem + review + review window + payment/escrow + settlement + reschedule
history). List layer: `BookingListFilter += in_progress|completed`, `ProviderBookingStatusFilter`,
`BookingSort`, `BookingListQuery`/`BookingPageResult` (search, service, provider, date window,
sort, page/limit/total/totalPages). `BookingReadyState += canConfirmCompletion | canReportProblem |
confirmationStatus` (+ `paymentStage` mapping).

**Backend store — `src/data/booking.ts`**
Fulfilment helpers (`mkFulfillment`, `newEvidenceId`, `settlementPreviewFor`,
`reviewEligibleUntilAfter`, `syncFulfillmentState` — the store remains authoritative for every
transition). New seeds cover every demo branch: provider `in_progress` (msvc2/u3); customer
`in_progress` today, `awaiting` (msvc6/u1), `confirmed` + review-eligible (msvc16/u1), `cancelled`
(msvc12/u1); msvc1 completed+confirmed for u5. `completeBookingOnBackend(id, owner, {evidence})`
sets `awaiting` vs `confirmed` by category rule, stores evidence (only when allowed), pushes the
right timeline events, and auto-opens the review window on auto-confirm. New mutations
`confirmCompletionOnBackend` (idempotent on re-confirm; impossible on problem_reported /
auto-confirmed), `reportProblemOnBackend` (allowed while `awaiting` or auto-confirmed-plus-completed
until confirmed; blocked after confirmed or already-reported), `submitBookingReviewOnBackend`
(needs `confirmed`, window open, and idempotent on duplicates). Cancellation/decline/reschedule
sync payment/escrow readiness without charging. **Query engine**: normalized search (service,
reference, customer, provider display name), service/provider/date-window filters, four sorts
(`newest`/`oldest`/`upcoming`/`recently_completed`), paged via `page`/`limit`;
`getBookingsForCustomer`/`getBookingsForProvider` stay overloaded (string filter → plain array,
query → `BookingPageResult`); `getProviderBookingStats += inProgress | cancelled`.

**Service facade — `src/services/booking.ts`**
`completeBooking(id, evidence?)` posts the completion and notifies the customer ("Service
completed — please confirm" vs "…has been completed"); `startBooking` notifies the customer;
`confirmBookingCompletion` / `reportBookingProblem` (`ReportBookingProblemInput`) /
`submitBookingReview` push provider notifications + dashboard activity. Query functions now return
`BookingPageResult` always (`getCustomerBookings`, `getProviderBookings`; page size 12),
`getCustomerBookingCounts(): Record<BookingListFilter, number>`, `getProviderBookingSummary()`
includes `inProgress`/`cancelled`. `getBookingReadyState` narrowed to the backend projection incl.
`paymentStage` + the fulfilment flags above. `ProviderBookingFilter` re-exported as an alias.

**Dashboard (extended)** — `src/types/service-provider-dashboard.ts` metric key
`in_progress_bookings`, `getSpDashboard` now emits an "In Progress" card
(`${completed} completed · ${cancelled} cancelled` sub-label), `ServiceProviderMetricCard` icon map
adds `CalendarClock`.

**UI — `src/components/booking/` (10 new)**
`FulfillmentStatusBadge` (customer/provider perspective labels for awaiting / confirmed / issue),
`EvidenceUpload` (FileReader data-URLs held in-memory only — never localStorage, never executed;
kind detection by MIME, per-file size + count validation, thumbnails for images),
`CompleteBookingModal` (provider; evidence section only when the category allows; explains whether
the customer must confirm), `ConfirmCompletionModal` (customer "It's done"), `ReportProblemModal`
(category radio drill-down + description + evidence),
`LeaveReviewModal` (5-star + title + body), `BookingFilters` (search/service/provider/date window/
sort over the backend query; options from `getActiveServices()` + `getProviderDisplayName`),
`BookingPagination` (prev/next + totals), `SettlementPanel` (payment & escrow labels + payout
preview), `CompletionCard` (customer gate: awaiting → confirm|report, problem → support notice,
confirmed → review CTA or "window closed").

**UI (wired into existing)**
`BookingTimeline` renders the three new kinds · `BookingListCard` shows the fulfilment sub-badge on
completed orders for both roles and the provider display name on the customer lists ·
`CustomerBookingsView` (5 tabs + live counts via `getCustomerBookingCounts`, filter bar, pagination)
· `ServiceProviderBookingsView` (6 tabs, summary strip, filter bar, pagination) ·
`CustomerBookingDetailView` (fulfilment badge in header; aside now hosts `SettlementPanel` +
`CompletionCard` + confirm/report/review modals; the old "reviews in a later module" placeholder
removed) · `ServiceProviderBookingDetailView` (fulfilment badge, modal-based completion with
evidence, `SettlementPanel` in the payment section in place of the "later module" note).

## 4. Order fulfilment lifecycle

```
provider completes
  ├─ subjective (cat1/cat8/cat9)   → status=completed, confirmation=awaiting
  │      customer: CONFIRM ──→ confirmed complete ──→ review window (14 d) ── review
  │               │   └→ REPORT PROBLEM ──→ problem_reported ──→ assigned to kampmax_support
  │                                    (dispute/resolution engine: deferred §9)
  └─ objective        → status=completed, confirmation=confirmed (auto) ──→ review window → review
```

- Review window = `completedAt + 14 days`; booking-timezone days (`Africa/Lagos`, UTC+1, no DST).
- Settlement preview (`currency NGN`) = service amount − 8% platform fee − tax, computed by the
  store only after confirmation (auto or manual); read-only, disclaimer shown.
- Escrow readiness: held → release_pending (awaiting confirmation) → released (confirmed) → disputed
  (problem reported); refund states on cancelled. No money is moved.
- Cancellation/decline/reschedule keep the readiness honest (labels only).

## 5. Policy & error handling (`BookingError`)

- `422` — completing a non-active booking, evidence on a non-eligible category, confirming an
  auto-confirmed booking ("nothing to do"), confirming/acting after `problem_reported`,
  reporting on an already-confirmed or already-reported order, reviewing before confirmation,
  review window closed, duplicate review (returns the existing review idempotently).
- `403` — acting on another owner's booking; `404` — missing order.
- Every transition remains **store-validated atomically**; the UI only renders what the store
  returns (same M18 `BookingError` matrix otherwise unchanged).

## 6. Security & privacy

- Ownership is derived from `getCurrentUser().id` / dashboard `providerId` — never client input.
- Evidence is confined to the in-memory store as session-only data URLs; no persistence, no
  execution, client-side limits (4 files × 5 MB, allowed MIME list) with the backend contract stub
  in `EVIDENCE_LIMITS`.
- Readiness projections (payment/escrow/settlement labels) contain no PII; provider display name
  only on the customer's own booking lists.
- Booking pages remain `noindex, nofollow` (unchanged from M18).

## 7. Accessibility

All four new modals are `role="dialog"`/`aria-modal` with labelled headings, Esc-to-close, and
state-aware buttons. `FulfillmentStatusBadge` is icon + text (never color-only). Radio category
cards, star radios (`role="radiogroup"`/`aria-checked`), `role="alert"` on errors, labelled
filter inputs with `sr-only` spans. Pagination is a labelled `<nav>`.

## 8. Expected backend endpoints (service layer already mirrors these)

`POST /me/bookings/:id/confirm-completion` ·
`POST /me/bookings/:id/report-problem` · `POST /me/bookings/:id/reviews` ·
`POST /service-provider/bookings/:id/complete` (multipart evidence) ·
`GET /me/bookings?status=&search=&serviceId=&providerId=&dateFrom=&dateTo=&sort=&page=&limit=` ·
`GET /me/bookings/counts` · `GET /service-provider/bookings?...` (same query contract, provider
owner) · `GET /service-provider/bookings/summary`.

## 9. Deferred (explicitly out of scope)

Real payments, escrow, payouts and taxation (preview math only; `payments`/`escrow` stay labels),
the **dispute/resolution engine** (reported issues hand to `kampmax_support` with full audit trail
so a later admin queue can pick them up), provider-side problem acknowledgement, admin review of
reports, messaging/chat for appointment logistics, evidence upload to real object storage (browser
FileReader holds it in-memory), notification response/action links, and rate-limiting (`429`).

## 10. Verification

- `npx tsc --noEmit -p tsconfig.json` — clean (config/types/data/service/UI all green).
- `npm run build` (Turbopack) — green; TypeScript pass; **81 routes** (81/81 static pages
  generated) — no regressions in vendor/admin/marketplace trees.
- Runtime domain pass — **60/60 assertions** on a clean store via a transient `next dev` route
  (deleted after the run): counts/pagination/search/sort/date/provider filters; ready-state gates
  for every fulfilment branch; problem report (+evidence, assigned to support, escrow disputed),
  confirm-after-problem blocked, confirm on auto-confirmed blocked, review on confirmed (stored,
  window label, duplicate idempotent), report on confirmed blocked; provider complete-with-evidence
  auto-confirm + settlement math; provider summary counts translate after mutations.
- Fresh prod smoke (`:3019`): all `customer/bookings*` and `service-provider/bookings*` routes and
  representative marketplace routes return 200 (auth-gated `(main)` shell SSRs a spinner until the
  client auth/owner context resolves; interactive behaviour is covered by the runtime pass above).

## 11. Documented deviations

- **No TanStack Query** (unchanged from M17/M18 — not in `package.json`); the sync layer stays
  endpoint-shaped (§8).
- **No `eslint.config.*`**; gates are tsc + production build (unchanged).
- Review/fulfilment state lives inside the M18 booking object rather than new "order" entities —
  the spec allows the booking to serve as the order object; a dedicated `Order` projection can be
  introduced without breaking the store API.
- Evidence validation is client-side + policy in the store (`EVIDENCE_LIMITS`); the mock accepts
  data URLs only, which is a known prototype boundary.

## 12. Suggested next module

**Module 20 — Payments, escrow & dispute engine**: make the readiness labels real (payment intent,
escrow hold/release, payouts, receipts/tax), an admin dispute-resolution queue fed by
`problem_reported` orders (assign, message, resolve → refund/full/release), provider problem
acknowledgement, and appointment-day messaging.