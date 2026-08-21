"use client";

import { cn } from "@/lib/utils";
import { ReviewSummary } from "@/types";
import { Star } from "lucide-react";

interface RatingBreakdownProps {
  summary: ReviewSummary;
  className?: string;
  onStarClick?: (star: number) => void;
}

export function RatingBreakdown({ summary, className, onStarClick }: RatingBreakdownProps) {
  const maxCount = Math.max(...Object.values(summary.breakdown), 1);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-4">
        <div className="text-center">
          <p className="text-3xl font-bold text-kampmax-text">{summary.averageRating}</p>
          <div className="flex items-center gap-0.5 mt-1">
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-3.5 w-3.5",
                  i < Math.round(summary.averageRating)
                    ? "fill-kampmax-gold text-kampmax-gold"
                    : "fill-transparent text-gray-300"
                )}
              />
            ))}
          </div>
          <p className="text-[10px] text-kampmax-text-secondary mt-1">
            {summary.totalReviews} reviews
          </p>
        </div>

        <div className="flex-1 space-y-1.5">
          {([5, 4, 3, 2, 1] as const).map((star) => {
            const count = summary.breakdown[star];
            const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
            return (
              <button
                key={star}
                onClick={() => onStarClick?.(star)}
                className="w-full flex items-center gap-2 group"
              >
                <span className="text-xs text-kampmax-text-secondary w-3 text-right shrink-0">
                  {star}
                </span>
                <Star className="h-3 w-3 fill-kampmax-gold text-kampmax-gold shrink-0" />
                <div className="flex-1 h-2 bg-kampmax-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-kampmax-gold rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[10px] text-kampmax-text-secondary w-5 text-right shrink-0">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {summary.recommendPercentage > 0 && (
        <p className="text-xs text-kampmax-text-secondary">
          <span className="font-semibold text-kampmax-text">{summary.recommendPercentage}%</span>{" "}
          of buyers recommend this product
        </p>
      )}
    </div>
  );
}
