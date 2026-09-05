"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { NotificationBadge } from "@/components/notifications/NotificationBadge";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { NotificationSkeleton } from "@/components/notifications/NotificationSkeleton";
import { NotificationErrorState } from "@/components/notifications/NotificationErrorState";
import { EmptyNotifications } from "@/components/notifications/EmptyNotifications";
import {
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotifications,
  useUnreadNotificationCount,
} from "@/hooks/use-notifications";
import { notificationErrorMessage } from "@/lib/notification-utils";
import { getSafeNotificationTarget } from "@/lib/notification-utils";

const BELL_BASE_CLASSES =
  "relative h-9 w-9 flex items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600";

interface NotificationBellProps {
  variant: "dropdown" | "link";
  className?: string;
  /** Highlights the bell when the notifications route is the active page. */
  active?: boolean;
}

export function NotificationBell({
  variant,
  className,
  active,
}: NotificationBellProps) {
  const unreadQuery = useUnreadNotificationCount();
  const count = unreadQuery.data ?? 0;
  // The badge only appears once the count is known and readable; on a
  // loading/error state it stays hidden rather than flashing a wrong "0".
  const showBadge =
    !unreadQuery.isPending && !unreadQuery.isError && count > 0;

  if (variant === "link") {
    return (
      <Link
        href="/notifications"
        aria-label="Notifications"
        className={cn(
          BELL_BASE_CLASSES,
          "hover:bg-neutral-100",
          active ? "bg-primary-50 text-primary-600" : "text-neutral-600",
          className,
        )}
      >
        <Bell className="h-[19px] w-[19px]" />
        {showBadge && (
          <NotificationBadge
            count={count}
            className="absolute top-0.5 right-0.5 ring-1 ring-white"
          />
        )}
      </Link>
    );
  }

  return (
    <NotificationDropdown
      count={count}
      showBadge={showBadge}
      active={active}
      className={className}
    />
  );
}

interface NotificationDropdownProps {
  count: number;
  showBadge: boolean;
  active?: boolean;
  className?: string;
}

function NotificationDropdown({
  count,
  showBadge,
  active,
  className,
}: NotificationDropdownProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const listQuery = useNotifications({ category: "all" }, { pageSize: 8 });
  const markRead = useMarkNotificationAsRead();
  const markAll = useMarkAllNotificationsAsRead();

  const close = useCallback(() => {
    setOpen(false);
    buttonRef.current?.focus();
  }, []);

  // Return focus to the panel while open and make Escape close it.
  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  function handleNavigate(url?: string) {
    setOpen(false);
    const target = getSafeNotificationTarget(url);
    if (target) router.push(target);
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(
          BELL_BASE_CLASSES,
          "hover:bg-neutral-100",
          active || open
            ? "bg-primary-50 text-primary-600"
            : "text-neutral-600",
          className,
        )}
      >
        <Bell className="h-[18px] w-[18px]" />
        {showBadge && (
          <NotificationBadge
            count={count}
            className="absolute top-0.5 right-0.5 ring-1 ring-white"
          />
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={close}
            aria-hidden="true"
          />
          <div
            ref={panelRef}
            role="dialog"
            aria-label="Notifications"
            tabIndex={-1}
            className="absolute right-0 top-full mt-2 z-50 w-[min(22rem,calc(100vw-2rem))] bg-white rounded-xl border border-neutral-200 shadow-xl overflow-hidden outline-none"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
              <p className="text-sm font-bold text-neutral-900">
                Notifications
              </p>
              {count > 0 && (
                <button
                  onClick={() => markAll.mutate()}
                  disabled={markAll.isPending}
                  className="text-xs font-semibold text-primary-600 hover:text-primary-700 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded"
                >
                  {markAll.isPending ? "Marking…" : "Mark all read"}
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {listQuery.isPending && <NotificationSkeleton count={5} compact />}
              {listQuery.isError && (
                <NotificationErrorState
                  error={listQuery.error}
                  onRetry={() => listQuery.refetch()}
                  compact
                />
              )}
              {!listQuery.isPending &&
                !listQuery.isError &&
                listQuery.data?.flattened.length === 0 && (
                  <EmptyNotifications />
                )}
              {listQuery.data?.flattened.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  compact
                  onMarkAsRead={(id) => markRead.mutate(id)}
                  onNavigate={(url) => handleNavigate(url)}
                />
              ))}
            </div>

            <div className="border-t border-neutral-100 p-2">
              <Link
                href="/notifications"
                onClick={close}
                className="flex items-center justify-center w-full px-3 py-2 rounded-lg text-sm font-semibold text-primary-600 hover:bg-primary-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
              >
                View all notifications
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}