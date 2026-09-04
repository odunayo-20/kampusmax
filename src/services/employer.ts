// ============================================================
// EMPLOYER / CLIENT ONBOARDING SERVICE  (Module 26)
// ============================================================
//
// SECURITY: All operations are owner-scoped via the authenticated user
// (getCurrentUser().id) — never a client-supplied id (IDOR/BOLA). Status,
// completion %, approval, verification and public visibility are
// backend-owned. The frontend only collects editable user input; it never
// sets status, verification, approval or public flags.
//
// This service mirrors the freelancer/service-provider onboarding service
// pattern (sync, in-memory store, localStorage-synced draft for resilience).
//
// Expected future NestJS endpoints (documented in MODULE-26-REPORT.md):
//   POST   /employer/profile            → create application
//   GET    /employer/profile            → get draft (owner-scoped)
//   PATCH  /employer/profile            → save draft
//   GET    /employer/profile/status     → onboarding status
//   GET    /employer/profile/verification -> verification status
//   POST   /employer/profile/submit     → submit for review

import { getCurrentUser } from "@/services/users";
import { getCampuses, getCampusById } from "@/services/campus";
import { pushUserNotification } from "@/services/notifications";
import {
  createEmployerApplication,
  getEmployerOnboardingDraft,
  saveEmployerDraft,
  getEmployerOnboardingStatus,
  getEmployerVerificationStatus,
  submitEmployerApplication,
} from "@/data/employer";
import type {
  EmployerOnboardingDraft,
  EmployerOnboardingStatus,
  EmployerVerificationStatus,
} from "@/types/employer";
import {
  EMPLOYER_ONBOARDING_STEPS,
  isEmployerBlockingStatus,
} from "@/types/employer";

// ── Owner context ───────────────────────────────────────────

function currentUserId(): string | null {
  const user = getCurrentUser();
  return user?.id ?? null;
}

// ── Access gate (role activation) ───────────────────────────
// Mirrors getFreelancerDashboardAccess / getVendorAccess.

export const EMPLOYER_DASHBOARD_GATE = {
  APPROVED: "approved",
  PENDING_REVIEW: "pending_review",
  REJECTED: "rejected",
  SUSPENDED: "suspended",
  IN_PROGRESS: "in_progress",
  NO_EMPLOYER: "no_employer",
} as const;

export type EmployerDashboardGateKind =
  (typeof EMPLOYER_DASHBOARD_GATE)[keyof typeof EMPLOYER_DASHBOARD_GATE];

export interface EmployerAccess {
  kind: EmployerDashboardGateKind;
  status: EmployerOnboardingStatus | null;
  canUseDashboard: boolean;
  message: string | null;
  displayName?: string;
}

export function getEmployerDashboardAccess(): EmployerAccess {
  const user = getCurrentUser();
  const draft = getEmployerOnboardingDraft(user.id);
  const status = getEmployerOnboardingStatus(user.id);

  if (!draft) {
    return {
      kind: EMPLOYER_DASHBOARD_GATE.NO_EMPLOYER,
      status: null,
      canUseDashboard: false,
      message: "You don't have an employer profile yet.",
      displayName: user.name,
    };
  }

  const base = { displayName: user.name };

  switch (status) {
    case "APPROVED":
      return {
        kind: EMPLOYER_DASHBOARD_GATE.APPROVED,
        status,
        canUseDashboard: true,
        message: null,
        ...base,
      };
    case "PENDING_REVIEW":
      return {
        kind: EMPLOYER_DASHBOARD_GATE.PENDING_REVIEW,
        status,
        canUseDashboard: false,
        message: "Your employer profile is under review.",
        ...base,
      };
    case "REJECTED":
      return {
        kind: EMPLOYER_DASHBOARD_GATE.REJECTED,
        status,
        canUseDashboard: false,
        message: "Your employer profile requires changes before going live.",
        ...base,
      };
    case "SUSPENDED":
      return {
        kind: EMPLOYER_DASHBOARD_GATE.SUSPENDED,
        status,
        canUseDashboard: false,
        message: "Your employer profile is currently unavailable.",
        ...base,
      };
    default:
      return {
        kind: EMPLOYER_DASHBOARD_GATE.IN_PROGRESS,
        status,
        canUseDashboard: false,
        message: "Complete your employer profile to start hiring.",
        ...base,
      };
  }
}

// ── Public API ──────────────────────────────────────────────

/**
 * Ensures an application record exists for the current user.
 */
export function createEmployerApplicationForUser(): { created: boolean } {
  const uid = currentUserId();
  if (!uid) return { created: false };
  const { created } = createEmployerApplication(uid);
  return { created };
}

/**
 * Returns the current draft for the authenticated user, or null.
 */
export function getEmployerOnboardingDraftForUser(): EmployerOnboardingDraft | null {
  const uid = currentUserId();
  if (!uid) return null;
  return getEmployerOnboardingDraft(uid);
}

/**
 * Persists draft changes (called on every step update + save-draft).
 */
