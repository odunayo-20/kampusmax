import type { BadgeVariant } from "@/components/admin/StatusBadge";
import type { VendorReviewScope, VendorReviewResponseFilter, VendorReviewRatingBand, VendorReviewSortField } from "@/types/vendor-reviews";
import { VENDOR_REVIEW_SCOPE, VENDOR_REVIEW_SORT } from "@/types/vendor-reviews";

export const SCOPE_LABELS: Record<VendorReviewScope, string> = {
  all: "All reviews",
  vendor: "Store reviews",
  product: "Product reviews",
};

export function reviewScopeLabel(scope: VendorReviewScope): string {
  return SCOPE_LABELS[scope] ?? scope;
}

export const RESPONSE_LABELS: Record<VendorReviewResponseFilter, string> = {
  all: "All",
  answered: "Responded",
  unanswered: "Unanswered",
};

export const RATING_BAND_OPTIONS: { value: VendorReviewRatingBand; label: string }[] = [
  { value: "all", label: "All ratings" },
  { value: "positive", label: "Positive (4–5)" },
  { value: "neutral", label: "Neutral (3)" },
  { value: "negative", label: "Negative (1–2)" },
];

export const REVIEW_SORT_OPTIONS: { value: VendorReviewSortField; label: string }[] = [
  { value: VENDOR_REVIEW_SORT.NEWEST, label: "Newest" },
  { value: VENDOR_REVIEW_SORT.OLDEST, label: "Oldest" },
  { value: VENDOR_REVIEW_SORT.RATING_DESC, label: "Highest rating" },
  { value: VENDOR_REVIEW_SORT.RATING_ASC, label: "Lowest rating" },
  { value: VENDOR_REVIEW_SORT.HELPFUL, label: "Most helpful" },
];

export function responseStatusVariant(status: VendorReviewResponseFilter): BadgeVariant {
  return status === "answered" ? "success" : status === "unanswered" ? "warning" : "neutral";
}

export const SCOPE_OPTIONS: { value: VendorReviewScope; label: string }[] = [
  { value: VENDOR_REVIEW_SCOPE.ALL, label: "All reviews" },
  { value: VENDOR_REVIEW_SCOPE.STORE, label: "Store reviews" },
  { value: VENDOR_REVIEW_SCOPE.PRODUCT, label: "Product reviews" },
];