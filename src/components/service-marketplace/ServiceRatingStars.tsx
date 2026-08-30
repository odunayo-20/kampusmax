"use client";

import { cn } from "@/lib/utils";
import { getStarArray, getRatingColor } from "@/lib/utils";

interface ServiceRatingStarsProps {
  rating?: number;
  count?: number;
  className?: string;
}

/**
 * Accessible star display. The visual uses partial fills; the screen-reader
 * text always includes the numeric rating so it is never conveyed by colour or
 * shape alone.
 */
export function ServiceRatingStars({ rating, count, className }: ServiceRatingStarsProps) {
  if (rating === undefined) return null;
  const stars = getStarArray(rating);

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <span className="flex items-center gap-0.5" role="img" aria-label={`Rated ${rating.toFixed(1)} out of 5`}>
        {stars.map((fill, i) => (
          <svg key={i} className="h-3.5 w-3.5" viewBox="0 0 20 20" aria-hidden>
            <defs>
              <linearGradient id={`star-${fill}-${i}`}>
                <stop offset={fill === "full" ? "100%" : fill === "half" ? "50%" : "0%"} stopColor="currentColor" />
                <stop offset={fill === "half" ? "50%" : "0%"} stopColor="#e5e7eb" />
              </linearGradient>
            </defs>
            <path
              fill={`url(#star-${fill}-${i})`}
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
            />
          </svg>
        ))}
      </span>
      <span className={cn("text-xs font-semibold", getRatingColor(rating))}>
        {rating.toFixed(1)}
      </span>
      {typeof count === "number" && (
        <span className="text-xs text-neutral-500">
          ({count})
        </span>
      )}
    </div>
  );
}