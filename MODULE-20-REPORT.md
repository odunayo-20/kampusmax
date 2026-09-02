# Module 20 — Service Provider Financials & Payouts (Report)

**Status:** Complete · **Build:** ✔ `npm run build` green (Turbopack, TypeScript pass; 7 new
routes) · **Type-check:** ✔ `npx tsc --noEmit` clean · **Runtime:** ✔ domain assertions on a
transient route (deleted after the run) · **Smoke:** ✔ all 7 financials routes 200 on `next dev :3000`

## 1. Scope (per the M20 spec)

Service Provider Financials, Earnings Ledger & Payouts on top of the Module 19 fulfilment domain.
The backend (service layer standing in for it) is fully **backend-authoritative**: every balance,
period total and ledger entry is computed from the provider's own booking ledger; the frontend
only renders returned values and never sums or derives money. Additions:

- **Earnings overview** — Available / Pending / On-hold / Net-earnings summary cards driven by
  settled completed bookings, with a period filter (Today / 7d / 30d / This month / Last month /
  Custom) resolved **server-side** in Africa/Lagos time (UTC+1, no DST).
- **Earnings breakdown** — gross revenue, platform fees, tax, net earnings, settled count and
  in-period payout total for the selected window (backend-computed).
- **Transactions ledger** — every money movement as immutable backend rows
  (`service_payment` CREDIT + `platform_fee` DEBIT per settled booking; `payout` DEBIT rows).
  Filterable (search, type, status, direction, date window) + sortable + paged, with **CSV export**.
  Detail pages link back to the originating booking and show a backend event timeline.
- **Payouts** — request flow (modal), history table + detail pages, and a re-verification-only
  payout-account management surface. Requests are **idempotency-keyed** (one key per intended
  submission, minted per modal open) and re-validated server-side against the available balance,
  per-request minimum/maximum and account status.
- **Payout account** — masked bank details only (`••••••••4317`); no full numbers anywhere.
  **No manual verification surface**: saving always re-queues the account for verification
  (`pending_verification`).
