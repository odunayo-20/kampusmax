# Module 22 — Freelancer Onboarding UI (Report)

**Status:** Complete · **Build:** ✔ `npm run build` green (webpack; TypeScript pass; 2 new routes) ·
**Type-check:** ✔ `node --max-old-space-size=2048 node_modules/typescript/bin/tsc --noEmit` clean ·
**Runtime:** ✔ routes serve 200 on `next dev :3000` (webpack mode) · **Smoke:** ✔ entry page + all 10
step routes 200

## 1. Scope (no written M22 spec — mirrors M18–M21 conventions + SP onboarding template)

A **10-step Freelancer Onboarding** flow at `/onboarding/freelancer/[step]`, mirroring the existing
Service Provider onboarding architecture (URL-driven steps, `useState` + sync service layer, no
TanStack Query, no NestJS). The freelancer was previously only an **inactive placeholder** in
`ProfileSwitcher`; this module builds the full data model, service, store, shell, form steps and
routes so a user can build and submit a freelancer profile.

The service layer is **backend-authoritative** — status, submission and completion % are owned by
the store/service; the UI only collects editable user input and renders returned values. The
frontend never sets `status`, `submittedAt`, administration messages or approval flags client-side.

Steps (all client-rendered, `localStorage` draft + in-memory store persistence, resumable):

1. **Profile** — headline, bio, city, photo upload, remote-available toggle
2. **Skills & Categories** — multi-select categories + their skills
3. **Experience** — repeatable work-history entries (title, company, dates, employment type, current)
4. **Education** — repeatable entries (institution, qualification, field, years)
5. **Certifications** — repeatable (name, issuer, issue/expiry, credential URL)
6. **Portfolio** — repeatable projects (title, description, URL, skills, visibility)
7. **Rates** — hourly / project rate, negotiable toggle
8. **Availability** — status, working days, hours, timezone
9. **Work Preferences** — work arrangements + project types
10. **Review & Submit** — completion checklist, profile summary, submit

Blocking states (PENDING_REVIEW / APPROVED / REJECTED / SUSPENDED) are handled by the layout and
entry page the same way as SP — the reviewer sees a focused "action" state, not the step forms.

## 2. Routes (all new)

```
/onboarding/freelancer                          (intro / resume page)
/onboarding/freelancer/[step]                   (step 1–10 router)
```

The intro page: creates the application on first visit, shows a progress bar + "Continue" when a
draft is in progress, or a blocking-state CTA (to dashboard) when submitted/approved/etc.

## 3. Files created / extended

**Types — `src/types/freelancer.ts`**
`FREELANCER_ONBOARDING_STATUS` + `FreelancerOnboardingStatus`, `FREELANCER_ONBOARDING_STEP` (1–10),
`FreelancerOnboardingStepId`, `FREELANCER_ONBOARDING_STEPS`, `FL_ONBOARDING_STEP_LABELS` /
`_DESCRIPTIONS`, `BLOCKING_FREELANCER_STATUSES` + `isFlBlockingStatus`,
`FREELANCER_AVAILABILITY_STATUS`, `FreelancerExperience/Education/Certification/PortfolioItem`,
`FreelancerOnboardingDraft` (full form model), `FREELANCER_SUBMIT_RESULT`.

**Config — `src/config/freelancer.ts`**
`FREELANCER_CATEGORIES` (12 categories × skills), `FREELANCER_WORK_ARRANGEMENTS`,
`FREELANCER_PROJECT_TYPES`, `FREELANCER_WORKING_DAYS`, `FREELANCER_AVAILABILITY_OPTIONS`,
`FREELANCER_EMPLOYMENT_TYPES`, `FREELANCER_QUALIFICATIONS`. Presentation constants only.

**Data store — `src/data/freelancer.ts`**
In-memory `Map` keyed by userId; `createFreelancerApplication` (returns `{created}` for the ini­tial
page), `get/save` draft (deep-cloned), `getFreelancerOnboardingStatus`, `submitFreelancerApplication`
(sets PENDING_REVIEW + submittedAt), `freshId`, `cloneDraft`.

