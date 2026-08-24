"use client";

import { RotateCcw, Search, Tag } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import type { ManagedProduct } from "@/types/admin";
import { PRODUCT_STATUS_LABELS } from "./products-meta";

export interface ProductsFilterState {
  search: string;
  status: ManagedProduct["status"] | "all";
  categoryId: string | "all";
  campusId: string | "all";
  vendorId: string | "all";
  stock: "any" | "in_stock" | "low_stock" | "out_of_stock";
  priceMin: string;
  priceMax: string;
}

export type ProductsCounts = Record<
  ManagedProduct["status"] | "all",
  number
>;

const TAB_DOTS: Record<ManagedProduct["status"], string> = {
  active: "bg-kampmax-success",
  pending_approval: "bg-kampmax-info",
  rejected: "bg-kampmax-error",
  out_of_stock: "bg-kampmax-warning",
  suspended: "bg-rose-500",
  archived: "bg-kampmax-text-secondary/50",
};

interface ProductsFiltersProps {
  filters: ProductsFilterState;
  facets: {
    categories: { id: string; name: string }[];
    campuses: { id: string; name: string }[];
    vendors: { id: string; name: string }[];
  };
  counts: ProductsCounts | null;
  onChange: (patch: Partial<ProductsFilterState>) => void;
}

const STOCK_LABELS: Record<ProductsFilterState["stock"], string> = {
  any: "Any stock level",
  in_stock: "In stock (>5)",
  low_stock: "Low stock (1–5)",
  out_of_stock: "Out of stock",
};

export function ProductsFilters({
  filters,
  facets,
  counts,
  onChange,
}: ProductsFiltersProps) {
  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.status !== "all" ||
    filters.categoryId !== "all" ||
    filters.campusId !== "all" ||
    filters.vendorId !== "all" ||
    filters.stock !== "any" ||
    filters.priceMin.trim() !== "" ||
    filters.priceMax.trim() !== "";

  return (
    <div className="rounded-lg border border-kampmax-border bg-white">
      {/* Status tabs */}
      <div
        role="tablist"
        aria-label="Filter products by status"
        className="flex gap-1 overflow-x-auto border-b border-kampmax-border px-3 py-2 no-scrollbar"
      >
        <StatusTab
          active={filters.status === "all"}
          count={counts?.all ?? null}
          label="All listings"
          onClick={() => onChange({ status: "all" })}
        />
        {(Object.keys(PRODUCT_STATUS_LABELS) as ManagedProduct["status"][]).map(
          (status) => (
            <StatusTab
              key={status}
              active={filters.status === status}
              count={counts?.[status] ?? null}
              label={PRODUCT_STATUS_LABELS[status]}
              dotClass={TAB_DOTS[status]}
              onClick={() => onChange({ status })}
            />
          )
        )}
      </div>

      {/* Search + facet selects */}
      <div className="flex flex-col gap-2 p-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="w-full sm:max-w-[220px]">
          <Input
            aria-label="Search products"
            placeholder="Search title, vendor or ID…"
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            leftIcon={<Search className="h-4 w-4" />}
            className="h-9"
          />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 sm:flex-1">
          <select
            aria-label="Filter by category"
            value={filters.categoryId}
            onChange={(e) => onChange({ categoryId: e.target.value })}
            className="h-9 min-w-[130px] rounded-lg border border-kampmax-border bg-white px-2.5 text-sm text-kampmax-text focus:outline-none focus:ring-1 focus:ring-kampmax-blue"
          >
            <option value="all">All categories</option>
            {facets.categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by campus"
            value={filters.campusId}
            onChange={(e) => onChange({ campusId: e.target.value })}
            className="h-9 min-w-[120px] rounded-lg border border-kampmax-border bg-white px-2.5 text-sm text-kampmax-text focus:outline-none focus:ring-1 focus:ring-kampmax-blue"
          >
            <option value="all">All campuses</option>
            {facets.campuses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by vendor"
            value={filters.vendorId}
            onChange={(e) => onChange({ vendorId: e.target.value })}
            className="h-9 max-w-[170px] rounded-lg border border-kampmax-border bg-white px-2.5 text-sm text-kampmax-text focus:outline-none focus:ring-1 focus:ring-kampmax-blue"
          >
            <option value="all">All vendors</option>
            {facets.vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by stock level"
            value={filters.stock}
            onChange={(e) =>
              onChange({ stock: e.target.value as ProductsFilterState["stock"] })
            }
            className="h-9 min-w-[130px] rounded-lg border border-kampmax-border bg-white px-2.5 text-sm text-kampmax-text focus:outline-none focus:ring-1 focus:ring-kampmax-blue"
          >
            {(Object.keys(STOCK_LABELS) as ProductsFilterState["stock"][]).map(
              (key) => (
                <option key={key} value={key}>
                  {STOCK_LABELS[key]}
                </option>
              )
            )}
          </select>

          {/* Price range */}
          <div
            role="group"
            aria-label="Price range"
            className="flex h-9 items-center overflow-hidden rounded-lg border border-kampmax-border"
          >
            <span className="flex h-full items-center gap-1 border-r border-kampmax-border bg-kampmax-muted/60 px-2 text-xs font-medium text-kampmax-text-secondary">
              <Tag className="h-3 w-3" aria-hidden />
              ₦
            </span>
            <input
              aria-label="Minimum price"
              type="number"
              min={0}
              placeholder="Min"
              value={filters.priceMin}
              onChange={(e) => onChange({ priceMin: e.target.value })}
              className="h-full w-[74px] bg-white px-2 text-sm tabular-nums text-kampmax-text outline-none [appearance:textfield] placeholder:text-kampmax-text-secondary/60 [&::-webkit-inner-spin-button]:[appearance:none]"
            />
            <span aria-hidden className="text-kampmax-text-secondary/50">–</span>
            <input
              aria-label="Maximum price"
              type="number"
              min={0}
              placeholder="Max"
              value={filters.priceMax}
              onChange={(e) => onChange({ priceMax: e.target.value })}
              className="h-full w-[74px] bg-white px-2 text-sm tabular-nums text-kampmax-text outline-none [appearance:textfield] placeholder:text-kampmax-text-secondary/60 [&::-webkit-inner-spin-button]:[appearance:none]"
            />
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={() =>
                onChange({
                  search: "",
                  status: "all",
                  categoryId: "all",
                  campusId: "all",
                  vendorId: "all",
                  stock: "any",
                  priceMin: "",
                  priceMax: "",
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
      <span aria-hidden className={cn("h-1.5 w-1.5 rounded-full", dotClass ?? "bg-kampmax-blue")} />
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
