"use client";

import { Search, X } from "lucide-react";
import { Button } from "@/components/ui";
import { STATUS_PILLS, PROMOTION_SORT_OPTIONS } from "./promotions-meta";
import type { VendorPromotionStatus, VendorPromotionSortField } from "@/types/vendor-promotions";

interface PromotionsToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  status: VendorPromotionStatus | "all";
  onStatusChange: (value: VendorPromotionStatus | "all") => void;
  sort: VendorPromotionSortField;
  onSortChange: (value: VendorPromotionSortField) => void;
  total: number;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export function PromotionsToolbar({
  searchValue,
  onSearchChange,
  status,
  onStatusChange,
  sort,
  onSortChange,
  total,
  hasActiveFilters,
  onClearFilters,
}: PromotionsToolbarProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-kampmax-text-secondary" aria-hidden />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by title or code…"
            className="w-full rounded-lg border border-kampmax-border bg-white py-2 pl-9 pr-3 text-sm focus:border-kampmax-blue focus:outline-none"
            aria-label="Search promotions"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as VendorPromotionSortField)}
          className="rounded-lg border border-kampmax-border bg-white px-3 py-2 text-sm focus:border-kampmax-blue focus:outline-none"
          aria-label="Sort promotions"
        >
          {PROMOTION_SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {STATUS_PILLS.map((pill) => (
            <button
              key={pill.value}
              type="button"
              onClick={() => onStatusChange(pill.value as VendorPromotionStatus | "all")}
              className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                status === pill.value
                  ? "bg-kampmax-navy text-white"
                  : "bg-kampmax-muted text-kampmax-text-secondary hover:bg-kampmax-muted/80"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm text-kampmax-text-secondary">
            {total} promotion{total === 1 ? "" : "s"}
          </p>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onClearFilters} aria-label="Clear promotion filters">
              <X className="h-3.5 w-3.5" aria-hidden />
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}