"use client";

import { useState, useEffect } from "react";
import { Search, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui";
import type { VendorOrderSortField } from "@/types/vendor-orders";

interface OrdersToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  sortValue: VendorOrderSortField;
  onSortChange: (value: VendorOrderSortField) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

const SORT_OPTIONS: { value: VendorOrderSortField; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "total_desc", label: "Total (High-Low)" },
  { value: "total_asc", label: "Total (Low-High)" },
];

export function OrdersToolbar({
  searchValue,
  onSearchChange,
  sortValue,
  onSortChange,
  hasActiveFilters,
  onClearFilters,
}: OrdersToolbarProps) {
  const [debouncedSearch, setDebouncedSearch] = useState(searchValue);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(debouncedSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [debouncedSearch, onSearchChange]);

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      <div className="relative flex-1">
        <label htmlFor="vendor-orders-search" className="sr-only">
          Search orders
        </label>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-kampmax-text-secondary" />
        <input
          id="vendor-orders-search"
          type="search"
          value={debouncedSearch}
          onChange={(e) => setDebouncedSearch(e.target.value)}
          placeholder="Search by order ID, buyer, or item…"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-kampmax-border text-sm bg-white focus:outline-none focus:border-kampmax-blue"
        />
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <div className="relative">
          <label htmlFor="vendor-orders-sort" className="sr-only">
            Sort orders
          </label>
          <select
            id="vendor-orders-sort"
            value={sortValue}
            onChange={(e) => onSortChange(e.target.value as VendorOrderSortField)}
            className="appearance-none h-10 pl-3 pr-9 rounded-xl border border-kampmax-border bg-white text-sm focus:outline-none focus:border-kampmax-blue"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-kampmax-text-secondary pointer-events-none" />
        </div>

        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={onClearFilters} className="gap-1.5">
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}