import { NotificationCategory } from "@/types";

/**
 * Structured TanStack Query key factory for Kampmax.
 *
 * Keys are scoped per user so caches never leak data between sessions.
 * The `notifications` preview is deliberately flat and shareable — the
 * NotificationSyncBridge invalidates the top-level `all` key whenever the
 * notification store changes so every dependent query refreshes together.
 */
export interface NotificationListFilters {
  category: NotificationCategory | "all";
}

export const notificationKeys = {
  all: ["notifications"] as const,
  list: (userId: string, filters: NotificationListFilters) =>
    ["notifications", "list", userId, filters] as const,
  unreadCount: (userId: string) =>
    ["notifications", "unread-count", userId] as const,
  categorySummaries: (userId: string) =>
    ["notifications", "category-summaries", userId] as const,
};