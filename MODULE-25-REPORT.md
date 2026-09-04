# Module 25 — Freelancer Financials & Payouts (Report)

**Status:** Complete · **Type-check:** ✔ `tsc --noEmit` clean (exit 0) ·
**Build:** ✔ `npm run build` green (webpack; all 6 new routes in manifest) ·
**Runtime:** ✔ routes serve 200 on `next dev :3000` · **Smoke:** ✔ all new routes 200

## 1. Scope

A **Freelancer Financials & Payouts** module for the Kampmax freelancer vertical (the successor to
Module 24 — Freelancer Contracts). It delivers Earnings (overview), a Transactions statement,
Withdrawals (payouts) and a Payout Method manager, all following the codebase's **sync in-memory
store + thin service layer** convention (`useState(() => getServiceData())`), with **no TanStack
Query / React Query / Zod / React Hook Form**.

Every financial value (available & pending balance, period totals, summary cards, payout
eligibility, ledger rows, payout records) is **backend-authoritative** — computed by the service
layer from the Module 24 **COMPLETED** contract ledger and the payout store. The frontend never sums
or derives money. Ownership is always derived from `getCurrentUser().id` (IDOR/BOLA-safe).

## 2. Routes (all new)

```
/freelancer/earnings                                   earnings overview (summary, balance, period bar, recent txs, payout method, withdraw modal)
/freelancer/transactions                               statement list (search/filter/sort/paginate)
/freelancer/transactions/[id]                          immutable transaction detail + timeline
/freelancer/payouts                                    withdrawal history (status tabs) + New withdrawal modal
/freelancer/payouts/[id]                               withdrawal detail + timeline
/freelancer/payout-methods                             payout method card + add/update form
```

The shell/layout renders for these paths (freelancer dashboard sections updated), and the sidebar
"Earnings" item is now a live link instead of a locked placeholder.

## 3. Files created / extended

**Types — `src/types/freelancer-financials.ts`**
`FL_FINANCIAL_TX_TYPE/STATUS`, `FL_FIN_SIGN`, `FlFinancialTransaction`, `FlBalance`,
`FlFinancialSummaryCard/Tone`, `FL_PAYOUT_ACCOUNT_STATUS`, `FlPayoutAccount`,
`FlPayoutAccountInput/Result`, `FL_PAYOUT_ELIGIBILITY`, `FlPayoutEligibility`, `FL_PAYOUT_STATUS`,
`FlPayout`, `FL_FINANCIAL_SORT`, `FlFinancialQuery/Page`, `FlPayoutRequestInput` (requires
`idempotencyKey` + `confirmed`), `FL_FINANCIAL_RESULT`, `FlPayoutRequestResult`,
`FL_FINANCIAL_LIMITS` (min 2000 / max 2,000,000 / fee 50), `FL_FINANCIAL_PERIOD`,
`FlEarningsPeriod`, `FlFinancialOverview`. Every enum is a single source of truth for the UI.

**Config — `src/config/freelancer-financials.ts`**
`FL_TX_STATUS_META`, `FL_TX_TYPE_META`, `FL_PAYOUT_ACCOUNT_STATUS_META`, `FL_PAYOUT_STATUS_META`,
`FL_PAYOUT_ELIGIBILITY_META`, `FL_PAYOUT_FILTER_TABS`, and the toolbar's
`FL_TX_TYPE_OPTIONS` / `FL_TX_STATUS_OPTIONS` / `FL_SIGN_OPTIONS` / `FL_SORT_OPTIONS`. Presentation
metadata only — no money math.

**Data store — `src/data/freelancer-financials.ts`**
`INITIAL_FL_PAYOUT_ACCOUNT` (GTBank, verified, masked `••••••••4317`), `INITIAL_FL_PAYOUTS`
(2 completed + 1 failed with relative timestamps and event timelines), mutable `flFinancialsStore`
(account, payouts, idempotencyKeys `Set`) and `maskAccountNumber`.

**Service facade — `src/services/freelancer-financials.ts`**
Owner-scoped ledger derivation (earning CREDIT + platform_fee DEBIT per COMPLETED contract; disputed
→ reversal; payout rows from store), `computeBalance`, `computeCards`, `computePeriods`,
`getPayoutEligibility`, `getFinancialOverview`, `getPayoutAccount`, `updatePayoutAccount`
(validates + moves to pending_verification), `getTransactions` (search/type/status/sign/date + sort
+ pagination + totals), `getTransactionById`, `getPayouts`, `getPayoutById`, `requestPayout`
(idempotency → confirmed flag → eligibility → min/max/balance → create payout → push notification),
`getFinancialPeriodLabel`, exports `FL_FINANCIAL_PERIOD`.

