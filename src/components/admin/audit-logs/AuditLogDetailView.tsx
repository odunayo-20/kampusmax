"use client";

import {
  Fingerprint,
  Hash,
  Megaphone,
  ScrollText,
  ShieldAlert,
  Tag,
  User,
  CalendarDays,
} from "lucide-react";
import { StatusBadge, badgeVariantClasses, type BadgeVariant } from "@/components/admin/StatusBadge";
import { ErrorState } from "@/components/admin/ErrorState";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { cn, formatDateTime } from "@/lib/utils";
import {
  AUDIT_ACTION_ICONS,
  AUDIT_ACTION_LABELS,
  AUDIT_RESOURCE_LABELS,
  auditActionVariant,
  auditEventSummary,
  auditResultVariant,
  auditSeverityLabel,
  isSecurityAction,
} from "./audit-logs-meta";
import type {
  AdminAuditEvent,
  AdminAuditMetadata,
} from "@/types/admin";

interface AuditLogDetailViewProps {
  event: AdminAuditEvent | null;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
}

/** Full read-only detail for a single immutable audit event. */
export function AuditLogDetailView({ event, loading, error, onRetry }: AuditLogDetailViewProps) {
  if (loading) {
    return (
      <div className="rounded-lg border border-kampmax-border bg-white">
        <LoadingSkeleton variant="detail" rows={8} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-kampmax-border bg-white p-6">
        <ErrorState onRetry={onRetry} />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="rounded-lg border border-kampmax-border bg-white p-6 text-center">
        <ScrollText className="mx-auto mb-3 h-8 w-8 text-kampmax-text-secondary/40" aria-hidden />
        <h2 className="text-sm font-semibold text-kampmax-text">Audit event not found</h2>
        <p className="mt-1 text-xs text-kampmax-text-secondary">
          This event does not exist or is no longer available in this session.
        </p>
      </div>
    );
  }

  const ActionIcon = AUDIT_ACTION_ICONS[event.action];
  const security = isSecurityAction(event.action);

  return (
    <div className="overflow-hidden rounded-lg border border-kampmax-border bg-white">
      {/* Event header */}
      <div className="border-b border-kampmax-border p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
              badgeVariantClasses(auditActionVariant(event.action))
            )}
          >
            <ActionIcon className="h-3.5 w-3.5" aria-hidden />
            {AUDIT_ACTION_LABELS[event.action]}
          </span>
          <StatusBadge
            variant={auditResultVariant(event.result)}
            label={auditResultLabel(event.result)}
            dot
          />
          <StatusBadge variant={auditSeverityVariant(event.severity)} label={auditSeverityLabel(event.severity)} dot />
          {security && (
            <StatusBadge variant="error" label="Security event" dot />
          )}
        </div>
        <p className="mt-3 text-sm text-kampmax-text" data-testid="audit-detail-summary">
          {auditEventSummary(event)}
        </p>
        <p className="mt-1 text-xs text-kampmax-text-secondary">
          {AUDIT_RESOURCE_LABELS[event.resource.type]} · {event.resource.id}
        </p>
      </div>

      <dl className="grid grid-cols-1 gap-5 p-4 sm:grid-cols-2 sm:p-5">
        <InfoRow icon={Hash} label="Event ID" value={event.id} mono />
        <InfoRow
          icon={CalendarDays}
          label="Timestamp"
          value={`${formatDateTime(event.at)} · ${new Date(event.at).toISOString()}`}
          mono
        />

        <InfoRow
          icon={User}
          label="Actor"
          value={event.actor.name || (event.actor.type === "system" ? "System" : "Platform Admin")}
        />
        <InfoRow
          icon={Fingerprint}
          label="Actor role"
          value={actorRoleLabel(event)}
        />

        <InfoRow
          icon={Tag}
          label="Resource"
          value={event.resource.label ? `${event.resource.label} (${event.resource.id})` : event.resource.id}
          mono
        />
        <InfoRow
          icon={ShieldAlert}
          label="Severity"
          value={auditSeverityLabel(event.severity)}
        />
      </dl>

      {Object.keys(event.metadata).length > 0 && (
        <div className="border-t border-kampmax-border p-4 sm:p-5">
          <h3 className="text-[11px] font-medium uppercase tracking-wide text-kampmax-text-secondary">
            Audit context
          </h3>
          <MetadataRows metadata={event.metadata} action={event.action} />
        </div>
      )}
    </div>
  );
}

function MetadataRows({ metadata, action }: { metadata: AdminAuditMetadata; action: string }) {
  const rows: { label: string; value: string }[] = [];

  if (metadata.title) rows.push({ label: "Notification title", value: metadata.title });
  if (metadata.audience) rows.push({ label: "Audience", value: metadata.audience.replaceAll("_", " ") });
  if (typeof metadata.recipientCount === "number")
    rows.push({ label: "Recipients", value: String(metadata.recipientCount) });
  if (metadata.previousStatus && metadata.newStatus)
    rows.push({
      label: "Status change",
      value: `${metadata.previousStatus.replaceAll("_", " ")} → ${metadata.newStatus.replaceAll("_", " ")}`,
    });
  if (metadata.reason) rows.push({ label: "Reason", value: metadata.reason });

  if (rows.length === 0) return null;

  return (
    <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
      {rows.map((r) => (
        <div key={r.label} className="rounded-md border border-kampmax-border bg-kampmax-muted/30 px-3 py-2.5">
          <dt className="flex items-center gap-1 text-[11px] font-medium text-kampmax-text-secondary">
            {action === "NOTIFICATION_SENT" && r.label === "Notification title" && (
              <Megaphone className="h-3 w-3" aria-hidden />
            )}
            {r.label}
          </dt>
          <dd className="mt-0.5 break-words text-sm text-kampmax-text">{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon?: typeof Tag;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs font-medium text-kampmax-text-secondary">
        <span className="inline-flex items-center gap-1">
          {Icon && <Icon className="h-3 w-3 opacity-60" aria-hidden />}
          {label}
        </span>
      </dt>
      <dd
        className={cn(
          "mt-0.5 break-all text-sm text-kampmax-text",
          mono && "font-mono text-xs normal-case"
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function auditResultLabel(result: AdminAuditEvent["result"]): string {
  return result.charAt(0).toUpperCase() + result.slice(1);
}

function auditSeverityVariant(severity: AdminAuditEvent["severity"]): BadgeVariant {
  switch (severity) {
    case "critical":
      return "error";
    case "high":
      return "warning";
    case "medium":
      return "info";
    default:
      return "blue";
  }
}

function actorRoleLabel(event: AdminAuditEvent): string {
  if (event.actor.type === "system") return "Automated";
  return (event.actor.role ?? "Admin").replaceAll("_", " ").toLowerCase();
}