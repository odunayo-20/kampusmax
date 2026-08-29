"use client";

import { cn } from "@/lib/utils";
import { Tag } from "lucide-react";
import type { ProductPublishStatus, ProductStockStatus } from "@/types/vendor-products";
import {
  PUBLISH_STATUS_LABELS,
  productPublishStatusVariant,
  productStockStatusVariant,
  productStockStatusLabel,
} from "@/types/vendor-products";
import { StatusBadge } from "@/components/admin/StatusBadge";

interface ProductFiltersProps {
  statusFilter: ProductPublishStatus | "all";
  onStatusChange: (value: ProductPublishStatus | "all") => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  stockFilter: ProductStockStatus | "all";
  onStockChange: (value: ProductStockStatus | "all") => void;
  priceMin: string;
  onPriceMinChange: (value: string) => void;
  priceMax: string;
  onPriceMaxChange: (value: string) => void;
  categories: { id: string; name: string }[];
  statusCounts: Record<ProductPublishStatus | "all", number>;
}

const STATUS_OPTIONS: (ProductPublishStatus | "all")[] = [
  "all",
  "active",
  "draft",
  "pending_review",
  "inactive",
  "rejected",
  "archived",
];

const STOCK_OPTIONS: (ProductStockStatus | "all")[] = ["all", "in_stock", "low_stock", "out_of_stock"];

const STATUS_DOTS: Record<ProductPublishStatus, string> = {
  active: "bg-kampmax-success",
  draft: "bg-kampmax-muted",
  pending_review: "bg-kampmax-info",
  inactive: "bg-kampmax-warning",
  rejected: "bg-kampmax-error",
  archived: "bg-kampmax-text-secondary/50",
};

function StatusTab({
  active,
  label,
  count,
  dotClass,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  dotClass?: string;
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
      <span aria-hidden className={cn("h-1.5 w-1.5 rounded-full", dotClass ?? "bg-kampmax-blue")} />
      {label}
      <span
        className={cn(
          "rounded-full px-1.5 py-px text-[10px] font-semibold tabular-nums",
          active ? "bg-white/20 text-white" : "bg-kampmax-muted text-kampmax-text-secondary"
        )}
      >
        {count.toLocaleString("en-NG")}
      </span>
    </button>
  );
}

export function ProductFilters({
  statusFilter,
  onStatusChange,
  categoryFilter,
  onCategoryChange,
  stockFilter,
  onStockChange,
  priceMin,
  onPriceMinChange,
  priceMax,
  onPriceMaxChange,
  categories,
  statusCounts,
}: ProductFiltersProps) {
  const hasActiveFilters =
    statusFilter !== "all" ||
    categoryFilter !== "all" ||
    stockFilter !== "all" ||
    priceMin.trim() !== "" ||
    priceMax.trim() !== "";

  return (
    <div className="rounded-lg border border-kampmax-border bg-white mb-4">
      {/* Status tabs */}
      <div
        role="tablist"
        aria-label="Filter products by status"
        className="flex gap-1 overflow-x-auto border-b border-kampmax-border px-3 py-2 no-scrollbar"
      >
        <StatusTab
          active={statusFilter === "all"}
          count={statusCounts.all ?? 0}
          label="All"
          onClick={() => onStatusChange("all")}
        />
        {STATUS_OPTIONS.filter((s) => s !== "all").map((status) => (
          <StatusTab
            key={status}
            active={statusFilter === status}
            count={statusCounts[status] ?? 0}
            label={PUBLISH_STATUS_LABELS[status]}
            dotClass={STATUS_DOTS[status]}
            onClick={() => onStatusChange(status)}
          />
        ))}
      </div>

      {/* Search + facet selects */}
      <div className="flex flex-col gap-2 p-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="w-full sm:max-w-[200px]">
          <select
            aria-label="Filter by category"
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="h-9 w-full rounded-lg border border-kampmax-border bg-white px-2.5 text-sm text-kampmax-text focus:outline-none focus:ring-1 focus:ring-kampmax-blue"
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full sm:max-w-[160px]">
          <select
            aria-label="Filter by stock level"
            value={stockFilter}
            onChange={(e) => onStockChange(e.target.value as ProductStockStatus | "all")}
            className="h-9 w-full rounded-lg border border-kampmax-border bg-white px-2.5 text-sm text-kampmax-text focus:outline-none focus:ring-1 focus:ring-kampmax-blue"
          >
            {STOCK_OPTIONS.map((key) => (
              <option key={key} value={key}>
                {key === "all" ? "Any stock level" : productStockStatusLabel(key as ProductStockStatus)}
              </option>
            ))}
          </select>
        </div>

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
            value={priceMin}
            onChange={(e) => onPriceMinChange(e.target.value)}
            className="h-full w-[74px] bg-white px-2 text-sm tabular-nums text-kampmax-text outline-none [appearance:textfield] placeholder:text-kampmax-text-secondary/60 [&::-webkit-inner-spin-button]:[appearance:none]"
          />
          <span aria-hidden className="text-kampmax-text-secondary/50">–</span>
          <input
            aria-label="Maximum price"
            type="number"
            min={0}
            placeholder="Max"
            value={priceMax}
            onChange={(e) => onPriceMaxChange(e.target.value)}
            className="h-full w-[74px] bg-white px-2 text-sm tabular-nums text-kampmax-text outline-none [appearance:textfield] placeholder:text-kampmax-text-secondary/60 [&::-webkit-inner-spin-button]:[appearance:none]"
          />
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => {
              onStatusChange("all");
              onCategoryChange("all");
              onStockChange("all");
              onPriceMinChange("");
              onPriceMaxChange("");
            }}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-kampmax-blue transition-colors hover:bg-kampmax-blue/5"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}