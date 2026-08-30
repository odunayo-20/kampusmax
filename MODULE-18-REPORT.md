# Module 18 — Service Booking & Scheduling (Report)

**Status:** Complete · **Build:** ✔ production build green (81 routes; 5 new) · **Type-check:** ✔ `npx tsc --noEmit` clean · **Smoke tests:** ✔ (prod on :3019)

## 1. Scope (per spec §66)

Booking request flow with calendar & time-slot selection, provider approval/confirmation, booking
lifecycle (request → confirmed → in-progress → completed), cancellation & rescheduling with policy
checks, race-safe slot locking (409 + alternatives), idempotent creates, a customer **My bookings**
area, a provider **Bookings** dashboard with accept/decline/start/complete, and booking
notifications for both sides.

**Payments, escrow, service orders/payouts, quote negotiation and reviews are intentionally out of
scope** (see §9). Booking succeeds without any charge; the UI shows where payment & escrow will sit.

## 2. Routes (5 new)

| Route | Render | Notes |
|---|---|---|
| `/services/[serviceId]/book` | Dynamic + server `metadata.robots noindex` | Guest-accessible *route* but auth-gated *flow*: guests are sent to `/login?returnTo=/services/[id]/book` and returned automatically. `notFound()` for missing/inactive and **quote-only** services (quotes stay on the detail page). |
| `/customer/bookings` | Client (inside auth-gated `(main)`) | Tabs: Upcoming / Past / Cancelled / All with counts + empty states; CTA back to `/services`. |
| `/customer/bookings/[bookingId]` | Client (auth-gated) | Details, timeline, schedule/where/price/phone, cancellation policy, ready-state (payment label), Cancel (2h policy modal) + Reschedule (availability-driven modal). |
| `/service-provider/bookings` | Client, dashboard shell (`(main)/service-provider/layout`) | Tabs: Pending / Upcoming / Completed / Cancelled / All. Pending requests are visually highlighted. In `SERVICE_PROVIDER_DASHBOARD_SECTIONS`, so the sidebar/topbar render (static segment beats the public `[slug]` route). |
| `/service-provider/bookings/[bookingId]` | Client, dashboard shell | Customer contact (phone visible to the provider), agreed price, actions: Accept (with optional final fee for range pricing) / Decline (reason) / Start (within a 30-min grace window) / Complete. |

Both booking sub-trees export `layout.tsx` with `metadata.robots = { index:false, follow:false }`
(private resources). The public marketplace pages remain indexable.

## 3. Files created

