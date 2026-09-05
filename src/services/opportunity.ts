// ============================================================
// FIND WORK & PROPOSALS SERVICE  (Module 23C)
// ============================================================
//
// Owner-scoped facade over the opportunity/proposal store. Mirrors the
// future NestJS API. SECURITY:
//   - Proposal ownership is ALWAYS derived from getCurrentUser().id
//     (IDOR/BOLA-safe) — the client never supplies freelancerId/ownerId.
//   - Proposal/job status is backend-owned: only store transitions write it.
//   - Eligibility is computed by the store's backend logic, never trusted
//     from the browser; frontend code only displays the result.
//   - Validation mirrors backend DTOs (cover letter length, amounts,
//     delivery, attachments, safe URLs).
//   - No fake data: unauthenticated or missing profiles return real
//     error/eligibility results, never invented records.

import { getCurrentUser } from "@/services/users";
import {
  ensureProposalRecord,
  getAllOpportunities,
  getOpportunityRecord,
  getProposalById,
  getProposalForOpportunity,
  getProposalsByFreelancer,
  getSavedOpportunityIds,
  incrementOpportunityViews,
  queryOpportunityRecords,
  saveOpportunityRecord,
  submitProposalRecord,
  unsaveOpportunityRecord,
  updateProposalDraftRecord,
  withdrawProposalRecord,
} from "@/data/opportunity";
import { getFreelancerOnboardingDraft } from "@/data/freelancer";
import { pushUserNotification } from "@/services/notifications";
import { getCampusById } from "@/services/campus";
import type {
  JobEligibility,
  Opportunity,
  OpportunityPage,
  OpportunityQuery,
  OpportunityResult,
  OpportunityResultCode,
  OpportunityStatus,
  Proposal,
  ProposalInput,
  ProposalStatus,
} from "@/types/opportunity";
import {
  ELIGIBILITY_CODE,
  OPPORTUNITY_RESULT,
  OPPORTUNITY_STATUS,
  PROPOSAL_STATUS,
} from "@/types/opportunity";
import {
  OPPORTUNITY_SAFE_SCHEMES,
  PROPOSAL_COVER_LETTER_MAX,
  JOB_CATEGORIES,
} from "@/config/opportunity";

// ── Owner context ───────────────────────────────────────────

function currentUserId(): string | null {
  const user = getCurrentUser();
  return user?.id ?? null;
}

function ok(message: string, extra?: Partial<OpportunityResult>): OpportunityResult {
  return { ok: true, code: OPPORTUNITY_RESULT.OK, message, ...extra };
}

function fail(code: OpportunityResultCode, message: string): OpportunityResult {
  return { ok: false, code, message };
}

function isSafeExternalUrl(value: string | undefined | null): boolean {
  if (!value) return true;
  try {
    const url = new URL(value, "https://kampmax.ng");
    return OPPORTUNITY_SAFE_SCHEMES.includes(
      url.protocol as (typeof OPPORTUNITY_SAFE_SCHEMES)[number]
    );
  } catch {
    return false;
  }
}

// ── Public discovery ────────────────────────────────────────
// Freelancers may only see OPEN opportunities (backend-owned visibility).

const DISCOVERABLE_STATUSES: OpportunityStatus[] = [OPPORTUNITY_STATUS.OPEN];

export function getOpportunitiesPage(query: OpportunityQuery = {}): OpportunityPage {
  const size = Math.min(Math.max(query.size ?? 9, 1), 30);
  const page = Math.max(query.page ?? 1, 1);
  const { items, total } = queryOpportunityRecords(query, DISCOVERABLE_STATUSES);
  const totalPages = Math.max(1, Math.ceil(total / size));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * size;
  return {
    items: items.slice(start, start + size),
    total,
    page: safePage,
    size,
    totalPages,
  };
}

/** Public job detail (only discoverable statuses). Returns null if not visible. */
export function getDiscoverableOpportunity(id: string): Opportunity | null {
  const opp = getOpportunityRecord(id);
  if (!opp || !DISCOVERABLE_STATUSES.includes(opp.status)) return null;
  return opp;
}

/** Full job record regardless of visibility status — for detail/eligibility. */
export function getOpportunity(id: string): Opportunity | null {
  return getOpportunityRecord(id);
}

export function recordOpportunityView(id: string): void {
  incrementOpportunityViews(id);
}

export function categoryLabelFor(categoryId: string): string {
  return JOB_CATEGORIES.find((c) => c.id === categoryId)?.name ?? "Other";
}

export function campusNameFor(campusId?: string): string | undefined {
  if (!campusId) return undefined;
  return getCampusById(campusId)?.name;
}

// ── Saved jobs (owner-scoped) ───────────────────────────────

export function isJobSavedForUser(jobId: string): boolean {
  const uid = currentUserId();
  if (!uid) return false;
  return getSavedOpportunityIds(uid).includes(jobId);
}

