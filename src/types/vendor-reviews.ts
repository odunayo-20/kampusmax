import type { Review, ReviewReport, ReviewReportReason } from "@/types";

// ============================================================
// VENDOR REVIEWS DOMAIN  (Module 13)
// ============================================================
//
// A vendor manages the reviews they RECEIVE from customers (store-level and
// product-level for their own products). Vendors may reply to, edit/remove
// their own reply, and report reviews — but they may never delete or hide a
// customer review, change its rating, or rewrite the customer's content.
// Every transition and summary value below is backend-authoritative.

// ── Scoping ─────────────────────────────────────────────────

export const VENDOR_REVIEW_SCOPE = {
  ALL: "all",
  STORE: "vendor",
  PRODUCT: "product",
} as const;

export type VendorReviewScope = ValuesOf<typeof VENDOR_REVIEW_SCOPE>;

// ── Filters / sort ──────────────────────────────────────────

export const VENDOR_REVIEW_RESPONSE = {
  ALL: "all",
  ANSWERED: "answered",
  UNANSWERED: "unanswered",
} as const;

export type VendorReviewResponseFilter = ValuesOf<typeof VENDOR_REVIEW_RESPONSE>;

export const VENDOR_REVIEW_RATING_BAND = {
  ALL: "all",
  POSITIVE: "positive",
  NEUTRAL: "neutral",
  NEGATIVE: "negative",
} as const;

export type VendorReviewRatingBand = ValuesOf<typeof VENDOR_REVIEW_RATING_BAND>;

export const VENDOR_REVIEW_SORT = {
  NEWEST: "newest",
  OLDEST: "oldest",
  RATING_DESC: "rating_desc",
  RATING_ASC: "rating_asc",
  HELPFUL: "helpful",
} as const;

export type VendorReviewSortField = ValuesOf<typeof VENDOR_REVIEW_SORT>;

export interface VendorReviewQuery {
  search?: string;
  scope?: VendorReviewScope;
  ratingBand?: VendorReviewRatingBand;
  star?: number;
  responseStatus?: VendorReviewResponseFilter;
  sort?: VendorReviewSortField;
  page?: number;
  pageSize?: number;
}

export interface VendorReviewsPage<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface VendorReviewCounts {
  all: number;
  answered: number;
  unanswered: number;
  withImages: number;
  reported: number;
}

// ── Summary (backend-provided values only) ──────────────────

export interface VendorReviewSummary {
  averageRating: number;
  totalReviews: number;
  breakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  recommendPercentage: number;
}

// ── Permission model (presentation; backend stays authoritative) ─

export const VENDOR_REVIEW_PERMISSION_KEYS = [
  "reviews.view",
  "reviews.respond",
  "reviews.report",
] as const;

export type VendorReviewPermissionKey = (typeof VENDOR_REVIEW_PERMISSION_KEYS)[number];
export type VendorReviewPermissions = Record<VendorReviewPermissionKey, boolean>;

export function getDefaultVendorReviewPermissions(): VendorReviewPermissions {
  return {
    "reviews.view": true,
    "reviews.respond": true,
    "reviews.report": true,
  };
}

// ── Mutation result codes (backend-authoritative) ────────────

export type VendorReviewResultCode =
  | "ok"
  | "not_found"
  | "forbidden"
  | "invalid_payload"
  | "already_responded"
  | "no_response"
  | "already_reported";

export interface VendorReviewResult {
  ok: boolean;
  code: VendorReviewResultCode;
  error?: string;
  review?: Review;
  report?: ReviewReport;
}

// ── Report input ─────────────────────────────────────────────

export interface VendorReviewReportInput {
  reason: ReviewReportReason;
  details?: string;
}

export type { ReviewReportReason };

type ValuesOf<T> = T[keyof T];