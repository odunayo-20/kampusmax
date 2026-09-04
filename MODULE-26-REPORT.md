# Module 26 — Employer / Client Onboarding (Report)

**Status:** Complete · **Type-check:** ✔ `tsc --noEmit` clean (exit 0) ·
**Build:** ✔ `npm run build` green (webpack; employer routes in manifest) ·
**Runtime:** ✔ routes serve 200 on `next dev :3000` · **Smoke:** ✔ all new routes 200

## 1. Scope

An **Employer/Client onboarding** module for the Kampmax hiring vertical — the foundation of the
future Jobs/Freelance marketplace (Module 27). An authenticated user activates an **Employer**
capability on the **same** Kampmax account (multi-role: freelancer/vendor/service-provider profiles
remain intact), chooses a client type, fills a 5-step profile, and submits for backend review.

It follows the existing **freelancer / service-provider onboarding** pattern exactly: `types` →
`config` → `data` (in-memory store) → `services` (owner-scoped facade) → UI components → pages under
the `(onboarding)` route group, using the codebase's **sync store + thin service layer** convention
(`useState(() => getServiceData())`) with **no TanStack Query / React Query / Zod / React Hook Form**.

Employer **status, verification, completion % and approval are backend-authoritative** — the frontend
only collects editable user input. The frontend never sets `status`, `verification`, `approved` or
public-visibility flags; the store (simulating the backend) is the only writer. Ownership is always
derived from `getCurrentUser().id` (IDOR/BOLA-safe).

## 2. Routes (all new)

```
/onboarding/employer            intro + status screen (DRAFT/IN_PROGRESS → start/continue;
                                PENDING/APPROVED/REJECTED/SUSPENDED → status panel; multi-role note)
/onboarding/employer/[step]     5-step onboarding container (1-5, with save-draft side effect)
```

Routes live under the existing minimal `(onboarding)` layout (private — no public navbar/footer, not
indexable).

## 3. Files created

**Types — `src/types/employer.ts`**
`EMPLOYER_ONBOARDING_STATUS` (DRAFT/IN_PROGRESS/PENDING_REVIEW/APPROVED/REJECTED/SUSPENDED),
`EMPLOYER_ONBOARDING_STEP` (5), `EMPLOYER_ONBOARDING_STEPS = 5`, step labels/descriptions,
`BLOCKING_EMPLOYER_STATUSES` + `isEmployerBlockingStatus`, `EMPLOYER_CLIENT_TYPE`
(individual/business/organization/campus_group), `EMPLOYER_VERIFICATION_STATUS`
(not_started/pending/verified/rejected/action_required), `EMPLOYER_WORK_PREFERENCE`
(remote/on_site/hybrid), `EmployerOnboardingDraft` (profile / organization / contact / location /
preferences / verification), `EMPLOYER_SUBMIT_RESULT`.

**Config — `src/config/employer.ts`**
`EMPLOYER_CLIENT_TYPES` (+`isOrganizationLikeClientType`), `EMPLOYER_HIRING_CATEGORIES` (backend IDs
`ec1`–`ec12`), `EMPLOYER_EXPERIENCE_LEVELS`, `EMPLOYER_WORK_PREFERENCES`, `EMPLOYER_WORK_TYPES`,
`EMPLOYER_PROJECT_DURATIONS`, `EMPLOYER_BUSINESS_TYPES`, `EMPLOYER_ORG_SIZES`,
`EMPLOYER_CONTACT_METHODS`. Presentation metadata only.

**Data store — `src/data/employer.ts`**
In-memory `Map` keyed by userId, `defaultDraft`, `createEmployerApplication`, `get...draft/status`,
`saveEmployerDraft`, `getEmployerVerificationStatus`, `submitEmployerApplication` (store sets
`status → PENDING_REVIEW` on success), and an **APPROVED demo seed for the demo owner `u1`** so the
active-employer role & multi-role switching are demonstrable (matches freelancer/SP seed pattern).

**Service facade — `src/services/employer.ts`**
`getEmployerDashboardAccess` (gate: approved/pending/rejected/suspended/in_progress/no_employer),
`create/get/save` draft, `getEmployerOnboardingStatusForUser`,
`getEmployerVerificationStatusForUser`, `submitEmployerProfileForUser` (pushes an `account`-type
`pushUserNotification` on success), `computeEmployerCompletion`, `isSafeUrlCandidate` (rejects
`javascript:`/`data:`/`vbscript:` and non-allowlisted schemes), `getEmployerPublicPreview` (only
surface fields the backend deems public — contact stays private), `getEmployerCampusOptions`.

**UI — `src/components/employer/` (8)**
`EmployerOnboardingLayout` (progress sidebar + footer actions, mirrors Freelancer OnboardingLayout),
`EmployerOnboardingProgress` + `EmployerStepIndicator`, `StepIdentity` (client type + identity,
URL-safe website), `StepOrganization` (conditional on client type + logo upload with type/size checks),
`StepContact` (email from verified account + phone + campus/city/state + work preference + remote),
`StepPreferences` (categories multi-select + experience/work-type/duration + budget preference — no
money logic), `StepReview` (sectioned summary + edit-per-section + public preview), `EmployerSubmissionStatus`
(PENDING/APPROVED/REJECTED/SUSPENDED/DRAFT+completion bar), plus `index.ts`.