export function getSavedJobsForUser(): Opportunity[] {
  const uid = currentUserId();
  if (!uid) return [];
  const ids = getSavedOpportunityIds(uid);
  return ids
    .map((id) => getOpportunityRecord(id))
    .filter((o): o is Opportunity => !!o);
}

export function saveJobForUser(jobId: string): OpportunityResult {
  const uid = currentUserId();
  if (!uid) return fail(OPPORTUNITY_RESULT.UNAUTHORIZED, "Not authenticated.");
  const opp = getOpportunityRecord(jobId);
  if (!opp) return fail(OPPORTUNITY_RESULT.NOT_FOUND, "Opportunity not found.");
  saveOpportunityRecord(uid, jobId);
  return ok("Job saved.");
}

export function unsaveJobForUser(jobId: string): OpportunityResult {
  const uid = currentUserId();
  if (!uid) return fail(OPPORTUNITY_RESULT.UNAUTHORIZED, "Not authenticated.");
  unsaveOpportunityRecord(uid, jobId);
  return ok("Job removed from saved.");
}

// ── Eligibility (backend-computed; display only) ────────────

export function getJobEligibility(jobId: string): JobEligibility {
  const uid = currentUserId();
  const opp = getOpportunityRecord(jobId);

  if (!opp) {
    return {
      code: ELIGIBILITY_CODE.NOT_APPLICABLE,
      eligible: false,
      reasons: ["This opportunity could not be found."],
    };
  }

  if (opp.status !== OPPORTUNITY_STATUS.OPEN) {
    return {
      code: ELIGIBILITY_CODE.CLOSED,
      eligible: false,
      reasons: ["This opportunity is no longer accepting proposals."],
    };
  }

  if (!uid) {
    return {
      code: ELIGIBILITY_CODE.VERIFICATION_REQUIRED,
      eligible: false,
      reasons: ["You must be signed in as an approved freelancer to apply."],
    };
  }

  const draft = getFreelancerOnboardingDraft(uid);
  if (!draft || draft.status !== "APPROVED") {
    return {
      code: ELIGIBILITY_CODE.PROFILE_INCOMPLETE,
      eligible: false,
      reasons: ["Complete and submit your freelancer profile before applying."],
    };
  }

  const existing = getProposalForOpportunity(uid, jobId);
  if (existing && existing.status !== PROPOSAL_STATUS.WITHDRAWN) {
    return {
      code: ELIGIBILITY_CODE.ALREADY_APPLIED,
      eligible: false,
      reasons: ["You've already submitted a proposal for this opportunity."],
    };
  }

  const mySkills = (draft.skills ?? []).map((s) => s.toLowerCase());
  const missing = (opp.skills ?? []).filter(
    (s) => !mySkills.includes(s.toLowerCase())
  );
  if (missing.length > 0) {
    return {
      code: ELIGIBILITY_CODE.SKILL_MISMATCH,
      eligible: false,
      reasons: [
        "Your profile doesn't currently list every required skill for this opportunity.",
        `Missing from your profile: ${missing.join(", ")}.`,
      ],
    };
  }

  return {
    code: ELIGIBILITY_CODE.ELIGIBLE,
    eligible: true,
    reasons: ["You're eligible to apply for this opportunity."],
  };
}

// ── Proposal lifecycle (owner-scoped, backend-owned status) ─

export function createProposalDraft(input: ProposalInput): OpportunityResult {
  const uid = currentUserId();
  if (!uid) return fail(OPPORTUNITY_RESULT.UNAUTHORIZED, "Not authenticated.");
  const issues = validateProposalInput(input);
  if (issues) return issues;
  const { proposal } = ensureProposalRecord(uid, input);
  return ok("Draft saved.", { proposal });
}

export function saveProposalDraft(id: string, input: ProposalInput): OpportunityResult {
  const uid = currentUserId();
  if (!uid) return fail(OPPORTUNITY_RESULT.UNAUTHORIZED, "Not authenticated.");
  const existing = getProposalById(id);
  if (!existing || existing.freelancerId !== uid) {
    return fail(OPPORTUNITY_RESULT.NOT_FOUND, "Proposal not found.");
  }
  if (existing.status !== PROPOSAL_STATUS.DRAFT) {
    return fail(OPPORTUNITY_RESULT.CONFLICT, "Only draft proposals can be edited.");
  }
  const issues = validateProposalInput(input);
  if (issues) return issues;
  const updated = updateProposalDraftRecord(id, input);
  if (!updated) return fail(OPPORTUNITY_RESULT.CONFLICT, "This proposal can no longer be edited.");
  return ok("Draft saved.", { proposal: updated });
}

export function getProposal(id: string): Proposal | null {
  const uid = currentUserId();
  if (!uid) return null;
  const p = getProposalById(id);
  if (!p || p.freelancerId !== uid) return null;
  return p;
}

