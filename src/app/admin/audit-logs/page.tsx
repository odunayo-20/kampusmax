"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ScrollText,
  Search,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Pagination } from "@/components/admin/Pagination";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import { AuditLogsTable } from "@/components/admin/audit-logs/AuditLogsTable";
import { AuditLogDetailDialog } from "@/components/admin/audit-logs/AuditLogDetailDialog";
import {
  AUDIT_ACTION_FILTER_ORDER,
  AUDIT_RESOURCE_FILTER_ORDER,
  auditActionLabel,
  auditResourceLabel,
} from "@/components/admin/audit-logs/audit-logs-meta";
import { auditLogService } from "@/services/admin";
import type {
  AuditActionType,
  AuditLog,
  AuditResource,
  AuditResult,
  Paginated,
} from "@/types/admin";

export default function AdminAuditLogsPage() {
  return (
    <Suspense fallback={<LoadingSkeleton variant="table" rows={8} />}>
      <AuditLogsConsole />
    </Suspense>
  );
}

function parseInitialStatus(params: { get(name: string): string | null }) {
  const raw = params.get("result");
  return raw === "success" || raw === "failed" || raw === "denied"
    ? (raw as AuditResult)
    : "all";
}

const todayIso = () => new Date().toISOString().slice(0, 10);