**Types — `src/types/booking.ts`**
`BookingStatus` (+labels/tones, `ACTIVE_BOOKING_STATUSES` = pending/confirmed/in_progress),
`BookingTimelineEvent`, `BookingLocation`, `BookingPrice`, `ServiceBooking` (owner projection,
private phone/email only on the parties' views, `cancellationPolicy`, `cancelledBy`, `declineReason`),
`DayAvailability`, `BookingSlot` (wall-clock + absolute instants, `taken`/`reason`),
`BookingAvailabilityResponse` (backend-authoritative: never re-computed), `CreateBookingInput`
(per-submission `idempotencyKey`), `CancelBookingInput`, `RescheduleBookingInput`,
`ProviderBookingDecision` (`finalFee`), `BookingError` (codes incl. `timeout`, `recoverable`,
`suggestedSlots`), `BookingResult`, `BookingListFilter`, ready-stage types (`BookingReadyState`,
`BookingPaymentStage`) for the deferred payment module, `BookingDayUnavailableReason` (`past` /
`closed` / `advance_notice` / `too_far` / `fully_booked`).

**Backend store — `src/data/booking.ts`**
Owner-scoped mock of the future API (§8). Booking timezone `Africa/Lagos` (fixed UTC+1, no DST) is
authoritative for all wall-clock labels. Engine: 31-day window (today..+30), weekly hours, 15-min
inter-slot **appointment buffer**, per-provider `minAdvanceNoticeHours`, and **provider-level
collision detection** (a new booking overlaps ANY active booking on that provider, including other
services). Atomic, validated mutations: create (idempotent via key→bookingId map) / cancel
(customer free-cancellation window up to 2h before start) / reschedule (idempotent, cross-service
conflict → 409 + alternatives) / accept (optionally sets `finalFee`, supersedes `starting_from`) /
decline / start / complete, plus owner-scoped queries, `getProviderBookingStats`, and
`suggestAlternativeSlots` for 409 recovery. Seeded bookings are **relative to "now"** so the demo
calendar is always populated (sp1 inbound requests from u2–u5; u1 history on sp2/sp6/sp4).

**Service facade — `src/services/booking.ts`**
Every function maps 1:1 to a future endpoint (`GET /bookings/availability…`, `POST /bookings`, …).
`getBookingAvailability`, `getBookingPageBundle`, `getBookingLocationOptions`,
`createBooking`/`cancelBooking`/`rescheduleBooking`/`acceptBooking`/`declineBooking`/`startBooking`/
`completeBooking`, `getCustomerBookings`/`Detail`, `getProviderBookings`/`Detail`/`Summary`,
`getBookingReadyState`, `bookingStatusLabel`, and tz-authoritative `formatBookingDay/Time/Date`,
`bookingStartLabel`. Mutations emit customer notifications (`pushUserNotification`, category
`bookings`, type `booking_update`) and provider notifications/activity (`pushSpBookingNotification`,
`recordSpBookingActivity`). No circular imports.

**Existing-file integrations**
Notifications: `NotificationCategory += bookings`, `NotificationType += booking_update`,
`categoryLabels`/grouped order + `pushUserNotification` (`src/types/index.ts`,
`src/services/notifications.ts`); `CategoryFilter` + `NotificationItem` icon maps for the new
category (fallback was safe, explicit icon added). `src/lib/utils.ts`: added
`/service-provider/bookings` to `SERVICE_PROVIDER_DASHBOARD_SECTIONS`. Sidebar: Bookings item
unlocked (`placeholder` removed). `ServiceProviderDashboard` overview now computes the real
upcoming-bookings metric from `getProviderBookingStats` and books the `booking_request` feed kind.
`ServiceDetailView`: **Book this service → real routing** to `/services/[id]/book` (auth-gated,
`returnTo` preserved); quote-only services keep **Request a quote** as the primary CTA; the
`BookingSheet` placeholder was deleted.

**UI — `src/components/booking/`**
`BookingFlow` (3-step wizard: schedule → details → review, confirmation state, auth gate with
`returnTo`, 409/timeout → availability re-fetch + step-1 recovery with suggested slots — never a
blind retry, per-submission idempotency, numbers-only phone, location option cards, sticky summary),
`BookingDayPicker`, `BookingTimeSlotGrid`, `BookingSummaryCard`, `BookingStatusBadge`,
`BookingDateTime`, `BookingTimeline`, `BookingListCard` (shared customer/provider), modals
`CancelBookingModal` (2h policy shown), `RescheduleModal` (live availability, 409 → slot greys out),
`AcceptBookingModal` (final fee for range pricing), `DeclineBookingModal` (reason required),
`BookingEmptyState`, `CustomerBookingsView` + `CustomerBookingDetailView`,
`ServiceProviderBookingsView` + `ServiceProviderBookingDetailView`.

**Pages — `src/app/`**
`services/[serviceId]/book/page.tsx` (server shell: robots noindex, `notFound()` for missing /
quote-only, renders `BookingFlow`), `(main)/customer/bookings/{layout,page,[bookingId]/page}.tsx`,
`(main)/service-provider/bookings/{layout,page,[bookingId]/page}.tsx`.

## 4. Booking lifecycle & rules

```
instant (sp2)                 request_approval (sp1/sp3/etc.)
  created → confirmed            created → pending ─→ confirmed (accept)
              │                                  │ └→ declined
              ▼                                  ▼
          in_progress (provider start) → completed
```
- **Idempotency:** creates and reschedules carry a key; a retried/duplicate request returns the
  `SAME` booking (`alreadyExisted`) — never a second slot.
- **Races:** two bookings for an overlapping slot on the same provider → second gets `409`
  `SLOT_UNAVAILABLE`, `recoverable: true`, with `suggestedSlots`. The UI re-fetches availability
  (taken slot greys out) and returns the customer to step 1.
- **Policy (422):** past start, within advance-notice window, provider closed that day / outside
  working hours, beyond +30-day window, customer free-cancellation window passed, rescheduling a
  non-pending/confirmed booking, declining an accepted booking, etc.
- **Provider actions** are ownership-scoped and status-validated; `start` requires `confirmed`
  (UI exposes it from 30 minutes before start), `complete` requires `confirmed`/`in_progress`.

## 5. Error matrix (already surfaced as `BookingError`)

`401` unauthenticated · `403` not the owner / no provider dashboard · `404` missing service/book
(notFound page) · `409` slot conflict — recoverable, `suggestedSlots` · `422` validation/policy
(`field` set) · `429` rate limit (type + UI-ready, not exercised by the single-user demo store) ·
`500` internal · `timeout` ambiguous — resolve by re-checking status, idempotency makes the retry
safe. The service layer is cut so each maps 1:1 to a real HTTP code on the future API.

## 6. Security & privacy

- Ownership is **always derived from the authenticated identity** (`getCurrentUser()` for
  customers, dashboard record `providerId` for providers) — never from client input.
- Mutations validate status/window/collision **atomically in the store**; the UI renders only what
  the backend returns (slots, price, status transitions).
- Private phone/email/campus are exposed only on the two booking parties' own projections.
- No user/dashboard fields are shared with the public marketplace (no `userId`, no
  verification/address data in marketplace types).
- Booking pages are `noindex/nofollow` (private resources) via server `metadata.robots`; the
  public marketplace remains indexable.
- Navigation after login uses the existing `safeReturnTo` whitelist (extended to `/services/` in
  M17); no open redirect.

## 7. Accessibility

Modal dialogs: `role="dialog"`/`aria-modal`, labelled, Esc-to-close, backdrop click closes.
Status badges carry icon + text (never color-only); slot reasons are text. Tabs use
`role="tablist"/"tab"` + `aria-selected`; day picker / slot grid buttons have explicit labels and
`aria-pressed` selected state. Timelines use semantic lists; `role="alert"` for errors; focus states
on all controls.

## 8. Expected backend endpoints (layer already mirrors these)

`GET /bookings/availability?serviceId=&dateFrom=&dateTo=` ·
`POST /bookings` (idempotency-keyed) ·
`GET /me/bookings?filter=upcoming|past|cancelled|all` · `GET /me/bookings/:id` ·
`POST /me/bookings/:id/cancel` · `POST /me/bookings/:id/reschedule` ·
`GET /service-provider/bookings?filter=pending|upcoming|completed|cancelled|all` ·
`GET /service-provider/bookings/:id` · `POST /service-provider/bookings/:id/accept|decline|start|complete`

## 9. Deferred (explicitly out of scope this module)

Payments & escrow and service orders/payouts (the UI/timeline surface the ready-stage boundary —
`getBookingReadyState` returns `not_started`), quote negotiation, provider-initiated cancellation
of confirmed bookings (backend supports status rules; no provider cancel UI yet), reviews on
completed bookings, in-app messaging/chat for appointment day logistics, a real timezone/AST
library (fixed UTC+1 is correct for Nigeria and documented), and real rate-limiting (`429` declared).

## 10. Verification

- `npx tsc --noEmit -p tsconfig.json` — clean.
- `npm run build` (Turbopack) — green; TypeScript pass; **81 routes** static + dynamic.
- Smoke tests (prod server on `:3019`): new routes return 200; missing service → 404; booking
  pages carry `<meta name="robots" content="noindex, nofollow"/>` while `/services/msvc2` stays
  indexable; SSR of the wizard renders the auth-gated shell (flow hydrates client-side after the
  mock auth resolves). The store's lifecycle/collision/idempotency logic was reviewed against its
  matrix and ships in the build.

## 11. Documented deviations

- **No TanStack Query** (same as M17 — spec §41/§52/§62 assumed it; not in `package.json`). The
  sync service layer is endpoint-shaped (§8) so a real client can swap in later.
- **No `eslint.config.*`** in the repo; `npm run lint` cannot run. Gates: tsc + production build.
- The marketplace availability type has **no max-advance field**; the engine applies a
  `DEFAULT_MAX_ADVANCE_DAYS = 30` (documented constant) — surfaced to the UI as the booking window.

## 12. Suggested next module

**Module 19 — Payments, escrow & service orders**: ready-state payment stage becomes real
(hold/escrow → release on `completed`), order + payout records, and review gating on completed
bookings.