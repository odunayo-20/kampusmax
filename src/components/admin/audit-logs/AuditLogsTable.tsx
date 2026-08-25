"use client";

import {
  MonitorSmartphone,
  ScrollText,
} from "lucide-react";
import { Pagination } from "@/components/admin/Pagination";
import {
  StatusBadge,
  badgeVariantClasses,
} from "@/components/admin/StatusBadge";
import { EmptyState } from "@/components/admin/EmptyState";
import { ErrorState } from "@/components/admin/ErrorState";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { cn, formatDateTime, timeAgo } from "@/lib/utils";
import {
  AUDIT_ACTION_ICONS,
  AUDIT_ACTION_LABELS,
  AUDIT_RESOURCE_ICONS,
  AUDIT_RESOURCE_LABELS,
  auditActionLabel,
  auditActionVariant,
  auditResultVariant,
} from "./audit-logs-meta";
import type { AuditLog } from "@/types/admin";

export interface AuditLogsTableProps {
  items: AuditLog[];
  loading: boolean;
  error: boolean;
  hasActiveFilters: boolean;
  onRetry: () => void;
  onClearFilters: () => void;
  onView: (log: AuditLog) => void;
}

export function AuditLogsTable(props: AuditLogsTableProps) {
  const {
    items,
    loading,
    error,
    hasActiveFilters,
    onRetry,
    onClearFilters,
    onView,
  } = props;

  if (loading) return <LoadingSkeleton variant="table" rows={8} />;
  if (error) return <ErrorState onRetry={onRetry} />;
  if (items.length === 0)
    return (
      <EmptyState
        icon={ScrollText}
        title={hasActiveFilters ? "No audit events match" : "No audit events yet"}
        message={
          hasActiveFilters
            ? "Try different search terms or clear the filters."
            : "Admin activity will be recorded here once the platform runs."
        }
        action={
          hasActiveFilters ? (
            <button
              type="button"
              onClick={onClearFilters}
              className="h-8 rounded-md border border-kampmax-border bg-white px-3 text-xs font-medium text-kampmax-text hover:bg-kampmax-muted/60"
            >
              Clear filters
            </button>
          ) : undefined
        }
      />
    );

  return (
    <>
      {/* Desktop / tablet */}
      <div className="hidden overflow-hidden rounded-lg border border-kampmax-border bg-white md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] text-left text-sm">
            <thead>
              <tr className="border-b border-kampmax-border bg-kampmax-muted/40 text-[11px] uppercase tracking-wide text-kampmax-text-secondary">
                <th scope="col" className="px-4 py-2.5 font-medium">Timestamp</th>
                <th scope="col" className="px-3 py-2.5 font-medium">Admin</th>
                <th scope="col" className="px-3 py-2.5 font-medium">Action</th>
                <th scope="col" className="hidden px-3 py-2.5 font-medium lg:table-cell">Resource</th>
                <th scope="col" className="px-3 py-2.5 font-medium">Description</th>
                <th scope="col" className="hidden px-3 py-2.5 font-medium xl:table-cell">IP · Device</th>
                <th scope="col" className="px-3 py-2.5 font-medium">Result</th>
                <th scope="col" className="w-10 px-2 py-2.5"><span className="sr-only">Details</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-kampmax-border">
              {items.map((l) => (
                <AuditRow key={l.id} log={l} onView={onView} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <ul className="space-y-2.5 md:hidden">
        {items.map((l) => (
          <MobileCard key={l.id} log={l} onView={onView} />
        ))}
      </ul>
    </>
  );
}

function AuditRow({ log: l, onView }: { log: AuditLog; onView: (l: AuditLog) => void }) {
  const ActionIcon = AUDIT_ACTION_ICONS[l.action];
  const ResourceIcon = AUDIT_RESOURCE_ICONS[l.resource];
  return (
    <tr
      onClick={() => onView(l)}
      className="cursor-pointer transition-colors hover:bg-kampmax-muted/40"
    >
      <td
        className="whitespace-nowrap px-4 py-2.5 tabular-nums text-xs text-kampmax-text-secondary"
        title={new Date(l.at).toISOString()}
      >
        <span className="block font-medium text-kampmax-text">
          {formatDateTime(l.at)}
        </span>
        <span className="text-[11px]">{timeAgo(l.at)}</span>
      </td>

      <td className="max-w-[150px] whitespace-nowrap px-3 py-2.5">
        <span className="flex items-center gap-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-kampmax-blue/10 text-[10px] font-semibold text-kampmax-blue">
            {l.adminName
              .split(/\s+/)
              .map((w) => w.charAt(0))
              .slice(0, 2)
              .join("")}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[13px] font-medium text-kampmax-text" title={l.adminName}>
              {l.adminName}
            </span>
            <span className="block text-[10px] uppercase tracking-wide text-kampmax-text-secondary">
              {l.adminRole.replace("_", " ")}
            </span>
          </span>
        </span>
      </td>

      <td className="whitespace-nowrap px-3 py-2.5">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium capitalize",
            badgeVariantClasses(auditActionVariant(l.action))
          )}
        >
          <ActionIcon className="h-3 w-3" aria-hidden />
          {auditActionLabel(l.action)}
        </span>
      </td>

      <td className="hidden max-w-[160px] whitespace-nowrap px-3 py-2.5 lg:table-cell">
        <span className="inline-flex items-center gap-1.5 text-xs text-kampmax-text">
          <ResourceIcon className="h-3.5 w-3.5 shrink-0 text-kampmax-text-secondary" aria-hidden />
          {AUDIT_RESOURCE_LABELS[l.resource]}
        </span>
        <span className="mt-0.5 block truncate font-mono text-[10px] uppercase text-kampmax-text-secondary/70" title={l.resourceId}>
          {l.resourceId}
        </span>
      </td>

      <td className="max-w-[300px] px-3 py-2.5">
        <p className="line-clamp-2 text-[13px] leading-snug text-kampmax-text" title={l.description}>
          {l.description}
        </p>
      </td>

      <td className="hidden max-w-[190px] whitespace-nowrap px-3 py-2.5 xl:table-cell">
        <span className="block font-mono text-xs tabular-nums text-kampmax-text">{l.ip}</span>
        <span className="block truncate text-[11px] text-kampmax-text-secondary" title={l.device}>
          {l.device}
        </span>
      </td>

      <td className="whitespace-nowrap px-3 py-2.5">
        <StatusBadge variant={auditResultVariant(l.result)} label={resultLabel(l.result)} dot />
      </td>

      <td className="px-2 py-2.5">
        <button
          type="button"
          aria-label={`Open details for event ${l.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onView(l);
          }}
          className="rounded-md p-1.5 text-kampmax-text-secondary transition-colors hover:bg-kampmax-muted hover:text-kampmax-text"
        >
          <ScrollText className="h-4 w-4" aria-hidden />
        </button>
      </td>
    </tr>
  );
}function MobileCard({ log: l, onView }: { log: AuditLog; onView: (l: AuditLog) => void }) {
  const ActionIcon = AUDIT_ACTION_ICONS[l.action];
  const ResourceIcon = AUDIT_RESOURCE_ICONS[l.resource];
  return (
    <li
      onClick={() => onView(l)}
      className="cursor-pointer rounded-lg border border-kampmax-border bg-white p-3 transition-colors active:bg-kampmax-muted/50"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-kampmax-text-secondary">
          <ActionIcon
            className={cn("h-3.5 w-3.5", actionTextClass(auditActionVariant(l.action)))}
            aria-hidden
          />
          {auditActionLabel(l.action)}
          <ResourceIcon className="ml-1 h-3 w-3" aria-hidden />
          {AUDIT_RESOURCE_LABELS[l.resource]}
        </span>
        <StatusBadge variant={auditResultVariant(l.result)} label={resultLabel(l.result)} dot />
      </div>

      <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-kampmax-text">
        {l.description}
      </p>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 border-t border-dashed border-kampmax-border pt-2 text-[11px] text-kampmax-text-secondary">
        <span className="min-w-0 truncate">
          {l.adminName}
          <span className="ml-1.5 font-mono uppercase">{l.resourceId}</span>
        </span>
        <span className="tabular-nums" title={formatDateTime(l.at)}>
          {timeAgo(l.at)}
        </span>
      </div>

      <p className="mt-1 flex items-center gap-1 font-mono text-[10px] text-kampmax-text-secondary/70">
        <MonitorSmartphone className="h-3 w-3" aria-hidden />
        {l.ip} · {l.device}
      </p>
    </li>
  );
}

function resultLabel(result: AuditLog["result"]): string {
  return result.charAt(0).toUpperCase() + result.slice(1);
}

function actionTextClass(variant: string): string {
  switch (variant) {
    case "success":
      return "text-kampmax-success";
    case "error":
      return "text-kampmax-error";
    case "warning":
      return "text-amber-600";
    case "blue":
      return "text-kampmax-blue";
    default:
      return "text-kampmax-info";
  }
}