**Service facade — `src/services/freelancer.ts`**
Owner-scoped via `getCurrentUser().id` (from `@/services/users`); `createFlApplication`,
`getFlOnboardingDraft`, `saveFlDraft`, `getFlOnboardingStatus`, `submitFlApplication`, and
`computeFlCompletion` (10-flag approximation for the intro progress bar).

**Cross-module (extended)**
`ProfileSwitcher.tsx` — freelancer row now links to `/onboarding/freelancer` instead of being an
inert placeholder.

**UI — `src/components/freelancer/` (12)**
`OnboardingLayout` (shell: top bar, step indicator, sidebar progress, footer Back / Save Draft /
Continue / Submit) · `OnboardingProgress` (+ `OnboardingStepIndicator`) · `StepProfile` ·
`StepSkills` · `StepExperience` · `StepEducation` · `StepCertifications` · `StepPortfolio` ·
`StepRates` · `StepAvailability` · `StepPreferences` · `StepReview`.

**Pages — 2** (intro `page.tsx` + `[step]/page.tsx` router with `STEP_COMPONENTS` map and
`STEP_VALIDATION` per-step required-field guards).

## 4. Verification stops before / during

- `node --max-old-space-size=2048 node_modules/typescript/bin/tsc --noEmit` — **clean (exit 0)**.
- A first runtime pass on `next dev` surfaced a **stale-cache false error**: two files (service +
  StepProfile) initially imported `getCurrentUser` from `@/services/auth`, which does not export a
  `getCurrentUser` (the live one is `@/services/users`). Fixed the imports, grepped to confirm zero
  remaining `services/auth` references in the module, and re-ran tsc — clean.
- `npm run build` — **green**; manifest shows `/onboarding/freelancer` (static) and
  `/onboarding/freelancer/[step]` (dynamic); only benign `--localstorage-file` Node warnings.
- Smoke — `/onboarding/freelancer`, `/onboarding/freelancer/1`, plus steps 2–10 all return **200** on
  `next dev :3000`.

## 5. Security & privacy

- All persistence is keyed by the authenticated user's id (`getCurrentUser().id`); the client can
  never address another freelancer's record.
- Status / approval / submission timestamps are store/service-owned; the client only edits the
  profile form fields.
- No secrets, tokens or admin surfaces introduced; image uploads are stored as local data-URL
  previews (consistent with the existing SP onboarding) and are not a production upload path.

## 6. Accessibility

- Progress is conveyed both by a labeled step indicator and by "Step X of 10" text; checkmarks for
  completed steps are labelled.
- Form controls carry `aria-label`/`label` association; icon-only remove buttons have
  `aria-label`s; blocking states render as focused dialogs/copy.
- Keyboard-friendly: all interactive step elements are real buttons/inputs, not click-only divs.

## 7. Expected backend endpoints (service layer already mirrors these)

`POST /me/freelancer/applications` (create) · `GET /me/freelancer/application` ·
`PUT /me/freelancer/application` (save draft) · `POST /me/freelancer/application/submit`.

## 8. Deferred (explicitly out of scope)

Real file-storage upload (photo/portfolio stay data-URL previews), admin review queue and
approval/rejection workflow (a later module), the approved public freelancer profile page, messaging
of clients, and any TanStack Query / server-fetch migration (by existing codebase convention).

## 9. Documented deviations

- **No written M22 spec was provided**; scope follows the M18–M21 conventions and the SP onboarding
  template (URL-driven steps, sync service layer, no TanStack Query).
- **Select/Button primitives**: this codebase's `@/components/ui` exposes the simple HTML `Select`,
  `Button` (variants `primary/secondary/outline/ghost/destructive`) and `Input` only — no Radix
  `SelectTrigger/SelectContent`, `Switch` or `AlertDialog`. Step forms use the native `<select>` /
  `<input type=checkbox>` styled to match, and the shell uses the existing `Button` variants.

## 10. Suggested next module

**Module 23 — Freelancer dashboard + public profile**: an owner-scoped `/freelancer/dashboard`
(welcome, status, completion, resume/continue) and an approved public profile page, so a submitted
freelancer profile is actually visible to clients — completing the freelancer vertical introduced
here. Followed by the admin review queue to drive APPROVED/REJECTED transitions.
