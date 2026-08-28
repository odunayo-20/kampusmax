"use client";

import { ChevronDown, Grid, List } from "lucide-react";
import { SortOption } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";

interface ListingToolbarProps {
  totalCount: number;
  filteredCount?: number;
  sort: SortOption;
  onSortChange: (value: SortOption) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  className?: string;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "recent", label: "Most Recent" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Highest Rated" },
];

export function ListingToolbar({ 
  totalCount, 
  filteredCount, 
  sort, 
  onSortChange, 
  viewMode, 
  onViewModeChange,
  className 
}: ListingToolbarProps) {
  const displayCount = filteredCount ?? totalCount;
  const showFiltered = filteredCount !== undefined && filteredCount !== totalCount;

  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3", className)}>
      <div className="flex items-center gap-2 text-sm text-neutral-600">
        <span className="font-medium text-neutral-900">
          {displayCount.toLocaleString()} {displayCount === 1 ? "product" : "products"}
        </span>
        {showFiltered && (
          <span className="text-neutral-500">of {totalCount.toLocaleString()}</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="appearance-none bg-white border border-neutral-200 rounded-lg px-3 py-2 pr-8 text-sm text-neutral-900 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 cursor-pointer"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
        </div>

        <div className="hidden sm:flex items-center gap-1 bg-white border border-neutral-200 rounded-lg p-0.5">
          <button
            onClick={() => onViewModeChange("grid")}
            aria-pressed={viewMode === "grid"}
            aria-label="Grid view"
            className={cn(
              "p-2 rounded-[6px] transition-colors",
              viewMode === "grid" ? "bg-primary-600 text-white" : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50"
            )}
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            aria-pressed={viewMode === "list"}
            aria-label="List view"
            className={cn(
              "p-2 rounded-[6px] transition-colors",
              viewMode === "list" ? "bg-primary-600 text-white" : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50"
            )}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}