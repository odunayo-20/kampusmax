"use client";

import { Search, X } from "lucide-react";
import { Button } from "@/components/ui";
import { SEGMENT_PILLS } from "./customers-meta";
import type { VendorCustomerSegment } from "@/types/vendor-customers";
import type { VendorCustomerSortField } from "@/types/vendor-customers";
import { CUSTOMER_SORT_OPTIONS } from "./customers-meta";

interface CustomersToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  segment: VendorCustomerSegment | "all";
  onSegmentChange: (segment: VendorCustomerSegment | "all") => void;
  sort: VendorCustomerSortField;
  onSortChange: (sort: VendorCustomerSortField) => void;
  total: number;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export function CustomersToolbar({
  searchValue,
  onSearchChange,
  segment,
  onSegmentChange,
  sort,
  onSortChange,
  total,
  hasActiveFilters,
  onClearFilters,
}: CustomersToolbarProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-kampmax-text-secondary" aria-hidden />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, ID or product…"
            className="w-full rounded-lg border border-kampmax-border bg-white py-2 pl-9 pr-3 text-sm focus:border-kampmax-blue focus:outline-none"
            aria-label="Search customers"
          />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="customer-sort" className="sr-only">
            Sort customers
          </label>
          <select
            id="customer-sort"
            value={sort}
            onChange={(e) => onSortChange(e.target.value as VendorCustomerSortField)}
            className="rounded-lg border border-kampmax-border bg-white px-3 py-2 text-sm focus:border-kampmax-blue focus:outline-none"
          >
            {CUSTOMER_SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onClearFilters} aria-label="Clear filters">
              <X className="h-3.5 w-3.5" aria-hidden />
              Clear
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-kampmax-text-secondary">
          {total} customer{total === 1 ? "" : "s"}
        </p>
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {SEGMENT_PILLS.map((pill) => (
            <button
              key={pill.value}
              type="button"
              onClick={() => onSegmentChange(pill.value)}
              className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                segment === pill.value
                  ? "bg-kampmax-navy text-white"
                  : "bg-kampmax-muted text-kampmax-text-secondary hover:bg-kampmax-muted/80"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}