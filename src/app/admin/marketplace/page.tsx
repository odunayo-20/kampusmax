"use client";

import { useCallback, useEffect, useMemo, useState, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Boxes } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Pagination } from "@/components/admin/Pagination";
import {
  MarketplaceFilters,
  DEFAULT_MARKETPLACE_FILTERS,
  type MarketplaceFilterState,
} from "@/components/admin/marketplace/MarketplaceFilters";
import { MarketplaceTable } from "@/components/admin/marketplace/MarketplaceTable";
import {
  PUBLICATION_KEYS,
  STATUS_TABS,
  STOCK_KEYS,
  VISIBILITY_LABELS,
} from "@/components/admin/marketplace/marketplace-meta";
import { useDebounce } from "@/hooks/use-debounce";
import {
  useAdminMarketplace,
  useAdminMarketplaceCounts,
  useAdminMarketplaceFacets,
} from "@/hooks/admin/use-admin-marketplace";
import type { MarketplacePublicationFilter, MarketplaceVisibility, MarketplaceStockFilter, ProductStatusCompat, SortDir } from "@/types/admin";
import type { MarketplaceSortField } from "@/services/admin";

function parseInitialFilters(params: URLSearchParams): MarketplaceFilterState {
  const rawStatus = params.get("status");
  const validStatus = STATUS_TABS as (ProductStatusCompat | "all")[];
  const rawVisibility = params.get("visibility");
  const validVisibilityStrs = Object.keys(VISIBILITY_LABELS) as (MarketplaceVisibility | "all")[];
  const validPublicationStrs = PUBLICATION_KEYS as string[];
  const rawPublication = params.get("publication");
  return {
    search: params.get("q") ?? "",
    status:
      rawStatus && validStatus.includes(rawStatus as ProductStatusCompat | "all")
        ? (rawStatus as ProductStatusCompat | "all")
        : "all",
    visibility:
      rawVisibility &&
      validVisibilityStrs.includes(rawVisibility as MarketplaceVisibility | "all")
        ? (rawVisibility as MarketplaceVisibility | "all")
        : "all",
    publication:
      rawPublication && validPublicationStrs.includes(rawPublication)
        ? (rawPublication as MarketplacePublicationFilter)
        : "all",
    categoryId: params.get("category") ?? "all",
    campusId: params.get("campus") ?? "all",
    vendorId: params.get("vendor") ?? "all",
    stock: (() => {
      const v = params.get("stock");
      return v && (STOCK_KEYS as (MarketplaceStockFilter | "all")[]).includes(v as MarketplaceStockFilter | "all")
        ? (v as MarketplaceStockFilter | "all")
        : "all";
    })(),
  };
}

function parseInitialPage(params: URLSearchParams): number {
  const rawPage = Number.parseInt(params.get("page") ?? "", 10);
  return Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
}

export default function AdminMarketplacePage() {
  return (
    <Suspense fallback={<MarketplaceSkeleton />}>
      <AdminMarketplacePageInner />
    </Suspense>
  );
}

function AdminMarketplacePageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [filters, setFilters] = useState<MarketplaceFilterState>(() =>
    parseInitialFilters(new URLSearchParams(searchParams.toString()))
  );
  const [sortBy, setSortBy] = useState<MarketplaceSortField>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(() =>
    parseInitialPage(new URLSearchParams(searchParams.toString()))
  );
  const [pageSize, setPageSize] = useState(10);

  const debouncedSearch = useDebounce(filters.search.trim(), 350);
  const query = useMemo(
    () => ({
      search: debouncedSearch,
      status: filters.status === "all" ? undefined : filters.status,
      visibility: filters.visibility === "all" ? undefined : filters.visibility,
      publication: filters.publication === "all" ? undefined : filters.publication,
      categoryId: filters.categoryId === "all" ? undefined : filters.categoryId,
      campusId: filters.campusId === "all" ? undefined : filters.campusId,
      vendorId: filters.vendorId === "all" ? undefined : filters.vendorId,
      stock: filters.stock === "all" ? undefined : filters.stock,
      sortBy,
      sortDir,
      page,
      pageSize,
    }),
    [debouncedSearch, filters, sortBy, sortDir, page, pageSize]
  );

  // ----- data hooks (always called at top level) -----
  const { data, error, isLoading, refetch } = useAdminMarketplace(query);
  const counts = useAdminMarketplaceCounts();
  const facets = useAdminMarketplaceFacets();

  // Non-sensitive filters persist to the URL so views are shareable and
  // survive reloads (never the raw search term per keystroke).
  const urlParams = searchParams.toString();
  useEffect(() => {
    const timer = setTimeout(() => {
      const sp = new URLSearchParams();
      const trimmed = filters.search.trim();
      if (trimmed) sp.set("q", trimmed);
      if (filters.status !== "all") sp.set("status", filters.status);
      if (filters.visibility !== "all") sp.set("visibility", filters.visibility);
      if (filters.publication !== "all") sp.set("publication", filters.publication);
      if (filters.categoryId !== "all") sp.set("category", filters.categoryId);
      if (filters.campusId !== "all") sp.set("campus", filters.campusId);
      if (filters.vendorId !== "all") sp.set("vendor", filters.vendorId);
      if (filters.stock !== "all") sp.set("stock", filters.stock);
      if (page > 1) sp.set("page", String(page));
      const next = sp.toString();
      if (next !== urlParams) router.replace(`${pathname}?${next}`, { scroll: false });
    }, 350);
    return () => clearTimeout(timer);
  }, [filters, page, urlParams, router, pathname]);

  const patchFilters = useCallback((patch: Partial<MarketplaceFilterState>) => {
    setFilters((f) => ({ ...f, ...patch }));
    setPage(1);
  }, []);

  const toggleSort = useCallback(
    (field: MarketplaceSortField) => {
      if (field === sortBy) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortBy(field);
        setSortDir(field === "name" ? "asc" : "desc");
      }
      setPage(1);
    },
    [sortBy]
  );

  const onRetry = useCallback(() => {
    void refetch();
  }, [refetch]);

  const countsData = counts.data ?? null;
  const facetsData = facets.data ?? null;
  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.status !== "all" ||
    filters.visibility !== "all" ||
    filters.publication !== "all" ||
    filters.categoryId !== "all" ||
    filters.campusId !== "all" ||
    filters.vendorId !== "all" ||
    filters.stock !== "all";

  const clearFilters = useCallback(() => {
    patchFilters(DEFAULT_MARKETPLACE_FILTERS);
  }, [patchFilters]);

  return (
    <>
      <AdminPageHeader
        title="Marketplace"
        description="Every product listing across all vendor storefronts. Derived from the real catalog, read-only."
        actions={
          <span className="inline-flex items-center gap-1.5 rounded-md border border-kampmax-border bg-white px-3 py-1.5 text-xs font-medium text-kampmax-text-secondary">
            <Boxes className="h-3.5 w-3.5" />
            {countsData ? `${countsData.all} listings` : "…"}
          </span>
        }
      />

      {/* Visibility summary */}
      <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-1 rounded-lg border border-kampmax-border bg-white px-4 py-2.5 text-xs text-kampmax-text-secondary">
        <span>
          Live <strong className="font-semibold text-kampmax-success">{countsData?.live ?? "…"}</strong>
        </span>
        <span>
          Paused storefront{" "}
          <strong className="font-semibold tabular-nums">{countsData?.paused_storefront ?? "…"}</strong>
        </span>
        <span>
          Unpublished <strong className="font-semibold tabular-nums">{countsData?.unpublished ?? "…"}</strong>
        </span>
        <span className="text-kampmax-border">•</span>
        <span>
          Sold <strong className="font-semibold tabular-nums">{countsData?.sold ?? "…"}</strong>
        </span>
        <span>
          Removed <strong className="font-semibold tabular-nums">{countsData?.removed ?? "…"}</strong>
        </span>
      </div>

      <div className="mb-4">
        <MarketplaceFilters
          filters={filters}
          counts={countsData}
          facets={facetsData}
          onChange={patchFilters}
        />
      </div>

      <MarketplaceTable
        page={data ?? null}
        loading={isLoading}
        error={!!error}
        sortBy={sortBy}
        sortDir={sortDir}
        onSort={toggleSort}
        onRetry={onRetry}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
      />

      {data && data.total > 0 && (
        <Pagination
          page={data.page}
          pageSize={pageSize}
          total={data.total}
          totalPages={data.totalPages}
          onPageChange={setPage}
          onPageSizeChange={(n) => {
            setPageSize(n);
            setPage(1);
          }}
        />
      )}
    </>
  );
}

function MarketplaceSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-64 animate-pulse rounded bg-kampmax-muted" />
      <div className="h-24 animate-pulse rounded-lg bg-white ring-1 ring-kampmax-border" />
      <div className="h-80 animate-pulse rounded-lg bg-white ring-1 ring-kampmax-border" />
    </div>
  );
}