"use client";

import { MessageSquare, Star, ThumbsUp, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VendorReviewSummary } from "@/types/vendor-reviews";

interface ReviewSummaryCardProps {
  summary: VendorReviewSummary;
  starFilter: number | null;
  onStarChange: (star: number | null) => void;
}

export function ReviewSummaryCard({ summary, starFilter, onStarChange }: ReviewSummaryCardProps) {
  const stars = [5, 4, 3, 2, 1] as const;

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1px_2fr]">
      {/* Headline stats */}
      <div className="grid grid-cols-2 gap-3">
        <Stat
          icon={Star}
          label="Average rating"
          value={summary.totalReviews > 0 ? summary.averageRating.toFixed(1) : "N/A"}
          className="bg-kampmax-gold/10 text-kampmax-gold"
        />
        <Stat
          icon={MessageSquare}
          label="Total reviews"
          value={summary.totalReviews}
          className="bg-kampmax-blue/10 text-kampmax-blue"
        />
        <Stat
          icon={TrendingUp}
          label="Recommend rate"
          value={`${summary.recommendPercentage}%`}
          className="bg-kampmax-success/10 text-kampmax-success"
        />
        <Stat
          icon={ThumbsUp}
          label="Scope"
          value="Store + products"
          className="bg-kampmax-info/10 text-kampmax-info"
          small
        />
      </div>

      <div className="hidden border-l border-kampmax-border lg:block" aria-hidden />

      {/* Rating breakdown */}
      <div className="rounded-xl border border-kampmax-border bg-white p-4">
        <h3 className="text-sm font-semibold text-kampmax-text">Rating breakdown</h3>
        <div className="mt-3 space-y-2">
          {stars.map((star) => {
            const count = summary.breakdown[star];
            const pct = summary.totalReviews > 0 ? (count / summary.totalReviews) * 100 : 0;
            const active = starFilter === star;
            return (
              <button
                key={star}
                type="button"
                onClick={() => onStarChange(active ? null : star)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-2 py-1 transition-colors",
                  active && "bg-kampmax-gold/5"
                )}
              >
                <span className="w-3 shrink-0 text-right text-xs text-kampmax-text-secondary">{star}</span>
                <Star className="h-3.5 w-3.5 shrink-0 fill-kampmax-gold text-kampmax-gold" aria-hidden />
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-kampmax-muted">
                  <div className="h-full rounded-full bg-kampmax-gold transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-6 shrink-0 text-right text-xs text-kampmax-text-secondary">{count}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  className,
  small,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  className: string;
  small?: boolean;
}) {
  return (
    <div className="rounded-xl border border-kampmax-border bg-white p-4">
      <div className={cn("mb-2 flex h-8 w-8 items-center justify-center rounded-lg", className)}>
        <Icon className="h-4 w-4" aria-hidden />
      </div>
      <p className={cn("truncate font-bold text-kampmax-text", small ? "text-base" : "text-lg")}>{value}</p>
      <p className="text-xs text-kampmax-text-secondary">{label}</p>
    </div>
  );
}