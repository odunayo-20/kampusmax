import { NotificationCategory } from "@/types";
import type { EmployerApplicationStatus } from "@/types/opportunity";
import type { GlobalSearchQuery } from "@/types";

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

/**
 * Employer profile key factory (Module 29A). Profile queries are per-user
 * so owner-only data never leaks between sessions. Profile updates invalidate
 * both `employerKeys.all` (profile reads) and `dashboardKeys.all` (dashboard
 * summary, header and completion).
 */
export const employerKeys = {
  all: ["employer"] as const,
  profile: (userId: string) => ["employer", "profile", userId] as const,
  publicProfile: (slug: string) =>
    ["employer", "public", slug] as const,
};

/**
 * Settings key factory (Module 30). Reads are scoped per user so cached
 * account/settings data can never leak between sessions. Mutations
 * invalidate the flat `all` key — since the platform preference stores
 * (notification / privacy / security) are shared records, every settings
 * query refreshes together after a change.
 */
export const settingsKeys = {
  all: ["settings"] as const,
  account: (userId: string) => ["settings", "account", userId] as const,
  notificationPreferences: (userId: string) =>
    ["settings", "notification-preferences", userId] as const,
  privacySettings: (userId: string) =>
    ["settings", "privacy", userId] as const,
  securitySettings: (userId: string) =>
    ["settings", "security", userId] as const,
};

/**
 * Global search key factory (Module 31).
 *
 * Results and suggestion keys embed the FULL normalized search query
 * (term + type + sort + page + campus + price range) so every unique
 * search carries its own cached response — the same convention as the
 * vertical list keys. Results are public discovery data (not user
 * scoped), so keys stay user-agnostic.
 */
export interface GlobalSearchQueryKey extends GlobalSearchQuery {}

export const searchKeys = {
  all: ["search"] as const,
  results: (query: GlobalSearchQuery) => ["search", "results", query] as const,
  suggestions: (q: string) => ["search", "suggestions", q] as const,
};

/**
 * Admin console key factory (Module 34). Dashboard keys are scoped per
 * campus so a campus-scoped operator's cached aggregates can never be
 * mistaken for platform-wide data. Session/identity is owned by the
 * admin-session store, not by react-query — the dashboard tree invalidates
 * flat under `adminKeys.all` on logout.
 */
