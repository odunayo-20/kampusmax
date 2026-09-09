"use client";

import { RotateCcw, Search, Briefcase } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import type { FreelancerBucket, FreelancerStatusCounts } from "@/types/admin";
import { FREELANCER_QUEUE_LABELS } from "./freelancers-meta";

export interface FreelancersFilterState {
  search: string;
  status: FreelancerBucket | "all";
  categoryId: string | "all";
}

export interface FreelancersFiltersProps {
  filters: FreelancersFilterState;
  statusCounts: FreelancerStatusCounts | null;
  categories: string[];
  onChange: (patch: Partial<FreelancersFilterState>) => void;
}

export function FreelancersFilters({
  filters,
  statusCounts,
  categories,
  onChange,
}: FreelancersFiltersProps) {
  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.status !== "all" ||
    filters.categoryId !== "all";

  return (
    <div className="rounded-lg border border-kampmax-border bg-white">
      <div className="flex gap-2 px-3 py-1.5 border-b border-kampmax-border">
        {/* Search */}
        <Input
          type="text"
          placeholder="Search by name, slug, headline..."
          value={filters.search}
          onChange={(e) =>
            onChange({ search: e.target.value })
          }
          className="flex-1 rounded-l-lg border-none"
        />
        <RotateCcw className="h-4 w-4 opacity-50 text-kampmax-text-tertiary cursor-pointer" />
      </div>

      {/* Status tabs */}
      <div
        role="tablist"
        aria-label="Filter freelancers by status"
        className="flex gap-1 overflow-x-auto border-b border-kampmax-border px-3 py-2 no-scrollbar"
      >
        <StatusTab
          active={filters.status === "all"}
          count={statusCounts?.all ?? null}
          label={FREELANCER_QUEUE_LABELS.all}
          onClick={() => onChange({ status: "all" })}
        />
        {(Object.keys(FREELANCER_QUEUE_LABELS) as (FreelancerBucket | "all")[])
          .filter((k) => k !== "all")
          .map((key) => (
            <StatusTab
              key={key}
              active={filters.status === key}
              count={statusCounts?.[key] ?? null}
              label={FREELANCER_QUEUE_LABELS[key]}
              onClick={() => onChange({ status: key })}
            />
          ))}
      </div>

      {/* Category filter */}
      {categories.length > 0 && (
        <div
          role="listbox"
          aria-label="Filter freelancers by category"
          className="mt-1.5 rounded-lg border border-kampmax-border bg-white max-h-80 overflow-y-auto"
        >
          <div
            role="option"
            aria-selected={filters.categoryId === "all"}
            onClick={() => onChange({ categoryId: "all" })}
            className={cn(
              "flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm text-kampmax-text-primary hover:bg-kampmax-surface",
              filters.categoryId === "all" && "bg-kampmax-surface/20"
            )}
          >
            All categories
          </div>
          {categories.map((cat, i) => (
            <div
              key={cat}
              role="option"
              aria-selected={filters.categoryId === cat}
              onClick={() => onChange({ categoryId: cat })}
              className={cn(
                "flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm text-kampmax-text-primary hover:bg-kampmax-surface",
                filters.categoryId === cat && "bg-kampmax-surface/20"
              )}
            >
              {cat}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusTab({
  active,
  count,
  label,
  dotClass,
  onClick,
}: {
  active: boolean;
  count: number | null;
  label: string;
  dotClass?: string;
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
        <span className={cn("ml-1 text-caption-2 inline-flex items-center rounded-full h-2.5 w-2.5 bg-current", dotClass)} />
      )}
    </button>
  );
}