"use client";

import { RotateCcw, Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import type {
  TrustSafetyReportCounts,
  TrustSafetyReportFacets,
  TrustSafetyReportStatus,
  TrustSafetySource,
  TrustSafetyTargetType,
} from "@/types/admin";
import {
  SAFETY_SOURCE_LABELS,
  SAFETY_SOURCE_TABS,
  SAFETY_STATUS_LABELS,
  SAFETY_STATUS_TABS,
  SAFETY_TARGET_TYPE_LABELS,
  SAFETY_TARGET_TYPE_OPTIONS,
} from "./safety-meta";

export interface SafetyFilterState {
  search: string;
  status: TrustSafetyReportStatus | "all";
  source: TrustSafetySource | "all";
  reason: string | "all";
  targetType: TrustSafetyTargetType | "all";
}

export const DEFAULT_SAFETY_FILTERS: SafetyFilterState = {
  search: "",
  status: "all",
  source: "all",
  reason: "all",
  targetType: "all",
};

interface SafetyFiltersProps {
  filters: SafetyFilterState;
  counts: TrustSafetyReportCounts | null;
  facets: TrustSafetyReportFacets | null;
  onChange: (patch: Partial<SafetyFilterState>) => void;
}

export function SafetyFilters({
  filters,
  counts,
  facets,
  onChange,
}: SafetyFiltersProps) {
  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.status !== "all" ||
    filters.source !== "all" ||
    filters.reason !== "all" ||
    filters.targetType !== "all";

  return (
    <div className="rounded-lg border border-kampmax-border bg-white">
      {/* Status tabs */}
      <div
        role="tablist"
        aria-label="Filter reports by status"
        className="flex gap-1 overflow-x-auto border-b border-kampmax-border px-3 py-2 no-scrollbar"
      >
        {SAFETY_STATUS_TABS.map((key) => (
          <StatusTab
            key={key}
            active={filters.status === key}
            label={key === "all" ? "All reports" : SAFETY_STATUS_LABELS[key]}
            count={
              key === "all"
                ? counts?.all ?? null
                : (counts?.byStatus[key] ?? null)
            }
            onClick={() => onChange({ status: key })}
          />
        ))}
      </div>

      {/* Search + selects */}
      <div className="flex flex-col gap-2 p-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="w-full sm:max-w-xs">
          <Input
            aria-label="Search reports"
            placeholder="Search report ID, target, reason or reporter…"
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            leftIcon={<Search className="h-4 w-4" />}
            className="h-9"
          />
        </div>

        <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
          <Select
            label="source"
            value={filters.source}
            onChange={(v) => onChange({ source: v as TrustSafetySource | "all" })}
          >
            {SAFETY_SOURCE_TABS.map((key) => (
              <option key={key} value={key}>
                {key === "all" ? "Any source" : SAFETY_SOURCE_LABELS[key]}
              </option>
            ))}
          </Select>

          <Select
            label="target type"
            value={filters.targetType}
            onChange={(v) =>
              onChange({ targetType: v as TrustSafetyTargetType | "all" })
            }
          >
            {SAFETY_TARGET_TYPE_OPTIONS.map((key) => (
              <option key={key} value={key}>
                {key === "all"
                  ? "Any target"
                  : SAFETY_TARGET_TYPE_LABELS[key]}
              </option>
            ))}
          </Select>

          <Select
            label="reason"
            value={filters.reason}
            onChange={(v) => onChange({ reason: v === "all" ? "all" : v })}
          >
            <option value="all">Any reason</option>
            {(facets?.reasons ?? []).map((r) => (
              <option key={r.reason} value={r.reason}>
                {r.reason} ({r.count})
              </option>
            ))}
          </Select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => onChange({ ...DEFAULT_SAFETY_FILTERS })}
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
}: {
  active: boolean;
  label: string;
  count: number | null;
  onClick: () => void;
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
      <span
        aria-hidden
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          active ? "bg-white/70" : "bg-kampmax-text-secondary/40"
        )}
      />
      {label}
      {count !== null && (
        <span
          className={cn(
            "rounded-full px-1.5 py-px text-[10px] font-semibold tabular-nums",
            active
              ? "bg-white/20 text-white"
              : "bg-kampmax-muted text-kampmax-text-secondary"
          )}
        >
          {count.toLocaleString("en-NG")}
        </span>
      )}
    </button>
  );
}

function Select({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      aria-label={`Filter by ${label}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 min-w-[150px] rounded-lg border border-kampmax-border bg-white px-2.5 text-sm text-kampmax-text focus:outline-none focus:ring-1 focus:ring-kampmax-blue"
    >
      {children}
    </select>
  );
}