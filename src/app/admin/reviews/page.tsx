"use client";

import { useCallback, useEffect, useMemo, useState, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Star } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Pagination } from "@/components/admin/Pagination";
import {
  ReviewFilters,
  DEFAULT_REVIEW_FILTERS,
  type ReviewFilterState,
  type ReviewRatingFilter,
} from "@/components/admin/reviews/ReviewFilters";
import { ReviewsTable } from "@/components/admin/reviews/ReviewsTable";
import {
  REVIEW_RESPONSE_OPTIONS,
  REVIEW_STATUS_TABS,
  REVIEW_TARGET_TYPE_OPTIONS,
} from "@/components/admin/reviews/reviews-meta";
import { useDebounce } from "@/hooks/use-debounce";
import {
  useAdminReviewCounts,
  useAdminReviewFacets,
  useAdminReviews,
} from "@/hooks/admin/use-admin-reviews";
import type {
  ManagedReviewStatus,
  ManagedReviewTargetType,
  SortDir,
} from "@/types/admin";
import type { ManagedReviewSortField } from "@/services/admin";

function parseInitialFilters(params: URLSearchParams): ReviewFilterState {
  const rawStatus = params.get("status");
  const rawTarget = params.get("target");
  const rawResponse = params.get("response");
  const rawRating = params.get("rating");
  const validStatus = REVIEW_STATUS_TABS as (ManagedReviewStatus | "all")[];
  const validTarget = REVIEW_TARGET_TYPE_OPTIONS as (ManagedReviewTargetType | "all")[];
  const validResponse = REVIEW_RESPONSE_OPTIONS as ("all" | "answered" | "unanswered")[];
  return {
    search: params.get("q") ?? "",
    status:
      rawStatus && validStatus.includes(rawStatus as ManagedReviewStatus | "all")
        ? (rawStatus as ManagedReviewStatus | "all")
        : "all",
    rating: isRatingKey(rawRating) ? rawRating : "all",
    targetType:
      rawTarget && validTarget.includes(rawTarget as ManagedReviewTargetType | "all")
        ? (rawTarget as ManagedReviewTargetType | "all")
        : "all",
    vendorId: params.get("vendor") ?? "all",
    response:
      rawResponse && validResponse.includes(rawResponse as "all" | "answered" | "unanswered")
        ? (rawResponse as "all" | "answered" | "unanswered")
        : "all",
    reportedOnly: params.get("reported") === "1",
  };
}

function isRatingKey(value: string | null): value is ReviewRatingFilter {
  return value === "all" || (value !== null && /^[1-5]$/.test(value));
}

function parseInitialPage(params: URLSearchParams): number {
  const rawPage = Number.parseInt(params.get("page") ?? "", 10);
  return Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
}

export default function AdminReviewsPage() {
  return (
    <Suspense fallback={<ReviewsSkeleton />}>
      <AdminReviewsPageInner />
    </Suspense>
  );
}

function AdminReviewsPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [filters, setFilters] = useState<ReviewFilterState>(() =>
    parseInitialFilters(new URLSearchParams(searchParams.toString()))
  );
  const [sortBy, setSortBy] = useState<ManagedReviewSortField>("createdAt");
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
      rating:
        filters.rating === "all" ? undefined : (Number(filters.rating) as 1 | 2 | 3 | 4 | 5),
      targetType: filters.targetType === "all" ? undefined : filters.targetType,
      vendorId: filters.vendorId === "all" ? undefined : filters.vendorId,
      response: filters.response === "all" ? undefined : filters.response,
      reportedOnly: filters.reportedOnly || undefined,
      sortBy,
      sortDir,
      page,
      pageSize,
    }),
    [debouncedSearch, filters, sortBy, sortDir, page, pageSize]
  );

  // ----- data hooks (always called at top level) -----
  const { data, error, isLoading, refetch } = useAdminReviews(query);
  const counts = useAdminReviewCounts();
  const facets = useAdminReviewFacets();

  // Non-sensitive filters persist to the URL so views are shareable and
  // survive reloads (never the raw search term per keystroke).
  const urlParams = searchParams.toString();
  useEffect(() => {
    const timer = setTimeout(() => {
      const sp = new URLSearchParams();
      const trimmed = filters.search.trim();
      if (trimmed) sp.set("q", trimmed);
      if (filters.status !== "all") sp.set("status", filters.status);
      if (filters.rating !== "all") sp.set("rating", filters.rating);
      if (filters.targetType !== "all") sp.set("target", filters.targetType);
      if (filters.vendorId !== "all") sp.set("vendor", filters.vendorId);
      if (filters.response !== "all") sp.set("response", filters.response);
      if (filters.reportedOnly) sp.set("reported", "1");
      if (page > 1) sp.set("page", String(page));
      const next = sp.toString();
      if (next !== urlParams) router.replace(`${pathname}?${next}`, { scroll: false });
    }, 350);
    return () => clearTimeout(timer);
  }, [filters, page, urlParams, router, pathname]);

  const patchFilters = useCallback((patch: Partial<ReviewFilterState>) => {
    setFilters((f) => ({ ...f, ...patch }));
    setPage(1);
  }, []);

  const toggleSort = useCallback(
    (field: ManagedReviewSortField) => {
      if (field === sortBy) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortBy(field);
        setSortDir(field === "createdAt" ? "desc" : "desc");
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
    filters.rating !== "all" ||
    filters.targetType !== "all" ||
    filters.vendorId !== "all" ||
    filters.response !== "all" ||
    filters.reportedOnly;

  const clearFilters = useCallback(() => {
    patchFilters(DEFAULT_REVIEW_FILTERS);
  }, [patchFilters]);

  return (
    <>
      <AdminPageHeader
        title="Reviews & Moderation"
        description="Every review left on products, stores and freelancer or employer profiles, with its status source, reports and signals. Read-only console over the real review stores."
        actions={
          <span className="inline-flex items-center gap-1.5 rounded-md border border-kampmax-border bg-white px-3 py-1.5 text-xs font-medium text-kampmax-text-secondary">
            <Star className="h-3.5 w-3.5" />
            {countsData ? `${countsData.all} reviews` : "…"}
          </span>
        }
      />

      {/* Pipeline summary */}
      <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-1 rounded-lg border border-kampmax-border bg-white px-4 py-2.5 text-xs text-kampmax-text-secondary">
        <span>
          Published{" "}
          <strong className="font-semibold tabular-nums text-kampmax-success">
            {countsData?.byStatus.published ?? "…"}
          </strong>
        </span>
        <span>
          Pending{" "}
          <strong className="font-semibold tabular-nums text-kampmax-info">
            {countsData?.byStatus.pending ?? "…"}
          </strong>
        </span>
        <span>
          Hidden{" "}
          <strong className="font-semibold tabular-nums text-kampmax-warning">
            {countsData?.byStatus.hidden ?? "…"}
          </strong>
        </span>
        <span>
          Removed{" "}
          <strong className="font-semibold tabular-nums text-kampmax-error">
            {countsData?.byStatus.removed ?? "…"}
          </strong>
        </span>
        <span className="text-kampmax-border">•</span>
        <span>
          Products <strong className="font-semibold tabular-nums">{countsData?.byTargetType.product ?? "…"}</strong>
        </span>
        <span>
          Vendors <strong className="font-semibold tabular-nums">{countsData?.byTargetType.vendor ?? "…"}</strong>
        </span>
        <span>
          Freelancers <strong className="font-semibold tabular-nums">{countsData?.byTargetType.freelancer ?? "…"}</strong>
        </span>
        <span>
          Employers <strong className="font-semibold tabular-nums">{countsData?.byTargetType.employer ?? "…"}</strong>
        </span>
        <span className="text-kampmax-border">•</span>
        <span className="text-kampmax-text-secondary">
          Attn.{" "}
          <strong className="font-semibold tabular-nums text-kampmax-text">
            {countsData?.needsAttention ?? "…"}
          </strong>
        </span>
        <span>
          With photos <strong className="font-semibold tabular-nums">{countsData?.withImages ?? "…"}</strong>
        </span>
        <span>
          With response <strong className="font-semibold tabular-nums">{countsData?.withResponse ?? "…"}</strong>
        </span>
      </div>

      <div className="mb-4">
        <ReviewFilters
          filters={filters}
          counts={countsData}
          facets={facetsData}
          onChange={patchFilters}
        />
      </div>

      <ReviewsTable
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
          unitLabel="reviews"
        />
      )}
    </>
  );
}

function ReviewsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-64 animate-pulse rounded bg-kampmax-muted" />
      <div className="h-24 animate-pulse rounded-lg bg-white ring-1 ring-kampmax-border" />
      <div className="h-80 animate-pulse rounded-lg bg-white ring-1 ring-kampmax-border" />
    </div>
  );
}