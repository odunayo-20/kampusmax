"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, MessageSquarePlus } from "lucide-react";
import type { Review, Product } from "@/types";
import { getAwaitingReviews } from "@/services/account";
import { AccountEmptyState } from "./AccountEmptyState";

/* eslint-disable @next/next/no-img-element */

interface ReviewsListProps {
  reviews: Review[];
  awaiting: ReturnType<typeof getAwaitingReviews>;
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={
            i < rating
              ? "h-3.5 w-3.5 fill-amber-400 text-amber-400"
              : "h-3.5 w-3.5 text-neutral-300"
          }
        />
      ))}
    </div>
  );
}

/** Customer "My Reviews": reviews they submitted + products awaiting review. */
export function ReviewsList({ reviews, awaiting }: ReviewsListProps) {
  const hasReviews = reviews.length > 0 || awaiting.length > 0;

  if (!hasReviews) {
    return (
      <AccountEmptyState
        icon={<Star />}
        title="No reviews yet"
        description="Review a product you’ve ordered to help other students on campus."
      />
    );
  }

  return (
    <div className="space-y-5">
      {awaiting.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-kampmax-text mb-2">
            Awaiting your review
          </h2>
          <ul className="space-y-2.5">
            {awaiting.slice(0, 5).map((a) => {
              const image = (a.product as Partial<Product>).images?.[0];
              return (
                <li
                  key={a.product.id}
                  className="bg-white rounded-xl border border-kampmax-border p-3 flex items-center gap-3"
                >
                  <div className="w-12 h-12 rounded-lg bg-kampmax-muted overflow-hidden shrink-0">
                    {image ? (
                      <Image
                        src={image}
                        alt={a.product.title}
                        width={48}
                        height={48}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-xs text-kampmax-text-secondary/50">
                        img
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-kampmax-text line-clamp-1">
                      {a.product.title}
                    </p>
                    <p className="text-xs text-kampmax-text-secondary">
                      Delivered · Order {a.orderId}
                    </p>
                  </div>
                  <Link
                    href={`/orders/${a.orderId}`}
                    className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold text-kampmax-blue hover:underline"
                  >
                    <MessageSquarePlus className="h-3.5 w-3.5" />
                    Review
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {reviews.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-kampmax-text mb-2">
            Reviews you wrote ({reviews.length})
          </h2>
          <ul className="space-y-2.5">
            {reviews.map((r) => (
              <li
                key={r.id}
                className="bg-white rounded-xl border border-kampmax-border p-4"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <StarRow rating={r.rating} />
                  <span className="text-xs text-kampmax-text-secondary">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {r.title && (
                  <h3 className="text-sm font-semibold text-kampmax-text">
                    {r.title}
                  </h3>
                )}
                <p className="text-sm text-kampmax-text-secondary mt-1">
                  {r.comment}
                </p>
                {r.vendorResponse && (
                  <div className="mt-2 bg-kampmax-muted rounded-lg p-3 text-xs text-kampmax-text-secondary">
                    <span className="font-semibold text-kampmax-text">
                      Seller response:
                    </span>{" "}
                    {r.vendorResponse}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
