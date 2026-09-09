"use client";

import { Flag, RotateCcw, Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import type {
  ManagedReviewCounts,
  ManagedReviewFacets,
  ManagedReviewStatus,
  ManagedReviewTargetType,
} from "@/types/admin";
import {
  REVIEW_RESPONSE_LABELS,
  REVIEW_RESPONSE_OPTIONS,
  REVIEW_STATUS_DOTS,
  REVIEW_STATUS_LABELS,
  REVIEW_STATUS_TABS,
  REVIEW_TARGET_TYPE_LABELS,
  REVIEW_TARGET_TYPE_OPTIONS,
} from "./reviews-meta";

export type ReviewRatingFilter = "all" | "1" | "2" | "3" | "4" | "5";

export interface ReviewFilterState {
  search: string;
  status: ManagedReviewStatus | "all";
  rating: ReviewRatingFilter;
  targetType: ManagedReviewTargetType | "all";
  vendorId: string | "all";
  response: "all" | "answered" | "unanswered";
  reportedOnly: boolean;
}

export const DEFAULT_REVIEW_FILTERS: ReviewFilterState = {
  search: "",
  status: "all",
  rating: "all",
  targetType: "all",
  vendorId: "all",
  response: "all",
  reportedOnly: false,
};

interface ReviewFiltersProps {
  filters: ReviewFilterState;
  counts: ManagedReviewCounts | null;
  facets: ManagedReviewFacets | null;
  onChange: (patch: Partial<ReviewFilterState>) => void;
}

export function ReviewFilters({
  filters,
  counts,
  facets,
  onChange,
}: ReviewFiltersProps) {
  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.status !== "all" ||
    filters.rating !== "all" ||
    filters.targetType !== "all" ||
    filters.vendorId !== "all" ||
    filters.response !== "all" ||
    filters.reportedOnly;

  return (
    <div className="rounded-lg border border-kampmax-border bg-white">
      {/* Status tabs */}
      <div
        role="tablist"
        aria-label="Filter reviews by status"
        className="flex gap-1 overflow-x-auto border-b border-kampmax-border px-3 py-2 no-scrollbar"
      >
        {REVIEW_STATUS_TABS.map((key) => (
          <StatusTab
            key={key}
            active={filters.status === key}
            label={key === "all" ? "All reviews" : REVIEW_STATUS_LABELS[key]}
            count={
              key === "all"
                ? counts?.all ?? null
                : (counts?.byStatus[key] ?? null)
            }
            dotClass={key === "all" ? undefined : REVIEW_STATUS_DOTS[key]}
            onClick={() => onChange({ status: key })}
          />
        ))}
      </div>

      {/* Search + selects */}
      <div className="flex flex-col gap-2 p-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="w-full sm:max-w-xs">
          <Input
            aria-label="Search reviews"
            placeholder="Search reviewer, target, ID or comment…"
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            leftIcon={<Search className="h-4 w-4" />}
            className="h-9"
          />
        </div>

        <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
          <Select
            label="rating"
            value={filters.rating}
            onChange={(v) => onChange({ rating: v as ReviewRatingFilter })}
          >
            {["all", "1", "2", "3", "4", "5"].map((key) => (
              <option key={key} value={key}>
                {key === "all" ? "Any rating" : `${key} star${key === "1" ? "" : "s"}`}
              </option>
            ))}
          </Select>

          <Select
            label="target type"
            value={filters.targetType}
            onChange={(v) =>
              onChange({ targetType: v as ManagedReviewTargetType | "all" })
            }
          >
            {REVIEW_TARGET_TYPE_OPTIONS.map((key) => (
              <option key={key} value={key}>
                {key === "all"
                  ? "Any target"
                  : REVIEW_TARGET_TYPE_LABELS[key]}
              </option>
            ))}
          </Select>

          <Select
            label="vendor"
            value={filters.vendorId}
            onChange={(v) => onChange({ vendorId: v === "all" ? "all" : v })}
          >
            <option value="all">All vendors</option>
            {(facets?.vendors ?? []).map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.count})
              </option>
            ))}
          </Select>

          <Select
            label="response"
            value={filters.response}
            onChange={(v) =>
              onChange({ response: v as "all" | "answered" | "unanswered" })
            }
          >
            {REVIEW_RESPONSE_OPTIONS.map((key) => (
              <option key={key} value={key}>
                {REVIEW_RESPONSE_LABELS[key]}
              </option>
            ))}
          </Select>

          <button
            type="button"
            role="checkbox"
            aria-checked={filters.reportedOnly}
            aria-label="Only reviews with active reports"
            onClick={() => onChange({ reportedOnly: !filters.reportedOnly })}
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors",
              filters.reportedOnly
                ? "border-kampmax-error/40 bg-kampmax-error/5 text-kampmax-error"
                : "border-kampmax-border bg-white text-kampmax-text-secondary hover:bg-kampmax-muted"
            )}
          >
            <Flag className="h-3 w-3" />
            Reported only
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => onChange({ ...DEFAULT_REVIEW_FILTERS })}
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
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-kampmax-text-secondary/40" />
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