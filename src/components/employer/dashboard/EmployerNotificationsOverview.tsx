"use client";

import { useRouter } from "next/navigation";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { useMarkNotificationAsRead, useNotifications, useUnreadNotificationCount } from "@/hooks/use-notifications";
import { getFriendlyErrorMessage } from "@/lib/error-messages";
import { getSafeNotificationTarget } from "@/lib/notification-utils";
import {
  EmployerDashboardEmpty,
  EmployerDashboardError,
  EmployerDashboardSection,
  EmployerDashboardSkeleton,
} from "./EmployerDashboardSection";

export function EmployerNotificationsOverview() {
  const router = useRouter();
  const unreadQuery = useUnreadNotificationCount();
  const markRead = useMarkNotificationAsRead();
  const listQuery = useNotifications({ category: "all" }, { pageSize: 5 });

  const notifications = listQuery.data?.flattened ?? [];
  const unread = unreadQuery.data ?? 0;

  if (listQuery.isPending) {
    return (
      <EmployerDashboardSection
        title="Notifications"
        action={{ href: "/notifications", label: "View all" }}
      >
        <EmployerDashboardSkeleton rows={4} />
      </EmployerDashboardSection>
    );
  }

  if (listQuery.isError) {
    return (
      <EmployerDashboardSection
        title="Notifications"
        action={{ href: "/notifications", label: "View all" }}
      >
        <EmployerDashboardError message={getFriendlyErrorMessage(listQuery.error)} onRetry={listQuery.refetch} />
      </EmployerDashboardSection>
    );
  }

  return (
    <EmployerDashboardSection
      title={`Notifications${unread > 0 ? ` (${unread} unread)` : ""}`}
      action={{ href: "/notifications", label: "View all" }}
    >
      {notifications.length === 0 ? (
        <EmployerDashboardEmpty title="You're all caught up" detail="No notifications right now." />
      ) : (
        <div className="divide-y divide-kampmax-border/70">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              compact
              onMarkAsRead={(id) => markRead.mutate(id)}
              onNavigate={(url) => {
                const target = getSafeNotificationTarget(url);
                if (target) router.push(target);
              }}
            />
          ))}
        </div>
      )}
    </EmployerDashboardSection>
  );
}