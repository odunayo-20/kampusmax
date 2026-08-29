"use client";

import { useEffect, useMemo, useState, use } from "react";
import { MessageSquare } from "lucide-react";
import { listVendorReviews, getVendorReviewCounts, getVendorReviewSummary, getVendorReviewPermissions } from "@/services/vendor-reviews";
import { getProducts } from "@/services/products";
import { ReviewsHeader } from "@/components/vendor-reviews/ReviewsHeader";
import { ReviewSummaryCard } from "@/components/vendor-reviews/ReviewSummaryCard";
import { ReviewsToolbar } from "@/components/vendor-reviews/ReviewsToolbar";
import { VendorReviewListItem } from "@/components/vendor-reviews/VendorReviewListItem";
import { VendorPagination } from "@/components/vendor-shared/VendorPagination";
import { ReviewsSkeleton } from "@/components/vendor-reviews/ReviewsSkeleton";
import type { VendorReviewScope, VendorReviewResponseFilter, VendorReviewRatingBand, VendorReviewSortField } from "@/types/vendor-reviews";

const PAGE_SIZE = 10;

export default function VendorReviewsPage({ params }: { params: Promise<{}> }) {
  use(params);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [scope, setScope] = useState<VendorReviewScope>("all");
  const [responseStatus, setResponseStatus] = useState<VendorReviewResponseFilter>("all");
  const [ratingBand, setRatingBand] = useState<VendorReviewRatingBand>("all");
  const [star, setStar] = useState<number | null>(null);
  const [sort, setSort] = useState<VendorReviewSortField>("newest");
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  const counts = useMemo(() => getVendorReviewCounts(), []);
  const summary = useMemo(() => getVendorReviewSummary(), []);

  const result = useMemo(
    () =>
      listVendorReviews({
        search: search || undefined,
        scope,
        responseStatus,
        ratingBand,
        star: star ?? undefined,
        sort,
        page,
        pageSize: PAGE_SIZE,
      }),
    [search, scope, responseStatus, ratingBand, star, sort, page, tick]
  );

  const permissions = useMemo(() => getVendorReviewPermissions(), []);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 250);
    return () => clearTimeout(timer);
  }, []);

  function refresh() {
    setTick((t) => t + 1);
  }

  const hasActiveFilters =
    search !== "" || scope !== "all" || responseStatus !== "all" || ratingBand !== "all" || star !== null;

  const clearFilters = () => {
    setSearch("");
    setScope("all");
    setResponseStatus("all");
    setRatingBand("all");
    setStar(null);
    setSort("newest");
    setPage(1);
  };

  return (
    <div className="space-y-4">
      <ReviewsHeader counts={counts} />

      <ReviewSummaryCard summary={summary} starFilter={star} onStarChange={(s) => { setStar(s); setPage(1); }} />

      <div className="rounded-xl border border-kampmax-border bg-white p-4">
        <ReviewsToolbar
          searchValue={search}
          onSearchChange={(v) => { setSearch(v); setPage(1); }}
          scope={scope}
          onScopeChange={(v) => { setScope(v); setPage(1); }}
          responseStatus={responseStatus}
          onResponseChange={(v) => { setResponseStatus(v); setPage(1); }}
          ratingBand={ratingBand}
          onRatingBandChange={(v) => { setRatingBand(v); setPage(1); }}
          sort={sort}
          onSortChange={(v) => { setSort(v); setPage(1); }}
          total={result.total}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearFilters}
        />

        <div className="mt-4">
          {loading ? (
            <ReviewsSkeleton />
          ) : result.items.length === 0 ? (
            <div className="rounded-xl border border-kampmax-border bg-white p-10 text-center">
              <MessageSquare className="mx-auto mb-3 h-10 w-10 text-kampmax-text-secondary" aria-hidden />
              <p className="text-sm font-medium text-kampmax-text">No reviews found</p>
              <p className="mt-1 text-xs text-kampmax-text-secondary">
                Try adjusting your search or filters.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {result.items.map((review) => (
                <VendorReviewListItem
                  key={review.id}
                  review={review}
                  productTitle={review.target === "product" ? getProducts().find((p) => p.id === review.productId)?.title : undefined}
                  permissions={permissions}
                  onChanged={refresh}
                />
              ))}
            </div>
          )}
        </div>

        <VendorPagination
          page={result.page}
          totalPages={result.totalPages}
          total={result.total}
          pageSize={result.pageSize}
          itemLabel="reviews"
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}