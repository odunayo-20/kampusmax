"use client";

import { RotateCcw, Search, Store } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import type { VendorBucket } from "@/types/admin";
import { VENDOR_QUEUE_LABELS } from "./vendors-meta";

export interface VendorsFilterState {
  search: string;
  queue: VendorBucket | "all";
  campusId: string | "all";
  category: string | "all";
}

export interface VendorsCounts {
  all: number;
  pending_verification: number;
  verified: number;
  rejected: number;
  suspended: number;
  deactivated: number;
}

const TAB_DOTS: Record<VendorBucket, string> = {
  pending_verification: "bg-kampmax-warning",
  verified: "bg-kampmax-success",
  rejected: "bg-kampmax-error",
  suspended: "bg-amber-500",
  deactivated: "bg-kampmax-text-secondary/50",
};

interface VendorsFiltersProps {
  filters: VendorsFilterState;
  campuses: { id: string; name: string }[];
  categories: string[];
  counts: VendorsCounts | null;
  onChange: (patch: Partial<VendorsFilterState>) => void;
}

export function VendorsFilters({
  filters,
  campuses,
  categories,
  counts,
  onChange,
}: VendorsFiltersProps) {
  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.queue !== "all" ||
    filters.campusId !== "all" ||
    filters.category !== "all";

  return (
    <div className="rounded-lg border border-kampmax-border bg-white">
      {/* Queue tabs */}
      <div
        role="tablist"
        aria-label="Filter vendors by status queue"
        className="flex gap-1 overflow-x-auto border-b border-kampmax-border px-3 py-2 no-scrollbar"
      >
        <StatusTab
          active={filters.queue === "all"}
          count={counts?.all ?? null}
          label={VENDOR_QUEUE_LABELS.all}
          onClick={() => onChange({ queue: "all" })}
        />
        {(Object.keys(VENDOR_QUEUE_LABELS) as (VendorBucket | "all")[])
          .filter((k) => k !== "all")
          .map((key) => (
            <StatusTab
              key={key}
              active={filters.queue === key}
              count={counts?.[key] ?? null}
              label={VENDOR_QUEUE_LABELS[key]}
              dotClass={TAB_DOTS[key as VendorBucket]}
              onClick={() => onChange({ queue: key })}
            />
          ))}
      </div>

      {/* Search + selects */}
      <div className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center">
        <div className="w-full sm:max-w-xs">
          <Input
            aria-label="Search vendors"
            placeholder="Search store, owner or ID…"
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            leftIcon={<Search className="h-4 w-4" />}
            className="h-9"
          />
        </div>

        <div className="flex flex-1 items-center justify-end gap-2">
          <select
            aria-label="Filter by campus"
            value={filters.campusId}
            onChange={(e) => onChange({ campusId: e.target.value })}
            className="h-9 min-w-[140px] rounded-lg border border-kampmax-border bg-white px-2.5 text-sm text-kampmax-text focus:outline-none focus:ring-1 focus:ring-kampmax-blue"
          >
            <option value="all">All campuses</option>
            {campuses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by category"
            value={filters.category}
            onChange={(e) => onChange({ category: e.target.value })}
            className="h-9 min-w-[130px] rounded-lg border border-kampmax-border bg-white px-2.5 text-sm text-kampmax-text focus:outline-none focus:ring-1 focus:ring-kampmax-blue"
          >
            <option value="all">All categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={() =>
                onChange({
                  search: "",
                  queue: "all",
                  campusId: "all",
                  category: "all",
                })
              }
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-kampmax-blue transition-colors hover:bg-kampmax-blue/5"
            >
              <RotateCcw className="h-3 w-3" />
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusTab({
  active,
  label,
  count,
  onClick,
  dotClass,
}: {
  active: boolean;
  label: string;
  count: number | null;
  onClick: () => void;
  dotClass?: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
        active
          ? "bg-kampmax-navy text-white"
          : "text-kampmax-text-secondary hover:bg-kampmax-muted hover:text-kampmax-text"
      )}
    >
      {dotClass ? (
        <span aria-hidden className={cn("h-1.5 w-1.5 rounded-full", dotClass)} />
      ) : (
        <Store aria-hidden className="h-3 w-3 opacity-60" />
      )}
      {label}
      {count !== null && (
        <span
          className={cn(
            "rounded-full px-1.5 py-px text-[10px] font-semibold tabular-nums",
            active ? "bg-white/20 text-white" : "bg-kampmax-muted text-kampmax-text-secondary"
          )}
        >
          {count.toLocaleString("en-NG")}
        </span>
      )}
    </button>
  );
}
