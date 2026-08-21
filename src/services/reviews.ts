import { Review, ReviewSummary, ReviewReport, ReviewReportReason, ReviewSortOption } from "@/types";
import {
  reviews as mockReviews,
  reviewReports as mockReports,
  getReviewsByVendor as _getReviewsByVendor,
  getReviewsByProduct as _getReviewsByProduct,
  getReviewsByUser as _getReviewsByUser,
  getAverageRating as _getAverageRating,
  getReviewSummary as _getReviewSummary,
} from "@/data/reviews";

export function getReviewsByVendor(vendorId: string): Review[] {
  return _getReviewsByVendor(vendorId);
}

export function getReviewsByProduct(productId: string): Review[] {
  return _getReviewsByProduct(productId);
}

export function getReviewsByUser(userId: string): Review[] {
  return _getReviewsByUser(userId);
}

export function getAverageRating(vendorId: string): number {
  return _getAverageRating(vendorId);
}

export function getReviewSummary(targetId: string, target: "product" | "vendor"): ReviewSummary {
  return _getReviewSummary(targetId, target);
}

export function getAllReviews(targetId?: string, target?: "product" | "vendor"): Review[] {
  if (targetId && target) {
    return mockReviews.filter((r) => r.targetId === targetId && r.target === target);
  }
  return [...mockReviews];
}

export function sortReviews(reviews: Review[], sort: ReviewSortOption): Review[] {
  const sorted = [...reviews];
  switch (sort) {
    case "recent":
      return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    case "highest":
      return sorted.sort((a, b) => b.rating - a.rating);
    case "lowest":
      return sorted.sort((a, b) => a.rating - b.rating);
    case "helpful":
      return sorted.sort((a, b) => b.helpfulCount - a.helpfulCount);
    case "with_images":
      return sorted.filter((r) => r.images && r.images.length > 0);
    default:
      return sorted;
  }
}

export function addReview(
  review: Omit<Review, "id" | "createdAt" | "verifiedPurchase" | "helpfulCount" | "helpfulBy">
): Review {
  const newReview: Review = {
    ...review,
    id: `r${mockReviews.length + 1}`,
    verifiedPurchase: false,
    helpfulCount: 0,
    helpfulBy: [],
    createdAt: new Date().toISOString(),
  };
  mockReviews.push(newReview);
  return newReview;
}

export function toggleHelpful(reviewId: string, userId: string): Review | undefined {
  const review = mockReviews.find((r) => r.id === reviewId);
  if (!review) return undefined;

  if (!review.helpfulBy) review.helpfulBy = [];

  const idx = review.helpfulBy.indexOf(userId);
  if (idx > -1) {
    review.helpfulBy.splice(idx, 1);
    review.helpfulCount = Math.max(0, review.helpfulCount - 1);
  } else {
    review.helpfulBy.push(userId);
    review.helpfulCount += 1;
  }
  return review;
}

export function hasUserReviewedProduct(userId: string, productId: string): boolean {
  return mockReviews.some(
    (r) => r.userId === userId && r.productId === productId && r.target === "product"
  );
}

export function hasUserReviewedVendor(userId: string, vendorId: string): boolean {
  return mockReviews.some(
    (r) => r.userId === userId && r.vendorId === vendorId && r.target === "vendor"
  );
}

export function reportReview(
  reviewId: string,
  userId: string,
  reason: ReviewReportReason,
  details?: string
): ReviewReport {
  const report: ReviewReport = {
    id: `rr${mockReports.length + 1}`,
    reviewId,
    userId,
    reason,
    details,
    createdAt: new Date().toISOString(),
  };
  mockReports.push(report);

  const review = mockReviews.find((r) => r.id === reviewId);
  if (review) {
    if (!review.reportedBy) review.reportedBy = [];
    review.reportedBy.push(userId);
  }
  return report;
}

export function hasUserReportedReview(reviewId: string, userId: string): boolean {
  return mockReports.some((r) => r.reviewId === reviewId && r.userId === userId);
}
