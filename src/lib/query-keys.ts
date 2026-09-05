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

/**
 * Messaging key factory. Conversation and thread keys are scoped per user so
 * message content can never leak between sessions or accounts. The Message
 * SyncBridge invalidates the top-level `all` key whenever the messaging store
 * changes (send / mark-as-read) so the list, thread, previews and unread badge
 * all refresh together — the same pattern as notifications.
 */
export interface MessageListFilters {
  search: string;
}

export const messageKeys = {
  all: ["messages"] as const,
  conversations: (userId: string, filters: MessageListFilters) =>
    ["messages", "conversations", userId, filters] as const,
  unreadCount: (userId: string) =>
    ["messages", "unread-count", userId] as const,
  conversation: (conversationId: string, userId: string) =>
    ["messages", "conversation", conversationId, userId] as const,
  thread: (conversationId: string, userId: string) =>
    ["messages", "thread", conversationId, userId] as const,
};