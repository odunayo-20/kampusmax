"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Check, BellRing } from "lucide-react";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/lib/utils";
import {
  getSpNotifications,
  markSpNotificationsRead,
} from "@/services/service-provider-dashboard";
import type { ServiceProviderNotification } from "@/types/service-provider-dashboard";

const KIND_DOT: Record<ServiceProviderNotification["kind"], string> = {
  profile_approved: "bg-success-500",
  verification_update: "bg-info-600",
  new_review: "bg-primary-600",
  service_moderation: "bg-success-600",
  booking_request: "bg-warning-600",
  financial_update: "bg-info-600",
  system_announcement: "bg-neutral-400",
};

/** Owner-scoped dashboard notification bell. Uses the existing dashboard
 * notification feed (like the vendor dashboard) — no duplicate notification
 * delivery system. */
export function ServiceProviderNotifications() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(() => getSpNotifications());

  function refresh() {
    setData(getSpNotifications());
  }

  const unread = data.unreadCount;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-neutral-600 hover:bg-neutral-100"
      >
        <Bell className="h-5 w-5" aria-hidden />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-error-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-error-600" />
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} aria-hidden />
          <div
            role="menu"
            className="absolute right-0 top-full z-40 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-kampmax-border bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-kampmax-border px-4 py-3">
              <p className="text-sm font-bold text-kampmax-text">Notifications</p>
              {unread > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    markSpNotificationsRead(true);
                    refresh();
                  }}
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:underline"
                >
                  <Check className="h-3.5 w-3.5" aria-hidden /> Mark all read
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {data.items.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <BellRing className="mx-auto mb-2 h-6 w-6 text-neutral-300" aria-hidden />
                  <p className="text-sm text-kampmax-text-secondary">You're all caught up.</p>
                </div>
              ) : (
                data.items.map((n) => (
                  <NotificationRow
                    key={n.id}
                    n={n}
                    onConsume={() => {
                      if (!n.read) {
                        markSpNotificationsRead(false, n.id);
                        refresh();
                      }
                    }}
                  />
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function NotificationRow({ n, onConsume }: { n: ServiceProviderNotification; onConsume: () => void }) {
  const content = (
    <>
      <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", KIND_DOT[n.kind])} aria-hidden />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className={cn("truncate text-sm text-kampmax-text", !n.read && "font-bold")}>{n.title}</span>
          {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary-600" aria-label="Unread" />}
        </span>
        <span className="block text-xs text-kampmax-text-secondary">{n.body}</span>
        <span className="block text-[10px] text-kampmax-text-muted">{timeAgo(n.createdAt)}</span>
      </span>
    </>
  );

  const cls = cn(
    "flex w-full items-start gap-2.5 px-4 py-3 text-left hover:bg-neutral-50",
    n.read ? "bg-white" : "bg-primary-50/50"
  );

  if (n.href) {
    return (
      <Link href={n.href} onClick={onConsume} className={cls}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onConsume} className={cls}>
      {content}
    </button>
  );
}