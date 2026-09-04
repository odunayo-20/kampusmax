"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { Button, Input, Select } from "@/components/ui";
import {
  FL_SIGN_OPTIONS,
  FL_SORT_OPTIONS,
  FL_TX_STATUS_OPTIONS,
  FL_TX_TYPE_OPTIONS,
  FL_TX_TYPE_META,
  FL_TX_STATUS_META,
} from "@/config/freelancer-financials";
import type { FlFinancialQuery } from "@/types/freelancer-financials";

interface FlTransactionsToolbarProps {
  query: FlFinancialQuery;
  onQueryChange: (query: FlFinancialQuery) => void;
  total: number;
}

export function FlTransactionsToolbar({ query, onQueryChange, total }: FlTransactionsToolbarProps) {
  const [search, setSearch] = useState(query.search ?? "");
  const [debounced, setDebounced] = useState(query.search ?? "");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const handleSearch = (value: string) => {
    setSearch(value);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setDebounced(value);
      onQueryChange({ ...query, search: value, page: 1 });
    }, 300);
  };

  const set = (patch: Partial<FlFinancialQuery>) =>
    onQueryChange({ ...query, ...patch, page: 1 });

  const hasFilters =
    !!debounced ||
    query.type !== "all" ||
    query.status !== "all" ||
    query.sign !== "all" ||
    !!query.from ||
    !!query.to;

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-kampmax-text-secondary" />
        <Input
          type="search"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search transactions"
          className="pl-10"
          aria-label="Search transactions"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select value={query.type ?? "all"} onChange={(e) => set({ type: e.target.value as FlFinancialQuery["type"] })} className="w-full sm:w-40">
          {FL_TX_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </Select>
        <Select value={query.status ?? "all"} onChange={(e) => set({ status: e.target.value as FlFinancialQuery["status"] })} className="w-full sm:w-40">
          {FL_TX_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </Select>
        <Select value={query.sign ?? "all"} onChange={(e) => set({ sign: e.target.value as FlFinancialQuery["sign"] })} className="w-full sm:w-32">
          {FL_SIGN_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </Select>
        <Select value={query.sort ?? "newest"} onChange={(e) => onQueryChange({ ...query, sort: e.target.value as FlFinancialQuery["sort"] })} className="w-full sm:w-44">
          {FL_SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </Select>
        <div className="flex items-center gap-2 rounded-md border border-neutral-200 p-1">
          <label className="pl-1 text-xs text-kampmax-text-secondary">From</label>
          <input type="date" value={query.from ?? ""} onChange={(e) => set({ from: e.target.value })} className="h-9 bg-transparent px-1 text-sm focus:outline-none" />
          <label className="text-xs text-kampmax-text-secondary">To</label>
          <input type="date" value={query.to ?? ""} onChange={(e) => set({ to: e.target.value })} className="h-9 bg-transparent px-1 text-sm focus:outline-none" />
        </div>
      </div>

      {hasFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-kampmax-text-secondary">Active filters:</span>
          {debounced && <FilterChip>Search: {debounced}</FilterChip>}
          {query.type !== "all" && <FilterChip>Type: {FL_TX_TYPE_META[query.type as keyof typeof FL_TX_TYPE_META]?.label ?? query.type}</FilterChip>}
          {query.status !== "all" && <FilterChip>Status: {FL_TX_STATUS_META[query.status as keyof typeof FL_TX_STATUS_META]?.label ?? query.status}</FilterChip>}
          {query.sign !== "all" && <FilterChip>Direction: {query.sign}</FilterChip>}
          {query.from && <FilterChip>From: {query.from}</FilterChip>}
          {query.to && <FilterChip>To: {query.to}</FilterChip>}
          <Button variant="ghost" size="sm" onClick={() => onQueryChange({ page: 1, pageSize: query.pageSize })}>Clear</Button>
        </div>
      )}

      <p className="text-sm text-kampmax-text-secondary">
        Showing {total.toLocaleString("en-NG")} transaction{total !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

function FilterChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">
      {children}
    </span>
  );
}
