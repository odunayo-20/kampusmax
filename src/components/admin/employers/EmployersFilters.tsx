"use client";

import { RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import type { EmployerBucket, EmployerStatusCounts } from "@/types/admin";
import {
  EMPLOYER_QUEUE_LABELS,
  EMPLOYER_VERIFICATION_LABELS,
  VALID_VERIFICATION_FILTER_VALUES,
} from "./employers-meta";

export interface EmployersFilterState {
  search: string;
  status: EmployerBucket | "all";
  verification: string | "all";
  campusId: string | "all";
  industry: string | "all";
}

export interface CampusOption {
  id: string;
  name: string;
}

export interface EmployersFiltersProps {
  filters: EmployersFilterState;
  statusCounts: EmployerStatusCounts | null;
  campusOptions: CampusOption[];
  industries: string[];
  onChange: (patch: Partial<EmployersFilterState>) => void;
}

export function EmployersFilters({
  filters,
  statusCounts,
  campusOptions,
  industries,
  onChange,
}: EmployersFiltersProps) {
  const hasSecondaryFilters =
    filters.verification !== "all" ||
    filters.campusId !== "all" ||
    filters.industry !== "all";

  return (
    <div className="rounded-lg border border-kampmax-border bg-white">
      <div className="flex gap-2 px-3 py-1.5 border-b border-kampmax-border">
        <Input
          type="text"
          placeholder="Search by name, organization, slug, location..."
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
          className="flex-1 rounded-l-lg border-none"
          aria-label="Search employers"
        />
        {hasSecondaryFilters && (
          <button
            type="button"
            onClick={() =>
              onChange({ verification: "all", campusId: "all", industry: "all" })
            }
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-kampmax-border bg-white px-2.5 py-1.5 text-xs font-medium text-kampmax-text-secondary transition-colors hover:bg-kampmax-muted/60"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset filters
          </button>
        )}
      </div>

      {/* Status tabs */}
      <div
        role="tablist"
        aria-label="Filter employers by status"
        className="flex gap-1 overflow-x-auto border-b border-kampmax-border px-3 py-2 no-scrollbar"
      >
        <StatusTab
          active={filters.status === "all"}
          count={statusCounts?.all ?? null}
          label={EMPLOYER_QUEUE_LABELS.all}
          onClick={() => onChange({ status: "all" })}
        />
        {(Object.keys(EMPLOYER_QUEUE_LABELS) as (EmployerBucket | "all")[])
          .filter((k) => k !== "all")
          .map((key) => (
            <StatusTab
              key={key}
              active={filters.status === key}
              count={statusCounts?.[key] ?? null}
              label={EMPLOYER_QUEUE_LABELS[key]}
              onClick={() => onChange({ status: key })}
            />
          ))}
      </div>

      {/* Secondary filters */}
      <div className="flex flex-wrap items-center gap-2 px-3 py-2.5">
        <label className="flex items-center gap-1.5 text-xs font-medium text-kampmax-text-secondary">
          Verification
          <select
            value={filters.verification}
            onChange={(e) => onChange({ verification: e.target.value })}
            className="h-8 rounded-md border border-kampmax-border bg-white px-2 py-0 text-xs font-medium text-kampmax-text focus:outline-none focus:ring-1 focus:ring-kampmax-blue"
            aria-label="Filter by verification status"
          >
            <option value="all">All</option>
            {VALID_VERIFICATION_FILTER_VALUES.map((v) => (
              <option key={v} value={v}>
                {EMPLOYER_VERIFICATION_LABELS[v]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-1.5 text-xs font-medium text-kampmax-text-secondary">
          Campus
          <select
            value={filters.campusId}
            onChange={(e) => onChange({ campusId: e.target.value })}
            className="h-8 rounded-md border border-kampmax-border bg-white px-2 py-0 text-xs font-medium text-kampmax-text focus:outline-none focus:ring-1 focus:ring-kampmax-blue"
            aria-label="Filter by campus"
          >
            <option value="all">All campuses</option>
            {campusOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-1.5 text-xs font-medium text-kampmax-text-secondary">
          Industry
          <select
            value={filters.industry}
            onChange={(e) => onChange({ industry: e.target.value })}
            className="h-8 rounded-md border border-kampmax-border bg-white px-2 py-0 text-xs font-medium text-kampmax-text focus:outline-none focus:ring-1 focus:ring-kampmax-blue"
            aria-label="Filter by industry"
          >
            <option value="all">All industries</option>
            {industries.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}

function StatusTab({
  active,
  count,
  label,
  onClick,
}: {
  active: boolean;
  count: number | null;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "flex items-center gap-1 rounded-sm border border-transparent py-1.5 px-2.5 text-xs font-medium transition-colors",
        active
          ? "border-kampmax-primary text-kampmax-primary bg-kampmax-primary/10"
          : "text-kampmax-text-secondary hover:border-kampmax-primary hover:text-kampmax-primary hover:bg-kampmax-surface/50"
      )}
    >
      <span>{label}</span>
      {count !== null && (
        <span className="tabular-nums text-[10px] text-kampmax-text-tertiary">{count}</span>
      )}
    </button>
  );
}