- **Notifications** — successful payout requests push a dashboard notification ("Payout
  requested") and a `payout_update` dashboard activity.

No payment/escrow engine, no Paystack secrets, no tax engine and no dispute engine are built
here (§9).

## 2. Routes (all new, all under `/service-provider/financials`, all `robots: noindex`)

```
/service-provider/financials                         (overview)
/service-provider/financials/transactions            (ledger + CSV export)
/service-provider/financials/transactions/[transactionId]
/service-provider/financials/payouts                 (history + request modal)
/service-provider/financials/payouts/[payoutId]
/service-provider/financials/payout-account          (managed re-verification form)
```

`SERVICE_PROVIDER_DASHBOARD_SECTIONS` in `src/lib/utils.ts` gains `Financials` → points at
`/service-provider/financials` (the sidebar placeholder is replaced; Analytics stays deferred).

## 3. Files created / extended

**Types — `src/types/service-provider-financials.ts`**
`SP_FINANCIAL_TX_TYPE` (§ service_payment/platform_fee/payout/adjustment/refund),
`SP_FINANCIAL_TX_STATUS` (pending/processing/successful/failed/reversed/refunded/disputed/on_hold),
`SP_FIN_SIGN`, `SpFinancialTransaction` (immutable rows + backend event timeline),
`SpFinancialSummaryCard`/`Tone`, `SP_FINANCIAL_PERIOD` + `SpFinancialPeriod`,
`SpEarningsBreakdown`, `SpPayoutAccount`/`Status` (+`restrictions`), `SpPayoutAccountInput`/`Result`,
`SpPayout`/`Status`, `SpFinancialQuery`/`Sort`/`Page<T>` (per-page credit/debit totals),
`SpPayoutRequestInput` (amount + idempotencyKey + confirmed) /`Result`, `SP_FINANCIAL_RESULT` codes,
`SP_FINANCIAL_LIMITS` (min 2,000 · max 2,000,000 · fee 50 · 24 h idempotency window),
`SP_FINANCIAL_PERMISSION_KEYS`, `SpFinancialOverview` bundle, `SpCsvExport`.

**Backend store — `src/data/service-provider-financials.ts`**
Seed payout account (GTBank, `••••••••4317`, verified 40 d ago) and 3 relative payout seeds:
SPOUT-2003 successful 12,000 (9 d ago), SPOUT-2002 successful 6,000 (2 d ago), SPOUT-2001 **failed**
15,000 (16 d ago, "Bank could not confirm the recipient account."). In-memory
`spFinancialsStore` (account, payouts, idempotency-key set). `daysAgo`/`daysAgoPlus` keep
timestamps coherent with the relative booking ledger. `maskAccountNumber()` helper.

**Backend store — `src/data/booking.ts` (extended)**
`settlementPreviewFor` exported; `seed()` opts gained `confirmAfterMinutes` (applied before
`syncFulfillmentState` when completed+confirmed); 7 enrichment seeds (u91–u97) now give the
provider a coherent earnings story: 3 × msvc1 confirmed (5,000 → net 4,600 each), 2 × msvc2
confirmed (3,000 → net 2,760 each), 1 × msvc3 confirmed (2,000 → net 1,840), 1 × msvc1 awaiting
(pending 4,600), 1 × msvc2 `problem_reported` (on-hold 2,760). Existing u1 counts unchanged.

**Service facade — `src/services/service-provider-financials.ts`**
Owner-scoped (`getSpProfileRecord` → providerId; throws `UNAUTHORIZED` without it). Platform clock
in Lagos; `resolvePeriod` (today = Lagos UTC-day start; custom ranges sanitised with
`Math.min(from,to)`). `deriveLedger()` = single source of truth for every row (12 booking rows from
the 6 settled bookings + payout rows from the store; never duplicated, sorted newest-first).
`computeCardsAndBreakdown` (available = net − successful/processing payouts, pending =
awaiting-confirmation net, on-hold = problem_reported net, net-earnings = period net) · public API:
`getSpFinancialPermissions`, `getFinancialOverview(period = 30 d)`, `getPayoutAccount`,
`updatePayoutAccount` (always → `pending_verification`, masks to last 4), `getTransactions` /
`getTransactionById` / `exportTransactionsCsv`, `getPayouts` / `getPayoutById`, idempotent
`requestPayout` (mints SPOUT-n, fee 50, pushes notification + `payout_update` activity,
returns post-request available), `computeAvailable`, `getFinancialPeriodLabel`.

**Cross-module (extended)**
`src/types/service-provider-dashboard.ts` — activity kind `payout_update`,
notification kind `financial_update` · `src/services/service-provider-dashboard.ts` —
`pushSpFinancialNotification` / `recordSpFinancialActivity` helpers · `ServiceProviderSidebar.tsx`
— Financials nav live · `ServiceProviderNotifications.tsx` — `financial_update` dot (`bg-info-600`)
· `src/app/(main)/service-provider/page.tsx` — `payout_update` activity icon ·
`src/lib/utils.ts` — Financials section.

**UI — `src/components/service-provider/financials/` (14 new)**
`sp-financials-meta.ts` (labels + BadgeVariant maps + option lists, single source of truth) ·
`SpFinancialsSkeleton` · `SpFinancialSummaryCards` · `SpFinancialsPeriodBar` (period Select +
custom date range, backend breakdown) · `SpFinancialsSubnav` (Overview / Transactions / Payouts /
Payout account) · `SpPayoutAccountCard` (status + restrictions + Request payout + Manage) ·
`SpTransactionTable` (compound rows, per-row booking deep-link) · `SpTransactionsToolbar`
(search/type/status/direction/sort/date filters + **Export CSV** blob download) ·
`SpTransactionDetail` (immutable-ledger notice, summary cards, details + timeline, copy-to-clipboard)
· `SpPayoutsTable` · `SpPayoutDetail` · `SpPayoutRequestModal` (amount / confirm / submitting /
success / error phases; quick-amount chips; **fresh idempotency key per open**; clear failure
surface incl. insufficient balance) · `SpPayoutAccountForm` (bank/account-number/account-name;
10-digit validation; success state explains re-verification) · `SpPagination`.

**Pages — 7** under `src/app/(main)/service-provider/financials/` (skeleton/error/empty states,
mirroring the vendor financials module, `noindex, nofollow` layout for the whole section).

## 4. Ledger & money math (backend-computed)

Per settled (confirmed-complete) booking two rows are emitted: `service_payment` CREDIT = gross
service amount and `platform_fee` DEBIT = 8% fee; the **net** is the backend-provided
`providerEarnings` value. Payouts are DEBIT rows of `amount + fee` (the failed attempt is emitted
as a terminal `failed` DEBIT row — funds unchanged, excluded from Available). The frontend never
sums anything: cards, breakdowns, per-page totals and Available all come from the service/store.

Seed story (all `Date.now()`-relative for demo freshness):

| Item | Value |
|---|---|
| Settled bookings (6) | 3×msvc1 + 2×msvc2 + 1×msvc3 |
| Gross / platform fees / **net** (all-time) | **₦23,000 / ₦1,840 / ₦21,160** |
| 7 d window | gross ₦15,000 · fees ₦1,200 · net ₦13,800 · 3 settled · 1 payout (₦6,050) |
| Pending (awaiting confirmation, u96) | ₦4,600 |
| On-hold (`problem_reported`, u97) | ₦2,760 |
| Successful payouts (12,050 + 6,050) | ₦18,100 |
| **Available** (= net − successful/processing) | **₦3,060** (≥ min ₦2,000) |
| Ledger rows | 15 (6 service_payment + 6 platform_fee + 3 payout) |

## 5. Payout request flow & policy (`SP_FINANCIAL_RESULT`)

Modal → amount (client hint: min/max/fee) → confirm (checkbox) → submit. Server order of checks:
not found / permission (`payouts.request`), account verified, account restricted, **idempotency key
replay** → `DUPLICATE_REQUEST` (returns the earlier payout, no double debit), not-confirmed,
below/above min, invalid amount, insufficient balance. On success a `SPOUT-n` payout is minted
(`processing`, `expectedAt` +24 h), the key is stored, a notification and dashboard activity are
pushed, and the modal reports success. Payouts are final once submitted — no cancel/edit UI
(spec perspective: rate-limiting/429 is deferred, §9; the idempotency guard already makes a retried
click harmless).

## 6. Security & privacy

- Ownership always derived from the authenticated provider record — a client can never pass
  another provider's id (no IDOR). Service throws `UNAUTHORIZED` otherwise.
- Bank details returned **masked only**; the manage form never shows a full number; a fresh
  `idempotencyKey` is minted per modal open so a replayed submit cannot double-debit.
- Ledger rows are immutable — no edit/delete/change surface; the detail page states so.
- Nothing sensitive lands in URLs; financials section is `robots: noindex, nofollow`.
- Internal risk/fraud reasoning is not exposed; failed payouts show the bank's public reason only.

## 7. Accessibility

Tables carry `role="table"` and real `<th>` scoping; the payout modal is `role="dialog"` /
`aria-modal` with a labelled heading, Esc-to-close and state-aware (disabled-while-submitting)
buttons; icons are always paired with text labels (never color-only); form errors are
`aria`-reachable (Labelled Input error text); focusable copy buttons masked behind `aria-label`s.

## 8. Expected backend endpoints (service layer already mirrors these)

`GET /me/financials/overview?period=` · `GET /me/financials/transactions?search=&type=&status=&sign=&from=&to=&sort=&page=&limit=` ·
`GET /me/financials/transactions/:id` · `GET /me/financials/transactions/export.csv` ·
`GET /me/financials/payouts?status=&page=&limit=` · `GET /me/financials/payouts/:id` ·
`POST /me/financials/payouts` (`{ amount, idempotencyKey, confirmed }`, `Idempotency-Key` friendly) ·
`GET /me/financials/payout-account` · `PUT /me/financials/payout-account`.

## 9. Deferred (explicitly out of scope)

Real payments/escrow/dispute-resolution engines (M19 §9 unchanged — readiness stays a projection;
`support` retains reported problems), the **tax engine** (breakdown shows tax = 0; the fee model
is the landing rule), **statements-a-period export** (CSV export of the filtered ledger is in
instead of a statements banking-style route), server-side rate-limiting/`429`, multi-provider
admin finance views, webhooks, and real bank verification (account updates always re-queue for
verification by the platform).

## 10. Verification

- `npx tsc --noEmit` — clean (types/data/service/UI/routes all green).
- `npm run build` (Turbopack) — green; **7 new routes** in the manifest
  (`financials`, `payout-account`, `payouts`, `payouts/[payoutId]`, `transactions`,
  `transactions/[transactionId]`) — no vendor/admin/marketplace regressions.
- Runtime domain pass (transient `next dev` route, deleted afterwards) — all checks matched the
  seed math: available **3,060**, pending **4,600**, on-hold **2,760**, 30-d net **21,160**;
  7-d gross **15,000** / fees **1,200** / net **13,800** / 3 settled / 1 payout; payouts total 3;
  15 ledger rows (`service_payment` 6 · `platform_fee` 6 · `payout` 3); failed payout reason and
  payout→transaction deep-link intact; `computeAvailable` matches the card.
- Smoke — all 7 financials routes return 200 on `next dev :3000` (SSR shell renders; interactive
  behaviour covered by the runtime pass above). Dev instance left running for inspection.

## 11. Documented deviations

- **No TanStack Query** (unchanged M17–M19); the sync service layer stays endpoint-shaped (§8).
- **No `eslint.config.*`**; gates are tsc + production build (unchanged).
- **Tax = 0** in the breakdown while the backend taxes; documented instead of a fake value-adding
  row ("backend returns tax; UI renders it").
- Payout account editing has **no client-side bank-name resolution** (10-digit + bank-name free
  text validated server-side); resolves to masked display only.
- `updatePayoutAccount` never offers manual/instant verification by design (pending_verification).

## 12. Suggested next module

**Module 21 — Admin finance & dispute queue**: an admin workbench consuming `problem_reported`
bookings and `failed` payouts (assign → message → resolve: release/refund), plus provider-side
problem acknowledgement, receipts/tax documents, and the real paystack/intent payment hooks the
service layer's endpoint mirror already anticipates.