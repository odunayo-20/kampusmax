// ============================================================
// ADMIN COMMUNICATIONS DATA (Module 47)
// ============================================================
//
// Read-only + one real mutation layer over the LIVE Module 26A
// in-app notification store (src/data/notifications.ts) and the
// real user registry (src/data/users.ts). It administers the SAME
// records the user notification center reads — this is not a
// second notification system.
//
// HARD RULES:
//   - Only in-app delivery exists. No email/SMS/push provider is
//     wired anywhere; channel data is never invented.
//   - Recipient counts are computed from the real `users` array.
//     The fabricated Module 33 broadcast dataset
//     (src/data/admin/notification-management.ts) and the PRNG
//     admin-users store are NEVER consumed here.
//   - Dispatch writes through pushNotificationRecord() so user
//     notification caches refresh via the existing change bridge.
//   - Notification content is plain text only. Action deep links
//     must be safe internal routes (never javascript:/external).
// ============================================================

import type {
  ManagedAdminAudiencePreview,
  ManagedAdminAudiencePreviewUser,
  ManagedAdminNotificationAudience,
  ManagedAdminNotificationCounts,
  ManagedAdminNotificationCreateInput,
  ManagedAdminNotificationCreateResult,
  ManagedAdminNotificationOverview,
  ManagedAdminNotificationQuery,
  ManagedAdminNotificationRow,
  Paginated,
} from "@/types/admin";
import type { Notification, User } from "@/types";
import { notifications, pushNotificationRecord } from "@/data/notifications";
import { users } from "@/data/users";
import {
  applySearch,
  applySort,
  inDateRange,
  paginate,
} from "@/lib/admin/api";

// ============================================================
// CONSTANTS
// ============================================================

export const NOTIFICATION_TITLE_MAX = 120;
export const NOTIFICATION_BODY_MAX = 1000;

/**
 * Type/category combinations an admin may compose. Deliberately
 * excludes `message` (chat-domain — would impersonate user-to-user
 * messaging), `booking_update` (booking-service owned) and
 * `payments` (financial — the frontend must never author payment
 * notices). System/campus/account/marketplace/order/promotion
 * announcements are allowed.
 */
export const ADMIN_COMPOSABLE_NOTIFICATIONS: readonly {
  type: Notification["type"];
  category: Notification["category"];
}[] = [
  { type: "system", category: "account" },
  { type: "system", category: "campus" },
  { type: "campus", category: "campus" },
  { type: "account", category: "account" },
  { type: "marketplace", category: "marketplace" },
  { type: "order_update", category: "orders" },
  { type: "promotion", category: "promotions" },
];

/** Campuses present in the stable user registry (drives the campus audience selector). */
export const REAL_CAMPAIGN_CAMPUSES: string[] = [
  ...new Set(users.map((u) => u.campusId)),
];

// ============================================================
// SAFE ACTION LINKS (§20 — open-redirect / XSS protection)
// ============================================================

/**
 * Accepts only absolute internal paths: must start with a single `/`
 * and must not smuggle a scheme, protocol-relative or backslash
 * variant (javascript:, data:, vbscript:, https://, //, /\, …).
 */
export function isSafeActionRoute(url: string | null | undefined): boolean {
  if (url == null || url.trim() === "") return true;
  const value = url.trim();
  if (!value.startsWith("/")) return false;
  if (value.startsWith("//")) return false;
  if (value.startsWith("/\\")) return false;
  if (value.includes("\\")) return false;
  if (value.slice(1).includes(":")) return false;
  if (/[\u0000-\u001f\u007f]/.test(value)) return false;
  return true;
}

// ============================================================
// RECIPIENT RESOLUTION
// ============================================================

function resolveRecipient(userId: string): {
  recipientName: string;
  recipientHref: string;
} {
  const user = users.find((u) => u.id === userId);
  return {
    recipientName: user?.name ?? userId,
    recipientHref: `/admin/users/${userId}`,
  };
}

