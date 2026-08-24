"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/** Compact 5-star rating display with numeric value. */
export function StarRating({
  rating,
  showValue = true,
  size = "sm",
}: {
  rating: number;
  showValue?: boolean;
  size?: "xs" | "sm" | "md";
}) {
  const px = { xs: "h-3 w-3", sm: "h-3.5 w-3.5", md: "h-4 w-4" }[size];
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap">
      <span className="inline-flex items-center" aria-hidden>
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            className={cn(
              px,
              n <= rating
                ? "fill-kampmax-gold text-kampmax-gold"
                : "text-kampmax-border"
            )}
          />
        ))}
      </span>
      {showValue && (
        <span className="text-xs font-semibold tabular-nums text-kampmax-text">
          {rating}.0
        </span>
      )}
      <span className="sr-only">{rating} out of 5 stars</span>
    </span>
  );
}
