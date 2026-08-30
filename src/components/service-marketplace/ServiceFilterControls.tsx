"use client";

import type { ServicePriceBucket, ServiceMarketplaceCategory } from "@/types/service-marketplace";
import type { ServiceProviderLocationType } from "@/types/service-provider";
import { cn } from "@/lib/utils";
import { ServiceMarketplaceFilters, PRICE_BUCKET_OPTIONS, RATING_OPTIONS, LOCATION_OPTIONS } from "./constants";

interface FilterControlsProps {
  filters: ServiceMarketplaceFilters;
  onFilterChange: <K extends keyof ServiceMarketplaceFilters>(
    key: K,
    value: ServiceMarketplaceFilters[K]
  ) => void;
  categories: ServiceMarketplaceCategory[];
  campuses: { id: string; name: string; abbreviation: string }[];
  variant?: "sidebar" | "drawer";
}

function RowButton({
  active,
  onClick,
  children,
  compact,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  compact?: boolean;
}) {
  const base = "rounded-lg text-sm font-medium border transition-colors text-left";
  const sizer = compact ? "px-3 py-1.5" : "px-3 py-2";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        base,
        sizer,
        active
          ? "bg-primary-600 text-white border-primary-600"
          : "bg-white text-neutral-700 border-neutral-200 hover:border-primary-400"
      )}
    >
      {children}
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
      {children}
    </h3>
  );
}

/**
 * The actual filter fieldset shared by the desktop sidebar and the mobile
 * bottom-sheet drawer, so both stay identical.
 */
export function ServiceFilterControls({
  filters,
  onFilterChange,
  categories,
  campuses,
  variant = "sidebar",
}: FilterControlsProps) {
  const compact = variant === "drawer";
  const grid = compact ? "grid grid-cols-2 gap-2" : "space-y-1";

  return (
    <div className="space-y-5">
      {/* Category */}
      <div>
        <SectionLabel>Category</SectionLabel>
        <div className={cn(grid, !compact && "space-y-1")}>
          <RowButton
            compact={compact}
            active={!filters.categoryId}
            onClick={() => onFilterChange("categoryId", "")}
          >
            All categories
          </RowButton>
          {categories.map((cat) => (
            <RowButton
              key={cat.id}
              compact={compact}
              active={filters.categoryId === cat.id}
              onClick={() =>
                onFilterChange("categoryId", filters.categoryId === cat.id ? "" : cat.id)
              }
            >
              {cat.name}
            </RowButton>
          ))}
        </div>
      </div>

      {/* Campus */}
      <div>
        <SectionLabel>Campus</SectionLabel>
        <div className={cn(grid, !compact && "space-y-1")}>
          <RowButton compact={compact} active={!filters.campusId} onClick={() => onFilterChange("campusId", "")}>
            All campuses
          </RowButton>
          {campuses.map((c) => (
            <RowButton
              key={c.id}
              compact={compact}
              active={filters.campusId === c.id}
              onClick={() => onFilterChange("campusId", filters.campusId === c.id ? "" : c.id)}
            >
              {compact ? c.abbreviation : c.name}
            </RowButton>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div>
        <SectionLabel>Rating</SectionLabel>
        <div className={compact ? "grid grid-cols-2 gap-2" : "space-y-1"}>
          {RATING_OPTIONS.map((r) => (
            <RowButton
              key={r.min}
              compact={compact}
              active={filters.ratingMin === r.min}
              onClick={() => onFilterChange("ratingMin", r.min)}
            >
              {r.label}
            </RowButton>
          ))}
        </div>
      </div>

      {/* Price bucket */}
      <div>
        <SectionLabel>Price</SectionLabel>
        <div className={cn(grid, !compact && "space-y-1")}>
          {PRICE_BUCKET_OPTIONS.map((b) => (
            <RowButton
              key={b.value}
              compact={compact}
              active={filters.priceBucket === b.value}
              onClick={() => onFilterChange("priceBucket", b.value as ServicePriceBucket)}
            >
              {b.label}
            </RowButton>
          ))}
        </div>
      </div>

      {/* Location type */}
      <div>
        <SectionLabel>Location</SectionLabel>
        <div className={cn(grid, !compact && "space-y-1")}>
          {LOCATION_OPTIONS.map((l) => (
            <RowButton
              key={l.value}
              compact={compact}
              active={filters.locationType === l.value}
              onClick={() => onFilterChange("locationType", l.value as ServiceProviderLocationType | "")}
            >
              {l.label}
            </RowButton>
          ))}
        </div>
      </div>
    </div>
  );
}