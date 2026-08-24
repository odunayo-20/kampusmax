"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, ArrowDownToLine, Search } from "lucide-react";
import { formatNairaCompact } from "@/lib/utils";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { Pagination } from "@/components/admin/Pagination";
import {
  RejectWithdrawalDialog,
} from "@/components/admin/wallet/RejectWithdrawalDialog";
import {
  WithdrawalsTable,
} from "@/components/admin/wallet/WithdrawalsTable";
import { financeManagementService } from "@/services/admin";
import type {
  Paginated,
  WithdrawalAction,
  WithdrawalRequest,
  WithdrawalStatus,
  WithdrawalStatusCounts,
} from "@/types/admin";

const VALID_STATUSES: WithdrawalStatus[] = [
  "pending",
  "processing",
  "approved",
  "completed",
  "rejected",
  "failed",
];

type QuickAction = Extract<
  WithdrawalAction,
  "start_processing" | "approve" | "mark_completed" | "mark_failed"
>;

function parseInitialFilters(): { search: string; status: WithdrawalStatus | "all" } {
  if (typeof window === "undefined") return { search: "", status: "all" };
  const params = new URLSearchParams(window.location.search);
  const status = params.get("status") as WithdrawalStatus;
  return {
    search: params.get("q") ?? "",
    status: VALID_STATUSES.includes(status) ? status : "all",
  };
}

export default function AdminWithdrawalsPage() {
  const [filters, setFilters] = useState(parseInitialFilters);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const [list, setList] = useState<Paginated<WithdrawalRequest> | null>(null);
  const [counts, setCounts] = useState<WithdrawalStatusCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [acting, setActing] = useState(false);
  const [reasonTarget, setReasonTarget] = useState<{
    w: WithdrawalRequest;
    mode: "reject" | "fail";
  } | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<{
    w: WithdrawalRequest;
    action: Exclude<QuickAction, "mark_failed">;
  } | null>(null);

  const loadList = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const result = await financeManagementService.listWithdrawals({
        search: filters.search.trim() || undefined,
        status: filters.status,
        sortBy: "requestedAt",
        sortDir: "desc",
        page,
        pageSize,
      });
      setList(result);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [filters, page, pageSize]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const c = await financeManagementService.getWithdrawalCounts();
        if (!cancelled) setCounts(c);
      } catch {
        /* non-critical */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [list]);

  function patchFilters(patch: Partial<{ search: string; status: WithdrawalStatus | "all" }>) {
    setFilters((f) => ({ ...f, ...patch }));
    setPage(1);

    const params = new URLSearchParams();
    const next = { ...filters, ...patch };
    if (next.search.trim()) params.set("q", next.search.trim());
    if (next.status !== "all") params.set("status", next.status);
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `/admin/withdrawals?${qs}` : "/admin/withdrawals");
  }

  const runAct = useCallback(
    async (w: WithdrawalRequest, action: WithdrawalAction, note?: string) => {
      setActing(true);
      try {
        await financeManagementService.actOnWithdrawal(w.id, action, note);
        await loadList();
      } catch {
        setError(true);
      } finally {
        setActing(false);
      }
    },
    [loadList]
  );

  const showPendingBanner =
    counts != null && counts.byStatus.pending > 0 && filters.status !== "pending";

  return (
    <>
      <AdminPageHeader
        title="Withdrawals"
        description="Vendor payout requests - money leaving vendor payable into bank accounts."
        actions={
          counts && (
            <>
              <span className="hidden h-9 items-center gap-1.5 rounded-md border border-amber-300 bg-amber-50 px-3 text-xs font-medium text-amber-700 sm:inline-flex">
                <AlertTriangle className="h-3.5 w-3.5" />
                {formatNairaCompact(counts.pendingAmount)} awaiting payout
              </span>
              <span className="hidden h-9 items-center gap-1.5 rounded-md border border-kampmax-border bg-white px-3 text-xs font-medium text-kampmax-text-secondary lg:inline-flex">
                <ArrowDownToLine className="h-3.5 w-3.5 opacity-60" />
                {formatNairaCompact(counts.completedAmount)} completed all-time
              </span>
            </>
          )
        }
      />

      {showPendingBanner && counts && (
        <button
          type="button"
          onClick={() => patchFilters({ status: "pending" })}
          className="mb-3 flex w-full items-center justify-between gap-3 rounded-lg border border-kampmax-warning/40 bg-kampmax-warning/10 px-4 py-2.5 text-left transition-colors hover:bg-kampmax-warning/20"
        >
          <span className="flex min-w-0 items-center gap-2 text-sm text-amber-700">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span className="truncate">
              {counts.byStatus.pending} new request
              {counts.byStatus.pending === 1 ? "" : "s"} waiting for review ·{" "}
              {formatNairaCompact(counts.byStatus.pending)} total
            </span>
          </span>
          <span className="shrink-0 text-xs font-medium text-kampmax-blue">Review now</span>
        </button>
      )}

      <WithdrawalsSection
        list={list}
        loading={loading}
        error={error}
        hasActiveFilters={filters.search.trim().length > 0 || filters.status !== "all"}
        onRetry={() => void loadList()}
        onClearFilters={() => patchFilters({ search: "", status: "all" })}
        filters={filters}
        onFilterChange={patchFilters}
        onAct={(w, action) => {
          if (action === "mark_failed") {
            setReasonTarget({ w, mode: "fail" });
          } else {
            setConfirmTarget({ w, action });
          }
        }}
        onReject={(w) => setReasonTarget({ w, mode: "reject" })}
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

      {/* Mutations */}
      <RejectWithdrawalDialog
        open={reasonTarget != null}
        withdrawal={reasonTarget?.w ?? null}
        mode={reasonTarget?.mode ?? "reject"}
        working={acting}
        onClose={() => setReasonTarget(null)}
        onConfirm={async (w, note) => {
          await runAct(w, reasonTarget?.mode === "fail" ? "mark_failed" : "reject", note);
          setReasonTarget(null);
        }}
      />

      <ConfirmDialog
        open={confirmTarget != null}
        title={
          confirmTarget?.action === "mark_completed"
            ? "Mark as completed?"
            : confirmTarget?.action === "approve"
              ? "Approve withdrawal?"
              : "Mark as processing?"
        }
        message={
          confirmTarget == null
            ? ""
            : confirmTarget.action === "mark_completed"
              ? `Confirm the bank transfer of ${formatNairaCompact(confirmTarget.w.amount + confirmTarget.w.fee)} to ${confirmTarget.w.vendorName} (${confirmTarget.w.bankName} ${confirmTarget.w.accountNumberMasked}) is complete.`
              : `${confirmTarget.w.vendorName} · ${formatNairaCompact(confirmTarget.w.amount)} to ${confirmTarget.w.bankName}. This moves vendor payable forward - funds stay reconciled in the wallet console.`
        }
        tone={confirmTarget?.action === "start_processing" ? "default" : "warning"}
        loading={acting}
        confirmLabel={
          confirmTarget?.action === "mark_completed"
            ? "Yes, mark completed"
            : confirmTarget?.action === "approve"
              ? "Approve"
              : "Mark processing"
        }
        onConfirm={async () => {
          if (!confirmTarget) return;
          await runAct(confirmTarget.w, confirmTarget.action);
          setConfirmTarget(null);
        }}
        onCancel={() => setConfirmTarget(null)}
      />
    </>
  );
}

