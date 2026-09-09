"use client";

import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ExternalLink,
  Flag,
  UserRound,
} from "lucide-react";
import { cn, formatDate, timeAgo } from "@/lib/utils";
import { EmptyState } from "@/components/admin/EmptyState";
import { ErrorState } from "@/components/admin/ErrorState";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import type { Paginated, SortDir, TrustSafetyReportRow } from "@/types/admin";
import type { TrustSafetySortField } from "@/services/admin";
import {
  SafetySourceBadge,
  SafetyStatusBadge,
  SafetyTargetTypeBadge,
} from "./SafetyBadges";

interface SafetyTableProps {
  page: Paginated<TrustSafetyReportRow> | null;
  loading: boolean;
  error: boolean;
  sortBy: TrustSafetySortField;
  sortDir: SortDir;
  onSort: (field: TrustSafetySortField) => void;
  onRetry: () => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export function SafetyTable({
  page,
  loading,
  error,
  sortBy,
  sortDir,
  onSort,
  onRetry,
  hasActiveFilters,
  onClearFilters,
}: SafetyTableProps) {
  const router = useRouter();

  if (loading && !page) {
    return <LoadingSkeleton variant="table" rows={6} />;
  }

  if (error && !page) {
    return <ErrorState onRetry={onRetry} />;
  }

  if (!page || page.items.length === 0) {
    return (
      <div className="rounded-lg border border-kampmax-border bg-white p-4">
        <EmptyState
          title="No reports found"
          message={
            hasActiveFilters
              ? "No reports match the current search and filters."
              : "Reports submitted through the platform report flows will appear here. None exist yet — every source store is empty."
          }
          action={
            hasActiveFilters ? (
              <button
                type="button"
                onClick={onClearFilters}
                className="inline-flex h-9 items-center rounded-md border border-kampmax-border bg-white px-3 text-sm font-medium text-kampmax-text transition-colors hover:bg-kampmax-muted/60"
              >
                Clear filters
              </button>
            ) : undefined
          }
        />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-kampmax-border bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1280px] text-sm">
          <thead>
            <tr className="border-b border-kampmax-border bg-kampmax-muted/50 text-left text-xs uppercase tracking-wide text-kampmax-text-secondary">
              <Th>Report</Th>
              <Th>Target</Th>
              <Th>Reason</Th>
              <Th>Source</Th>
              <Th>Status</Th>
              <Th className="hidden xl:table-cell">Reporter</Th>
              <SortableTh
                label="Entity reports"
                active={sortBy === "entityReportCount"}
                dir={sortDir}
                onClick={() => onSort("entityReportCount")}
              />
              <SortableTh
                label="Created"
                active={sortBy === "createdAt"}
                dir={sortDir}
                onClick={() => onSort("createdAt")}
              />
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-kampmax-border/70">
            {page.items.map((report) => (
              <Row
                key={report.id}
                report={report}
                onOpen={() => router.push(`/admin/safety/${report.id}`)}
              />
            ))}
          </tbody>
        </table>
      </div>

      <p className="sr-only" aria-live="polite">
        Showing {page.items.length} of {page.total} reports, page {page.page} of{" "}
        {page.totalPages}.
      </p>
    </div>
  );
}

// ------------------------------------------------------------
// Header cells
// ------------------------------------------------------------

function Th({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      scope="col"
      className={cn("whitespace-nowrap px-4 py-2.5 font-medium", className)}
    >
      {children}
    </th>
  );
}

function SortableTh({
  label,
  active,
  dir,
  onClick,
  className,
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
  className?: string;
}) {
  const Icon = !active ? ArrowUpDown : dir === "asc" ? ArrowUp : ArrowDown;
  return (
    <th
      scope="col"
      aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"}
      className={cn("px-4 py-2.5 font-medium", className)}
    >
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "inline-flex items-center gap-1 whitespace-nowrap uppercase tracking-wide transition-colors hover:text-kampmax-text",
          active && "text-kampmax-text"
        )}
      >
        {label}
        <Icon
          className={cn("h-3 w-3", active ? "text-kampmax-blue" : "opacity-50")}
        />
      </button>
    </th>
  );
}

// ------------------------------------------------------------
// Rows
// ------------------------------------------------------------

