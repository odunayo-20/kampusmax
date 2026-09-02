// ============================================================
// FREELANCER ONBOARDING DATA STORE  (Module 22)
// ============================================================
// In-memory mock store for the freelancer onboarding flow. Seeded with a
// starter application so the onboarding entry page shows the correct state.
// Backend-authoritative — this store simulates what NestJS would persist.

import type {
  FreelancerOnboardingDraft,
  FreelancerOnboardingStepId,
  FreelancerOnboardingStatus,
} from "@/types/freelancer";
import { FREELANCER_ONBOARDING_STATUS } from "@/types/freelancer";

// ── Store ───────────────────────────────────────────────────

interface FreelancerStoreRecord {
  draft: FreelancerOnboardingDraft;
}

const store = new Map<string, FreelancerStoreRecord>();

// ── Helpers ─────────────────────────────────────────────────

function nowIso(): string {
  return new Date().toISOString();
}

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86_400_000).toISOString();
}

function freshId(): string {
  return `fl_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function cloneDraft(d: FreelancerOnboardingDraft): FreelancerOnboardingDraft {
  return JSON.parse(JSON.stringify(d));
}

// ── Initial seed (inactive by default — no active freelancer yet) ──
// The entry page checks status; a fresh user sees "Become a Freelancer".

function defaultDraft(userId: string): FreelancerOnboardingDraft {
  return {
    userId,
    status: FREELANCER_ONBOARDING_STATUS.DRAFT,
    currentStep: 1 as FreelancerOnboardingStepId,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    profile: { remoteAvailable: true },
    categories: [],
    skills: [],
    experience: [],
    education: [],
    certifications: [],
    portfolio: [],
    rates: { negotiable: true },
    availability: {
      status: "available_now",
      workingDays: ["mon", "tue", "wed", "thu", "fri"],
      workingHoursStart: "09:00",
      workingHoursEnd: "17:00",
      timezone: "Africa/Lagos",
    },
    preferences: { workArrangements: [], projectTypes: [] },
  };
}

// ── Store API ───────────────────────────────────────────────

export function createFreelancerApplication(userId: string): { created: boolean; draft: FreelancerOnboardingDraft } {
  const existing = store.get(userId);
  if (existing) return { created: false, draft: cloneDraft(existing.draft) };

  const draft = defaultDraft(userId);
  store.set(userId, { draft });
  return { created: true, draft: cloneDraft(draft) };
}

export function getFreelancerOnboardingDraft(userId: string): FreelancerOnboardingDraft | null {
  const rec = store.get(userId);
  return rec ? cloneDraft(rec.draft) : null;
}

export function saveFreelancerDraft(draft: FreelancerOnboardingDraft): void {
  const existing = store.get(draft.userId);
  if (existing) {
    existing.draft = { ...cloneDraft(draft), updatedAt: nowIso() };
  } else {
    store.set(draft.userId, { draft: { ...cloneDraft(draft), updatedAt: nowIso() } });
  }
}

export function getFreelancerOnboardingStatus(userId: string): FreelancerOnboardingStatus {
  const rec = store.get(userId);
  return rec ? rec.draft.status : FREELANCER_ONBOARDING_STATUS.DRAFT;
}

export function submitFreelancerApplication(
  userId: string
): { success: boolean; message: string } {
  const rec = store.get(userId);
  if (!rec) return { success: false, message: "No application found." };
  if (rec.draft.status === FREELANCER_ONBOARDING_STATUS.PENDING_REVIEW) {
    return { success: false, message: "Your profile is already under review." };
  }
  if (rec.draft.status === FREELANCER_ONBOARDING_STATUS.APPROVED) {
    return { success: false, message: "Your profile is already approved." };
  }

  rec.draft.status = FREELANCER_ONBOARDING_STATUS.PENDING_REVIEW;
  rec.draft.submittedAt = nowIso();
  rec.draft.updatedAt = nowIso();
  return { success: true, message: "Profile submitted for review." };
}

export { cloneDraft, freshId, FREELANCER_ONBOARDING_STATUS };
