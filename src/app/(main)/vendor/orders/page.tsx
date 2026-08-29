"use client";

import { useEffect, useMemo, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { listVendorOrders, getVendorOrderCounts } from "@/services/vendor-orders";
import { OrderHeader } from "@/components/vendor-orders/OrderHeader";
import { OrdersToolbar } from "@/components/vendor-orders/OrdersToolbar";
import { OrdersFilters } from "@/components/vendor-orders/OrdersFilters";
import { OrdersTable } from "@/components/vendor-orders/OrdersTable";
import { OrdersGrid } from "@/components/vendor-orders/OrdersGrid";
import { OrdersPagination } from "@/components/vendor-orders/OrdersPagination";
import { OrderListSkeleton } from "@/components/vendor-orders/OrderSkeleton";
import type {
  VendorFulfillmentStatus,
  VendorPaymentStatus,
  VendorDeliveryMethod,
  VendorOrderSortField,
} from "@/types/vendor-orders";

const PAGE_SIZE = 12;

export default function VendorOrdersPage({ params }: { params: Promise<{}> }) {
  use(params);
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<VendorOrderSortField>("newest");
  const [fulfillmentStatus, setFulfillmentStatus] = useState<VendorFulfillmentStatus | "all">("all");
  const [paymentStatus, setPaymentStatus] = useState<VendorPaymentStatus | "all">("all");
  const [deliveryMethod, setDeliveryMethod] = useState<VendorDeliveryMethod | "all">("all");
  const [issues, setIssues] = useState<"all" | "with_issues">("all");
  const [loading, setLoading] = useState(true);

  const counts = useMemo(() => getVendorOrderCounts(), []);

  const result = useMemo(
    () =>
      listVendorOrders({
        search: search || undefined,
        fulfillmentStatus,
        paymentStatus,
        deliveryMethod,
        issues,
        sort,
        page,
        pageSize: PAGE_SIZE,
      }),
    [search, sort, fulfillmentStatus, paymentStatus, deliveryMethod, issues, page]
  );

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 250);
    return () => clearTimeout(timer);
  }, []);

  const hasActiveFilters =
    search !== "" ||
    fulfillmentStatus !== "all" ||
    paymentStatus !== "all" ||
    deliveryMethod !== "all" ||
    issues !== "all";

  const clearFilters = () => {
    setSearch("");
    setFulfillmentStatus("all");
    setPaymentStatus("all");
    setDeliveryMethod("all");
    setIssues("all");
    setPage(1);
  };

  return (
    <div className="space-y-4">
      <OrderHeader counts={counts} onViewAll={() => router.push("/vendor/orders")} />

      <OrdersToolbar
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        sortValue={sort}
        onSortChange={(v) => {
          setSort(v);
          setPage(1);
        }}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
      />

      <OrdersFilters
        fulfillmentStatus={fulfillmentStatus}
        onFulfillmentChange={(v) => {
          setFulfillmentStatus(v);
          setPage(1);
        }}
        paymentStatus={paymentStatus}
        onPaymentChange={(v) => {
          setPaymentStatus(v);
          setPage(1);
        }}
        deliveryMethod={deliveryMethod}
        onDeliveryChange={(v) => {
          setDeliveryMethod(v);
          setPage(1);
        }}
        issues={issues}
        onIssuesChange={(v) => {
          setIssues(v);
          setPage(1);
        }}
        counts={counts}
      />

      {loading ? (
        <OrderListSkeleton />
      ) : result.items.length === 0 ? (
        <div className="rounded-xl border border-kampmax-border bg-white p-10 text-center">
          <ShoppingCart className="mx-auto mb-3 h-10 w-10 text-kampmax-text-secondary" aria-hidden />
          <p className="text-sm font-medium text-kampmax-text">No orders found</p>
          <p className="mt-1 text-xs text-kampmax-text-secondary">
            Try adjusting your search or filters.
          </p>
        </div>
      ) : (
        <>
          <div className="hidden md:block">
            <OrdersTable orders={result.items} onView={(o) => router.push(`/vendor/orders/${o.id}`)} />
          </div>
          <div className="md:hidden">
            <OrdersGrid orders={result.items} onView={(o) => router.push(`/vendor/orders/${o.id}`)} />
          </div>

          <OrdersPagination
            page={result.page}
            totalPages={result.totalPages}
            total={result.total}
            pageSize={result.pageSize}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}