"use client";

import { useState } from "react";
import { Star, TrendingUp, MessageSquare, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { getVendorByUserId } from "@/services/users";
import {
  getReviewsByVendor,
  getReviewSummary,
  sortReviews,
} from "@/services/reviews";
import { ReviewCard } from "@/components/reviews";
import { ReviewSortOption, ReviewSummary } from "@/types";

const sortOptions: { value: ReviewSortOption; label: string }[] = [
  { value: "recent", label: "Most Recent" },
  { value: "highest", label: "Highest" },
  { value: "lowest", label: "Lowest" },
  { value: "helpful", label: "Most Helpful" },
];

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-kampmax-border p-4">
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-2", color)}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-lg font-bold text-kampmax-text">{value}</p>
      <p className="text-xs text-kampmax-text-secondary">{label}</p>
    </div>
  );
}

export default function VendorReviewsPage() {
  const { user } = useAuth();
  const vendor = user ? getVendorByUserId(user.id) : null;
  const [sort, setSort] = useState<ReviewSortOption>("recent");
  const [filterStar, setFilterStar] = useState<number | null>(null);
  const [refresh, setRefresh] = useState(0);

  if (!vendor) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-kampmax-text-secondary">No vendor account found</p>
      </div>
    );
  }

  const reviews = getReviewsByVendor(vendor.id);
  const summary = getReviewSummary(vendor.id, "vendor");

  let filtered = [...reviews];
  if (filterStar !== null) {
    filtered = filtered.filter((r) => r.rating === filterStar);
  }
  filtered = sortReviews(filtered, sort);

  const totalHelpful = reviews.reduce((sum, r) => sum + r.helpfulCount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-kampmax-text">Reviews & Ratings</h1>
        <p className="text-sm text-kampmax-text-secondary mt-0.5">
          See what customers are saying about {vendor.storeName}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={Star}
          label="Average Rating"
          value={summary.averageRating > 0 ? summary.averageRating.toFixed(1) : "N/A"}
          color="bg-kampmax-gold/10 text-kampmax-gold"
        />
        <StatCard
          icon={MessageSquare}
          label="Total Reviews"
          value={summary.totalReviews}
          color="bg-kampmax-blue/10 text-kampmax-blue"
        />
        <StatCard
          icon={TrendingUp}
          label="Recommend Rate"
          value={`${summary.recommendPercentage}%`}
          color="bg-green-50 text-green-600"
        />
        <StatCard
          icon={ThumbsUp}
          label="Helpful Votes"
          value={totalHelpful}
          color="bg-purple-50 text-purple-600"
        />
      </div>

      {/* Rating Breakdown */}
      <div className="bg-white rounded-xl border border-kampmax-border p-4">
        <h3 className="text-sm font-semibold text-kampmax-text mb-3">Rating Breakdown</h3>
        <div className="space-y-2">
          {([5, 4, 3, 2, 1] as const).map((star) => {
            const count = summary.breakdown[star];
            const pct = summary.totalReviews > 0 ? (count / summary.totalReviews) * 100 : 0;
            return (
              <button
                key={star}
                onClick={() => setFilterStar(filterStar === star ? null : star)}
                className={cn(
                  "w-full flex items-center gap-2.5 py-1 px-2 rounded-lg transition-colors",
                  filterStar === star && "bg-kampmax-gold/5"
                )}
              >
                <span className="text-xs text-kampmax-text-secondary w-3 text-right shrink-0">
                  {star}
                </span>
                <Star className="h-3.5 w-3.5 fill-kampmax-gold text-kampmax-gold shrink-0" />
                <div className="flex-1 h-2.5 bg-kampmax-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-kampmax-gold rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-kampmax-text-secondary w-6 text-right shrink-0">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-kampmax-text">
          {filtered.length} Review{filtered.length !== 1 ? "s" : ""}
          {filterStar !== null && (
            <span className="text-kampmax-blue ml-1">
              ({filterStar} star{filterStar !== 1 ? "s" : ""})
            </span>
          )}
        </p>

        <div className="flex items-center gap-2">
          {filterStar !== null && (
            <button
              onClick={() => setFilterStar(null)}
              className="px-2 py-1 rounded-lg bg-kampmax-blue/10 text-kampmax-blue text-xs font-medium"
            >
              Clear filter
            </button>
          )}
          <div className="flex gap-1">
            {sortOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSort(opt.value)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
                  sort === opt.value
                    ? "bg-kampmax-navy text-white"
                    : "bg-kampmax-muted text-kampmax-text-secondary hover:bg-kampmax-muted/80"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="bg-white rounded-xl border border-kampmax-border">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Star className="h-8 w-8 text-kampmax-muted mx-auto mb-3" />
            <p className="text-sm text-kampmax-text-secondary">
              {filterStar !== null
                ? `No ${filterStar}-star reviews yet`
                : "No reviews yet"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-kampmax-border px-4">
            {filtered.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onRefresh={() => setRefresh((n) => n + 1)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