function toAdminRow(n: Notification): ManagedAdminNotificationRow {
  const recipient = resolveRecipient(n.userId);
  return {
    id: n.id,
    title: n.title,
    message: n.message,
    type: n.type,
    category: n.category,
    recipientId: n.userId,
    recipientName: recipient.recipientName,
    recipientHref: recipient.recipientHref,
    read: n.read,
    createdAt: n.createdAt,
    actionUrl: n.actionUrl ?? null,
    groupId: n.groupId ?? null,
  };
}

// ============================================================
// READ: LIST / DETAIL
// ============================================================

export function filterAdminNotifications(
  query?: ManagedAdminNotificationQuery
): ManagedAdminNotificationRow[] {
  const q = query ?? {};
  const filterType = q.type ?? "all";
  const filterCategory = q.category ?? "all";
  const filterRead = q.read ?? "all";

  let rows = [...notifications]
    .map(toAdminRow)
    .filter(
      (r) =>
        (filterType === "all" || r.type === filterType) &&
        (filterCategory === "all" || r.category === filterCategory) &&
        (filterRead === "all" ||
          (filterRead === "read" ? r.read : !r.read)) &&
        inDateRange(r.createdAt, q.from, q.to)
    );

  rows = applySearch(rows, q.search, (r) => [
    r.id,
    r.title,
    r.message,
    r.type,
    r.category,
    r.recipientName,
  ]);

  rows = applySort(
    rows,
    q.sortBy,
    q.sortDir ?? "desc",
    {
      createdAt: (r) => new Date(r.createdAt).getTime(),
      title: (r) => r.title.toLowerCase(),
    },
    "createdAt"
  );

  return rows;
}

export function paginateAdminNotifications(
  query?: ManagedAdminNotificationQuery
): Paginated<ManagedAdminNotificationRow> {
  return paginate(filterAdminNotifications(query), query ?? {});
}

export function getAdminNotificationRow(
  id: string
): ManagedAdminNotificationRow | null {
  const n = notifications.find((row) => row.id === id);
  return n ? toAdminRow(n) : null;
}

// ============================================================
// READ: OVERVIEW (real counts only — never fabricated)
// ============================================================

const ALL_CATEGORIES: Notification["category"][] = [
  "orders",
  "messages",
  "marketplace",
  "campus",
  "payments",
  "account",
  "promotions",
  "bookings",
];

const ALL_TYPES: Notification["type"][] = [
  "order_update",
  "message",
  "marketplace",
  "campus",
  "payments",
  "account",
  "promotion",
  "booking_update",
  "system",
];

export function computeAdminNotificationCounts(): ManagedAdminNotificationCounts {
  const unread = notifications.filter((n) => !n.read).length;
  return {
    total: notifications.length,
    unread,
    read: notifications.length - unread,
    recipients: new Set(notifications.map((n) => n.userId)).size,
    byCategory: Object.fromEntries(
      ALL_CATEGORIES.map((c) => [
        c,
        notifications.filter((n) => n.category === c).length,
      ])
    ) as ManagedAdminNotificationCounts["byCategory"],
    byType: Object.fromEntries(
      ALL_TYPES.map((t) => [
        t,
        notifications.filter((n) => n.type === t).length,
      ])
    ) as ManagedAdminNotificationCounts["byType"],
  };
}

export function buildAdminNotificationOverview(): ManagedAdminNotificationOverview {
  const byCampus = new Map<string, number>();
  for (const u of users) byCampus.set(u.campusId, (byCampus.get(u.campusId) ?? 0) + 1);

  return {
    counts: computeAdminNotificationCounts(),
    platformUsers: users.length,
    inAppOnly: true,
    deliveryNote:
      "In-app is the only wired delivery channel: records are written to the shared notification store and appear in the recipient's notification center. No email, SMS or push provider is integrated — delivery telemetry beyond read state is not available.",
    campusBreakdown: [...byCampus.entries()].map(([campusId, count]) => ({
      campusId,
      count,
    })),
  };
}