export const adminKeys = {
  all: ["admin"] as const,
  dashboard: {
    overview: (scopeCampusId?: string | null) =>
      ["admin", "dashboard", "overview", scopeCampusId ?? "platform"] as const,
    revenue: (range: string) => ["admin", "dashboard", "revenue", range] as const,
    growth: (kind: string) => ["admin", "dashboard", "growth", kind] as const,
    campusSales: () => ["admin", "dashboard", "campus-sales"] as const,
    topProducts: (limit: number) =>
      ["admin", "dashboard", "top-products", limit] as const,
    lowStock: (limit: number) =>
      ["admin", "dashboard", "low-stock", limit] as const,
    recentOrders: (limit: number) =>
      ["admin", "dashboard", "recent-orders", limit] as const,
    activity: (pageSize: number) =>
      ["admin", "dashboard", "activity", pageSize] as const,
    stats: (scopeCampusId?: string | null) =>
      ["admin", "dashboard", "stats", scopeCampusId ?? "platform"] as const,
  },
  /**
   * User directory (Module 35). Keys are scope-qualified by the acting
   * operator's campus so a campus-scoped admin's cache can never leak
   * rows/counts across campus boundaries. `list` embeds the full query
   * object; React Query structural-hashes it, so identical params share
   * one cache entry.
   */
  users: {
    all: ["admin", "users"] as const,
    list: (
      query: {
        search?: string;
        role?: string;
        campusId?: string;
        status?: string;
        sortBy?: string;
        sortDir?: "asc" | "desc";
        page?: number;
        pageSize?: number;
      },
      scopeCampusId?: string | null
    ) => ["admin", "users", "list", scopeCampusId ?? "platform", query] as const,
    counts: (scopeCampusId?: string | null) =>
      ["admin", "users", "counts", scopeCampusId ?? "platform"] as const,
    detail: (id: string, scopeCampusId?: string | null) =>
      ["admin", "users", "detail", id, scopeCampusId ?? "platform"] as const,
    activity: (id: string, scopeCampusId?: string | null) =>
      ["admin", "users", "activity", id, scopeCampusId ?? "platform"] as const,
  },
  /**
   * Freelancer management key factory (Module 36). Keys are scoped per
   * admin session (via campusId) so campus-scoped operators never see
   * freelancers outside their scope. Mutations invalidate the whole
   * `freelancers` tree so list, counts, detail and activity stay consistent.
   */
  freelancers: {
    all: ["admin", "freelancers"] as const,
    list: (
      query: {
        search?: string;
        status?: string;
        categoryId?: string;
        campusId?: string;
        sortBy?: string;
        sortDir?: "asc" | "desc";
        page?: number;
        pageSize?: number;
      },
      scopeCampusId?: string | null
    ) => ["admin", "freelancers", "list", scopeCampusId ?? "platform", query] as const,
    counts: (scopeCampusId?: string | null) =>
      ["admin", "freelancers", "counts", scopeCampusId ?? "platform"] as const,
    detail: (id: string, scopeCampusId?: string | null) =>
      ["admin", "freelancers", "detail", id, scopeCampusId ?? "platform"] as const,
    activity: (id: string, scopeCampusId?: string | null) =>
      ["admin", "freelancers", "activity", id, scopeCampusId ?? "platform"] as const,
  } as const,
  /**
   * Employer management key factory (Module 37). Keys are scoped per
   * admin session (via campusId) so campus-scoped operators never see
   * employers outside their scope. Mutations invalidate the whole
   * `employers` tree so list, counts, detail and activity stay consistent.
   */
  employers: {
    all: ["admin", "employers"] as const,
    list: (
      query: {
        search?: string;
        status?: string;
        verification?: string;
        campusId?: string;
        industry?: string;
        sortBy?: string;
        sortDir?: "asc" | "desc";
        page?: number;
        pageSize?: number;
      },
      scopeCampusId?: string | null
    ) => ["admin", "employers", "list", scopeCampusId ?? "platform", query] as const,
    counts: (scopeCampusId?: string | null) =>
      ["admin", "employers", "counts", scopeCampusId ?? "platform"] as const,
    detail: (id: string, scopeCampusId?: string | null) =>
      ["admin", "employers", "detail", id, scopeCampusId ?? "platform"] as const,
    activity: (id: string, scopeCampusId?: string | null) =>
      ["admin", "employers", "activity", id, scopeCampusId ?? "platform"] as const,
  } as const,
  /**
   * Vendor management key factory (Module 38). Keys are scoped per
   * admin session (via campusId) so campus-scoped operators never see
   * vendors outside their scope. Mutations invalidate the whole
   * `vendors` tree so list, counts, detail and activity stay consistent.
   */
  vendors: {
    all: ["admin", "vendors"] as const,
    list: (
      query: {
        search?: string;
        queue?: string;
        campusId?: string;
        category?: string;
        sortBy?: string;
        sortDir?: "asc" | "desc";
        page?: number;
        pageSize?: number;
      },
      scopeCampusId?: string | null
    ) => ["admin", "vendors", "list", scopeCampusId ?? "platform", query] as const,
    counts: (scopeCampusId?: string | null) =>
      ["admin", "vendors", "counts", scopeCampusId ?? "platform"] as const,
    categories: (scopeCampusId?: string | null) =>
      ["admin", "vendors", "categories", scopeCampusId ?? "platform"] as const,
    detail: (id: string, scopeCampusId?: string | null) =>
      ["admin", "vendors", "detail", id, scopeCampusId ?? "platform"] as const,
    activity: (id: string, scopeCampusId?: string | null) =>
      ["admin", "vendors", "activity", id, scopeCampusId ?? "platform"] as const,
  } as const,
};