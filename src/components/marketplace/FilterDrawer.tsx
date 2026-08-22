"use client";

import { X, SlidersHorizontal } from "lucide-react";
import { MarketplaceFilters, SortOption } from "@/types";
import { Button } from "@/components/atoms/Button";

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
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

export function FilterDrawer({
  open,
  onClose,
  filters,
  onFilterChange,
  onClear,
  activeCount,
  categories,
  campuses,
}: FilterDrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] bg-white rounded-t-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-kampmax-border">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-kampmax-navy" />
            <span className="font-semibold text-kampmax-navy">Filters</span>
            {activeCount > 0 && (
              <span className="bg-kampmax-blue text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1 hover:bg-kampmax-muted rounded-full">
            <X className="w-5 h-5 text-kampmax-text-secondary" />
          </button>
        </div>

        <div className="overflow-y-auto p-4 space-y-5">
          <div>
            <h3 className="text-xs font-semibold text-kampmax-text-secondary uppercase tracking-wider mb-2">
              Category
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onFilterChange("categoryId", "")}
                className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  !filters.categoryId
                    ? "bg-kampmax-navy text-white border-kampmax-navy"
                    : "bg-white text-kampmax-text border-kampmax-border hover:border-kampmax-blue"
                }`}
              >
                All
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
                  className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors text-left ${
                    filters.categoryId === cat.id
                      ? "bg-kampmax-navy text-white border-kampmax-navy"
                      : "bg-white text-kampmax-text border-kampmax-border hover:border-kampmax-blue"
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
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onFilterChange("campusId", "")}
                className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  !filters.campusId
                    ? "bg-kampmax-navy text-white border-kampmax-navy"
                    : "bg-white text-kampmax-text border-kampmax-border hover:border-kampmax-blue"
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
                  className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    filters.campusId === c.id
                      ? "bg-kampmax-navy text-white border-kampmax-navy"
                      : "bg-white text-kampmax-text border-kampmax-border hover:border-kampmax-blue"
                  }`}
                >
                  {c.abbreviation}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-kampmax-text-secondary uppercase tracking-wider mb-2">
              Condition
            </h3>
            <div className="flex gap-2">
              {["", "New", "Used"].map((cond) => (
                <button
                  key={cond}
                  onClick={() =>
                    onFilterChange(
                      "condition",
                      cond as MarketplaceFilters["condition"]
                    )
                  }
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    filters.condition === cond
                      ? "bg-kampmax-navy text-white border-kampmax-navy"
                      : "bg-white text-kampmax-text border-kampmax-border hover:border-kampmax-blue"
                  }`}
                >
                  {cond || "All"}
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
                className="flex-1 px-3 py-2 rounded-lg border border-kampmax-border text-sm text-kampmax-text focus:outline-none focus:border-kampmax-blue"
              />
              <span className="text-kampmax-text-secondary">-</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => onFilterChange("maxPrice", e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-kampmax-border text-sm text-kampmax-text focus:outline-none focus:border-kampmax-blue"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-kampmax-border p-4 flex gap-3">
          {activeCount > 0 && (
            <Button variant="ghost" onClick={onClear} className="flex-1">
              Clear all
            </Button>
          )}
          <Button
            onClick={onClose}
            className="flex-1 bg-kampmax-navy text-white hover:bg-kampmax-navy/90"
          >
            Show results
          </Button>
        </div>
      </div>
    </div>
  );
}