export function saveEmployerDraftForUser(draft: EmployerOnboardingDraft): void {
  saveEmployerDraft(draft);
}

/**
 * Returns the current onboarding status for the authenticated user.
 */
export function getEmployerOnboardingStatusForUser(): EmployerOnboardingStatus {
  const uid = currentUserId();
  if (!uid) return "DRAFT" as EmployerOnboardingStatus;
  return getEmployerOnboardingStatus(uid);
}

/**
 * Returns the verification status for the authenticated user.
 * Verification is backend-owned — the frontend only displays it.
 */
export function getEmployerVerificationStatusForUser(): EmployerVerificationStatus {
  const uid = currentUserId();
  if (!uid) return "not_started";
  return getEmployerVerificationStatus(uid);
}

/**
 * Submits the employer profile for review. Backend-authoritative: the
 * store (backend) sets the status to PENDING_REVIEW on success.
 */
export function submitEmployerProfileForUser(): { success: boolean; message: string } {
  const uid = currentUserId();
  if (!uid) return { success: false, message: "Not authenticated." };
  const res = submitEmployerApplication(uid);
  if (res.success) {
    pushUserNotification({
      userId: uid,
      type: "account",
      category: "account",
      title: "Employer profile submitted",
      message: "Your employer profile has been submitted for review. You'll be notified once it's approved.",
      actionUrl: "/onboarding/employer",
    });
  }
  return res;
}

/**
 * Computes a simple completion percentage from the draft.
 * Backend would compute this; here we approximate for the UI.
 * Completion is NOT the same as verification — the backend owns both.
 */
export function computeEmployerCompletion(
  draft: EmployerOnboardingDraft | null
): number {
  if (!draft) return 0;

  // Number of meaningful sections contributing to completeness.
  let filled = 0;
  const total = 5;

  // Step 1 — Identity
  const identityOk =
    !!draft.clientType &&
    !!draft.profile.displayName?.trim() &&
    !!draft.profile.headline?.trim();
  if (identityOk) filled++;

  // Step 2 — Organization (required for org-like types)
  const isOrgLike =
    draft.clientType === "business" ||
    draft.clientType === "organization" ||
    draft.clientType === "campus_group";
  const orgOk = isOrgLike
    ? !!draft.organization.name?.trim() &&
      !!draft.organization.businessType?.trim()
    : true;
  if (orgOk) filled++;

  // Step 3 — Contact & location
  const contactOk = !!draft.contact.email?.trim() && !!draft.contact.phone?.trim();
  if (contactOk) filled++;

  // Step 4 — Hiring preferences
  const prefOk = draft.preferences.categories.length > 0;
  if (prefOk) filled++;

  // Step 5 — Reachable once in review
  filled++;

  return Math.round((filled / total) * 100);
}

// ── URL validation (security: reject javascript:/data:/vbscript:) ──

const SAFE_URL_SCHEMES = ["http:", "https:", "mailto:", "tel:"];

export function isSafeUrlCandidate(input: string | undefined | null): boolean {
  if (!input || !input.trim()) return true; // empty is fine (optional)
  let value = input.trim();
  // Reject obvious script injection even without a scheme prefix.
  if (/^\s*(javascript|vbscript|data)\s*:/i.test(value)) return false;
  if (value.indexOf(":") > -1) {
    const scheme = value.slice(0, value.indexOf(":")).toLowerCase();
    if (!SAFE_URL_SCHEMES.includes(scheme)) return false;
  }
  return true;
}

/**
 * Public-facing employer profile preview — only surfaces fields the backend
 * considers public. Contact details, internal notes and verification artifacts
 * are never included here.
 */
export function getEmployerPublicPreview(
  draft: EmployerOnboardingDraft | null
): {
  name: string;
  descriptor: string;
  about: string;
  location: string;
  verified: boolean;
} | null {
  if (!draft) return null;

  const isOrgLike =
    draft.clientType === "business" ||
    draft.clientType === "organization" ||
    draft.clientType === "campus_group";

  const name =
    (isOrgLike && draft.organization.name?.trim()) ||
    draft.profile.displayName?.trim() ||
    getCurrentUser().name;

  const industry = draft.organization.industry?.trim() || draft.profile.industry?.trim();
  const campus = draft.location.campusId ? getCampusById(draft.location.campusId) : undefined;

  const descriptor = [industry, campus?.name].filter(Boolean).join(" • ");

  const about =
    draft.organization.description?.trim() ||
    draft.profile.about?.trim() ||
    "";

  const location =
    [draft.location.city?.trim(), draft.location.state?.trim()]
      .filter(Boolean)
      .join(", ") || campus?.name || "";

  const verified = draft.verification.status === "verified";

  return { name, descriptor, about, location, verified };
}

/**
 * Campus options for the location step — reused from the existing campus
 * selection system (no duplicate dataset).
 */
export function getEmployerCampusOptions() {
  return getCampuses();
}

export { EMPLOYER_ONBOARDING_STEPS, isEmployerBlockingStatus };