function Row({
  report,
  onOpen,
}: {
  report: TrustSafetyReportRow;
  onOpen: () => void;
}) {
  return (
    <tr className="group transition-colors hover:bg-kampmax-muted/40">
      {/* Report */}
      <td className="max-w-[240px] px-4 py-2.5">
        <button
          type="button"
          onClick={onOpen}
          title={`Open report ${report.id}`}
          className="flex w-full items-start gap-2.5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-kampmax-blue"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-kampmax-muted text-xs font-semibold text-kampmax-text-secondary">
            <Flag className="h-3.5 w-3.5" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[13px] font-medium text-kampmax-text group-hover:text-kampmax-blue">
              {report.targetName}
            </span>
            <span className="block font-mono text-[10px] uppercase text-kampmax-text-secondary/70">
              {report.id}
            </span>
            <span className="mt-1 block line-clamp-2 text-xs leading-snug text-kampmax-text-secondary">
              {report.targetPreview || "—"}
            </span>
          </span>
        </button>
      </td>

      {/* Target */}
      <td className="max-w-[180px] px-4 py-2.5">
        <SafetyTargetTypeBadge type={report.targetType} />
        <span
          className="mt-1 block truncate text-[13px] font-medium text-kampmax-text"
          title={report.targetName}
        >
          {report.targetName}
        </span>
        <span className="block truncate font-mono text-[10px] text-kampmax-text-secondary/70">
          {report.targetId}
        </span>
      </td>

      {/* Reason */}
      <td className="max-w-[160px] px-4 py-2.5">
        <span
          className="block truncate text-[13px] capitalize text-kampmax-text"
          title={report.reason}
        >
          {report.reason}
        </span>
        {report.details && (
          <span
            className="block truncate text-[11px] text-kampmax-text-secondary"
            title={report.details}
          >
            {report.details}
          </span>
        )}
      </td>

      {/* Source */}
      <td className="px-4 py-2.5">
        <SafetySourceBadge source={report.source} />
      </td>

      {/* Status */}
      <td className="px-4 py-2.5">
        <div className="flex flex-col items-start gap-1">
          <SafetyStatusBadge status={report.status} />
          <span
            className="text-[10px] text-kampmax-text-secondary/70"
            title={report.statusNote}
          >
            derived
          </span>
        </div>
      </td>

      {/* Reporter */}
      <td className="hidden max-w-[180px] px-4 py-2.5 xl:table-cell">
        <span className="flex items-center gap-1.5">
          <UserRound className="h-3.5 w-3.5 shrink-0 text-kampmax-text-secondary" aria-hidden />
          <span className="truncate text-[13px] text-kampmax-text">
            {report.reporterName}
          </span>
        </span>
        <span className="block truncate font-mono text-[10px] text-kampmax-text-secondary/70">
          {report.reporterUserId ?? "—"}
        </span>
      </td>

      {/* Entity reports */}
      <td className="whitespace-nowrap px-4 py-2.5">
        {report.entityReportCount > 1 ? (
          <span className="inline-flex items-center gap-1 font-medium tabular-nums text-kampmax-error">
            <Flag className="h-3 w-3" aria-hidden />
            {report.entityReportCount}
          </span>
        ) : (
          <span className="tabular-nums text-kampmax-text-secondary">—</span>
        )}
      </td>

      {/* Created */}
      <td
        className="whitespace-nowrap px-4 py-2.5 tabular-nums text-kampmax-text-secondary"
        title={new Date(report.createdAt).toISOString()}
      >
        {formatDate(report.createdAt)}
        <span className="ml-1.5 hidden text-[11px] 2xl:inline">
          {timeAgo(report.createdAt)}
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-2.5 text-right">
        <div className="flex items-center justify-end gap-1.5">
          {report.adminHref && (
            <a
              href={report.adminHref}
              className="inline-flex h-8 items-center rounded-md border border-kampmax-border bg-white px-2.5 text-xs font-medium text-kampmax-text transition-colors hover:bg-kampmax-muted"
              title="Open the target in its admin console"
            >
              <ExternalLink className="h-3 w-3" aria-hidden />
            </a>
          )}
          <button
            type="button"
            onClick={onOpen}
            className="inline-flex h-8 items-center rounded-md border border-kampmax-border bg-white px-2.5 text-xs font-medium text-kampmax-text transition-colors hover:bg-kampmax-muted"
          >
            View
          </button>
        </div>
      </td>
    </tr>
  );
}