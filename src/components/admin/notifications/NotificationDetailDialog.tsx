"use client";

import { useEffect } from "react";
import {
  Bell,
  CalendarClock,
  Mail,
  Users,
  X,
} from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { communityCampusName } from "@/components/admin/campus-community/campus-community-utils";
import { cn, formatDateTime } from "@/lib/utils";
import {
  DELIVERY_ICONS,
  DELIVERY_LABELS,
  audienceLabel,
  notificationStatusLabel,
  notificationStatusVariant,
  notificationTypeLabel,
  notificationTypeVariant,
} from "./notifications-meta";
import type { ManagedNotification, NotificationDeliveryType } from "@/types/admin";

const DELIVERY_ICONS_MAP = DELIVERY_ICONS;

export function NotificationDetailDialog({
  notification,
  onClose,
}: {
  notification: ManagedNotification | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!notification) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [notification, onClose]);

  if (!notification) return null;
  const n = notification;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Notification details"
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
                {n.id}
              </span>
              <StatusBadge
                variant={notificationTypeVariant(n.type)}
                label={notificationTypeLabel(n.type)}
              />
              <StatusBadge
                variant={notificationStatusVariant(n.status)}
                label={notificationStatusLabel(n.status)}
              />
            </div>
            <h2 className="mt-1.5 text-sm font-semibold leading-snug text-kampmax-text">
              {n.title}
            </h2>
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

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {/* Message */}
          <p className="whitespace-pre-line text-sm leading-relaxed text-kampmax-text">
            {n.message}
          </p>

          {/* Meta grid */}
          <dl className="space-y-2.5 rounded-lg border border-kampmax-border bg-kampmax-muted/30 px-4 py-3 text-xs">
            <Row label="Audience" value={audienceLabel(n.audience)} />
            <Row
              label="Campus scope"
              value={n.campusId ? communityCampusName(n.campusId) : "All campuses"}
            />
            <Row
              label={n.status === "scheduled" ? "Scheduled for" : "Delivered at"}
              value={
                n.status === "draft" ? "-" : formatDateTime(n.deliverAt)
              }
            />
            <Row label="Created by" value={n.sentBy} />
            <Row label="Created at" value={formatDateTime(n.createdAt)} />
          </dl>

          {/* Delivery channels */}
          <section aria-label="Delivery channels">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-kampmax-text-secondary">
              Delivery channels
            </h3>
            <ul className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              {(ALL_DELIVERY as NotificationDeliveryType[]).map((t) => {
                const Icon =
                  DELIVERY_ICONS_MAP[t as keyof typeof DELIVERY_ICONS_MAP] ?? Bell;
                const active = n.deliveryTypes.includes(t);
                return (
                  <li
                    key={t}
                    className={cn(
                      "flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2.5 text-xs font-medium",
                      active
                        ? "border-kampmax-blue/40 bg-kampmax-blue/5 text-kampmax-text"
                        : "border-dashed border-kampmax-border text-kampmax-text-secondary/60 line-through decoration-kampmax-text-secondary/30"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden />
                    {DELIVERY_LABELS[t]}
                  </li>
                );
              })}
            </ul>
            <p className="mt-1.5 text-[11px] italic text-kampmax-text-secondary">
              Channels are recorded intent only - no provider is contacted in
              this prototype.
            </p>
          </section>

          {/* Stats (sent only) */}
          {n.status === "sent" && (
            <section aria-label="Delivery stats" className="grid grid-cols-2 gap-2">
              <StatTile
                icon={Users}
                label="Recipients"
                value={n.recipients.toLocaleString("en-NG")}
              />
              <StatTile
                icon={Mail}
                label="Open rate"
                value={`${n.openRate}%`}
                tone={n.openRate >= 40 ? "success" : "neutral"}
              />
            </section>
          )}
          {n.status === "scheduled" && (
            <p className="flex items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2.5 text-xs text-kampmax-info">
              <CalendarClock className="h-4 w-4 shrink-0" aria-hidden />
              Queued for delivery on {formatDateTime(n.deliverAt)}.
            </p>
          )}
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

// Local constant so this file stays dependency-light.
const ALL_DELIVERY: readonly string[] = [
  "in_app",
  "push",
  "email",
  "sms",
];

function Row({ label, value }: { label: string; value: string }) {  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="shrink-0 uppercase tracking-wide text-kampmax-text-secondary">
        {label}
      </dt>
      <dd className="truncate text-right font-medium text-kampmax-text">
        {value}
      </dd>
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  tone = "neutral",
}: {
  icon: typeof Users;
  label: string;
  value: string;
  tone?: "neutral" | "success";
}) {
  return (
    <div className="rounded-lg border border-kampmax-border px-3 py-2.5">
      <p className="flex items-center gap-1.5 text-[11px] font-medium text-kampmax-text-secondary">
        <Icon className="h-3.5 w-3.5" aria-hidden />
        {label}
      </p>
      <p
        className={cn(
          "mt-1 text-lg font-semibold tabular-nums",
          tone === "success" ? "text-kampmax-success" : "text-kampmax-text"
        )}
      >
        {value}
      </p>
    </div>
  );
}
