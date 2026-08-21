"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { PageContainer } from "@/components/layout/PageContainer";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { CategoryFilter } from "@/components/notifications/CategoryFilter";
import { EmptyNotifications } from "@/components/notifications/EmptyNotifications";
import { useAuth } from "@/lib/auth-context";
import {
  getNotifications,
  getUnreadNotificationCount,
  getGroupedNotifications,
  getUnreadCountByCategory,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "@/services/notifications";
import { NotificationCategory } from "@/types";
import { CheckCheck, Bell, Filter } from "lucide-react";

export default function NotificationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<
    NotificationCategory | "all"
  >("all");
  const [viewMode, setViewMode] = useState<"grouped" | "flat">("grouped");
  const [, setTick] = useState(0);

  if (!user) return null;

  const allNotifs = getNotifications(user.id);
  const totalUnread = getUnreadNotificationCount(user.id);
  const grouped = getGroupedNotifications(user.id);

  const categories = [
    {
      id: "all" as const,
      label: "All",
      count: allNotifs.length,
      unread: totalUnread,
    },
    ...grouped.map((g) => ({
      id: g.category,
      label: g.label,
      count: g.notifications.length,
      unread: getUnreadCountByCategory(user!.id, g.category),
    })),
  ];

  const displayedNotifs =
    selectedCategory === "all"
      ? allNotifs
      : allNotifs.filter((n) => n.category === selectedCategory);

  const displayedGrouped =
    selectedCategory === "all"
      ? grouped
      : grouped.filter((g) => g.category === selectedCategory);

  function handleMarkAsRead(id: string) {
    markAsRead(id);
    setTick((t) => t + 1);
  }

  function handleMarkAll() {
    markAllAsRead(user!.id);
    setTick((t) => t + 1);
  }

  function handleDelete(id: string) {
    deleteNotification(id);
    setTick((t) => t + 1);
  }

  function handleNavigate(url: string) {
    router.push(url);
  }

  return (
    <PageContainer className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-bold text-kampmax-text">Notifications</h1>
            {totalUnread > 0 && (
              <p className="text-xs text-kampmax-text-secondary">
                {totalUnread} unread
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <button
            onClick={() =>
              setViewMode(viewMode === "grouped" ? "flat" : "grouped")
            }
            className="p-2 rounded-lg text-kampmax-text-secondary hover:bg-kampmax-muted transition-colors"
            title={viewMode === "grouped" ? "Flat view" : "Grouped view"}
          >
            <Filter className="h-4 w-4" />
          </button>

          {totalUnread > 0 && (
            <button
              onClick={handleMarkAll}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-kampmax-blue bg-kampmax-blue/10 hover:bg-kampmax-blue/15 transition-colors"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <CategoryFilter
        categories={categories}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />

      {/* Content */}
      {displayedNotifs.length === 0 ? (
        <EmptyNotifications filtered={selectedCategory !== "all"} />
      ) : viewMode === "grouped" ? (
        /* Grouped View */
        <div className="space-y-3">
          {displayedGrouped.map((group) => {
            const groupUnread = group.notifications.filter(
              (n) => !n.read
            ).length;
            return (
              <div
                key={group.category}
                className="bg-white rounded-xl border border-kampmax-border overflow-hidden"
              >
                {/* Group Header */}
                <div className="px-4 py-3 border-b border-kampmax-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-kampmax-text">
                      {group.label}
                    </h3>
                    <span className="text-[10px] text-kampmax-text-secondary px-1.5 py-0.5 rounded-full bg-kampmax-muted">
                      {group.notifications.length}
                    </span>
                  </div>
                  {groupUnread > 0 && (
                    <span className="text-[10px] font-semibold text-kampmax-blue">
                      {groupUnread} unread
                    </span>
                  )}
                </div>

                {/* Notifications */}
                <div className="divide-y divide-kampmax-border">
                  {group.notifications.map((notif) => (
                    <NotificationItem
                      key={notif.id}
                      notification={notif}
                      onMarkAsRead={handleMarkAsRead}
                      onDelete={handleDelete}
                      onNavigate={handleNavigate}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Flat View */
        <div className="bg-white rounded-xl border border-kampmax-border overflow-hidden divide-y divide-kampmax-border">
          {displayedNotifs.map((notif) => (
            <NotificationItem
              key={notif.id}
              notification={notif}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDelete}
              onNavigate={handleNavigate}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