function AuditLogsConsole() {
  const searchParams = useSearchParams();

  // ----- filters -----
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput.trim(), 350);
  const [adminId, setAdminId] = useState("all");
  const [action, setAction] = useState<AuditActionType | "all">("all");
  const [resource, setResource] = useState<AuditResource | "all">("all");
  const [result, setResult] = useState<AuditResult | "all">(() =>
    parseInitialStatus(searchParams)
  );
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  // ----- data -----
  const [list, setList] = useState<Paginated<AuditLog> | null>(null);
  const [adminOptions, setAdminOptions] = useState<
    { id: string; name: string; role: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // ----- overlays -----
  const [detailTarget, setDetailTarget] = useState<AuditLog | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (result !== "all") params.set("result", result);
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : "/admin/audit-logs");
  }, [result]);

  const loadMeta = useCallback(async () => {
    try {
      setAdminOptions(await auditLogService.getAdminOptions());
    } catch {
      /* non-critical */
    }
  }, []);

  const loadList = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await auditLogService.list({
        search: search || undefined,
        adminId,
        action,
        resource,
        result,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        page,
        pageSize: 15,
      });
      setList(res);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [search, adminId, action, resource, result, dateFrom, dateTo, page]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  useEffect(() => {
    void loadMeta();
  }, [loadMeta]);

  const hasActiveFilters =
    searchInput.trim().length > 0 ||
    adminId !== "all" ||
    action !== "all" ||
    resource !== "all" ||
    result !== "all" ||
    dateFrom !== "" ||
    dateTo !== "";

  function clearFilters() {
    setSearchInput("");
    setAdminId("all");
    setAction("all");
    setResource("all");
    setResult("all");
    setDateFrom("");
    setDateTo("");
  }

  return (
    <>
      <AdminPageHeader
        title="Audit Logs"
        description="Read-only trail of administrative actions across the platform. Mock data - no backend logging yet."
        actions={
          list && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex h-9 items-center gap-1.5 rounded-md border border-kampmax-border bg-white px-3 text-xs font-medium text-kampmax-text-secondary">
                <ScrollText className="h-3.5 w-3.5 opacity-60" />
                {list.total.toLocaleString("en-NG")} events
              </span>
              {(list.items.some((l) => l.result !== "success") ||
                searchInput.trim()) && (
                <span className="hidden h-9 items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-3 text-xs font-medium text-amber-700 lg:inline-flex">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Includes failures / denials
                </span>
              )}
            </div>
          )
        }
      />

      {/* Filter toolbar */}
      <div className="my-3 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-full sm:w-56">
            <Input
              value={searchInput}
              placeholder="Search description or ID…"
              leftIcon={<Search className="h-4 w-4" />}
              aria-label="Search audit logs"
              onChange={(e) => {
                setSearchInput(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <Select
            value={adminId}
            aria-label="Filter by admin"
            onChange={(e) => {
              setAdminId(e.target.value);
              setPage(1);
            }}
            className="h-9 max-w-[180px] text-xs"
          >
            <option value="all">All admins</option>
            {adminOptions.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
          <Select
            value={action}
            aria-label="Filter by action"
            onChange={(e) => {
              setAction(e.target.value as AuditActionType | "all");
              setPage(1);
            }}
            className="w-auto h-9 text-xs"
          >
            <option value="all">All actions</option>
            {AUDIT_ACTION_FILTER_ORDER.map((a) => (
              <option key={a} value={a}>
                {auditActionLabel(a)}
              </option>
            ))}
          </Select>
          <Select
            value={resource}
            aria-label="Filter by resource"
            onChange={(e) => {
              setResource(e.target.value as AuditResource | "all");
              setPage(1);
            }}
            className="w-auto h-9 text-xs"
          >
            <option value="all">All resources</option>
            {AUDIT_RESOURCE_FILTER_ORDER.map((r) => (
              <option key={r} value={r}>
                {auditResourceLabel(r)}
              </option>
            ))}
          </Select>
          <Select
            value={result}
            aria-label="Filter by result"
            onChange={(e) => {
              setResult(e.target.value as AuditResult | "all");
              setPage(1);
            }}
            className="w-auto h-9 text-xs"
          >
            <option value="all">Any result</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="denied">Denied</option>
          </Select>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-medium text-kampmax-blue hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Date range row */}
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex h-9 items-center gap-1.5 rounded-md border border-kampmax-border bg-white px-2 text-xs text-kampmax-text-secondary">
            From
            <input
              type="date"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-xs font-medium tabular-nums text-kampmax-text focus:outline-none"
              aria-label="Filter from date"
            />
          </label>
          <span className="text-kampmax-text-secondary">→</span>
          <label className="inline-flex h-9 items-center gap-1.5 rounded-md border border-kampmax-border bg-white px-2 text-xs text-kampmax-text-secondary">
            To
            <input
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              max={todayIso()}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-xs font-medium tabular-nums text-kampmax-text focus:outline-none"
              aria-label="Filter to date"
            />
          </label>
          {/* Quick ranges */}
          {(
            [
              { label: "24h", days: 1 },
              { label: "7d", days: 7 },
              { label: "30d", days: 30 },
            ] as const
          ).map((q) => (
            <button
              key={q.label}
              type="button"
              onClick={() => {
                const to = new Date();
                const fromD = new Date(
                  Date.now() - q.days * 86_400_000
                );
                setDateFrom(fromD.toISOString().slice(0, 10));
                setDateTo(to.toISOString().slice(0, 10));
                setPage(1);
              }}
              className={cn(
                "h-9 rounded-md border border-kampmax-border bg-white px-2.5 text-xs font-medium text-kampmax-text-secondary transition-colors hover:bg-kampmax-muted/60"
              )}
            >
              Last {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table + pagination */}
      <AuditLogsTable
        items={list?.items ?? []}
        loading={loading && !list}
        error={error}
        hasActiveFilters={hasActiveFilters}
        onRetry={() => void loadList()}
        onClearFilters={clearFilters}
        onView={(l) => setDetailTarget(l)}
      />

      {list && list.totalPages > 1 && (
        <Pagination
          page={list.page}
          pageSize={list.pageSize}
          total={list.total}
          totalPages={list.totalPages}
          onPageChange={setPage}
          className="mt-3 rounded-lg border border-kampmax-border bg-white"
        />
      )}

      {/* Detail view */}
      <AuditLogDetailDialog
        log={detailTarget}
        onClose={() => setDetailTarget(null)}
      />
    </>
  );
}
