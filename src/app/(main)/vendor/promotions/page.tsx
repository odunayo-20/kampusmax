"use client";

import { useEffect, useMemo, useState, use } from "react";
import { listVendorPromotions, getVendorPromotionStats, getVendorPromotionPermissions } from "@/services/vendor-promotions";
import { PromotionsHeader } from "@/components/vendor-promotions/PromotionsHeader";
import { PromotionStatsBar } from "@/components/vendor-promotions/PromotionStatsBar";
import { PromotionsToolbar } from "@/components/vendor-promotions/PromotionsToolbar";
import { PromotionsTable } from "@/components/vendor-promotions/PromotionsTable";
import { PromotionsGrid } from "@/components/vendor-promotions/PromotionsGrid";
import { PromotionsSkeleton } from "@/components/vendor-promotions/PromotionsSkeleton";
import { VendorPagination } from "@/components/vendor-shared/VendorPagination";
import type { VendorPromotionStatus, VendorPromotionSortField } from "@/types/vendor-promotions";

const PAGE_SIZE = 10;

export default function VendorPromotionsPage({ params }: { params: Promise<{}> }) {
  use(params);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<VendorPromotionStatus | "all">("all");
  const [sort, setSort] = useState<VendorPromotionSortField>("newest");
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  const stats = useMemo(() => getVendorPromotionStats(), []);
  const permissions = useMemo(() => getVendorPromotionPermissions(), []);

  const result = useMemo(
    () =>
      listVendorPromotions({
        search: search || undefined,
        status,
        sort,
        page,
        pageSize: PAGE_SIZE,
      }),
    [search, status, sort, page, tick]
  );

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 250);
    return () => clearTimeout(timer);
  }, []);

  const hasActiveFilters = search !== "" || status !== "all";

  const clearFilters = () => {
    setSearch("");
    setStatus("all");
    setSort("newest");
    setPage(1);
  };

  return (
    <div className="space-y-4">
      <PromotionsHeader stats={stats} canCreate={permissions["promotions.create"]} />

      <PromotionStatsBar stats={stats} />

      <div className="rounded-xl border border-kampmax-border bg-white p-4">
        <PromotionsToolbar
          searchValue={search}
          onSearchChange={(v) => { setSearch(v); setPage(1); }}
          status={status}
          onStatusChange={(v) => { setStatus(v); setPage(1); }}
          sort={sort}
          onSortChange={(v) => { setSort(v); setPage(1); }}
          total={result.total}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearFilters}
        />

        <div className="mt-4">
          {loading ? (
            <PromotionsSkeleton />
          ) : (
            <>
              <div className="hidden md:block">
                <PromotionsTable promotions={result.items} permissions={permissions} onChanged={() => setTick((t) => t + 1)} />
              </div>
              <div className="md:hidden">
                <PromotionsGrid promotions={result.items} permissions={permissions} onChanged={() => setTick((t) => t + 1)} />
              </div>
            </>
          )}
        </div>

        <VendorPagination
          page={result.page}
          totalPages={result.totalPages}
          total={result.total}
          pageSize={result.pageSize}
          itemLabel="promotions"
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}