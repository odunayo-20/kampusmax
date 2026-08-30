"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import type { ServiceMarketplaceCategory } from "@/types/service-marketplace";
import { ServiceMarketplaceFilters } from "./constants";
import { ServiceFilterControls } from "./ServiceFilterControls";

interface ServiceFilterDrawerProps {
  open: boolean;
  onClose: () => void;
  filters: ServiceMarketplaceFilters;
  onFilterChange: <K extends keyof ServiceMarketplaceFilters>(
    key: K,
    value: ServiceMarketplaceFilters[K]
  ) => void;
  onShowResults: () => void;
  categories: ServiceMarketplaceCategory[];
  campuses: { id: string; name: string; abbreviation: string }[];
}

/**
 * Mobile bottom-sheet version of the filter sidebar. Locks body scroll while
 * open and closes on backdrop click / Escape / Show results.
 */
export function ServiceFilterDrawer({
  open,
  onClose,
  filters,
  onFilterChange,
  onShowResults,
  categories,
  campuses,
}: ServiceFilterDrawerProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", onKey);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Filters">
      <button
        type="button"
        className="absolute inset-0 bg-neutral-900/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Close filters"
      />
      <div className="absolute inset-x-0 bottom-0 max-h-[85vh] bg-white rounded-t-2xl shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-neutral-100 shrink-0">
          <h2 className="text-sm font-bold text-neutral-900">Filters</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="p-2 rounded-full hover:bg-neutral-100"
          >
            <X className="h-4 w-4 text-neutral-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <ServiceFilterControls
            variant="drawer"
            filters={filters}
            onFilterChange={onFilterChange}
            categories={categories}
            campuses={campuses}
          />
        </div>
        <div className="px-4 py-3 border-t border-neutral-100 flex gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-11 rounded-lg border border-neutral-200 text-neutral-700 text-sm font-semibold hover:bg-neutral-100"
          >
            Close
          </button>
          <button
            type="button"
            onClick={onShowResults}
            className="flex-[2] h-11 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-[#1258C7]"
          >
            Show results
          </button>
        </div>
      </div>
    </div>
  );
}