// ============================================================
// FREELANCER ONBOARDING SERVICE  (Module 22)
// ============================================================
//
// SECURITY: All operations are owner-scoped via the authenticated user.
// Status, completion %, approval and publication are backend-owned.
// The frontend only collects editable user information; it never sets
// status, completionPercentage, canSubmit, or approval flags.
//
// This service mirrors the service-provider onboarding service pattern
// (sync, in-memory store, localStorage-synced draft for resilience).

import { getCurrentUser } from "@/services/users";
import {
  createFreelancerApplication,
  getFreelancerOnboardingDraft,
  saveFreelancerDraft,
  getFreelancerOnboardingStatus,
  submitFreelancerApplication,
} from "@/data/freelancer";
import type {
  FreelancerOnboardingDraft,
  FreelancerOnboardingStepId,
  FreelancerOnboardingStatus,
} from "@/types/freelancer";
import { FREELANCER_ONBOARDING_STEPS } from "@/types/freelancer";

// ── Owner context ───────────────────────────────────────────

function currentUserId(): string | null {
  const user = getCurrentUser();
  return user?.id ?? null;
}

// ── Public API ──────────────────────────────────────────────

/**
 * Ensures an application record exists for the current user.
 * Returns `{ created: true }` on first call (fresh entry page).
 */
export function createFlApplication(): { created: boolean } {
  const uid = currentUserId();
  if (!uid) return { created: false };
  const { created } = createFreelancerApplication(uid);
  return { created };
}

/**
 * Returns the current draft for the authenticated user, or null.
 */
export function getFlOnboardingDraft(): FreelancerOnboardingDraft | null {
  const uid = currentUserId();
  if (!uid) return null;
  return getFreelancerOnboardingDraft(uid);
}

/**
 * Persists draft changes (called on every step update + save-draft).
 */
export function saveFlDraft(draft: FreelancerOnboardingDraft): void {
  saveFreelancerDraft(draft);
}

/**
 * Returns the current onboarding status for the authenticated user.
 */
export function getFlOnboardingStatus(): FreelancerOnboardingStatus {
  const uid = currentUserId();
  if (!uid) return "DRAFT" as FreelancerOnboardingStatus;
  return getFreelancerOnboardingStatus(uid);
}

/**
 * Submits the freelancer profile for review.
 */
export function submitFlApplication(): { success: boolean; message: string } {
  const uid = currentUserId();
  if (!uid) return { success: false, message: "Not authenticated." };
  return submitFreelancerApplication(uid);
}

/**
 * Computes a simple completion percentage from the draft.
 * Backend would compute this; here we approximate for the UI.
 */
export function computeFlCompletion(draft: FreelancerOnboardingDraft | null): number {
  if (!draft) return 0;
  let filled = 0;
  let total = 10; // 10 sections

  if (draft.profile.headline?.trim() && draft.profile.bio?.trim()) filled++;
  if (draft.categories.length > 0 && draft.skills.length > 0) filled++;
  if (draft.experience.length > 0) filled++;
  if (draft.education.length > 0) filled++;
  if (draft.certifications.length > 0) filled++;
  if (draft.portfolio.length > 0) filled++;
  if (draft.rates.hourlyRate || draft.rates.projectRate) filled++;
  if (draft.availability.status) filled++;
  if (draft.preferences.workArrangements.length > 0) filled++;
  // review is always "available" once you reach it
  filled++; 

  return Math.round((filled / total) * 100);
}
