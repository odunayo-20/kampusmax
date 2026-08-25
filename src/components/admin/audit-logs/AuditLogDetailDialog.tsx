"use client";

import { useEffect } from "react";
import {
  Info,
  MonitorSmartphone,
  ScrollText,
  ShieldCheck,
  X,
} from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { cn, formatDateTime, timeAgo } from "@/lib/utils";
import {
  AUDIT_ACTION_ICONS,
  AUDIT_ACTION_LABELS,
  AUDIT_RESOURCE_ICONS,
  AUDIT_RESOURCE_LABELS,
  auditActionVariant,
  auditResultVariant,
} from "./audit-logs-meta";
import type { AuditLog } from "@/types/admin";

export function AuditLogDetailDialog({
  log,
  onClose,
}: {
  log: AuditLog | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!log) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [log, onClose]);

  if (!log) return null;
  const ActionIcon = AUDIT_ACTION_ICONS[log.action];
  const ResourceIcon = AUDIT_RESOURCE_ICONS[log.resource];

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Audit event details"
    >
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <div className="relative flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-kampmax-border bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-kampmax-border px-5 py-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] uppercase text-kampmax-text-secondary">
                {log.id}
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium capitalize",
                  badgeClasses(auditActionVariant(log.action))
                )}
              >
                <ActionIcon className="h-3 w-3" aria-hidden />
                {AUDIT_ACTION_LABELS[log.action]}
              </span>
              <StatusBadge variant={auditResultVariant(log.result)} label={resultLabel(log.result)} dot />
            </div>
            <p className="mt-1.5 text-sm font-semibold leading-snug text-kampmax-text">
              {log.description}
            </p>
            <p className="mt-0.5 text-xs tabular-nums text-kampmax-text-secondary">
              {formatDateTime(log.at)} · {timeAgo(log.at)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="-mr-1 rounded-md p-1 text-kampmax-text-secondary transition-colors hover:bg-kampmax-muted hover:text-kampmax-text"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {/* Actor */}
          <section aria-label="Admin">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-kampmax-text-secondary">
              Admin
            </h3>
            <div className="mt-2 flex items-center gap-3 rounded-lg border border-kampmax-border bg-kampmax-muted/30 px-3 py-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-kampmax-blue/10 text-xs font-semibold text-kampmax-blue">
                {log.adminName
                  .split(/\s+/)
                  .map((w) => w.charAt(0))
                  .slice(0, 2)
                  .join("")}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-kampmax-text">
                  {log.adminName}
                </p>
                <p className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wide text-kampmax-text-secondary">
                  <ShieldCheck className="h-3 w-3" aria-hidden />
                  {log.adminRole.replace("_", " ")}
                </p>
              </div>
            </div>
          </section>

          {/* Target */}
          <section aria-label="Target resource">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-kampmax-text-secondary">
              Target resource
            </h3>
            <dl className="mt-2 space-y-2 rounded-lg border border-kampmax-border px-3 py-2.5 text-xs">
              <Row
                label="Resource"
                value={
                  <span className="inline-flex items-center gap-1.5">
                    <ResourceIcon className="h-3.5 w-3.5 text-kampmax-text-secondary" aria-hidden />
                    {AUDIT_RESOURCE_LABELS[log.resource]}
                    <span className="font-mono text-[10px] text-kampmax-text-secondary/70">
                      ({log.resource})
                    </span>
                  </span>
                }
              />
              <Row
                label="Resource ID"
                value={<span className="font-mono uppercase">{log.resourceId}</span>}
              />
              <Row label="Action" value={AUDIT_ACTION_LABELS[log.action]} />
            </dl>
          </section>

          {/* Origin - placeholder */}
          <section aria-label="Origin">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-kampmax-text-secondary">
              Origin
            </h3>
            <dl className="mt-2 space-y-2 rounded-lg border border-kampmax-border px-3 py-2.5 text-xs">
              <Row
                label="IP address"
                value={
                  <span
                    className="inline-flex items-center gap-1.5 font-mono tabular-nums"
                    title="Placeholder value"
                  >
                    <Info className="h-3 w-3 text-kampmax-text-secondary/60" aria-hidden />
                    {log.ip}
                  </span>
                }
              />
              <Row
                label="Device"
                value={
                  <span className="inline-flex items-center gap-1.5">
                    <MonitorSmartphone className="h-3.5 w-3.5 text-kampmax-text-secondary" aria-hidden />
                    {log.device}
                  </span>
                }
              />
            </dl>
            <p className="mt-1.5 text-[11px] italic text-kampmax-text-secondary">
              IP and device strings are placeholders - real capture arrives with
              backend logging.
            </p>
          </section>

          {/* Result */}
          <section aria-label="Result">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-kampmax-text-secondary">
              Result
            </h3>
            <div
              className={cn(
                "mt-2 rounded-lg border px-3 py-2.5",
                log.result === "success"
                  ? "border-emerald-200 bg-emerald-50/60"
                  : log.result === "failed"
                    ? "border-amber-200 bg-amber-50/60"
                    : "border-red-200 bg-red-50/60"
              )}
            >
              <StatusBadge
                variant={auditResultVariant(log.result)}
                label={resultLabel(log.result)}
                dot={false}
              />
              <p className="mt-1.5 text-xs leading-relaxed text-kampmax-text">
                {log.result === "success"
                  ? "The action completed successfully and was recorded."
                  : log.result === "failed"
                    ? "The attempted operation did not complete. No state changed."
                    : "The admin's role did not permit this operation; the attempt was blocked."}
              </p>
            </div>
          </section>

          <p className="flex items-start gap-2 rounded-lg border border-dashed border-kampmax-border px-3 py-2.5 text-[11px] leading-snug text-kampmax-text-secondary">
            <ScrollText className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />
            Audit entries are mock data in this prototype - no backend logging is
            implemented yet.
          </p>
        </div>

        <div className="border-t border-kampmax-border px-5 py-3 pb-3.5 text-right">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 items-center rounded-md bg-kampmax-navy px-3 text-xs font-medium text-white transition-colors hover:bg-kampmax-navy-light"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="shrink-0 pt-0.5 text-[10px] uppercase tracking-wide text-kampmax-text-secondary">
        {label}
      </dt>
      <dd className="text-right font-medium text-kampmax-text">{value}</dd>
    </div>
  );
}

function resultLabel(result: AuditLog["result"]): string {
  return result.charAt(0).toUpperCase() + result.slice(1);
}

function badgeClasses(variant: string): string {
  switch (variant) {
    case "success":
      return "bg-kampmax-success/10 text-kampmax-success";
    case "error":
      return "bg-kampmax-error/10 text-kampmax-error";
    case "warning":
      return "bg-kampmax-warning/10 text-amber-700";
    case "blue":
      return "bg-kampmax-blue/10 text-kampmax-blue";
    default:
      return "bg-kampmax-info/10 text-kampmax-info";
  }
}
