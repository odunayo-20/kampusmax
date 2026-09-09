"use client";

import { useCallback, useEffect, useMemo, useState, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Receipt } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Pagination } from "@/components/admin/Pagination";
import {
  TransactionsFilters,
  DEFAULT_TRANSACTION_FILTERS,
  type TransactionFilterState,
} from "@/components/admin/transactions/TransactionsFilters";
import { TransactionsTable } from "@/components/admin/transactions/TransactionsTable";
import { TRANSACTION_STATUS_TABS } from "@/components/admin/transactions/transactions-meta";
import { useDebounce } from "@/hooks/use-debounce";
import {
  useAdminTransactionCounts,
  useAdminTransactionFacets,
  useAdminTransactions,
} from "@/hooks/admin/use-admin-transactions";
import type {
  ManagedTransactionMethod,
  ManagedTransactionSortField,
  ManagedTransactionStatus,
  ManagedTransactionType,
  SortDir,
} from "@/types/admin";
import { formatNaira, formatNairaCompact } from "@/lib/utils";

function parseInitialFilters(params: URLSearchParams): TransactionFilterState {
  const rawStatus = params.get("status");
  const validStatus = TRANSACTION_STATUS_TABS as (ManagedTransactionStatus | "all")[];
  const validType = ["all", "order_payment", "wallet_funding", "refund"] as (
    | ManagedTransactionType
    | "all"
  )[];
  const validMethod = ["all", "paystack", "wallet", "cod", "bank_transfer"] as (
    | ManagedTransactionMethod
    | "all"
  )[];
  return {
    search: params.get("q") ?? "",
    status:
      rawStatus && validStatus.includes(rawStatus as ManagedTransactionStatus | "all")
        ? (rawStatus as ManagedTransactionStatus | "all")
        : "all",
    type:
      params.get("type") && validType.includes(params.get("type") as ManagedTransactionType | "all")
        ? (params.get("type") as ManagedTransactionType | "all")
        : "all",
    method:
      params.get("method") && validMethod.includes(params.get("method") as ManagedTransactionMethod | "all")
        ? (params.get("method") as ManagedTransactionMethod | "all")
        : "all",
  };
}

function parseInitialPage(params: URLSearchParams): number {
  const rawPage = Number.parseInt(params.get("page") ?? "", 10);
  return Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
}

export default function AdminTransactionsPage() {
  return (
    <Suspense fallback={<TransactionsSkeleton />}>
      <AdminTransactionsPageInner />
    </Suspense>
  );
}

function AdminTransactionsPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [filters, setFilters] = useState<TransactionFilterState>(() =>
    parseInitialFilters(new URLSearchParams(searchParams.toString()))
  );
  const [sortBy, setSortBy] = useState<ManagedTransactionSortField>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(() =>
    parseInitialPage(new URLSearchParams(searchParams.toString()))
  );
  const [pageSize] = useState(10);

  const debouncedSearch = useDebounce(filters.search.trim(), 350);
  const query = useMemo(
    () => ({
      search: debouncedSearch,
      status: filters.status === "all" ? undefined : filters.status,
      type: filters.type === "all" ? undefined : filters.type,
      method: filters.method === "all" ? undefined : filters.method,
      sortBy,
      sortDir,
      page,
      pageSize,
    }),
    [debouncedSearch, filters, sortBy, sortDir, page, pageSize]
  );

  const { data, isLoading, error, refetch } = useAdminTransactions(query);
  const countsQuery = useAdminTransactionCounts();
  const facetsQuery = useAdminTransactionFacets();

  // Sync non-sensitive filters to URL (debounced to avoid history spam).
  const urlParams = searchParams.toString();
  useEffect(() => {
    const timer = setTimeout(() => {
      const sp = new URLSearchParams();
      if (filters.search.trim()) sp.set("q", filters.search.trim());
      if (filters.status !== "all") sp.set("status", filters.status);
      if (filters.type !== "all") sp.set("type", filters.type);
      if (filters.method !== "all") sp.set("method", filters.method);
      if (page > 1) sp.set("page", String(page));
      const next = sp.toString();
      if (next !== urlParams) router.replace(`${pathname}?${next}`, { scroll: false });
    }, 350);
    return () => clearTimeout(timer);
  }, [filters, page, urlParams, router, pathname]);

  const patchFilters = useCallback((patch: Partial<TransactionFilterState>) => {
    setFilters((f) => ({ ...f, ...patch }));
    setPage(1);
  }, []);

  const toggleSort = useCallback(
    (field: ManagedTransactionSortField) => {
      if (field === sortBy) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortBy(field);
        setSortDir(field === "amount" ? "desc" : "desc");
      }
      setPage(1);
    },
    [sortBy]
  );

  const counts = countsQuery.data ?? null;
  const facets = facetsQuery.data ?? null;
  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.status !== "all" ||
    filters.type !== "all" ||
    filters.method !== "all";

  const clearFilters = useCallback(() => {
    patchFilters(DEFAULT_TRANSACTION_FILTERS);
  }, [patchFilters]);

  return (
    <>
      <AdminPageHeader
        title="Transactions"
        description="Single financial ledger derived from the real order and wallet stores. Replaces the fabricated /admin/payments console — every figure here traces to a real record."
        actions={
          <span className="inline-flex items-center gap-1.5 rounded-md border border-kampmax-border bg-white px-3 py-1.5 text-xs font-medium text-kampmax-text-secondary">
            <Receipt className="h-3.5 w-3.5" />
            {counts ? `${counts.all} records · ${formatNairaCompact(counts.totalVolume)}` : "…"}
          </span>
        }
      />

      {/* Ledger summary (all values derived from the real ledger) */}
      <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-1 rounded-lg border border-kampmax-border bg-white px-4 py-2.5 text-xs text-kampmax-text-secondary">
        <span>
          Successful{" "}
          <strong className="font-semibold tabular-nums text-kampmax-success">
            {counts?.byStatus.successful ?? "…"}
          </strong>
        </span>
        <span>
          Pending{" "}
          <strong className="font-semibold tabular-nums text-kampmax-warning">
            {counts?.byStatus.pending ?? "…"}
          </strong>
        </span>
        <span>
          Refunded{" "}
          <strong className="font-semibold tabular-nums text-kampmax-gold-dark">
            {counts?.byStatus.refunded ?? "…"}
          </strong>
        </span>
        <span>
          Processing{" "}
          <strong className="font-semibold tabular-nums">{counts?.byStatus.processing ?? "…"}</strong>
        </span>
        <span>
          Failed{" "}
          <strong className="font-semibold tabular-nums text-kampmax-error">
            {counts?.byStatus.failed ?? "…"}
          </strong>
        </span>
        <span className="text-kampmax-border">•</span>
        <span>
          Order payments{" "}
          <strong className="font-semibold tabular-nums">{counts?.byType.order_payment ?? "…"}</strong>
        </span>
        <span>
          Wallet funding{" "}
          <strong className="font-semibold tabular-nums">{counts?.byType.wallet_funding ?? "…"}</strong>
        </span>
        <span>
          Refunds{" "}
          <strong className="font-semibold tabular-nums">{counts?.byType.refund ?? "…"}</strong>
        </span>
        <span className="text-kampmax-border">•</span>
        <span>
          Total volume{" "}
          <strong className="font-semibold tabular-nums">
            {counts ? formatNaira(counts.totalVolume) : "…"}
          </strong>
        </span>
      </div>

      <div className="mb-4 flex items-start gap-2 rounded-lg border border-kampmax-border bg-kampmax-surface-hover/50 px-4 py-2.5 text-xs text-kampmax-text-secondary">
        <span>
          <strong className="font-medium">Scope note:</strong> refunds, payouts and wallet
          movements stay where their real backend lives — this ledger covers order payments,
          wallet funding and explicit refund records only. Provider (gateway) verification is
          not wired into the prototype backend, so no record carries a gateway reference.
        </span>
      </div>

      <TransactionsFilters
        filters={filters}
        onChange={patchFilters}
        counts={counts?.byStatus ?? {
          successful: 0,
          pending: 0,
          processing: 0,
          failed: 0,
          refunded: 0,
          cancelled: 0,
        }}
        facets={facets}
      />

      {hasActiveFilters && (
        <div className="mt-2 flex items-center gap-2">
          <button
            onClick={clearFilters}
            className="rounded-md border border-kampmax-border px-2.5 py-1 text-xs font-medium text-kampmax-text-muted hover:text-kampmax-text"
          >
            Clear all filters
          </button>
        </div>
      )}

      <div className="mt-4">
        {isLoading && !data ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-kampmax-surface-hover" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-lg border border-kampmax-error/30 bg-kampmax-error/5 p-6 text-center">
            <p className="text-sm font-medium text-kampmax-error">Failed to load transactions</p>
            <p className="mt-1 text-xs text-kampmax-text-muted">{String(error)}</p>
            <button
              onClick={() => void refetch()}
              className="mt-3 rounded-md bg-kampmax-primary px-4 py-1.5 text-xs font-medium text-white hover:bg-kampmax-primary/90"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <TransactionsTable
              rows={data?.items ?? []}
              sortBy={sortBy}
              sortDir={sortDir}
              onSort={toggleSort}
              onOpen={(id) => router.push(`/admin/transactions/${id}`)}
              emptyHint={
                hasActiveFilters
                  ? "No transactions match the current filters."
                  : "No transaction records exist in the real order and wallet stores yet."
              }
            />

            {data && data.totalPages > 1 && (
              <div className="mt-4 flex justify-end">
                <Pagination
                  page={data.page}
                  pageSize={data.pageSize}
                  total={data.total}
                  totalPages={data.totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

function TransactionsSkeleton() {
  return (
    <>
      <div className="mb-6 h-10 w-48 animate-pulse rounded bg-kampmax-surface-hover" />
      <div className="mb-4 h-6 w-full animate-pulse rounded bg-kampmax-surface-hover" />
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-lg bg-kampmax-surface-hover" />
        ))}
      </div>
    </>
  );
}