"use client";

import { SlidersHorizontal } from "lucide-react";
import { MarketplaceFilters } from "@/types";
import { Button } from "@/components/atoms/Button";

interface FilterSidebarProps {
  filters: MarketplaceFilters;
  onFilterChange: <K extends keyof MarketplaceFilters>(
    key: K,
    value: MarketplaceFilters[K]
  ) => void;
  onClear: () => void;
  activeCount: number;
  categories: { id: string; name: string; icon: string }[];
  campuses: { id: string; name: string; abbreviation: string }[];
}

export function FilterSidebar({
  filters,
  onFilterChange,
  onClear,
  activeCount,
  categories,
  campuses,
}: FilterSidebarProps) {
  return (
    <div className="hidden lg:block w-60 shrink-0">
      <div className="sticky top-20 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-kampmax-navy" />
            <span className="font-semibold text-kampmax-navy text-sm">Filters</span>
            {activeCount > 0 && (
              <span className="bg-kampmax-blue text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </div>
          {activeCount > 0 && (
            <button
              onClick={onClear}
              className="text-xs text-kampmax-blue hover:underline"
            >
              Clear all
            </button>
          )}
        </div>

        <div>
          <h3 className="text-xs font-semibold text-kampmax-text-secondary uppercase tracking-wider mb-2">
            Category
          </h3>
          <div className="space-y-1">
            <button
              onClick={() => onFilterChange("categoryId", "")}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                !filters.categoryId
                  ? "bg-kampmax-navy/10 text-kampmax-navy font-medium"
                  : "text-kampmax-text hover:bg-kampmax-muted/50"
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() =>
                  onFilterChange(
                    "categoryId",
                    filters.categoryId === cat.id ? "" : cat.id
                  )
                }
                className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  filters.categoryId === cat.id
                    ? "bg-kampmax-navy/10 text-kampmax-navy font-medium"
                    : "text-kampmax-text hover:bg-kampmax-muted/50"
                }`}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-kampmax-text-secondary uppercase tracking-wider mb-2">
            Campus
          </h3>
          <div className="space-y-1">
            <button
              onClick={() => onFilterChange("campusId", "")}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                !filters.campusId
                  ? "bg-kampmax-navy/10 text-kampmax-navy font-medium"
                  : "text-kampmax-text hover:bg-kampmax-muted/50"
              }`}
            >
              All Campuses
            </button>
            {campuses.map((c) => (
              <button
                key={c.id}
                onClick={() =>
                  onFilterChange(
                    "campusId",
                    filters.campusId === c.id ? "" : c.id
                  )
                }
                className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  filters.campusId === c.id
                    ? "bg-kampmax-navy/10 text-kampmax-navy font-medium"
                    : "text-kampmax-text hover:bg-kampmax-muted/50"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-kampmax-text-secondary uppercase tracking-wider mb-2">
            Condition
          </h3>
          <div className="space-y-1">
            {["", "New", "Used"].map((cond) => (
              <button
                key={cond}
                onClick={() =>
                  onFilterChange(
                    "condition",
                    cond as MarketplaceFilters["condition"]
                  )
                }
                className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  filters.condition === cond
                    ? "bg-kampmax-navy/10 text-kampmax-navy font-medium"
                    : "text-kampmax-text hover:bg-kampmax-muted/50"
                }`}
              >
                {cond || "All Conditions"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-kampmax-text-secondary uppercase tracking-wider mb-2">
            Price Range
          </h3>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.minPrice}
              onChange={(e) => onFilterChange("minPrice", e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-kampmax-border text-sm text-kampmax-text focus:outline-none focus:border-kampmax-blue"
            />
            <span className="text-kampmax-text-secondary text-sm">-</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) => onFilterChange("maxPrice", e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-kampmax-border text-sm text-kampmax-text focus:outline-none focus:border-kampmax-blue"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
