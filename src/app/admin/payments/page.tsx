"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Clock, CreditCard, Wallet } from "lucide-react";
import { formatNairaCompact } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { Pagination } from "@/components/admin/Pagination";
import {
  PaymentsFilters,
  type PaymentsFilterState,
} from "@/components/admin/payments/PaymentsFilters";
import { PaymentsTable } from "@/components/admin/payments/PaymentsTable";
import { paymentManagementService } from "@/services/admin";
import type {
  ManagedPayment,
  ManagedPaymentMethod,
  ManagedPaymentStatus,
  Paginated,
  PaymentFacets,
  PaymentSortField,
} from "@/types/admin";

export default function AdminPaymentsPage() {
  return (
    <Suspense fallback={<LoadingSkeleton variant="cards" rows={4} />}>
      <PaymentsConsole />
    </Suspense>
  );
}

const VALID_STATUSES: ManagedPaymentStatus[] = [
  "pending",
  "successful",
  "failed",
  "reversed",
  "refunded",
  "partially_refunded",
];
const VALID_METHODS: ManagedPaymentMethod[] = ["wallet", "paystack", "other"];

function parseInitialFilters(params: URLSearchParams): PaymentsFilterState {
  const status = params.get("status") as ManagedPaymentStatus;
  const method = params.get("method") as ManagedPaymentMethod;
  return {
    search: params.get("q") ?? "",
    status: VALID_STATUSES.includes(status) ? status : "all",
    method: VALID_METHODS.includes(method) ? method : "all",
    campusId: params.get("campus") ?? "",
    vendorId: params.get("vendor") ?? "",
  };
}

function PaymentsConsole() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<PaymentsFilterState>(() =>
    parseInitialFilters(new URLSearchParams(window.location.search))
  );
  const debouncedSearch = useDebounce(filters.search, 350);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [sortBy, setSortBy] = useState<PaymentSortField>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [list, setList] = useState<Paginated<ManagedPayment> | null>(null);
  const [counts, setCounts] = useState<Awaited<
    ReturnType<typeof paymentManagementService.getCounts>
  > | null>(null);
  const [facets, setFacets] = useState<PaymentFacets | null>(null);
  const [campusNames, setCampusNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadList = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const result = await paymentManagementService.list({
        search: debouncedSearch.trim() || undefined,
        status: filters.status,
        method: filters.method,
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
          paymentManagementService.getCounts(),
          paymentManagementService.getFacets(),
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

  function patchFilters(patch: Partial<PaymentsFilterState>) {
    setFilters((f) => ({ ...f, ...patch }));
    setPage(1);

    const next = { ...filters, ...patch };
    const params = new URLSearchParams();
    if (next.search.trim()) params.set("q", next.search.trim());
    if (next.status !== "all") params.set("status", next.status);
    if (next.method !== "all") params.set("method", next.method);
    if (next.campusId) params.set("campus", next.campusId);
    if (next.vendorId) params.set("vendor", next.vendorId);
    const qs = params.toString();
    router.replace(qs ? `/admin/payments?${qs}` : "/admin/payments", { scroll: false });
  }

  function toggleSort(field: PaymentSortField) {
    if (field === sortBy) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir(field === "createdAt" ? "desc" : "asc");
    }
    setPage(1);
  }

  const hasActiveFilters =
    filters.search.trim().length > 0 ||
    filters.status !== "all" ||
    filters.method !== "all" ||
    Boolean(filters.campusId) ||
    Boolean(filters.vendorId);

  return (
    <>
      <AdminPageHeader
        title="Payments"
        description="Transaction ledger across the marketplace - settlements, refunds and reversals."
        actions={
          counts && (
            <>
              <span className="hidden h-9 items-center gap-1.5 rounded-md border border-kampmax-border bg-white px-3 text-xs font-medium text-kampmax-text-secondary sm:inline-flex">
                <CreditCard className="h-3.5 w-3.5 opacity-60" />
                {formatNairaCompact(counts.totalVolume)} settled volume
              </span>
              <span className="hidden h-9 items-center gap-1.5 rounded-md border border-amber-300 bg-amber-50 px-3 text-xs font-medium text-amber-700 md:inline-flex">
                <Clock className="h-3.5 w-3.5" />
                {formatNairaCompact(counts.settlementPending)} pending
              </span>
              <span className="hidden h-9 items-center gap-1.5 rounded-md border border-kampmax-border bg-white px-3 text-xs font-medium text-kampmax-text-secondary xl:inline-flex">
                <Wallet className="h-3.5 w-3.5 opacity-60" />
                {counts.all} transactions
              </span>
            </>
          )
        }
      />

      <PaymentsFilters filters={filters} facets={facets} onChange={patchFilters} />

      <PaymentsTable
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
          patchFilters({ search: "", status: "all", method: "all", campusId: "", vendorId: "" })
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