// ============================================================
// AUDIENCE PREVIEW (§22 — recipient counts from real users)
// ============================================================

function resolveAudienceUsers(
  audience: ManagedAdminNotificationAudience,
  campusId?: string | null,
  userId?: string | null
): User[] {
  switch (audience) {
    case "specific_user":
      return userId ? users.filter((u) => u.id === userId).slice(0, 1) : [];
    case "all_users":
      return [...users];
    case "customers":
      return users.filter((u) => u.role === "student");
    case "vendors":
      return users.filter((u) => u.role === "vendor");
    case "campus":
      return campusId ? users.filter((u) => u.campusId === campusId) : [];
    default:
      return [];
  }
}

export function audienceLabel(
  audience: ManagedAdminNotificationAudience
): string {
  switch (audience) {
    case "specific_user":
      return "Selected user";
    case "all_users":
      return "All platform users";
    case "customers":
      return "Customers (students)";
    case "vendors":
      return "Vendors";
    case "campus":
      return "Users on the selected campus";
    default:
      return audience;
  }
}

export function buildAudiencePreview(
  audience: ManagedAdminNotificationAudience,
  campusId?: string | null,
  userId?: string | null
): ManagedAdminAudiencePreview {
  const targets = resolveAudienceUsers(audience, campusId, userId);
  const previewUsers: ManagedAdminAudiencePreviewUser[] = targets.map((u) => ({
    userId: u.id,
    name: u.name,
    role: u.role,
    campusId: u.campusId,
    verified: u.isVerified ?? false,
    href: `/admin/users/${u.id}`,
  }));

  return {
    audience,
    campusId: campusId ?? null,
    label: audienceLabel(audience),
    channel: "in_app",
    recipients: previewUsers.length,
    users: previewUsers,
    note: "Recipient counts are computed from the real user registry. Only the in-app channel is delivered.",
  };
}

// ============================================================
// MUTATION: REAL IN-APP DISPATCH (§17/§23/§34/§57/§58)
// ============================================================

function isComposable(
  input: ManagedAdminNotificationCreateInput
): boolean {
  return ADMIN_COMPOSABLE_NOTIFICATIONS.some(
    (c) => c.type === input.type && c.category === input.category
  );
}

export function createAdminNotification(
  input: ManagedAdminNotificationCreateInput
): ManagedAdminNotificationCreateResult {
  const title = input.title.trim();
  const message = input.message.trim();

  if (!title) throw new Error("Title is required.");
  if (title.length > NOTIFICATION_TITLE_MAX)
    throw new Error(`Title must be ${NOTIFICATION_TITLE_MAX} characters or fewer.`);
  if (!message) throw new Error("Message is required.");
  if (message.length > NOTIFICATION_BODY_MAX)
    throw new Error(`Message must be ${NOTIFICATION_BODY_MAX} characters or fewer.`);
  if (!isComposable(input))
    throw new Error(
      "Unsupported type/category combination for admin communication."
    );
  if (!isSafeActionRoute(input.actionUrl))
    throw new Error(
      "Action link must be a safe internal route (e.g. /orders/KMP-4102)."
    );

  const preview = buildAudiencePreview(
    input.audience,
    input.campusId ?? null,
    input.userId ?? null
  );
  if (preview.recipients === 0)
    throw new Error("The selected audience has no reachable recipients.");

  // Same atomic push the user-facing services use — one real record per
  // recipient, delivered to the shared in-app notification center.
  const notificationIds = preview.users.map((u) =>
    pushNotificationRecord({
      userId: u.userId,
      type: input.type,
      category: input.category,
      title,
      message,
      actionUrl: input.actionUrl ?? undefined,
    }).id
  );

  return { created: notificationIds.length, notificationIds, channel: "in_app" };
}