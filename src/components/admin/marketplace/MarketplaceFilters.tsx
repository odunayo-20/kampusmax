"use client";

import { Boxes, RotateCcw, Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import type {
  MarketplaceFacets,
  MarketplacePublicationFilter,
  MarketplaceStatusCounts,
  MarketplaceStockFilter,
  MarketplaceVisibility,
  ProductStatusCompat,
} from "@/types/admin";
import {
  PUBLICATION_KEYS,
  PUBLICATION_LABELS,
  STATUS_TABS,
  STATUS_TAB_DOTS,
  STOCK_KEYS,
  STOCK_LABELS,
  VISIBILITY_OPTIONS_ALL,
  VISIBILITY_LABELS,
} from "./marketplace-meta";

export interface MarketplaceFilterState {
  search: string;
  status: ProductStatusCompat | "all";
  visibility: MarketplaceVisibility | "all";
  publication: MarketplacePublicationFilter;
  categoryId: string | "all";
  campusId: string | "all";
  vendorId: string | "all";
  stock: MarketplaceStockFilter;
}

export const DEFAULT_MARKETPLACE_FILTERS: MarketplaceFilterState = {
  search: "",
  status: "all",
  visibility: "all",
  publication: "all",
  categoryId: "all",
  campusId: "all",
  vendorId: "all",
  stock: "all",
};

interface MarketplaceFiltersProps {
  filters: MarketplaceFilterState;
  counts: MarketplaceStatusCounts | null;
  facets: MarketplaceFacets | null;
  onChange: (patch: Partial<MarketplaceFilterState>) => void;
}

export function MarketplaceFilters({
  filters,
  counts,
  facets,
  onChange,
}: MarketplaceFiltersProps) {
  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.status !== "all" ||
    filters.visibility !== "all" ||
    filters.publication !== "all" ||
    filters.categoryId !== "all" ||
    filters.campusId !== "all" ||
    filters.vendorId !== "all" ||
    filters.stock !== "all";

  return (
    <div className="rounded-lg border border-kampmax-border bg-white">
      {/* Status tabs */}
      <div
        role="tablist"
        aria-label="Filter listings by status"
        className="flex gap-1 overflow-x-auto border-b border-kampmax-border px-3 py-2 no-scrollbar"
      >
        {STATUS_TABS.map((key) => (
          <StatusTab
            key={key}
            active={filters.status === key}
            label={key === "all" ? "All listings" : key}
            count={
              key === "all" ? counts?.all ?? null : counts?.[key] ?? null
            }
            dotClass={key === "all" ? undefined : STATUS_TAB_DOTS[key]}
            onClick={() => onChange({ status: key })}
          />
        ))}
      </div>

      {/* Search + selects */}
      <div className="flex flex-col gap-2 p-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="w-full sm:max-w-xs">
          <Input
            aria-label="Search listings"
            placeholder="Search listing, vendor or SKU…"
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            leftIcon={<Search className="h-4 w-4" />}
            className="h-9"
          />
        </div>

        <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
          <Select
            label="visibility"
            value={filters.visibility}
            onChange={(v) => onChange({ visibility: v as MarketplaceVisibility | "all" })}
          >
            {VISIBILITY_OPTIONS_ALL.map((key) => (
              <option key={key} value={key}>
                {key === "all" ? "Any visibility" : VISIBILITY_LABELS[key]}
              </option>
            ))}
          </Select>

          <Select
            label="publication"
            value={filters.publication}
            onChange={(v) =>
              onChange({ publication: v as MarketplacePublicationFilter })
            }
          >
            {PUBLICATION_KEYS.map((key) => (
              <option key={key} value={key}>
                {PUBLICATION_LABELS[key]}
              </option>
            ))}
          </Select>

          <Select
            label="category"
            value={filters.categoryId}
            onChange={(v) =>
              onChange({ categoryId: v === "all" ? "all" : v })
            }
          >
            <option value="all">All categories</option>
            {(facets?.categories ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.count})
              </option>
            ))}
          </Select>

          <Select
            label="campus"
            value={filters.campusId}
            onChange={(v) => onChange({ campusId: v === "all" ? "all" : v })}
          >
            <option value="all">All campuses</option>
            {(facets?.campuses ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.count})
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
            label="stock"
            value={filters.stock}
            onChange={(v) => onChange({ stock: v as MarketplaceStockFilter })}
          >
            {STOCK_KEYS.map((key) => (
              <option key={key} value={key}>
                {STOCK_LABELS[key]}
              </option>
            ))}
          </Select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => onChange({ ...DEFAULT_MARKETPLACE_FILTERS })}
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
        <Boxes aria-hidden className="h-3 w-3 opacity-60" />
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