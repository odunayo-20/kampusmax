"use client";

import { SlidersHorizontal, X } from "lucide-react";
import type { ServiceMarketplaceCategory } from "@/types/service-marketplace";
import { ServiceMarketplaceFilters, activeServiceFilterCount } from "./constants";
import { ServiceFilterControls } from "./ServiceFilterControls";

interface ServiceFilterSidebarProps {
  filters: ServiceMarketplaceFilters;
  onFilterChange: <K extends keyof ServiceMarketplaceFilters>(
    key: K,
    value: ServiceMarketplaceFilters[K]
  ) => void;
  onClear: () => void;
  onOpenDrawer: () => void;
  categories: ServiceMarketplaceCategory[];
  campuses: { id: string; name: string; abbreviation: string }[];
}

/**
 * Desktop filter sidebar. Filters apply immediately to the URL (no Apply step).
 * On small screens this panel is replaced by the filter drawer.
 */
export function ServiceFilterSidebar({
  filters,
  onFilterChange,
  onClear,
  onOpenDrawer,
  categories,
  campuses,
}: ServiceFilterSidebarProps) {
  const activeCount = activeServiceFilterCount(filters);

  return (
    <>
      {/* Mobile trigger */}
      <button
        type="button"
        onClick={onOpenDrawer}
        className="lg:hidden inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-neutral-200 bg-white text-sm font-medium text-neutral-700 hover:border-neutral-300"
      >
        <SlidersHorizontal className="h-4 w-4" aria-hidden />
        Filters
        {activeCount > 0 && (
          <span className="min-w-4 h-4 px-1 rounded-full bg-primary-600 text-white text-[10px] font-bold flex items-center justify-center">
            {activeCount}
          </span>
        )}
      </button>

      {/* Desktop panel */}
      <aside className="hidden lg:block w-60 shrink-0">
        <div className="sticky top-[72px] bg-white rounded-[10px] border border-neutral-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
              <SlidersHorizontal className="h-4 w-4 text-neutral-400" aria-hidden />
              Filters
            </h2>
            {activeCount > 0 && (
              <button
                type="button"
                onClick={onClear}
                className="inline-flex items-center gap-0.5 text-xs font-medium text-primary-600 hover:text-primary-700"
              >
                <X className="h-3 w-3" aria-hidden />
                Clear
              </button>
            )}
          </div>
          <ServiceFilterControls
            variant="sidebar"
            filters={filters}
            onFilterChange={onFilterChange}
            categories={categories}
            campuses={campuses}
          />
        </div>
      </aside>
    </>
  );
}