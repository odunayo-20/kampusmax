"use client";

import { Building2, RotateCcw, Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import type { CampusStatus } from "@/types/admin";
import { CAMPUS_STATUS_LABELS } from "./campuses-meta";

export interface CampusesFilterState {
  search: string;
  state: string | "all";
  status: CampusStatus | "all";
}

interface CampusesFiltersProps {
  filters: CampusesFilterState;
  states: string[];
  counts: { all: number; active: number; inactive: number } | null;
  onChange: (patch: Partial<CampusesFilterState>) => void;
}

export function CampusesFilters({
  filters,
  states,
  counts,
  onChange,
}: CampusesFiltersProps) {
  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.state !== "all" ||
    filters.status !== "all";

  return (
    <div className="rounded-lg border border-kampmax-border bg-white">
      {/* Status tabs */}
      <div
        role="tablist"
        aria-label="Filter by campus status"
        className="flex gap-1 overflow-x-auto border-b border-kampmax-border px-3 py-2 no-scrollbar"
      >
        <StatusTab
          active={filters.status === "all"}
          count={counts?.all ?? null}
          label="All campuses"
          onClick={() => onChange({ status: "all" })}
        />
        {(Object.keys(CAMPUS_STATUS_LABELS) as CampusStatus[]).map((status) => (
          <StatusTab
            key={status}
            active={filters.status === status}
            count={
              counts
                ? status === "active"
                  ? counts.active
                  : counts.inactive
                : null
            }
            label={CAMPUS_STATUS_LABELS[status]}
            dotClass={
              status === "active" ? "bg-kampmax-success" : "bg-kampmax-text-secondary/50"
            }
            onClick={() => onChange({ status })}
          />
        ))}
      </div>

      {/* Search + selects */}
      <div className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center">
        <div className="w-full sm:max-w-xs">
          <Input
            aria-label="Search campuses"
            placeholder="Search campus, institution or city…"
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            leftIcon={<Search className="h-4 w-4" />}
            className="h-9"
          />
        </div>

        <div className="flex flex-1 items-center justify-end gap-2">
          <select
            aria-label="Filter by state"
            value={filters.state}
            onChange={(e) => onChange({ state: e.target.value })}
            className="h-9 min-w-[130px] rounded-lg border border-kampmax-border bg-white px-2.5 text-sm text-kampmax-text focus:outline-none focus:ring-1 focus:ring-kampmax-blue"
          >
            <option value="all">All states</option>
            {states.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => onChange({ search: "", state: "all", status: "all" })}
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
        <Building2 aria-hidden className="h-3 w-3 opacity-60" />
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
