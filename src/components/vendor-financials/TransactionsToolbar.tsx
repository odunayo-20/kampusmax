"use client";

import { useMemo, useState, ChangeEvent, FormEvent } from "react";
import { Search, Filter, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import { Select } from "@/components/ui";
import { cn } from "@/lib/utils";
import { formatNaira, formatDate } from "@/lib/utils";
import {
  TX_TYPE_OPTIONS,
  TX_STATUS_OPTIONS,
  SIGN_OPTIONS,
  SORT_OPTIONS,
  txTypeLabel,
  txStatusLabel,
  signIcon,
} from "./financials-meta";
import type { VendorFinancialQuery, VendorFinancialTransaction } from "@/types/vendor-financials";

interface TransactionsToolbarProps {
  query: VendorFinancialQuery;
  onQueryChange: (query: VendorFinancialQuery) => void;
  total: number;
}

export function TransactionsToolbar({ query, onQueryChange, total }: TransactionsToolbarProps) {
  const [search, setSearch] = useState(query.search ?? "");
  const [debouncedSearch, setDebouncedSearch] = useState(query.search ?? "");

  // Debounce search
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    const timer = setTimeout(() => {
      setDebouncedSearch(value);
      onQueryChange({ ...query, search: value, page: 1 });
    }, 300);
    return () => clearTimeout(timer);
  };

  const handleTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onQueryChange({ ...query, type: e.target.value as VendorFinancialQuery["type"], page: 1 });
  };

  const handleStatusChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onQueryChange({ ...query, status: e.target.value as VendorFinancialQuery["status"], page: 1 });
  };

  const handleSignChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onQueryChange({ ...query, sign: e.target.value as VendorFinancialQuery["sign"], page: 1 });
  };

  const handleSortChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onQueryChange({ ...query, sort: e.target.value as VendorFinancialQuery["sort"] });
  };

  const handleFromChange = (e: ChangeEvent<HTMLInputElement>) => {
    onQueryChange({ ...query, from: e.target.value, page: 1 });
  };

  const handleToChange = (e: ChangeEvent<HTMLInputElement>) => {
    onQueryChange({ ...query, to: e.target.value, page: 1 });
  };

  const hasFilters = debouncedSearch || query.type !== "all" || query.status !== "all" || query.sign !== "all" || query.from || query.to;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-kampmax-text-secondary" />
          <input
            type="search"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search transactions…"
            className="w-full h-11 pl-10 pr-3 text-sm bg-white border border-neutral-200 rounded-md placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600"
            aria-label="Search transactions"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={query.type ?? "all"} onChange={handleTypeChange} className="w-full sm:w-40">
            {TX_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Select>
          <Select value={query.status ?? "all"} onChange={handleStatusChange} className="w-full sm:w-40">
            {TX_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Select>
          <Select value={query.sign ?? "all"} onChange={handleSignChange} className="w-full sm:w-32">
            {SIGN_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Select>
          <Select value={query.sort ?? "newest"} onChange={handleSortChange} className="w-full sm:w-40">
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Select>
          <div className="flex items-center gap-2 border border-neutral-200 rounded-md p-1.5">
            <label className="text-xs text-kampmax-text-secondary">From</label>
            <input type="date" value={query.from ?? ""} onChange={handleFromChange} className="h-9 px-2 text-sm bg-transparent focus:outline-none" />
            <label className="text-xs text-kampmax-text-secondary">To</label>
            <input type="date" value={query.to ?? ""} onChange={handleToChange} className="h-9 px-2 text-sm bg-transparent focus:outline-none" />
          </div>
        </div>
      </div>

      {hasFilters && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-kampmax-text-secondary">Active filters:</span>
          {debouncedSearch && (
            <span className="inline-flex items-center gap-1 rounded bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">
              Search: {debouncedSearch}
            </span>
          )}
          {query.type !== "all" && (
            <span className="inline-flex items-center gap-1 rounded bg-info-100 px-2 py-0.5 text-xs font-medium text-info-700">
              Type: {txTypeLabel(query.type!)}
            </span>
          )}
          {query.status !== "all" && (
            <span className="inline-flex items-center gap-1 rounded bg-warning-100 px-2 py-0.5 text-xs font-medium text-warning-700">
              Status: {txStatusLabel(query.status!)}
            </span>
          )}
          {query.sign !== "all" && (
            <span className="inline-flex items-center gap-1 rounded bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700">
              {signIcon(query.sign!)} {query.sign}
            </span>
          )}
          {query.from && (
            <span className="inline-flex items-center gap-1 rounded bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700">
              From: {formatDate(query.from)}
            </span>
          )}
          {query.to && (
            <span className="inline-flex items-center gap-1 rounded bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700">
              To: {formatDate(query.to)}
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={() => onQueryChange({ page: 1, pageSize: query.pageSize })}>
            Clear
          </Button>
        </div>
      )}

      <p className="text-sm text-kampmax-text-secondary">
        Showing {total.toLocaleString("en-NG")} transaction{total !== 1 ? "s" : ""}
      </p>
    </div>
  );
}