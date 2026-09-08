// ============================================================
// PLATFORM REVIEWS (Module 33) — Freelancer ↔ Employer trust loop
// ============================================================
//
// Two-sided reputation system for public freelancer and employer
// profiles. Maps 1:1 to future backend endpoints:
//   GET    /profiles/:kind/:userId/reviews/summary
//   GET    /profiles/:kind/:userId/reviews?page&pageSize&sort&rating
//   GET    /profiles/:kind/:userId/reviews/eligibility
//   POST   /profiles/:kind/:userId/reviews
//   PATCH  /profiles/:kind/:userId/reviews/:id
//   DELETE /profiles/:kind/:userId/reviews/:id
//   POST   /profiles/:reviews/:id/report
//
// BACKEND-AUTHORITATIVE: eligibility (a completed contract between the
// reviewer and the reviewee) is computed from completed-work records, never
// from login state, profile views, messages or proposals. Review status
// (published/pending/hidden/removed) and all moderation states are
// server-owned. The UI never decides who may review, whether a review is
// authentic, or whether it is published.

export const PROFILE_REVIEW_TARGET_KINDS = ["freelancer", "employer"] as const;
export type ProfileReviewTargetKind = (typeof PROFILE_REVIEW_TARGET_KINDS)[number];

export const PROFILE_REVIEW_STATUS = {
  PUBLISHED: "published",
  PENDING: "pending",
  HIDDEN: "hidden",
  REMOVED: "removed",
} as const;
export type ProfileReviewStatus = (typeof PROFILE_REVIEW_STATUS)[keyof typeof PROFILE_REVIEW_STATUS];

export const PROFILE_REVIEW_SORTS = ["recent", "highest", "lowest"] as const;
export type ProfileReviewSort = (typeof PROFILE_REVIEW_SORTS)[number];

export const PROFILE_REVIEW_RATINGS = [1, 2, 3, 4, 5] as const;
export type ProfileReviewRating = (typeof PROFILE_REVIEW_RATINGS)[number];

/**
 * Public identity of the review author as recorded by the backend-surrogate
 * store. For guest/entity reviewers (a completed contract's client that has
 * no sign-in user) the store records the identity captured on the completed
 * contract — never a fabricated person.
 */
export interface ProfileReviewAuthor {
  userId?: string;
  name: string;
  avatar?: string;
  /** Engagement-verified: this author completed a contract with the reviewee. */
  verified: boolean;
}

/**
 * Public-facing review of a freelancer or employer profile. Only
 * `PUBLISHED` reviews are ever returned by the read API.
 */
export interface ProfileReview {
  id: string;
  /** Author identity, resolved server-side from the granting engagement. */
  author: ProfileReviewAuthor;
  /** Reviewee is always identified by owner user id (freelancer or employer profile). */
  revieweeId: string;
  revieweeKind: ProfileReviewTargetKind;
  rating: ProfileReviewRating;
  comment: string;
  /** Backend-owned moderation state; clients never infer it. */
  status: ProfileReviewStatus;
  createdAt: string;
  updatedAt: string;
  /** True once the author has edited the review (backend-recorded). */
  edited: boolean;
  reportCount: number;
}

export interface ProfileReviewSummary {
  averageRating: number;
  count: number;
  /** Star distribution, 5 → 1. */
  distribution: Record<`${ProfileReviewRating}`, number>;
}

export interface ProfileReviewFilter {
  page: number;
  pageSize: number;
  sort: ProfileReviewSort;
  /** Optional star filter (published reviews only). */
  rating?: ProfileReviewRating;
}

export interface ProfileReviewListResult {
  items: ProfileReview[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ProfileReviewInput {
  rating: ProfileReviewRating;
  comment: string;
}

export type ProfileReviewEligibilityReason =
  | "unauth"
  | "self"
  | "no_completed_engagement"
  | "already_reviewed"
  | "target_not_found";

export interface ProfileReviewEligibility {
  eligible: boolean;
  reasonCode?: ProfileReviewEligibilityReason;
  /**
   * Positive signal: gives the completed-work record (contract) that grants
   * this reviewer the right. Only present when eligible (or when the caller
   * already reviewed, in which case it carries the existing review id).
   */
  existingReviewId?: string;
}

export type ProfileReviewResultCode =
  | "OK"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "NOT_ELIGIBLE"
  | "ALREADY_REVIEWED"
  | "RATE_LIMITED"
  | "INVALID_INPUT"
  | "SELF_REVIEW";

export interface ProfileReviewActionResult {
  ok: boolean;
  code: ProfileReviewResultCode;
  message: string;
  review?: ProfileReview;
  /** Refreshed summary for the reviewee so mutations can update UI in one reply. */
  summary?: ProfileReviewSummary;
}

export interface ProfileReviewReportInput {
  reason: ReviewReportReason;
  details?: string;
}