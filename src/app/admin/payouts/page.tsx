"use client";

import { useCallback, useEffect, useMemo, useState, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Send } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Pagination } from "@/components/admin/Pagination";
import {
  PayoutsFilters,
  DEFAULT_PAYOUT_FILTERS,
  type PayoutFilterState,
} from "@/components/admin/payouts/PayoutsFilters";
import { PayoutsTable } from "@/components/admin/payouts/PayoutsTable";
import { PAYOUT_STATUS_TABS } from "@/components/admin/payouts/payouts-meta";
import { useDebounce } from "@/hooks/use-debounce";
import {
  useAdminPayoutCounts,
  useAdminPayoutFacets,
  useAdminPayouts,
} from "@/hooks/admin/use-admin-payouts";
import type {
  ManagedPayoutMethod,
  ManagedPayoutRecipientType,
  ManagedPayoutSortField,
  ManagedPayoutStatus,
  SortDir,
} from "@/types/admin";
import { formatNaira, formatNairaCompact } from "@/lib/utils";

function parseInitialFilters(params: URLSearchParams): PayoutFilterState {
  const rawStatus = params.get("status");
  const validStatus = PAYOUT_STATUS_TABS as (ManagedPayoutStatus | "all")[];
  const validType = ["all", "vendor", "freelancer"] as (
    | ManagedPayoutRecipientType
    | "all"
  )[];
  const validMethod = ["all", "wallet", "bank_transfer"] as (
    | ManagedPayoutMethod
    | "all"
  )[];
  return {
    search: params.get("q") ?? "",
    status:
      rawStatus && validStatus.includes(rawStatus as ManagedPayoutStatus | "all")
        ? (rawStatus as ManagedPayoutStatus | "all")
        : "all",
    type:
      params.get("type") && validType.includes(params.get("type") as ManagedPayoutRecipientType | "all")
        ? (params.get("type") as ManagedPayoutRecipientType | "all")
        : "all",
    method:
      params.get("method") && validMethod.includes(params.get("method") as ManagedPayoutMethod | "all")
        ? (params.get("method") as ManagedPayoutMethod | "all")
        : "all",
  };
}

function parseInitialPage(params: URLSearchParams): number {
  const rawPage = Number.parseInt(params.get("page") ?? "", 10);
  return Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
}

export default function AdminPayoutsPage() {
  return (
    <Suspense fallback={<PayoutsSkeleton />}>
      <AdminPayoutsPageInner />
    </Suspense>
  );
}

function AdminPayoutsPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [filters, setFilters] = useState<PayoutFilterState>(() =>
    parseInitialFilters(new URLSearchParams(searchParams.toString()))
  );
  const [sortBy, setSortBy] = useState<ManagedPayoutSortField>("createdAt");
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

  const { data, isLoading, error, refetch } = useAdminPayouts(query);
  const countsQuery = useAdminPayoutCounts();
  const facetsQuery = useAdminPayoutFacets();

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

  const patchFilters = useCallback((patch: Partial<PayoutFilterState>) => {
    setFilters((f) => ({ ...f, ...patch }));
    setPage(1);
  }, []);

  const toggleSort = useCallback(
    (field: ManagedPayoutSortField) => {
      if (field === sortBy) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortBy(field);
        setSortDir("desc");
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
    patchFilters(DEFAULT_PAYOUT_FILTERS);
  }, [patchFilters]);

  return (
    <>
      <AdminPageHeader
        title="Payouts"
        description="Recipient payout ledger for vendors and freelancers, derived from the real wallet, vendor-financials and freelancer-financials stores. Every figure here traces to a real payout record."
        actions={
          <span className="inline-flex items-center gap-1.5 rounded-md border border-kampmax-border bg-white px-3 py-1.5 text-xs font-medium text-kampmax-text-secondary">
            <Send className="h-3.5 w-3.5" />
            {counts ? `${counts.all} records · ${formatNairaCompact(counts.totalVolume)}` : "…"}
          </span>
        }
      />

      {/* Payout summary (all values derived from the real payout records) */}
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
          Processing{" "}
          <strong className="font-semibold tabular-nums">{counts?.byStatus.processing ?? "…"}</strong>
        </span>
        <span>
          Failed{" "}
          <strong className="font-semibold tabular-nums text-kampmax-error">
            {counts?.byStatus.failed ?? "…"}
          </strong>
        </span>
        <span>
          Reversed{" "}
          <strong className="font-semibold tabular-nums">{counts?.byStatus.reversed ?? "…"}</strong>
        </span>
        <span className="text-kampmax-border">•</span>
        <span>
          Vendors{" "}
          <strong className="font-semibold tabular-nums">{counts?.byRecipientType.vendor ?? "…"}</strong>
        </span>
        <span>
          Freelancers{" "}
          <strong className="font-semibold tabular-nums">{counts?.byRecipientType.freelancer ?? "…"}</strong>
        </span>
        <span>
          Wallet{" "}
          <strong className="font-semibold tabular-nums">{counts?.byMethod.wallet ?? "…"}</strong>
        </span>
        <span>
          Bank transfer{" "}
          <strong className="font-semibold tabular-nums">{counts?.byMethod.bank_transfer ?? "…"}</strong>
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
          <strong className="font-medium">Scope note:</strong> this console covers recipient payouts
          only — customer funding and refunds live on the Transactions ledger, customer withdrawals
          live on the Withdrawals console, and reconciliation/statements follow in a later module.
          Payout account numbers are shown exactly as the owning stores mask them. No disbursement
          provider is wired into the prototype backend, so no record carries a provider reference.
        </span>
      </div>

      <PayoutsFilters
        filters={filters}
        onChange={patchFilters}
        counts={counts?.byStatus ?? {
          successful: 0,
          pending: 0,
          processing: 0,
          failed: 0,
          reversed: 0,
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
            <p className="text-sm font-medium text-kampmax-error">Failed to load payouts</p>
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
            <PayoutsTable
              rows={data?.items ?? []}
              sortBy={sortBy}
              sortDir={sortDir}
              onSort={toggleSort}
              onOpen={(id) => router.push(`/admin/payouts/${id}`)}
              emptyHint={
                hasActiveFilters
                  ? "No payouts match the current filters."
                  : "No payout records exist in the real wallet, vendor or freelancer stores yet."
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

function PayoutsSkeleton() {
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