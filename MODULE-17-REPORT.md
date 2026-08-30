# Module 17 — Customer-Facing Service Marketplace & Service Listings (Report)

**Status:** Complete · **Build:** ✔ production build green (79 routes) · **Smoke tests:** ✔

## 1. Scope (per spec §56)

Customer-facing discovery of services & service providers:

`Discover → Search/Filter → Service Details → Provider Details → Begin Booking/Request`

The **booking engine, payments, escrow, orders, payouts, negotiation, and analytics are intentionally out of scope** and deferred (see §9).

## 2. Routes

| Route | Render | Title | Notes |
|---|---|---|---|
| `/services` | Static (prerendered at build; search params applied client-side) | Find trusted services around you | Hero + search, category chips, facilities, how-it-works, filterable results grid |
| `/services/[serviceId]` | Dynamic + `notFound()` | `{Service} by {Provider} \| Kampmax` | Full product detail, pricing panel, booking/quote/report/favourite/share |
| `/services/providers/[providerId]` | Dynamic + `notFound()` | `{Provider} — verified service provider \| Kampmax` | Public provider profile (guest-accessible sibling of auth-gated `/service-provider/[slug]`, which is untouched) |
| `/services/categories/[categorySlug]` | Dynamic + `notFound()` | `{Category} services \| Kampmax` | Category landing reusing the browse machinery with a locked category |

Guest-accessible: the whole group lives **outside `(main)`** (which is auth-gated), matching the existing public `/store/[slug]` pattern.

## 3. Files created

**Types** — `src/types/service-marketplace.ts`
Public, backend-authoritative projections: `ServiceMarketplaceCategory`, `MarketplaceProvider` (NO `userId` — deliberate), `MarketplaceService`, `MarketplaceServiceReview`, `MarketplaceServiceQuery/Page`, `ServiceSortOption`, `ServicePriceBucket`, `ServiceReportReason/Input`, `RequestQuoteInput/Result`. Reuses `ServiceProviderPricingModel`, `ServiceProviderLocationType`, `ServiceProviderAvailabilityDay`. Deliberately separate from provider-dashboard types (Module 16).

**Data (mock catalog, shaped 1:1 to the future API)** — `src/data/service-marketplace.ts`
6 public providers (`sp1…sp6`, incl. one unverified and two with custom open-days), 17 services (`msvc1…msvc17`, incl. one `isActive:false` to prove visibility filtering), 14 visible reviews, report reasons, category slug helpers.

**Service layer (future API clients)** — `src/services/service-marketplace.ts`
`getProviderById`, `getActiveServices`, `getServiceById`, `getProviderDisplayName`, `getServiceCategories` (with counts), `getServiceCategoryName/BySlug/ById`, `getServicePriceDisplay` (never computes final prices), `SERVICE_LOCATION_LABELS`, `getServiceLocationLabel`, `getServiceDurationLabel`, `getServicePage` (search/filter/sort/page; quote services excluded from numeric price buckets), `getServiceDetail` (null for inactive → 404), `getRelatedServices`, `getMarketplaceProvider`, `getProviderActiveServices`, `getProviderReviews`, `getProviderReviewSummary`, `getRelatedProviders`, `getAvailabilitySummary`, `getOpenDaysLabel`, favorites abstraction (`getServiceFavoriteIds`, `isServiceFavorited`, `toggleServiceFavorite`), `reportService`, `submitRequestQuote`.

**Layout & chrome** — `src/app/services/{layout,not-found,error}.tsx`, `src/components/service-marketplace/{ServiceMarketplaceHeader,ServiceMarketplaceFooter}.tsx`
Guest-aware header (Log in w/ `returnTo=/services` vs My account) replaced by useAuth-driven buttons, brand deep-link, dedicated footer; group-scoped 404 + ErrorBoundary with retry.

**Browse** — `src/components/service-marketplace/`
`constants.ts` (UI filter model), `ServiceCard`, `ProviderCard`, `ServiceCategoryChips`, `ServiceFilterControls` + `ServiceFilterSidebar` + `ServiceFilterDrawer`, `ServiceSortDropdown`, `ServiceRatingStars`, `ServiceFavoriteButton`, `ServiceSkeletons`, `ServiceEmptyState`, `ServicePagination`, `ServicesBrowseView` (+ `ServicesCategoryView`).

