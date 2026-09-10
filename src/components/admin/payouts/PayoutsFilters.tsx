"use client";

import { useCallback } from "react";
import { Search, X } from "lucide-react";
import type {
  ManagedPayoutFacets,
  ManagedPayoutMethod,
  ManagedPayoutRecipientType,
  ManagedPayoutStatus,
} from "@/types/admin";
import {
  PAYOUT_METHOD_OPTIONS,
  PAYOUT_RECIPIENT_TABS,
  PAYOUT_STATUS_TABS,
  payoutMethodLabel,
  payoutRecipientLabel,
  payoutStatusLabel,
} from "./payouts-meta";

export interface PayoutFilterState {
  search: string;
  status: ManagedPayoutStatus | "all";
  type: ManagedPayoutRecipientType | "all";
  method: ManagedPayoutMethod | "all";
}

export const DEFAULT_PAYOUT_FILTERS: PayoutFilterState = {
  search: "",
  status: "all",
  type: "all",
  method: "all",
};

/**
 * Filter bar for the payouts console. The type filter is the payout
 * recipient type (vendor/freelancer). Method options are driven by
 * `facets` (derived from the real ledger) so the console never offers
 * a filter that has no matching record. Status tabs show live counts.
 */
export function PayoutsFilters({
  filters,
  onChange,
  counts,
  facets,
}: {
  filters: PayoutFilterState;
  onChange: (patch: Partial<PayoutFilterState>) => void;
  counts: Record<ManagedPayoutStatus, number>;
  facets?: ManagedPayoutFacets | null;
}) {
  const patch = useCallback(
    (p: Partial<PayoutFilterState>) => onChange(p),
    [onChange]
  );

  const statusOptions = facets
    ? (["all", ...facets.statuses.map((s) => s.id)] as (ManagedPayoutStatus | "all")[])
    : PAYOUT_STATUS_TABS;

  const methodOptions = facets
    ? (["all", ...facets.methods.map((m) => m.id)] as (ManagedPayoutMethod | "all")[])
    : PAYOUT_METHOD_OPTIONS;

  return (
    <div className="space-y-4">
      {/* Status tabs */}
      <div className="flex flex-wrap gap-2">
        {statusOptions.map((status) => {
          const count =
            status === "all"
              ? Object.values(counts).reduce((a, b) => a + b, 0)
              : counts[status] ?? 0;
          return (
            <button
              key={status}
              onClick={() => patch({ status })}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                filters.status === status
                  ? "bg-kampmax-primary text-white"
                  : "bg-kampmax-surface-hover text-kampmax-text-muted hover:text-kampmax-text"
              }`}
            >
              {status === "all" ? "All" : payoutStatusLabel(status)}
              <span className="ml-0.5 text-[10px] opacity-80">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Recipient-type tabs */}
      <div className="flex flex-wrap gap-2">
        {PAYOUT_RECIPIENT_TABS.map((type) => (
          <button
            key={type}
            onClick={() => patch({ type })}
            className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              filters.type === type
                ? "bg-kampmax-navy text-white"
                : "bg-kampmax-surface-hover text-kampmax-text-muted hover:text-kampmax-text"
            }`}
          >
            {type === "all" ? "All recipients" : payoutRecipientLabel(type)}
          </button>
        ))}
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-kampmax-text-muted" />
          <input
            type="text"
            placeholder="Search payouts, references, recipients…"
            value={filters.search}
            onChange={(e) => patch({ search: e.target.value })}
            className="w-full rounded-lg border border-kampmax-border bg-kampmax-surface pl-9 pr-3 py-2 text-sm text-kampmax-text placeholder:text-kampmax-text-muted focus:border-kampmax-primary focus:outline-none focus:ring-1 focus:ring-kampmax-primary/50"
          />
          {filters.search && (
            <button
              onClick={() => patch({ search: "" })}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-kampmax-text-muted hover:text-kampmax-text"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <Select
          value={filters.method}
          onChange={(v) => patch({ method: v as PayoutFilterState["method"] })}
          options={methodOptions.map((v) => ({
            value: v,
            label: v === "all" ? "All methods" : payoutMethodLabel(v),
          }))}
        />

        <button
          onClick={() => patch(DEFAULT_PAYOUT_FILTERS)}
          className="rounded-lg border border-kampmax-border px-3 py-2 text-xs font-medium text-kampmax-text-muted hover:text-kampmax-text"
        >
          Clear
        </button>
      </div>
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-kampmax-border bg-kampmax-surface px-3 py-2 text-xs text-kampmax-text focus:border-kampmax-primary focus:outline-none focus:ring-1 focus:ring-kampmax-primary/50"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}