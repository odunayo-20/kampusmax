"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, PackageOpen } from "lucide-react";
import type { StoreSortOption, Storefront } from "@/types/storefront";
import {
  getStoreCategories,
  getStoreProducts,
  isUnavailable,
} from "@/services/storefront";
import { ProductCard, ProductGrid } from "@/components/marketplace";
import { Button } from "@/components/atoms/Button";
import { StoreCategories } from "./StoreCategories";
import { StoreSortDropdown } from "./StoreSortDropdown";
import { StoreEmptyState } from "./StoreEmptyState";
import { StoreProductsSkeleton } from "./StoreSkeleton";

interface StoreProductsProps {
  store: Storefront;
}

const PAGE_SIZE = 12;

/** Store product catalog: search, categories, sort, availability, pagination. */
export function StoreProducts({ store }: StoreProductsProps) {
  const categories = useMemo(() => getStoreCategories(store), [store]);

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [sort, setSort] = useState<StoreSortOption>("featured");
  const [page, setPage] = useState(1);
  const [shopUnavailable] = useState(isUnavailable(store));

  // Reset pagination whenever the filters change.
  useEffect(() => {
    setPage(1);
  }, [search, categoryId, sort]);

  const result = getStoreProducts(store, {
    search,
    categoryId,
    sort,
    availability: "available",
    page,
    pageSize: PAGE_SIZE,
  });

  const hasFilters = search !== "" || categoryId !== "" || sort !== "featured";
  const remaining = result.total - (page * PAGE_SIZE > result.total ? result.total : page * PAGE_SIZE);

  return (
    <div className="space-y-4">
      {shopUnavailable && (
        <div className="bg-accent-50 border border-accent-100 text-accent-700 text-sm rounded-lg px-4 py-3">
          This store is currently unavailable. You can browse existing products,
          but ordering is temporarily disabled.
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <label htmlFor="store-search" className="sr-only">
            Search this store
          </label>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-kampmax-text-secondary" />
          <input
            id="store-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${store.storeName}...`}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-kampmax-border text-sm focus:outline-none focus:border-kampmax-blue"
          />
        </div>
        <div className="flex items-center gap-2">
          <StoreSortDropdown value={sort} onChange={setSort} />
          <span className="text-xs text-kampmax-text-secondary whitespace-nowrap">
            {result.total} product{result.total !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Categories */}
      <StoreCategories
        categories={categories}
        activeCategoryId={categoryId}
        onCategoryChange={(id) => setCategoryId(id)}
      />

      {/* Grid / empty */}
      {result.items.length === 0 ? (
        <StoreEmptyState
          icon={<PackageOpen />}
          title={
            result.total === 0 && !hasFilters
              ? "This store hasn't listed any products yet"
              : "No products match your filters"
          }
          description={
            result.total === 0 && !hasFilters
              ? `Check back soon — ${store.storeName} will list products here.`
              : "Try a different search or category."
          }
          action={
            hasFilters ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setCategoryId("");
                  setSort("featured");
                }}
              >
                Clear filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <ProductGrid>
            {result.items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </ProductGrid>

          {result.totalPages > 1 && page < result.totalPages && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                className="border-kampmax-border"
              >
                Load more ({Math.max(remaining, 0)} remaining)
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/** Client-skeleton wrapper used by the page while data loads. */
export function StoreProductsLoading() {
  return <StoreProductsSkeleton count={8} />;
}

