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

// ── Fresh draft (inactive by default — no active freelancer yet) ──
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

// ── Mock approved freelancer application (for demo of the active dashboard) ──
// Mirrors the Service Provider pattern: a fully-filled, backend-approved record
// backing the dashboard so an "active freelancer" can be demonstrated. A fresh
// user (any id other than the demo owner) still starts at DRAFT via
// createFreelancerApplication. Status here is authoritative — the dashboard
// only renders what the store reports and never forces activation client-side.

// Demo owner = current user (Adebayo, id "u1") so the dashboard has backing data.
const DEMO_FREELANCER_USER_ID = "u1";

function approvedSeedDraft(): FreelancerOnboardingDraft {
  return {
    userId: DEMO_FREELANCER_USER_ID,
    status: FREELANCER_ONBOARDING_STATUS.APPROVED,
    currentStep: 10 as FreelancerOnboardingStepId,
    createdAt: daysAgo(30),
    updatedAt: daysAgo(2),
    submittedAt: daysAgo(28),
    approvedSlug: "adebayo-dev",
    profile: {
      headline: "Full-Stack Developer",
      bio: "I build modern web and mobile apps for students and growing businesses. From landing pages to full-stack MVPs, I turn ideas into shipped products.",
      photoUrl: null,
      city: "Lagos",
      remoteAvailable: true,
    },
    categories: ["fc1", "fc2"],
    skills: ["JavaScript", "TypeScript", "React", "Next.js", "Node.js", "React Native", "Flutter"],
    experience: [
      {
        id: "fl_xp_demo1",
        jobTitle: "Full-Stack Developer",
        company: "CampusLabs",
        startDate: "2024-01",
        currentlyWorking: true,
        employmentType: "full_time",
        description: "Built and shipped 8 client projects including e-commerce stores, mobile apps and admin dashboards.",
      },
      {
        id: "fl_xp_demo2",
        jobTitle: "Freelance Developer",
        company: "Self-employed",
        startDate: "2022-05",
        endDate: "2023-12",
        currentlyWorking: false,
        employmentType: "freelance",
        description: "Delivered websites and maintenance contracts for local businesses.",
      },
    ],
    education: [
      {
        id: "fl_edu_demo1",
        institution: "Federal Polytechnic RUGIPO",
        qualification: "hnd",
        fieldOfStudy: "Computer Science",
        startYear: "2019",
        endYear: "2024",
      },
    ],
    certifications: [
      {
        id: "fl_cert_demo1",
        name: "AWS Cloud Practitioner",
        issuingOrganization: "Amazon Web Services",
        issueDate: "2024-03",
      },
      {
        id: "fl_cert_demo2",
        name: "Meta Front-End Developer",
        issuingOrganization: "Meta",
        issueDate: "2023-08",
      },
    ],
    portfolio: [
      {
        id: "fl_port_demo1",
        title: "Campus Commerce Platform",
        description: "An e-commerce platform connecting campus vendors to students with real-time orders and delivery tracking.",
        skills: ["React", "Next.js", "Node.js"],
        visible: true,
        completionDate: "2024-05",
      },
      {
        id: "fl_port_demo2",
        title: "Event Booking Mobile App",
        description: "Cross-platform mobile app for booking campus events and tracking attendance.",
        skills: ["React Native", "Flutter"],
        visible: true,
        completionDate: "2024-09",
      },
    ],
    rates: { hourlyRate: 15000, projectRate: 250000, negotiable: true },
    availability: {
      status: "available_now",
      workingDays: ["mon", "tue", "wed", "thu", "fri", "sat"],
      workingHoursStart: "08:00",
      workingHoursEnd: "18:00",
      timezone: "Africa/Lagos",
    },
    preferences: { workArrangements: ["remote", "hybrid"], projectTypes: ["short_term", "long_term"] },
  };
}

// ── Seed the approved demo record at module load ────────────
store.set(DEMO_FREELANCER_USER_ID, { draft: approvedSeedDraft() });

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
