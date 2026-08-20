import { Review } from "@/types";
import {
  reviews as mockReviews,
  getReviewsByVendor as _getReviewsByVendor,
  getReviewsByProduct as _getReviewsByProduct,
  getReviewsByUser as _getReviewsByUser,
  getAverageRating as _getAverageRating,
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

export function addReview(
  review: Omit<Review, "id" | "createdAt">
): Review {
  const newReview: Review = {
    ...review,
    id: `r${mockReviews.length + 1}`,
    createdAt: new Date().toISOString(),
  };
  mockReviews.push(newReview);
  return newReview;
}