**Cross-module (extended)**
`src/config/freelancer-dashboard.ts` — added the four financial path prefixes to
`FREELANCER_DASHBOARD_SECTIONS` so the shell renders for them. `FreelancerSidebar.tsx` — Earnings now
links to `/freelancer/earnings`. Dashboard page + new `FreelancerFinancialSummary` widget
(backend-computed available/pending/total-earned card linking to `/freelancer/earnings`).

**UI — `src/components/freelancer/financials/` (15)**
`FlFinancialSummaryCards`, `FlBalanceCard` (eligibility-aware withdraw CTA), `FlEarningsPeriodBar`
(server-totalled periods), `FlStatusBadges` (icon+label transaction/payout status), `FlTransactionsTable`
(desktop table + mobile cards), `FlTransactionsToolbar`, `FlTransactionDetail`, `FlPayoutRequestModal`
(multi-step, idempotency-keyed, backend-validated), `FlPayoutMethodCard`, `FlPayoutMethodForm`,
`FlPayoutsTable`, `FlPayoutDetail`, `FlPagination`, `FlFinancialSubnav`, `FlFinancialSkeleton`,
`FlFinancialEmptyState` / `FlFinancialErrorState`, plus `index.ts`.

**Page files — 6** as listed in §2.

## 4. Verification

- `tsc --noEmit` — **clean (exit 0)** across all new files and the extended dashboard/sidebar.
- `npm run build` — **green**; manifest registers `/freelancer/earnings`, `/freelancer/transactions`,
  `/freelancer/payouts`, `/freelancer/payout-methods` (static) and the `[id]` detail routes (dynamic).
- Runtime smoke on `next dev :3000` — all six new routes return **200**; `/freelancer`,
  `/freelancer/dashboard`, `/freelancer/contracts` still **200**.
- Seeded ledger yields non-zero earnings (M24 COMPLETED "Logo & Brand Identity" @ ₦150k → earning
  credit + 10% fee debit), confirming the overview renders real, non-empty data.

## 5. Security & privacy

- **Backend-authoritative money:** balance, totals, eligibility and payout records are computed by
  the service; the UI renders returned values only and never sums/derives.
- **IDOR/BOLA:** all reads/writes derive ownership from `getCurrentUser().id`; no client-supplied id.
- **Masked accounts:** bank numbers are stored/displayed masked (`••••••••4317`); the raw number is
  collected only to hand to `updatePayoutAccount`, which returns the masked value as the only stored
  form. No full account numbers, secrets, or tokens.
- **Idempotent payouts:** `requestPayout` requires an `idempotencyKey` + `confirmed` flag, re-validates
  balance/min/max/account/duplicates server-side, and never double-debits. The modal mints a fresh key
  per open and after every failed submit, and **only shows success after `ok:true`**.
- **Currency fixed to NGN** (`FlBalance.currency: "NGN"`); never client-chosen.
- `requestPayout` pushes a `payments`-type `pushUserNotification` on success; no secrets in URLs/logs.

## 6. Accessibility

- Status badges always pair a label with an icon and a colour hint (never colour-only).
- Tables carry `<caption className="sr-only">`; sort/pagination/filter controls are real
  buttons/inputs/selects with `aria-label`s and `aria-current`.
- Modals are role `dialog` + `aria-modal` with labelled titles; icon-only close buttons have
  `aria-label`s; errors are surfaced with `role="alert"`.

## 7. Expected backend endpoints (service layer already mirrors these)

```
GET  /me/freelancer/financials/overview
GET  /me/freelancer/financials/transactions (?search&type&status&sign&from&to&sort&page)
GET  /me/freelancer/financials/transactions/:id
GET  /me/freelancer/financials/payouts (?status&page)
GET  /me/freelancer/financials/payouts/:id
GET  /me/freelancer/payout-account
PUT  /me/freelancer/payout-account
POST /me/freelancer/financials/payouts   (idempotency-keyed, confirmed)
GET  /me/freelancer/financials/eligibility
```

## 8. Documented deviations

- **M25 spec paragraphs referenced** (§7–§10 earnings, §11–§17 transactions, §22 eligibility,
  §26 payout method, §28–§29 withdrawals) describe a richer real-time gateway flow. This prototype
  mirrors the existing **M14 vendor / M20 service-provider financials** pattern: in-memory store +
  sync service, immediate idempotent payouts, masked accounts. No polling/webhooks/LiveKit + Bani
  gateway integration — flagged for the real integration in a later module.
- **ESLint is broken repo-wide** (no `eslint.config.*`), pre-existing and unrelated; verification is
  via `tsc` + build + runtime smoke only.
- **Earnings are derived** from the M24 COMPLETED contract ledger with an illustrative 10% platform
  fee computed in the service (backend-authoritative), consistent with the fee-model constraint.

## 9. Suggested next module

**Module 26 — Freelancer messaging / notifications**: wire the freelancer inbox (sidebar "Messages"
placeholder) and the full notifications center, plus administer view of disbursements so
COMPLETED-contract earnings and requested payouts close the loop end-to-end.
