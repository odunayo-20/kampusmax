// ============================================================
// PLATFORM REVIEWS CONFIG (Module 33)
// ============================================================
// Presentation constants and platform limits. Content/limit decisions made
// here are backend-authoritative later; the frontend only mirrors them.

import type { ReviewReportReason } from "@/types";

export const PROFILE_REVIEW_PAGE_SIZE = 5;

export const PROFILE_REVIEW_COMMENT_MIN = 10;
export const PROFILE_REVIEW_COMMENT_MAX = 500;

export const PROFILE_REVIEW_TITLE_MIN = 0;
export const PROFILE_REVIEW_TITLE_MAX = 80;

/**
 * Simple per-user mutation throttle honored by the store (mirrors a backend
 * rate limit). Historical mutation timestamps are kept only as long as
 * needed to evaluate the window.
 */
export const PROFILE_REVIEW_RATE_LIMIT = {
  maxMutationsPerWindow: 5,
  windowMs: 10 * 60 * 1000,
};

/**
 * Labels for the star picker, mirroring the storefront review vocabulary.
 */
export const PROFILE_REVIEW_RATING_LABELS: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Excellent",
};

/**
 * Sort options for the review list (backend-supported values only).
 */
export const PROFILE_REVIEW_SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "recent", label: "Most recent" },
  { value: "highest", label: "Highest rated" },
  { value: "lowest", label: "Lowest rated" },
];

/**
 * Report reasons for profile reviews. Reuses the platform-wide
 * `ReviewReportReason` union so the same report modal component works; the
 * copy is tuned to profiles ("work", "completed engagement") rather than
 * the storefront's "purchase"/"product" wording.
 */
export const PROFILE_REVIEW_REPORT_REASONS: { value: ReviewReportReason; label: string }[] = [
  { value: "spam", label: "Spam or fake review" },
  { value: "fake", label: "Not a genuine completed engagement" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "offensive", label: "Offensive language" },
  { value: "irrelevant", label: "Not about the work" },
  { value: "other", label: "Other" },
];

/** Notification copy used by the backend-surrogate service on review create. */
export const PROFILE_REVIEW_NOTIFICATION = {
  title: "You received a new review",
  type: "marketplace",
  category: "marketplace",
} as const;