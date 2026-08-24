"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckCheck,
  Flag,
  Search,
  SearchCheck,
  XCircle,
} from "lucide-react";
import { Pagination } from "@/components/admin/Pagination";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  StatusBadge,
  priorityVariant,
} from "@/components/admin/StatusBadge";
import { cn, formatDateShort, timeAgo } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import {
  REPORT_REASON_LABELS,
  REPORT_STATUS_FILTER_ORDER,
  REPORT_TARGET_TYPE_LABELS,
  reportStatusLabel,
  reportStatusVariant,
} from "./campus-community-meta";
import { CommunitySectionShell } from "./shared";
import { communityService } from "@/services/admin";
import type {
  CommunityReport,
  CommunityReportStatus,
  CommunityReportTargetType,
  CommunitySectionCounts,
  Paginated,
} from "@/types/admin";

const TARGET_TYPE_ORDER: CommunityReportTargetType[] = [
  "post",
  "comment",
  "event",
  "poll",
];

type PendingAction =
  | { kind: "dismiss"; r: CommunityReport }
  | null;

export function ReportsSection({
  onToast,
}: {
  onToast: (tone: "success" | "error", text: string) => void;
}) {
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput.trim(), 350);
  const [status, setStatus] = useState<CommunityReportStatus | "all">("open");
  const [targetType, setTargetType] = useState<
    CommunityReportTargetType | "all"
  >("all");
  const [page, setPage] = useState(1);

  const [list, setList] = useState<Paginated<CommunityReport> | null>(null);
  const [counts, setCounts] =
    useState<CommunitySectionCounts<CommunityReportStatus> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [pendingDismiss, setPendingDismiss] = useState<PendingAction>(null);
  const [workingId, setWorkingId] = useState<string | null>(null);

  const loadMeta = useCallback(async () => {
    try {
      setCounts(await communityService.getReportCounts());
    } catch {
      /* non-critical */
    }
  }, []);

  const loadList = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const result = await communityService.listReports({
        search: search || undefined,
        status,
        targetType,
        page,
        pageSize: 10,
      });
      setList(result);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [search, status, targetType, page]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  useEffect(() => {
    void loadMeta();
  }, [loadMeta]);

  async function triage(
    r: CommunityReport,
    next: Exclude<CommunityReportStatus, "open">
  ) {
    setWorkingId(r.id);
    try {
      await communityService.setReportStatus(r.id, next);
      onToast(
        "success",
        `Report ${r.id.toUpperCase()} ${
          next === "actioned"
            ? "closed as actioned"
            : next === "dismissed"
              ? "dismissed"
              : "moved to review"
        }.`
      );
      await Promise.all([loadList(), loadMeta()]);
    } catch (err) {
      onToast(
        "error",
        err instanceof Error ? err.message : "Couldn't update that report."
      );
    } finally {
      setWorkingId(null);
    }
  }

  const hasActiveFilters =
    searchInput.trim().length > 0 ||
    status !== "all" ||
    targetType !== "all";

  return (
    <>
      <div
        role="tablist"
        aria-label="Filter reports by status"
        className="flex gap-1 overflow-x-auto border-b border-kampmax-border px-3 py-2 no-scrollbar"
      >
        {(["all", ...REPORT_STATUS_FILTER_ORDER] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={status === tab}
            onClick={() => {
              setStatus(tab);
              setPage(1);
            }}
            className={cn(
              "-mb-px inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-1.5 text-[13px] font-medium transition-colors",
              status === tab
                ? "border-kampmax-blue text-kampmax-blue"
                : "border-transparent text-kampmax-text-secondary hover:text-kampmax-text"
            )}
          >
            {tab === "all" ? "All" : reportStatusLabel(tab)}
            {counts && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-px text-[10px] font-semibold tabular-nums",
                  tab !== "all" && tab === "open" && counts.byStatus.open > 0
                    ? "bg-kampmax-error/10 text-kampmax-error"
                    : "bg-kampmax-muted"
                )}
              >
                {tab === "all" ? counts.all : counts.byStatus[tab]}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="my-3 flex flex-wrap items-center gap-2">
        <div className="w-full sm:w-64">
          <Input
            value={searchInput}
            placeholder="Search reports…"
            leftIcon={<Search className="h-4 w-4" />}
            aria-label="Search reports"
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Select
          value={targetType}
          aria-label="Filter by target type"
          onChange={(e) => {
            setTargetType(e.target.value as CommunityReportTargetType | "all");
            setPage(1);
          }}
          className="w-auto h-9 text-xs"
        >
          <option value="all">All content types</option>
          {TARGET_TYPE_ORDER.map((t) => (
            <option key={t} value={t}>
              {REPORT_TARGET_TYPE_LABELS[t]}
            </option>
          ))}
        </Select>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => {
              setSearchInput("");
              setStatus("all");
              setTargetType("all");
            }}
            className="text-xs font-medium text-kampmax-blue hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      <CommunitySectionShell
        loading={loading && !list}
        error={error}
        isEmpty={(list?.items.length ?? 0) === 0}
        hasActiveFilters={hasActiveFilters}
        emptyTitle="No reports here"
        emptyMessage="Abuse reports against campus content will queue up in this section."
        onRetry={() => void loadList()}
        onClearFilters={() => {
          setSearchInput("");
          setStatus("all");
          setTargetType("all");
        }}
      >
        <div className="hidden overflow-hidden rounded-lg border border-kampmax-border bg-white md:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead>
                <tr className="border-b border-kampmax-border bg-kampmax-muted/40 text-[11px] uppercase tracking-wide text-kampmax-text-secondary">
                  <th scope="col" className="px-4 py-2.5 font-medium">Reported content</th>
                  <th scope="col" className="hidden px-3 py-2.5 font-medium lg:table-cell">Reason</th>
                  <th scope="col" className="hidden px-3 py-2.5 font-medium xl:table-cell">Reporter</th>
                  <th scope="col" className="px-3 py-2.5 font-medium">Priority</th>
                  <th scope="col" className="px-3 py-2.5 font-medium">Status</th>
                  <th scope="col" className="hidden px-3 py-2.5 font-medium xl:table-cell">Received</th>
                  <th scope="col" className="w-10 px-2 py-2.5"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-kampmax-border">
                {(list?.items ?? []).map((r) => (
                  <tr key={r.id} className="transition-colors hover:bg-kampmax-muted/40">
                    <td className="max-w-[300px] px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-kampmax-muted px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-kampmax-text-secondary">
                          {REPORT_TARGET_TYPE_LABELS[r.targetType]}
                        </span>
                        <span className="font-mono text-[10px] uppercase text-kampmax-text-secondary/70">
                          {r.targetId}
                        </span>
                      </div>
                      <p
                        className="mt-1 line-clamp-1 text-[13px] text-kampmax-text"
                        title={r.targetPreview}
                      >
                        {r.targetPreview}
                      </p>
                      <p
                        className="mt-0.5 line-clamp-1 text-[11px] italic text-kampmax-text-secondary"
                        title={r.detail}
                      >
                        &ldquo;{r.detail}&rdquo;
                      </p>
                    </td>
                    <td className="hidden whitespace-nowrap px-3 py-2.5 lg:table-cell">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 text-xs font-medium capitalize",
                          r.reason === "harassment" || r.reason === "scam"
                            ? "text-kampmax-error"
                            : "text-kampmax-text"
                        )}
                      >
                        <Flag className="h-3 w-3 opacity-70" aria-hidden />
                        {REPORT_REASON_LABELS[r.reason]}
                      </span>
                    </td>
                    <td className="hidden max-w-[150px] truncate whitespace-nowrap px-3 py-2.5 text-kampmax-text-secondary xl:table-cell">
                      {r.reporterName}
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusBadge variant={priorityVariant(r.priority)} label={r.priority} />
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusBadge
                        variant={reportStatusVariant(r.status)}
                        label={reportStatusLabel(r.status)}
                      />
                    </td>
                    <td
                      className="hidden whitespace-nowrap px-3 py-2.5 tabular-nums text-kampmax-text-secondary xl:table-cell"
                      title={new Date(r.createdAt).toISOString()}
                    >
                      {formatDateShort(r.createdAt)}
                      <span className="ml-1.5 text-[11px]">{timeAgo(r.createdAt)}</span>
                    </td>
                    <td className="px-2 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        {r.status !== "actioned" && r.status !== "dismissed" && (
                          <>
                            {r.status === "open" && (
                              <button
                                type="button"
                                title="Start review"
                                disabled={workingId !== null}
                                onClick={() => void triage(r, "reviewing")}
                                className="rounded-md p-1.5 text-kampmax-info transition-colors hover:bg-sky-50 disabled:opacity-50"
                              >
                                <SearchCheck className="h-3.5 w-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              title="Mark actioned"
                              disabled={workingId !== null}
                              onClick={() => void triage(r, "actioned")}
                              className="rounded-md p-1.5 text-kampmax-success transition-colors hover:bg-emerald-50 disabled:opacity-50"
                            >
                              <CheckCheck className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              title="Dismiss report"
                              disabled={workingId !== null}
                              onClick={() =>
                                setPendingDismiss({ kind: "dismiss", r })
                              }
                              className="rounded-md p-1.5 text-kampmax-error transition-colors hover:bg-red-50 disabled:opacity-50"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile cards */}
        <ul className="space-y-2.5 md:hidden">
          {(list?.items ?? []).map((r) => (
            <li
              key={r.id}
              className="rounded-lg border border-kampmax-border bg-white p-3"
            >
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="rounded bg-kampmax-muted px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-kampmax-text-secondary">
                  {REPORT_TARGET_TYPE_LABELS[r.targetType]}
                </span>
                <span className="font-mono text-[10px] uppercase text-kampmax-text-secondary/70">
                  {r.targetId}
                </span>
                <span className="ml-auto flex items-center gap-1.5">
                  <StatusBadge variant={priorityVariant(r.priority)} label={r.priority} />
                  <StatusBadge
                    variant={reportStatusVariant(r.status)}
                    label={reportStatusLabel(r.status)}
                  />
                </span>
              </div>

              <p className="mt-1.5 line-clamp-2 text-[13px] leading-snug text-kampmax-text">
                {r.targetPreview}
              </p>
              <p className="mt-0.5 line-clamp-2 text-[11px] italic text-kampmax-text-secondary">
                &ldquo;{r.detail}&rdquo;
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-dashed border-kampmax-border pt-2 text-[11px] text-kampmax-text-secondary">
                <span className="inline-flex items-center gap-1 font-medium text-kampmax-text capitalize">
                  <Flag className="h-3 w-3 opacity-70" aria-hidden />
                  {REPORT_REASON_LABELS[r.reason]}
                </span>
                <span>· by {r.reporterName}</span>
                <span>· {timeAgo(r.createdAt)}</span>
              </div>

              {r.status !== "actioned" && r.status !== "dismissed" && (
                <div className="mt-2 flex justify-end gap-1.5">
                  {r.status === "open" && (
                    <button
                      type="button"
                      title="Start review"
                      disabled={workingId !== null}
                      onClick={() => void triage(r, "reviewing")}
                      className="inline-flex h-7 items-center gap-1 rounded-md border border-kampmax-border bg-white px-2 text-[11px] font-medium text-kampmax-info transition-colors hover:bg-sky-50 disabled:opacity-50"
                    >
                      <SearchCheck className="h-3 w-3" />
                      Review
                    </button>
                  )}
                  <button
                    type="button"
                    title="Mark actioned"
                    disabled={workingId !== null}
                    onClick={() => void triage(r, "actioned")}
                    className="inline-flex h-7 items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 text-[11px] font-medium text-kampmax-success transition-colors hover:bg-emerald-100 disabled:opacity-50"
                  >
                    <CheckCheck className="h-3 w-3" />
                    Actioned
                  </button>
                  <button
                    type="button"
                    title="Dismiss report"
                    disabled={workingId !== null}
                    onClick={() => setPendingDismiss({ kind: "dismiss", r })}
                    className="inline-flex h-7 items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2 text-[11px] font-medium text-kampmax-error transition-colors hover:bg-red-100 disabled:opacity-50"
                  >
                    <XCircle className="h-3 w-3" />
                    Dismiss
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>

        {list && list.totalPages > 1 && (
          <Pagination
            page={list.page}
            pageSize={list.pageSize}
            total={list.total}
            totalPages={list.totalPages}
            onPageChange={setPage}
            className="rounded-b-lg border border-t-0 border-kampmax-border bg-white"
          />
        )}
      </CommunitySectionShell>

      <ConfirmDialog
        open={pendingDismiss !== null}
        title={`Dismiss this report?`}
        message={
          pendingDismiss == null
            ? ""
            : `The ${REPORT_TARGET_TYPE_LABELS[pendingDismiss.r.targetType].toLowerCase()} stays live and the reporter is told no action was needed. Use “Actioned” instead if you moderated the content.`
        }
        confirmLabel="Dismiss report"
        tone="warning"
        loading={workingId !== null}
        onConfirm={() => {
          if (!pendingDismiss) return;
          const target = pendingDismiss.r;
          void triage(target, "dismissed").then(() => setPendingDismiss(null));
        }}
        onCancel={() => setPendingDismiss(null)}
      />
    </>
  );
}
