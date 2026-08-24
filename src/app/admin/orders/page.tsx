"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, ShoppingBag, Wallet } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { Pagination } from "@/components/admin/Pagination";
import {
  OrdersFilters,
  type OrdersFilterState,
} from "@/components/admin/orders/OrdersFilters";
import { OrdersTable } from "@/components/admin/orders/OrdersTable";
import { orderManagementService } from "@/services/admin";
import type {
  ManagedOrder,
  ManagedOrderPaymentStatus,
  ManagedOrderStatus,
  OrderFacets,
  OrderSortField,
  Paginated,
} from "@/types/admin";

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<LoadingSkeleton variant="cards" rows={4} />}>
      <OrdersConsole />
    </Suspense>
  );
}

const VALID_STATUSES: ManagedOrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "ready_for_pickup",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "disputed",
];
const VALID_PAYMENTS: ManagedOrderPaymentStatus[] = [
  "pending",
  "paid",
  "failed",
  "refunded",
  "partially_refunded",
];
const VALID_FULFILLMENT = ["campus_pickup", "meetup", "delivery"] as const;

function parseInitialFilters(params: URLSearchParams): OrdersFilterState {
  const status = params.get("status") as ManagedOrderStatus;
  const paymentStatus = params.get("payment") as ManagedOrderPaymentStatus;
  const fulfillment = params.get("fulfillment");
  return {
    search: params.get("q") ?? "",
    status: VALID_STATUSES.includes(status) ? status : "all",
    paymentStatus: VALID_PAYMENTS.includes(paymentStatus) ? paymentStatus : "all",
    fulfillment: (VALID_FULFILLMENT as readonly string[]).includes(fulfillment ?? "")
      ? (fulfillment as (typeof VALID_FULFILLMENT)[number])
      : "all",
    campusId: params.get("campus") ?? "",
    vendorId: params.get("vendor") ?? "",
  };
}

function OrdersConsole() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<OrdersFilterState>(() =>
    parseInitialFilters(new URLSearchParams(window.location.search))
  );
  const debouncedSearch = useDebounce(filters.search, 350);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [sortBy, setSortBy] = useState<OrderSortField>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [list, setList] = useState<Paginated<ManagedOrder> | null>(null);
  const [counts, setCounts] = useState<Awaited<
    ReturnType<typeof orderManagementService.getCounts>
  > | null>(null);
  const [facets, setFacets] = useState<OrderFacets | null>(null);
  const [campusNames, setCampusNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadList = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const result = await orderManagementService.list({
        search: debouncedSearch.trim() || undefined,
        status: filters.status,
        paymentStatus: filters.paymentStatus,
        fulfillment: filters.fulfillment === "all" ? undefined : filters.fulfillment,
        campusId: filters.campusId || undefined,
        vendorId: filters.vendorId || undefined,
        sortBy,
        sortDir,
        page,
        pageSize,
      });
      setList(result);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filters, sortBy, sortDir, page, pageSize]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [c, f] = await Promise.all([
          orderManagementService.getCounts(),
          orderManagementService.getFacets(),
        ]);
        if (cancelled) return;
        setCounts(c);
        setFacets(f);
        setCampusNames(Object.fromEntries(f.campuses.map((x) => [x.id, x.name])));
      } catch {
        /* non-critical */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function patchFilters(patch: Partial<OrdersFilterState>) {
    setFilters((f) => ({ ...f, ...patch }));
    setPage(1);

    const next = { ...filters, ...patch };
    const params = new URLSearchParams();
    if (next.search.trim()) params.set("q", next.search.trim());
    if (next.status !== "all") params.set("status", next.status);
    if (next.paymentStatus !== "all") params.set("payment", next.paymentStatus);
    if (next.fulfillment !== "all") params.set("fulfillment", next.fulfillment);
    if (next.campusId) params.set("campus", next.campusId);
    if (next.vendorId) params.set("vendor", next.vendorId);
    const qs = params.toString();
    router.replace(qs ? `/admin/orders?${qs}` : "/admin/orders", { scroll: false });
  }

  function toggleSort(field: OrderSortField) {
    if (field === sortBy) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir(field === "createdAt" ? "desc" : field === "orderNumber" ? "asc" : "desc");
    }
    setPage(1);
  }

  const hasActiveFilters =
    filters.search.trim().length > 0 ||
    filters.status !== "all" ||
    filters.paymentStatus !== "all" ||
    filters.fulfillment !== "all" ||
    Boolean(filters.campusId) ||
    Boolean(filters.vendorId);

  const showDisputeBanner =
    counts != null &&
    counts.byStatus.disputed > 0 &&
    filters.status !== "disputed";

  return (
    <>
      <AdminPageHeader
        title="Orders"
        description="Every checkout across campuses - track fulfilment, payment and disputes."
        actions={
          counts && (
            <>
              <span className="hidden h-9 items-center gap-1.5 rounded-md border border-kampmax-border bg-white px-3 text-xs font-medium text-kampmax-text-secondary sm:inline-flex">
                <ShoppingBag className="h-3.5 w-3.5 opacity-60" />
                {counts.all} orders ·{" "}
                {counts.byStatus.confirmed +
                  counts.byStatus.preparing +
                  counts.byStatus.ready_for_pickup +
                  counts.byStatus.out_for_delivery}{" "}
                in progress
              </span>
              <span className="hidden h-9 items-center gap-1.5 rounded-md border border-kampmax-border bg-white px-3 text-xs font-medium text-kampmax-text-secondary xl:inline-flex">
                <Wallet className="h-3.5 w-3.5 opacity-60" />
                {counts.paymentIssues} payment issues
              </span>
            </>
          )
        }
      />

      {showDisputeBanner && counts && (
        <button
          type="button"
          onClick={() => patchFilters({ status: "disputed" })}
          className="mb-3 flex w-full items-center justify-between gap-3 rounded-lg border border-kampmax-error/30 bg-kampmax-error/10 px-4 py-2.5 text-left transition-colors hover:bg-kampmax-error/15"
        >
          <span className="flex min-w-0 items-center gap-2 text-sm text-red-700">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span className="truncate">
              {counts.byStatus.disputed} disputed order
              {counts.byStatus.disputed === 1 ? "" : "s"} need{counts.byStatus.disputed === 1 ? "s" : ""} attention
            </span>
          </span>
          <span className="shrink-0 text-xs font-medium text-kampmax-blue">Review disputes</span>
        </button>
      )}

      <OrdersFilters filters={filters} facets={facets} onChange={patchFilters} />

      <OrdersTable
        page={list}
        loading={loading}
        error={error}
        campusNames={campusNames}
        sortBy={sortBy}
        sortDir={sortDir}
        onSort={toggleSort}
        onRetry={() => void loadList()}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={() =>
          patchFilters({
            search: "",
            status: "all",
            paymentStatus: "all",
            fulfillment: "all",
            campusId: "",
            vendorId: "",
          })
        }
      />

      {list && list.totalPages > 1 && (
        <div className="mt-3 flex justify-center">
          <Pagination
            page={list.page}
            pageSize={list.pageSize}
            total={list.total}
            totalPages={list.totalPages}
            onPageChange={setPage}
            onPageSizeChange={(n) => {
              setPage(1);
              setPageSize(n);
            }}
          />
        </div>
      )}
    </>
  );
}
