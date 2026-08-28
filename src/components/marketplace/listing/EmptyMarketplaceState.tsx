"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";

interface EmptyMarketplaceStateProps {
  hasFilters?: boolean;
  onClearFilters?: () => void;
  categoryName?: string;
  className?: string;
}

export function EmptyMarketplaceState({ 
  hasFilters = false, 
  onClearFilters, 
  categoryName,
  className 
}: EmptyMarketplaceStateProps) {
  return (
    <div className={cn("py-16 text-center", className)}>
      <div className="w-16 h-16 mx-auto rounded-full bg-neutral-100 flex items-center justify-center mb-4">
        <svg className="h-8 w-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 mb-1">
        {hasFilters ? "No products match your filters" : "No products found"}
      </h3>
      <p className="text-sm text-neutral-500 max-w-sm mx-auto mb-6">
        {hasFilters 
          ? "We couldn't find any products matching your current filters."
          : `No products available in ${categoryName || "this category"} yet.`
        }
      </p>
      {hasFilters && onClearFilters && (
        <Button variant="outline" onClick={onClearFilters} className="w-fit mx-auto">
          Clear all filters
        </Button>
      )}
      {!hasFilters && categoryName && (
        <div className="mt-6">
          <p className="text-sm text-neutral-500 mb-2">Explore other categories</p>
          <a
            href="/marketplace"
            className="inline-flex items-center justify-center font-semibold tracking-tight transition-colors text-primary-600 hover:bg-primary-50 border border-primary-200 rounded-md px-5 h-10 text-sm"
          >
            Browse all products
          </a>
        </div>
      )}
    </div>
  );
}