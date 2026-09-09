// ============================================================
// PROFILE REVIEWS DATA STORE  (Module 33)
// ============================================================
// In-memory mock store simulating the future NestJS reviews module.
// Backend-authoritative: every review row is derived from a COMPLETED
// contract record (see data/contracts.ts getAllCompletedContracts) — the UI
// and service layer never invent relationships, ratings or identities.
// Status transitions, dedupe and rate limiting are enforced in the store,
// matching the booking/contract store discipline.

import type {
  ProfileReview,
  ProfileReviewAuthor,
  ProfileReviewFilter,
  ProfileReviewInput,
  ProfileReviewListResult,
  ProfileReviewSummary,
  ProfileReviewTargetKind,
  ReviewReportReason,
} from "@/types/platform-reviews";
import { PROFILE_REVIEW_STATUS } from "@/types/platform-reviews";
import { getUserById } from "@/data/users";
import { getAllCompletedContracts } from "@/data/contracts";
import { PROFILE_REVIEW_RATE_LIMIT } from "@/config/platform-reviews";

// ── Store ───────────────────────────────────────────────────

const records = new Map<string, ProfileReview>();

interface ReviewReport {
  userId: string;
  reason: ReviewReportReason;
  details?: string;
  createdAt: string;
}
const reports = new Map<string, ReviewReport[]>();

/** Per-user mutation timestamps, pruned to the rate-limit window. */
const mutationLog = new Map<string, number[]>();

