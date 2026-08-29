"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import type { ProductSortField } from "@/types/vendor-products";

interface ProductToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  sortValue: ProductSortField;
  onSortChange: (value: ProductSortField) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

const SORT_OPTIONS: { value: ProductSortField; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "title", label: "Name (A-Z)" },
  { value: "price_asc", label: "Price (Low-High)" },
  { value: "price_desc", label: "Price (High-Low)" },
  { value: "stock", label: "Stock (Low-High)" },
  { value: "updated", label: "Recently Updated" },
] as const;

export function ProductToolbar({
  searchValue,
  onSearchChange,
  sortValue,
  onSortChange,
  hasActiveFilters,
  onClearFilters,
}: ProductToolbarProps) {
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
        <label htmlFor="product-search" className="sr-only">
          Search products
        </label>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-kampmax-text-secondary" />
        <input
          id="product-search"
          type="search"
          value={debouncedSearch}
          onChange={(e) => setDebouncedSearch(e.target.value)}
          placeholder="Search products by title, SKU, tags…"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-kampmax-border text-sm bg-white focus:outline-none focus:border-kampmax-blue"
        />
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <div className="relative">
          <select
            value={sortValue}
            onChange={(e) => onSortChange(e.target.value as ProductSortField)}
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