**Detail / provider** — `ServiceDetailView`, `ProviderProfileView`, `RequestQuoteModal`, `BookingSheet` (placeholder for the deferred engine), `ServiceReportModal`, `ServiceShareButton`.

**Hook** — `src/hooks/useServiceMarketplace.ts`
Single source of truth: filter state mirrored to URL search params (`q, category, campus, rating, price, location, sort, page`), stateless refresh/back/forward (parse → shallow-compare → re-apply), debounced query (400ms), pagination (12/page with URL sync), campus default from `useApp().selectedCampus`, category-locked mode for landing pages.

**Auth integration** — `src/app/(auth)/login/page.tsx`
Added `/services` (+ `/services/`) to the `safeReturnTo` open-redirect whitelist so guest CTAs (Book / Quote / Save) land back in the service context after login.

## 4. Behavioural & security details

- **Public-first visibility:** only `isActive` services and their providers are served; `getServiceDetail` returns `null` for inactive → `notFound()`.
- **Backend-authoritative pricing:** displays `fixed` / `from ₦X` / range / `Quote required` from `pricingModel` — the frontend never derives a final price. Quote services are excluded from numeric price buckets.
- **Auth-gated *actions*, public *content*:** favouriting, booking trigger and quote requests require login (redirect with open-redirect-safe `returnTo`); browsing requires none.
- **Favourites:** a service-favourites abstraction keyed by `userId` — no second wishlist system; product `wishlist.ts` untouched.
- **Report:** moderation-only — reasons + details submitted; no delete/unpublish functionality exists client-side.
- **Share:** native share sheet → clipboard fallback, canonical public URL, internal IDs never surface.
- **Reviews:** only approved/visible reviews; average shown per provider (services carry no own rating); distribution bars + star breakdown on provider profile.
- **No secrets, no private provider data** in any projection (addresses, documents, statuses, `userId` all excluded).

## 5. SEO & accessibility

- Per-route `generateMetadata`: titles, descriptions, `alternates.canonical`, `openGraph` (incl. image URLs where present) via `getSiteBaseUrl()`.
- Server-side `notFound()` → group 404; route-level `error.tsx` with reset (filters preserved).
- Keyboard/screen-reader: real `<select>` for sort, `aria-pressed` favourites/filters, star display with numeric SR text, labelled dialogs with Esc-to-close and body-scroll lock on the mobile drawer.

## 6. Verification

- `npx tsc --noEmit` — clean.
- `npm run build` — green, 79 static + dynamic routes, TypeScript pass.
- Smoke tests (prod server on :3019): `/services` 200 & hero text, `/services/msvc1` 200 & title, `/services/providers/sp1` 200, `/services/categories/repairs-maintenance` 200, unknown service/provider → 404.

## 7. Documented deviations

- **No TanStack Query.** Spec §43/§52 assumed it exists; it is not in `package.json`. Implemented with the codebase's established mock-layer convention; the service layer is cut so each function maps 1:1 to a future endpoint (see §8).
- **No `eslint.config.*`** in the repo, so `npm run lint` cannot run; type-check + production build are the gates.

## 8. Expected backend endpoints (layer already mirrors these)

`GET /services` (search/q, category, campus, rating_min, price_bucket, location, sort, page/page_size) · `GET /services/:id` · `GET /services/categories` · `GET /services/categories/:slug` · `GET /services/providers/:id` (+ reviews, reviews summary, availability) · `POST /me/services/favorites` / `DELETE /me/services/favorites/:id` · `POST /me/quotes` · `POST /me/reports/services` · (book starts next)

## 9. Deferred (explicitly out of scope this module)

Booking engine & calendar availability selection, payments, escrow, orders/payouts, quote negotiation, provider onboarding improvements, `/services/campus/[campusSlug]` (campus filtering lives on `/services`), "verified purchase" review gating, in-app messaging.

## 10. Suggested next module

**Module 18 — Booking & service orders**: booking request flow with calendar/time-slot selection, provider approval/confirmation, order lifecycle statuses, and a customer "My bookings" area — reusing the `BookingSheet` trigger points and the availability model seeded here.