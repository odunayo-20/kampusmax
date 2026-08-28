"use client";

import { Star } from "lucide-react";
import type { Storefront } from "@/types/storefront";
import { getStoreReviews, getStoreReviewSummary } from "@/services/storefront";
import { ReviewList } from "@/components/reviews/ReviewList";
import { StoreEmptyState } from "./StoreEmptyState";

interface StoreReviewsProps {
  store: Storefront;
}

/** Customer store reviews: summary breakdown + list with filtering. */
export function StoreReviews({ store }: StoreReviewsProps) {
  if (store.reviewCount === 0) {
    return (
      <StoreEmptyState
        icon={<Star />}
        title="No reviews yet"
        description={`${store.storeName} hasn't received any reviews yet.`}
      />
    );
  }

  return (
    <div>
      <ReviewList
        reviews={getStoreReviews(store, "recent")}
        summary={getStoreReviewSummary(store)}
      />
    </div>
  );
}
