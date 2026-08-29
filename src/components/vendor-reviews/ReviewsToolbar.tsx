"use client";

import { Search, X } from "lucide-react";
import { Button } from "@/components/ui";
import type { VendorReviewScope, VendorReviewResponseFilter, VendorReviewRatingBand, VendorReviewSortField } from "@/types/vendor-reviews";
import { REVIEW_SORT_OPTIONS, SCOPE_OPTIONS, RATING_BAND_OPTIONS } from "./reviews-meta";

interface ReviewsToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  scope: VendorReviewScope;
  onScopeChange: (value: VendorReviewScope) => void;
  responseStatus: VendorReviewResponseFilter;
  onResponseChange: (value: VendorReviewResponseFilter) => void;
  ratingBand: VendorReviewRatingBand;
  onRatingBandChange: (value: VendorReviewRatingBand) => void;
  sort: VendorReviewSortField;
  onSortChange: (value: VendorReviewSortField) => void;
  total: number;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export function ReviewsToolbar({
  searchValue,
  onSearchChange,
  scope,
  onScopeChange,
  responseStatus,
  onResponseChange,
  ratingBand,
  onRatingBandChange,
  sort,
  onSortChange,
  total,
  hasActiveFilters,
  onClearFilters,
}: ReviewsToolbarProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-kampmax-text-secondary" aria-hidden />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by customer, title or comment…"
            className="w-full rounded-lg border border-kampmax-border bg-white py-2 pl-9 pr-3 text-sm focus:border-kampmax-blue focus:outline-none"
            aria-label="Search reviews"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={scope}
            onChange={(e) => onScopeChange(e.target.value as VendorReviewScope)}
            className="rounded-lg border border-kampmax-border bg-white px-3 py-2 text-sm focus:border-kampmax-blue focus:outline-none"
            aria-label="Review scope"
          >
            {SCOPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as VendorReviewSortField)}
            className="rounded-lg border border-kampmax-border bg-white px-3 py-2 text-sm focus:border-kampmax-blue focus:outline-none"
            aria-label="Sort reviews"
          >
            {REVIEW_SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <select
            value={responseStatus}
            onChange={(e) => onResponseChange(e.target.value as VendorReviewResponseFilter)}
            className="rounded-lg border border-kampmax-border bg-white px-3 py-2 text-sm focus:border-kampmax-blue focus:outline-none"
            aria-label="Response status"
          >
            <option value="all">All responses</option>
            <option value="answered">Responded</option>
            <option value="unanswered">Unanswered</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {RATING_BAND_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onRatingBandChange(opt.value)}
              className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                ratingBand === opt.value
                  ? "bg-kampmax-navy text-white"
                  : "bg-kampmax-muted text-kampmax-text-secondary hover:bg-kampmax-muted/80"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm text-kampmax-text-secondary">{total} review{total === 1 ? "" : "s"}</p>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onClearFilters} aria-label="Clear review filters">
              <X className="h-3.5 w-3.5" aria-hidden />
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}