**Cross-module (modified)**
`src/components/vendor-dashboard/ProfileSwitcher.tsx` — wired the existing **Employer** stub row to
`getEmployerDashboardAccess()`: the row is now `active` when approved and routes to `/onboarding/employer`;
the generic inactive-profile `Link` now honours each profile's own `href` (so "Become an Employer" goes
to `/onboarding/employer` instead of the vendor-onboarding stub).

## 4. Verification

- `tsc --noEmit` — **clean (exit 0)** across all new files and the modified ProfileSwitcher.
- `npm run build` — **green**; manifest registers `/onboarding/employer` (static) and
  `/onboarding/employer/[step]` (dynamic).
- Runtime smoke on `next dev :3000` — `/onboarding/employer`, `/onboarding/employer/1`,
  `/onboarding/employer/3`, `/onboarding/employer/5` all **200**. Regression: `/home`, `/profile`,
  `/freelancer/dashboard` still **200** (ProfileSwitcher change is safe).
- The demo owner `u1` has an APPROVED seed → `/onboarding/employer` renders the "ready to hire"
  approved state, and the ProfileSwitcher shows Employer as **active**.

## 5. Security & privacy

- **Backend-authoritative state:** status, verification, completion % and approval are owned by the
  store (backend); the UI never sets or forces them. No `localStorage.role = "employer"`-style auth.
- **IDOR/BOLA:** all reads/writes derive ownership from `getCurrentUser().id`.
- **Mass-assignment / status manipulation:** the draft model has no `role`/`verified`/`approved`
  writable fields; submission uses a purpose-specific action that the backend (store) resolves.
- **URL validation:** `isSafeUrlCandidate` rejects `javascript:`/`data:`/`vbscript:` and disallows
  non-allowlisted schemes; website fields validate on input.
- **Logo upload:** type (`image/*`) + size (≤5MB) checked client-side; backend re-validation is
  documented as required. No secrets, storage keys or signed URLs exposed.
- **Contact privacy:** phone/email/preferred-contact are collected but **not** included in the public
  preview; the backend (store) is authoritative for public visibility.
- **No financial logic:** budget fields are **preferences only** (min/max, with a min≤max check) — no
  wallet, no money derivation, no Paystack.
- **No verification bypass:** verification status is read-only from the store; users cannot toggle it.
- Non-sensitive form data is stored in `localStorage` for resilience (matching freelancer/SP); no
  OTPs, NINs, or secrets. No sensitive data is logged.
- NO Docker introduced.

## 6. Accessibility

- Real `<label>`/`Input`/`Select` elements (placeholders are never the sole label).
- Radio/checkbox groups use `role="radiogroup"` / `fieldset`+`legend` with visible focus states.
- Progress sidebar uses `aria-label` + `aria-current="step"`; step indicator is `role="navigation"`.
- Validation errors are text near controls and, on the review/continue gate, surfaced with
  `role="alert"` styling (`bg-red-50 ... text-red-700`).

## 7. Expected backend endpoints (service layer already mirrors these)

```
POST   /employer/profile                    → create application
GET    /employer/profile                    → get draft (owner-scoped)
PATCH  /employer/profile                    → save draft
GET    /employer/profile/status             → onboarding status
GET    /employer/profile/verification       → verification status
POST   /employer/profile/submit             → submit for review (backend sets PENDING_REVIEW)
GET    /employer/options                    → client types / hiring categories / campuses
GET    /employer/profile/preview            → public client profile preview
```

## 8. Backend alignment / documented deviations

- **No NestJS backend exists in this repo** (frontend-only prototype). Employer was previously only a
  static stub in `types/account.ts`, `data/account.ts`, `ProfileSwitcher.tsx`, `MultiProfilesList.tsx`
  and footer links. There are no employer endpoints/DTOs to align against; this module follows the
  established sync-store mock-backend pattern and documents the expected API contract above.
- **Multi-role:** the `ActiveProfile` union already included `"employer"`; this module makes the role
  actually reachable/active via `getEmployerDashboardAccess` + ProfileSwitcher, without an employer
  **dashboard** (that is a later module).
- **Verified-email pre-fill** uses the authenticated user's verified email (spec §15).
- **Campus** reuses `getCampuses()`/`getCampusById()` — no duplicate dataset (spec §17); campus IDs are
  submitted, not arbitrary names.
- **Approved state** deliberately avoids dead links: Module 27 (Jobs Marketplace) does not exist, so
  no "Post a Job"/"Find Freelancers" buttons are added; the only approved-state CTA links to the
  existing `/profile` route (spec §33).
- **Notifications** reuse the existing `pushUserNotification` with the existing `account`
  type/category (no new enum, zero risk to other modules) for the "submitted" event.
- The "Back to Profiles" link in the onboarding layout points to `/account/profiles` (a pre-existing
  repo-wide stub with no page — consistent with the Freelancer/SP layouts, not introduced here).
- **ESLint is broken repo-wide** (no `eslint.config.*`), pre-existing; verification is `tsc` + build +
  runtime smoke.

## 9. Suggested next module

**Module 27 — Employer Jobs & Applications Marketplace**: the approved employer profile (this module)
then powers posting jobs, browsing applications, contract creation and project workspaces, closing the
hiring ecosystem loop.
