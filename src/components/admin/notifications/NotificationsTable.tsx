"use client";

import {
  CalendarClock,
  Eye,
  Pencil,
  Send,
} from "lucide-react";
import { Pagination } from "@/components/admin/Pagination";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { EmptyState } from "@/components/admin/EmptyState";
import { ErrorState } from "@/components/admin/ErrorState";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { communityCampusName, previewText } from "@/components/admin/campus-community/campus-community-utils";
import { cn, formatDateShort, timeAgo } from "@/lib/utils";
import {
  DELIVERY_ICONS,
  audienceLabel,
  notificationActionsFor,
  notificationStatusLabel,
  notificationStatusVariant,
  notificationTypeIcon,
  notificationTypeLabel,
  notificationTypeVariant,
} from "./notifications-meta";
import type { ManagedNotification } from "@/types/admin";

export interface NotificationsTableProps {
  items: ManagedNotification[];
  loading: boolean;
  error: boolean;
  hasActiveFilters: boolean;
  onRetry: () => void;
  onClearFilters: () => void;
  onView: (n: ManagedNotification) => void;
  onEdit: (n: ManagedNotification) => void;
  onSendNow: (n: ManagedNotification) => void;
}

export function NotificationsTable(props: NotificationsTableProps) {
  const {
    items,
    loading,
    error,
    hasActiveFilters,
    onRetry,
    onClearFilters,
    onView,
    onEdit,
    onSendNow,
  } = props;

  if (loading) return <LoadingSkeleton variant="table" rows={6} />;
  if (error) return <ErrorState onRetry={onRetry} />;
  if (items.length === 0)
    return (
      <EmptyState
        title={hasActiveFilters ? "No notifications match" : "No notifications yet"}
        message={
          hasActiveFilters
            ? "Try different search terms or clear the filters."
            : "Compose your first platform broadcast to reach students and vendors."
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
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead>
              <tr className="border-b border-kampmax-border bg-kampmax-muted/40 text-[11px] uppercase tracking-wide text-kampmax-text-secondary">
                <th scope="col" className="px-4 py-2.5 font-medium">Notification</th>
                <th scope="col" className="px-3 py-2.5 font-medium">Type</th>
                <th scope="col" className="px-3 py-2.5 font-medium">Audience</th>
                <th scope="col" className="hidden px-3 py-2.5 font-medium xl:table-cell">Channels</th>
                <th scope="col" className="hidden px-3 py-2.5 font-medium lg:table-cell">Recipients</th>
                <th scope="col" className="hidden px-3 py-2.5 font-medium lg:table-cell">Opens</th>
                <th scope="col" className="px-3 py-2.5 font-medium">Date</th>
                <th scope="col" className="px-3 py-2.5 font-medium">Status</th>
                <th scope="col" className="w-10 px-2 py-2.5"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-kampmax-border">
              {items.map((n) => (
                <tr
                  key={n.id}
                  onClick={() => onView(n)}
                  className="cursor-pointer transition-colors hover:bg-kampmax-muted/40"
                >
                  <td className="max-w-[280px] px-4 py-2.5">
                    <p className="truncate font-medium text-kampmax-text" title={n.title}>
                      {n.title}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-kampmax-text-secondary" title={n.message}>
                      {previewText(n.message, 64)}
                    </p>
                  </td>

                  <td className="whitespace-nowrap px-3 py-2.5">
                    <TypeBadge n={n} />
                  </td>

                  <td className="whitespace-nowrap px-3 py-2.5">
                    <span className="text-xs font-medium text-kampmax-text">
                      {audienceLabel(n.audience)}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-kampmax-text-secondary">
                      {n.campusId ? communityCampusName(n.campusId) : "All campuses"}
                    </span>
                  </td>

                  {/* Delivery channels */}
                  <td className="px-3 py-2.5 xl:table-cell">
                    <span className="inline-flex items-center gap-1">
                      {n.deliveryTypes.map((t) => {
                        const Icon = DELIVERY_ICONS[t];
                        return (
                          <span
                            key={t}
                            title={t.replace("_", "-")}
                            className="flex h-6 w-6 items-center justify-center rounded-md bg-kampmax-muted text-kampmax-text-secondary"
                          >
                            <Icon className="h-3 w-3" aria-hidden />
                          </span>
                        );
                      })}
                    </span>
                  </td>

                  <td className="hidden whitespace-nowrap px-3 py-2.5 tabular-nums lg:table-cell">
                    {n.status === "sent"
                      ? n.recipients.toLocaleString("en-NG")
                      : <span className="text-kampmax-text-secondary">-</span>}
                  </td>

                  <td className="hidden whitespace-nowrap px-3 py-2.5 tabular-nums lg:table-cell">
                    {n.status === "sent" ? `${n.openRate}%` : <span className="text-kampmax-text-secondary">-</span>}
                  </td>

                  <td
                    className="whitespace-nowrap px-3 py-2.5 tabular-nums text-kampmax-text-secondary"
                    title={new Date(n.deliverAt || n.createdAt).toISOString()}
                  >
                    {n.status === "scheduled" && (
                      <CalendarClock className="mr-1 inline h-3 w-3 text-kampmax-info" aria-hidden />
                    )}
                    {n.status === "draft"
                      ? "-"
                      : formatDateShort(n.deliverAt)}
                    <span className="ml-1.5 hidden text-[11px] 2xl:inline">
                      {n.status !== "draft" ? timeAgo(n.deliverAt) : ""}
                    </span>
                  </td>

                  <td className="px-3 py-2.5">
                    <StatusBadge
                      variant={notificationStatusVariant(n.status)}
                      label={notificationStatusLabel(n.status)}
                    />
                  </td>

                  <td className="px-2 py-2.5" onClick={(e) => e.stopPropagation()}>
                    <RowActions n={n} onView={onView} onEdit={onEdit} onSendNow={onSendNow} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <ul className="space-y-2.5 md:hidden">
        {items.map((n) => {
          const allowed = notificationActionsFor(n);
          return (
            <li
              key={n.id}
              onClick={() => onView(n)}
              className="cursor-pointer rounded-lg border border-kampmax-border bg-white p-3 transition-colors active:bg-kampmax-muted/50"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="min-w-0 text-sm font-medium leading-snug text-kampmax-text">
                  {n.title}
                </p>
                <StatusBadge
                  variant={notificationStatusVariant(n.status)}
                  label={notificationStatusLabel(n.status)}
                />
              </div>

              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-kampmax-text-secondary">
                {previewText(n.message, 110)}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-dashed border-kampmax-border pt-2 text-[11px] text-kampmax-text-secondary">
                <TypeBadge n={n} compact />
                <span>{audienceLabel(n.audience)}</span>
                <span>· {n.campusId ? communityCampusName(n.campusId) : "All campuses"}</span>
                <span className="ml-auto inline-flex items-center gap-1">
                  {n.deliveryTypes.map((t) => {
                    const Icon = DELIVERY_ICONS[t];
                    return <Icon key={t} className="h-3 w-3" aria-hidden />;
                  })}
                </span>
              </div>

              {(allowed.edit || allowed.sendNow) && (
                <div
                  className="mt-2 flex items-center justify-end gap-1.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  {allowed.edit && (
                    <button
                      type="button"
                      onClick={() => onEdit(n)}
                      className="inline-flex h-7 items-center gap-1 rounded-md border border-kampmax-border bg-white px-2.5 text-[11px] font-medium text-kampmax-text transition-colors hover:bg-kampmax-muted/60"
                    >
                      <Pencil className="h-3 w-3" aria-hidden />
                      Edit
                    </button>
                  )}
                  {allowed.sendNow && (
                    <button
                      type="button"
                      onClick={() => onSendNow(n)}
                      className="inline-flex h-7 items-center gap-1 rounded-md border border-kampmax-blue/30 bg-kampmax-blue/10 px-2.5 text-[11px] font-medium text-kampmax-blue transition-colors hover:bg-kampmax-blue/15"
                    >
                      <Send className="h-3 w-3" aria-hidden />
                      Send now
                    </button>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}

function TypeBadge({ n, compact }: { n: ManagedNotification; compact?: boolean }) {
  const Icon = notificationTypeIcon(n.type);
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1.5",
        compact ? "truncate" : ""
      )}
    >
      <span
        className={cn(
          "inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium capitalize",
          typeBadgeClasses(notificationTypeVariant(n.type))
        )}
      >
        <Icon className="h-3 w-3" aria-hidden />
        {notificationTypeLabel(n.type)}
      </span>
    </span>
  );
}

function typeBadgeClasses(variant: string): string {
  switch (variant) {
    case "error":
      return "bg-kampmax-error/10 text-kampmax-error";
    case "gold":
      return "bg-kampmax-gold/15 text-kampmax-gold-dark";
    case "blue":
      return "bg-kampmax-blue/10 text-kampmax-blue";
    case "info":
      return "bg-kampmax-info/10 text-kampmax-info";
    case "success":
      return "bg-kampmax-success/10 text-kampmax-success";
    default:
      return "bg-kampmax-muted text-kampmax-text-secondary";
  }
}

function RowActions({
  n,
  onView,
  onEdit,
  onSendNow,
}: Pick<NotificationsTableProps, "onView" | "onEdit" | "onSendNow"> & {
  n: ManagedNotification;
}) {
  const allowed = notificationActionsFor(n);
  return (
    <div className="flex items-center justify-end gap-0.5">
      {allowed.sendNow && (
        <button
          type="button"
          title="Send now"
          onClick={() => onSendNow(n)}
          className="rounded-md p-1.5 text-kampmax-success transition-colors hover:bg-emerald-50"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      )}
      {allowed.edit && (
        <button
          type="button"
          title="Edit draft"
          onClick={() => onEdit(n)}
          className="rounded-md p-1.5 text-kampmax-text-secondary transition-colors hover:bg-kampmax-muted"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      )}
      <span
        role="button"
        tabIndex={0}
        title="View details"
        onClick={() => onView(n)}
        onKeyDown={(e) => e.key === "Enter" && onView(n)}
        className="hidden cursor-pointer rounded-md p-1.5 text-kampmax-text-secondary transition-colors hover:bg-kampmax-muted sm:block"
      >
        <Eye className="h-3.5 w-3.5" />
      </span>
    </div>
  );
}
