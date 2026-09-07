import { NotificationCategory } from "@/types";
import type { EmployerApplicationStatus } from "@/types/opportunity";

/**
 * Structured TanStack Query key factory for Kampmax.
 *
 * Keys are scoped per user so caches never leak data between sessions.
 * The `notifications` preview is deliberately flat and shareable — the
 * NotificationSyncBridge invalidates the top-level `all` key whenever the
 * notification store changes, so every dependent query refreshes together.
 * Keys are scoped per user so caches never leak between sessions.
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

/**
 * Jobs key factory (Module 27).
 *
 * The public marketplace list/detail are NOT user-scoped (only OPEN,
 * discoverable jobs). Employer lists, counts and details are scoped per
 * user so owner-only records can never leak between sessions. Saved-job ids
 * are per user.
 */
export interface JobListQuery {
  search?: string;
  categoryId?: string;
  experience?: string;
  arrangement?: string;
  sort?: string;
  page?: number;
  size?: number;
}

export interface EmployerJobListQuery {
  status?: string;
  sort?: string;
  page?: number;
  size?: number;
}

export const jobKeys = {
  all: ["jobs"] as const,
  list: (filters: JobListQuery) => ["jobs", "list", filters] as const,
  detail: (id: string) => ["jobs", "detail", id] as const,
  employerList: (userId: string, filters: EmployerJobListQuery) =>
    ["jobs", "employer", userId, "list", filters] as const,
  employerDetail: (userId: string, id: string) =>
    ["jobs", "employer", userId, "detail", id] as const,
  employerCounts: (userId: string) =>
    ["jobs", "employer", userId, "counts"] as const,
  saved: (userId: string) => ["jobs", "saved", userId] as const,
};

/**
 * Applications & hiring key factory (Module 28). Employer-scoped per user so
 * owner-only proposal records and public candidate profiles can never leak
 * between sessions. The employer-facing mutations invalidate the flat `all`
 * key AND the jobs keys (accepting an application closes the job), so list,
 * counts and job detail all refresh together.
 */
export interface EmployerApplicationListQuery {
  jobId?: string;
  status?: EmployerApplicationStatus | "all";
  sort?: string;
  search?: string;
  page?: number;
  size?: number;
}

export const applicationKeys = {
  all: ["applications"] as const,
  list: (userId: string, filters: EmployerApplicationListQuery) =>
    ["applications", "list", userId, filters] as const,
  detail: (userId: string, id: string) =>
    ["applications", "detail", userId, id] as const,
  summary: (userId: string) =>
    ["applications", "summary", userId] as const,
};

/**
 * Employer dashboard key factory (Module 29). The dashboard is an
 * orchestration layer, so its summary aggregates owner-scoped data from
 * the existing modules; every relevant mutation additionally invalidates
 * the flat `all` key so the dashboard refreshes together with its sources.
 */
export const dashboardKeys = {
  all: ["employer-dashboard"] as const,
  summary: (userId: string) =>
    ["employer-dashboard", "summary", userId] as const,
  contracts: (userId: string) =>
    ["employer-dashboard", "contracts", userId] as const,
};