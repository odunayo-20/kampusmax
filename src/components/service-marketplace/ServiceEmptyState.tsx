"use client";

import { Search, Wrench } from "lucide-react";
import { Button } from "@/components/atoms/Button";

interface ServiceEmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
  /** Label of the campus filter currently applied, if any. */
  activeCampusLabel?: string;
}

/**
 * Friendly empty state with actionable alternatives: clear filters, change
 * campus, or browse categories. Never shows raw data errors.
 */
export function ServiceEmptyState({ hasFilters, onClearFilters, activeCampusLabel }: ServiceEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mb-4">
        {hasFilters ? (
          <Search className="w-8 h-8 text-primary-600/60" />
        ) : (
          <Wrench className="w-8 h-8 text-primary-600/60" />
        )}
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 mb-1">
        No services found
      </h3>
      <p className="text-sm text-neutral-500 max-w-sm mb-4">
        {hasFilters
          ? "Try adjusting your filters or search, or pick a different campus."
          : "There are no services listed yet. Check back later!"}
      </p>
      {activeCampusLabel && (
        <p className="text-xs text-neutral-400 mb-4">
          Looking in {activeCampusLabel} — try switching your campus.
        </p>
      )}
      {hasFilters && (
        <Button
          onClick={onClearFilters}
          className="bg-primary-600 text-white hover:bg-[#1258C7]"
        >
          Clear all filters
        </Button>
      )}
    </div>
  );
}