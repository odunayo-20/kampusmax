"use client";

import { cn } from "@/lib/utils";
import type { StoreCategory } from "@/types/storefront";

interface StoreCategoriesProps {
  categories: StoreCategory[];
  activeCategoryId?: string;
  onCategoryChange: (id: string) => void;
}

/** Vendor product category pills ("All" + backend-provided categories). */
export function StoreCategories({
  categories,
  activeCategoryId,
  onCategoryChange,
}: StoreCategoriesProps) {
  if (categories.length === 0) return null;

  const chips: (StoreCategory & { productCount?: number })[] = [
    { id: "", name: "All", productCount: 0 },
    ...categories,
  ];

  return (
    <div role="tablist" aria-label="Store product categories">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {chips.map((cat) => {
          const active = activeCategoryId
            ? activeCategoryId === cat.id
            : cat.id === "";
          return (
            <button
              key={cat.id || "all"}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onCategoryChange(cat.id)}
              className={cn(
                "shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600",
                active
                  ? "bg-kampmax-navy text-white border-kampmax-navy"
                  : "bg-white text-kampmax-text-secondary border-kampmax-border hover:border-kampmax-text-secondary/50"
              )}
            >
              {cat.name}
              {cat.id && (
                <span className={cn("ml-1.5", active ? "text-white/70" : "text-kampmax-text-muted")}>
                  {cat.productCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
