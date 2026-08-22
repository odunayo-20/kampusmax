"use client";

import { Search, Package } from "lucide-react";
import { Button } from "@/components/atoms/Button";

interface EmptyMarketplaceStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
}

export function EmptyMarketplaceState({
  hasFilters,
  onClearFilters,
}: EmptyMarketplaceStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-kampmax-muted flex items-center justify-center mb-4">
        {hasFilters ? (
          <Search className="w-8 h-8 text-kampmax-text-secondary/60" />
        ) : (
          <Package className="w-8 h-8 text-kampmax-text-secondary/60" />
        )}
      </div>
      <h3 className="text-lg font-semibold text-kampmax-navy mb-1">
        No products found
      </h3>
      <p className="text-sm text-kampmax-text-secondary max-w-xs mb-4">
        {hasFilters
          ? "Try adjusting your filters or search to find what you're looking for."
          : "There are no products listed yet. Check back later!"}
      </p>
      {hasFilters && (
        <Button
          onClick={onClearFilters}
          className="bg-kampmax-navy text-white hover:bg-kampmax-navy/90"
        >
          Clear all filters
        </Button>
      )}
    </div>
  );
}
