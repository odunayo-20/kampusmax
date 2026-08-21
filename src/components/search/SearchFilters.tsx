"use client";

import { cn } from "@/lib/utils";
import { SearchFilterType } from "@/types";

interface SearchFiltersProps {
  activeType: SearchFilterType;
  sortBy: string;
  onTypeChange: (type: SearchFilterType) => void;
  onSortChange: (sort: string) => void;
  resultCount: number;
  className?: string;
}

const typeFilters: { value: SearchFilterType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "product", label: "Products" },
  { value: "vendor", label: "Vendors" },
  { value: "category", label: "Categories" },
  { value: "post", label: "Posts" },
  { value: "event", label: "Events" },
];

const sortOptions = [
  { value: "relevance", label: "Relevance" },
  { value: "recent", label: "Recent" },
  { value: "popular", label: "Popular" },
  { value: "price_low", label: "Price: Low" },
  { value: "price_high", label: "Price: High" },
];

export function SearchFilters({
  activeType,
  sortBy,
  onTypeChange,
  onSortChange,
  resultCount,
  className,
}: SearchFiltersProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-kampmax-text-secondary uppercase tracking-wider">
          Filters
        </p>
        {resultCount > 0 && (
          <p className="text-xs text-kampmax-text-secondary">
            {resultCount} result{resultCount !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1">
        {typeFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => onTypeChange(f.value)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0",
              activeType === f.value
                ? "bg-kampmax-navy text-white"
                : "bg-kampmax-muted text-kampmax-text-secondary hover:bg-kampmax-muted/80"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1">
        {sortOptions.map((s) => (
          <button
            key={s.value}
            onClick={() => onSortChange(s.value)}
            className={cn(
              "px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors shrink-0 border",
              sortBy === s.value
                ? "border-kampmax-blue bg-kampmax-blue/5 text-kampmax-blue"
                : "border-kampmax-border text-kampmax-text-secondary hover:bg-kampmax-muted"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