interface WithdrawalsSectionProps {
  list: Paginated<WithdrawalRequest> | null;
  loading: boolean;
  error: boolean;
  hasActiveFilters: boolean;
  onRetry: () => void;
  onClearFilters: () => void;
  filters: { search: string; status: WithdrawalStatus | "all" };
  onFilterChange: (patch: Partial<{ search: string; status: WithdrawalStatus | "all" }>) => void;
  onAct: (w: WithdrawalRequest, action: QuickAction) => void;
  onReject: (w: WithdrawalRequest) => void;
}

function WithdrawalsSection(props: WithdrawalsSectionProps) {
  const { filters, onFilterChange, list, ...rest } = props;

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="w-full sm:w-64">
          <Input
            value={filters.search}
            placeholder="Search vendor, bank, request id…"
            leftIcon={<Search className="h-4 w-4" />}
            aria-label="Search withdrawals"
            onChange={(e) => onFilterChange({ search: e.target.value })}
          />
        </div>
        <Select
          value={filters.status}
          aria-label="Filter by withdrawal status"
          onChange={(e) =>
            onFilterChange({ status: e.target.value as WithdrawalStatus | "all" })
          }
          className="w-auto"
        >
          <option value="all">All statuses</option>
          {VALID_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </Select>
      </div>

      <WithdrawalsTable page={list} {...rest} />
    </>
  );
}