function freshId(): string {
  return `prv_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

// ── Seed reviews derived from completed contracts ───────────
// Only reviews whose reviewer and reviewee are both recorded on a COMPLETED
// contract are materialized. Content is curated per client/freelancer; the
// grant (eligibility) always comes from the contract, never from the copy.

interface SeedContent {
  rating: number;
  comment: string;
}

const CLIENT_SEED_CONTENT: Record<string, SeedContent> = {
  cl_003: {
    rating: 5,
    comment:
      "Excellent brand identity work. The logo concepts were strong and the final pack was delivered exactly on schedule with all source files included. Communication was clear throughout.",
  },
  cl_005: {
    rating: 5,
    comment:
      "The portfolio site exceeded our expectations — fast, mobile-first and clean. Handover included source files and deployment notes just as agreed.",
  },
  cl_006: {
    rating: 4,
    comment:
      "A solid content pack delivered on time. The designs were on-brand and the caption library saved our team days of work.",
  },
  cl_007: {
    rating: 5,
    comment:
      "Our landing page converted noticeably better after the rebuild. Responsive, quick and very well documented.",
  },
  cl_008: {
    rating: 4,
    comment:
      "Beautiful menu and flyer designs, print-ready and easy to reuse. A couple of revision rounds, but each one was handled politely and quickly.",
  },
  cl_009: {
    rating: 5,
    comment:
      "A professional dashboard UI delivered ahead of deadline. The handoff notes and component set made the implementation stage straightforward.",
  },
  u1: {
    rating: 5,
    comment:
      "Folashade delivered a polished brand refresh on time. Clear weekly updates, strong design sense, and everything handed over with source files.",
  },
};

const FREELANCER_SEED_CONTENT: Record<string, SeedContent> = {
  u4: {
    rating: 5,
    comment:
      "Working with Oluwaseun Labs was straightforward — clear brief, timely feedback and exactly the scope we agreed on from day one.",
  },
};

const DEFAULT_SEED_CONTENT: SeedContent = {
  rating: 4,
  comment:
    "Professional and dependable. Work was completed to the agreed scope and delivered on schedule.",
};

function resolveAuthorName(userId: string): string {
  return getUserById(userId)?.name ?? userId;
}

/** Completed contract completion timestamp shifted a few hours later (the
 * reviews were evidently written after the work wrapped). Clamped to now. */
function seedCreatedAt(contractUpdatedAt: string): string {
  const base = new Date(contractUpdatedAt).getTime() + 20 * 60 * 60 * 1000;
  return new Date(Math.min(base, Date.now())).toISOString();
}

function seedReviewsFromCompletedContracts(): void {
  for (const { contract, freelancerId } of getAllCompletedContracts()) {
    const clientId = contract.client.id;
    const isUserClient = Boolean(getUserById(clientId));
    const isUserFreelancer = Boolean(getUserById(freelancerId));

    // Client/employer → freelancer review.
    const clientReview: ProfileReview = {
      id: freshId(),
      author: {
        userId: isUserClient ? clientId : undefined,
        name: contract.client.displayName,
        avatar: isUserClient ? getUserById(clientId)?.avatar : contract.client.avatar,
        verified: true,
      },
      revieweeId: freelancerId,
      revieweeKind: "freelancer",
      rating: (CLIENT_SEED_CONTENT[clientId] ?? DEFAULT_SEED_CONTENT)
        .rating as ProfileReview["rating"],
      comment:
        CLIENT_SEED_CONTENT[clientId]?.comment ?? DEFAULT_SEED_CONTENT.comment,
      status: PROFILE_REVIEW_STATUS.PUBLISHED,
      createdAt: seedCreatedAt(contract.updatedAt),
      updatedAt: seedCreatedAt(contract.updatedAt),
      edited: false,
      reportCount: 0,
    };
    records.set(clientReview.id, clientReview);

    // Freelancer → client/employer review (only meaningful when the client is
    // a sign-in user with a public employer profile).
    if (isUserClient && isUserFreelancer && freelancerId !== clientId) {
      const freelancerReview: ProfileReview = {
        id: freshId(),
        author: {
          userId: freelancerId,
          name: resolveAuthorName(freelancerId),
          avatar: getUserById(freelancerId)?.avatar,
          verified: true,
        },
        revieweeId: clientId,
        revieweeKind: "employer",
        rating: (FREELANCER_SEED_CONTENT[freelancerId] ?? DEFAULT_SEED_CONTENT)
          .rating as ProfileReview["rating"],
        comment:
          FREELANCER_SEED_CONTENT[freelancerId]?.comment ??
          DEFAULT_SEED_CONTENT.comment,
        status: PROFILE_REVIEW_STATUS.PUBLISHED,
        createdAt: seedCreatedAt(contract.updatedAt),
        updatedAt: seedCreatedAt(contract.updatedAt),
        edited: false,
        reportCount: 0,
      };
      records.set(freelancerReview.id, freelancerReview);
    }
  }
}

seedReviewsFromCompletedContracts();

// ── Read API (published only) ───────────────────────────────

export function getProfileReviewByIdData(reviewId: string): ProfileReview | null {
  const rec = records.get(reviewId);
  return rec ? { ...rec } : null;
}

export function getProfileReviewsData(
  revieweeId: string,
  kind: ProfileReviewTargetKind,
  filter: ProfileReviewFilter
): ProfileReviewListResult {
  const all = Array.from(records.values()).filter(
    (r) =>
      r.revieweeId === revieweeId &&
      r.revieweeKind === kind &&
      r.status === PROFILE_REVIEW_STATUS.PUBLISHED &&
      (filter.rating == null || r.rating === filter.rating)
  );

  all.sort((a, b) => {
    if (filter.sort === "highest") {
      if (b.rating !== a.rating) return b.rating - a.rating;
      return b.createdAt.localeCompare(a.createdAt);
    }
    if (filter.sort === "lowest") {
      if (a.rating !== b.rating) return a.rating - b.rating;
      return b.createdAt.localeCompare(a.createdAt);
    }
    return b.createdAt.localeCompare(a.createdAt);
  });

  const pageSize = Math.max(1, Math.min(50, filter.pageSize));
  const page = Math.max(1, filter.page);
  const total = all.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;

  return {
    items: all.slice(start, start + pageSize).map((r) => ({ ...r })),
    total,
    page: Math.min(page, totalPages),
    pageSize,
    totalPages,
  };
}

export function getProfileReviewSummaryData(
  revieweeId: string,
  kind: ProfileReviewTargetKind
): ProfileReviewSummary {
  const published = Array.from(records.values()).filter(
    (r) =>
      r.revieweeId === revieweeId &&
      r.revieweeKind === kind &&
      r.status === PROFILE_REVIEW_STATUS.PUBLISHED
  );

  const distribution: ProfileReviewSummary["distribution"] = {
    "5": 0,
    "4": 0,
    "3": 0,
    "2": 0,
    "1": 0,
  };
  let totalScore = 0;
  for (const r of published) {
    distribution[String(r.rating) as keyof typeof distribution] += 1;
    totalScore += r.rating;
  }
  const count = published.length;
  return {
    averageRating: count ? Number((totalScore / count).toFixed(1)) : 0,
    count,
    distribution,
  };
}

/** One review per (reviewer, reviewee, kind) — backend dedupe. */
export function getProfileReviewByReviewerData(
  reviewerUserId: string,
  revieweeId: string,
  kind: ProfileReviewTargetKind
): ProfileReview | null {
  const rec = Array.from(records.values()).find(
    (r) =>
      r.author.userId === reviewerUserId &&
      r.revieweeId === revieweeId &&
      r.revieweeKind === kind
  );
  return rec ? { ...rec } : null;
}

// ── Admin read API (Module 41) ──────────────────────────────
// Read-only accessors for the /admin/reviews console. They mirror the stores
// exactly (clones, no derivation) so the console can surface moderatable
// state honestly instead of fabricating it. There is deliberately no admin
// mutation API here — the store exposes none.

/** Every profile review row across all reviewees/kinds (any status). */
export function getAllProfileReviewsData(): ProfileReview[] {
  return Array.from(records.values()).map((r) => ({ ...r }));
}

/** Read reports recorded against a profile review (empty when none). */
export function getProfileReviewReportsData(
  reviewId: string
): { userId: string; reason: ReviewReportReason; details?: string; createdAt: string }[] {
  return (reports.get(reviewId) ?? []).map((r) => ({ ...r }));
}

// ── Rate limiting ───────────────────────────────────────────

export function profileReviewMutationAllowed(userId: string): boolean {
  const now = Date.now();
  const windowStart = now - PROFILE_REVIEW_RATE_LIMIT.windowMs;
  const history = (mutationLog.get(userId) ?? []).filter((t) => t > windowStart);
  mutationLog.set(userId, history);
  return history.length < PROFILE_REVIEW_RATE_LIMIT.maxMutationsPerWindow;
}

function recordMutation(userId: string): void {
  const now = Date.now();
  const windowStart = now - PROFILE_REVIEW_RATE_LIMIT.windowMs;
  const history = (mutationLog.get(userId) ?? []).filter((t) => t > windowStart);
  history.push(now);
  mutationLog.set(userId, history);
}

// ── Write API ───────────────────────────────────────────────

export function createProfileReviewRecord(input: {
  author: ProfileReviewAuthor;
  revieweeId: string;
  revieweeKind: ProfileReviewTargetKind;
  review: ProfileReviewInput;
}): ProfileReview {
  const now = nowIso();
  const review: ProfileReview = {
    id: freshId(),
    author: { ...input.author },
    revieweeId: input.revieweeId,
    revieweeKind: input.revieweeKind,
    rating: input.review.rating,
    comment: input.review.comment.trim(),
    status: PROFILE_REVIEW_STATUS.PUBLISHED,
    createdAt: now,
    updatedAt: now,
    edited: false,
    reportCount: 0,
  };
  records.set(review.id, review);
  recordMutation(input.author.userId ?? "");
  return { ...review };
}

export function updateProfileReviewRecord(
  reviewId: string,
  review: ProfileReviewInput,
  actorUserId: string
): ProfileReview | null {
  const rec = records.get(reviewId);
  if (!rec || rec.author.userId !== actorUserId) return null;
  rec.rating = review.rating;
  rec.comment = review.comment.trim();
  rec.edited = true;
  rec.updatedAt = nowIso();
  recordMutation(actorUserId);
  return { ...rec };
}

export function deleteProfileReviewRecord(
  reviewId: string,
  actorUserId: string
): boolean {
  const rec = records.get(reviewId);
  if (!rec || rec.author.userId !== actorUserId) return false;
  records.delete(reviewId);
  reports.delete(reviewId);
  recordMutation(actorUserId);
  return true;
}

export function reportProfileReviewRecord(input: {
  reviewId: string;
  userId: string;
  reason: ReviewReportReason;
  details?: string;
}): { ok: boolean; code: "NOT_FOUND" | "ALREADY_REPORTED" | "OK" } {
  const rec = records.get(input.reviewId);
  if (!rec) return { ok: false, code: "NOT_FOUND" };
  const list = reports.get(input.reviewId) ?? [];
  if (list.some((r) => r.userId === input.userId)) {
    return { ok: false, code: "ALREADY_REPORTED" };
  }
  list.push({
    userId: input.userId,
    reason: input.reason,
    details: input.details?.trim() || undefined,
    createdAt: nowIso(),
  });
  reports.set(input.reviewId, list);
  rec.reportCount = list.length;
  return { ok: true, code: "OK" };
}