export function getMyProposals(): Proposal[] {
  const uid = currentUserId();
  if (!uid) return [];
  return getProposalsByFreelancer(uid);
}

export function submitProposal(id: string): OpportunityResult {
  const uid = currentUserId();
  if (!uid) return fail(OPPORTUNITY_RESULT.UNAUTHORIZED, "Not authenticated.");
  const existing = getProposalById(id);
  if (!existing || existing.freelancerId !== uid) {
    return fail(OPPORTUNITY_RESULT.NOT_FOUND, "Proposal not found.");
  }
  if (existing.status !== PROPOSAL_STATUS.DRAFT) {
    return fail(OPPORTUNITY_RESULT.CONFLICT, "This proposal can no longer be submitted.");
  }
  const opp = getOpportunityRecord(existing.opportunityId);
  if (!opp || opp.status !== OPPORTUNITY_STATUS.OPEN) {
    return fail(OPPORTUNITY_RESULT.CONFLICT, "This opportunity is no longer accepting proposals.");
  }
  const submitted = submitProposalRecord(id);
  if (!submitted) return fail(OPPORTUNITY_RESULT.CONFLICT, "This proposal can no longer be submitted.");
  pushUserNotification({
    userId: uid,
    type: "marketplace",
    category: "marketplace",
    title: "Proposal submitted",
    message: `Your proposal for "${opp.title}" has been sent to the client.`,
    actionUrl: "/freelancer/proposals",
  });
  return ok("Proposal submitted.", { proposal: submitted, status: PROPOSAL_STATUS.SUBMITTED });
}

export function withdrawProposal(id: string): OpportunityResult {
  const uid = currentUserId();
  if (!uid) return fail(OPPORTUNITY_RESULT.UNAUTHORIZED, "Not authenticated.");
  const existing = getProposalById(id);
  if (!existing || existing.freelancerId !== uid) {
    return fail(OPPORTUNITY_RESULT.NOT_FOUND, "Proposal not found.");
  }
  const withdrawn = withdrawProposalRecord(id);
  if (!withdrawn) {
    return fail(OPPORTUNITY_RESULT.CONFLICT, "This proposal can no longer be withdrawn.");
  }
  return ok("Proposal withdrawn.", { proposal: withdrawn, status: PROPOSAL_STATUS.WITHDRAWN });
}

// ── Validation (mirrors backend DTO validation) ─────────────

function validateProposalInput(input: ProposalInput): OpportunityResult | null {
  if (!input.opportunityId) {
    return fail(OPPORTUNITY_RESULT.VALIDATION, "A job is required.");
  }
  if (!input.coverLetter.trim()) {
    return fail(OPPORTUNITY_RESULT.VALIDATION, "A cover letter is required.");
  }
  if (input.coverLetter.trim().length > PROPOSAL_COVER_LETTER_MAX) {
    return fail(OPPORTUNITY_RESULT.VALIDATION, `Cover letter must be ${PROPOSAL_COVER_LETTER_MAX} characters or fewer.`);
  }
  if (input.proposedAmount !== undefined) {
    if (!Number.isFinite(input.proposedAmount) || input.proposedAmount < 0) {
      return fail(OPPORTUNITY_RESULT.VALIDATION, "Proposed amount must be a positive number.");
    }
  }
  if (
    !input.delivery ||
    !Number.isFinite(input.delivery.value) ||
    input.delivery.value <= 0 ||
    !["days", "weeks", "months"].includes(input.delivery.unit)
  ) {
    return fail(OPPORTUNITY_RESULT.VALIDATION, "A valid delivery estimate is required.");
  }
  if (input.attachments.some((a) => a.sizeBytes > 5 * 1024 * 1024)) {
    return fail(OPPORTUNITY_RESULT.VALIDATION, "Each attachment must be 5MB or smaller.");
  }
  return null;
}

// ── Aggregate (dashboard integration) ───────────────────────

export function getFindWorkSummary(): {
  openJobs: number;
  savedJobs: number;
  activeProposals: number;
} {
  const uid = currentUserId();
  const openJobs = getAllOpportunities().filter(
    (o) => o.status === OPPORTUNITY_STATUS.OPEN
  ).length;
  const savedJobs = uid ? getSavedOpportunityIds(uid).length : 0;
  const activeProposals = uid
    ? getProposalsByFreelancer(uid).filter((p) => {
        const active: ProposalStatus[] = [
          PROPOSAL_STATUS.SUBMITTED,
          PROPOSAL_STATUS.UNDER_REVIEW,
          PROPOSAL_STATUS.SHORTLISTED,
        ];
        return active.includes(p.status);
      }).length
    : 0;
  return { openJobs, savedJobs, activeProposals };
}

export { isSafeExternalUrl, currentUserId };
