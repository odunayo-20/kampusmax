import {
  CommunitySectionCounts,
  ListQuery,
  ManagedNotification,
  ManagedNotificationAudience,
  ManagedNotificationStatus,
  NotificationComposerInput,
  NotificationListQuery,
  Paginated,
} from "@/types/admin";
import { apiDelay, applySearch, applySort, paginate } from "@/lib/admin/api";
import {
  estimateRecipients,
  notificationDataset,
} from "@/data/admin/notification-management";

// ------------------------------------------------------------
// CONTRACT (future NestJS resource: /admin/notifications)
//
// Delivery is INTENT-ONLY in this prototype: send/schedule record
// state and recipients estimates. No push/email/SMS provider is
// wired up - the real dispatcher lives in the backend.
// ------------------------------------------------------------

export interface AdminNotificationManagementService {
  list(
    query?: NotificationListQuery
  ): Promise<Paginated<ManagedNotification>>;
  getById(id: string): Promise<ManagedNotification | null>;
  getCounts(): Promise<CommunitySectionCounts<ManagedNotificationStatus>>;
  /** Live composer preview: estimated audience size. */
  getEstimate(
    audience: ManagedNotificationAudience,
    campusId: string | null
  ): Promise<number>;
  create(input: NotificationComposerInput): Promise<ManagedNotification>;
  update(
    id: string,
    patch: Partial<NotificationComposerInput>
  ): Promise<ManagedNotification>;
  /** Draft/scheduled -> sent immediately (intent only). */
  sendNow(id: string): Promise<ManagedNotification>;
  /** Schedule a draft for a future delivery time. */
  schedule(id: string, deliverAt: string): Promise<ManagedNotification>;
}

const NOTIFICATION_STATUSES: ManagedNotificationStatus[] = [
  "draft",
  "scheduled",
  "sent",
];

export function createMockNotificationManagementService(): AdminNotificationManagementService {
  const notifications = notificationDataset.notifications.map((n) => ({ ...n }));
  let created = 0;

  function requireRow(id: string): ManagedNotification {
    const row = notifications.find((n) => n.id === id);
    if (!row) throw new Error(`Notification ${id} not found`);
    return row;
  }

  return {
    async list(query = {}) {
      await apiDelay();
      const {
        search,
        type = "all",
        audience = "all",
        status = "all",
        campusId = "all",
        ...rest
      } = query;

      let rows = notifications.filter(
        (n) =>
          (type === "all" || n.type === type) &&
          (audience === "all" || n.audience === audience) &&
          (status === "all" || n.status === status) &&
          (campusId === "all" || n.campusId === campusId)
      );
      rows = applySearch(rows, search, (n) => [
        n.title,
        n.message,
        n.sentBy,
        n.id,
      ]);
      rows = applySort(
        rows,
        rest.sortBy,
        rest.sortDir ?? "desc",
        {
          deliverAt: (n) =>
            n.status === "draft" ? 0 : new Date(n.deliverAt).getTime(),
          createdAt: (n) => new Date(n.createdAt).getTime(),
          recipients: (n) => n.recipients,
          title: (n) => n.title.toLowerCase(),
        },
        "deliverAt"
      );
      return paginate(rows, rest as ListQuery);
    },

    async getById(id) {
      await apiDelay(140);
      const row = notifications.find((n) => n.id === id);
      return row ? { ...row, deliveryTypes: [...row.deliveryTypes] } : null;
    },

    async getCounts() {
      await apiDelay(70);
      const byStatus = Object.fromEntries(
        NOTIFICATION_STATUSES.map((s) => [
          s,
          notifications.filter((n) => n.status === s).length,
        ])
      ) as Record<ManagedNotificationStatus, number>;
      return { all: notifications.length, byStatus };
    },

    async getEstimate(audience, campusId) {
      await apiDelay(80);
      return estimateRecipients(audience, campusId);
    },

    async create(input) {
      await apiDelay();
      created += 1;
      const now = new Date().toISOString();
      const notification: ManagedNotification = {
        id: `mnt-new-${String(created).padStart(3, "0")}`,
        type: input.type,
        title: input.title.trim(),
        message: input.message.trim(),
        audience: input.audience,
        campusId: input.campusId,
        deliveryTypes: [...input.deliveryTypes],
        sentBy: "Platform Admin",
        // Drafts carry no delivery time until scheduled/sent.
        deliverAt:
          input.scheduleAt &&
          new Date(input.scheduleAt) > new Date()
            ? new Date(input.scheduleAt).toISOString()
            : now,
        recipients: 0,
        openRate: 0,
        status:
          input.scheduleAt && new Date(input.scheduleAt) > new Date()
            ? "scheduled"
            : "draft",
        createdAt: now,
      };
      notifications.unshift(notification);
      return { ...notification };
    },

    async update(id, patch) {
      await apiDelay();
      const row = requireRow(id);
      if (row.status === "sent")
        throw new Error("Sent broadcasts can no longer be edited.");
      if (patch.title !== undefined) row.title = patch.title.trim();
      if (patch.message !== undefined) row.message = patch.message.trim();
      if (patch.type !== undefined) row.type = patch.type;
      if (patch.audience !== undefined) row.audience = patch.audience;
      if (patch.campusId !== undefined) row.campusId = patch.campusId;
      if (patch.deliveryTypes !== undefined)
        row.deliveryTypes = [...patch.deliveryTypes];
      if (patch.scheduleAt !== undefined && row.status === "scheduled") {
        const when = new Date(patch.scheduleAt!);
        if (Number.isNaN(when.getTime()))
          throw new Error("Pick a valid schedule date and time.");
        row.deliverAt = when.toISOString();
      }
      return { ...row };
    },

    async sendNow(id) {
      await apiDelay(400);
      const row = requireRow(id);
      if (row.status === "sent")
        throw new Error("This broadcast was already sent.");
      // Intent only: mark as delivered with an estimate. No channel
      // is actually contacted in the prototype.
      row.status = "sent";
      row.deliverAt = new Date().toISOString();
      row.recipients = estimateRecipients(row.audience, row.campusId);
      row.openRate = 0;
      return { ...row };
    },

    async schedule(id, deliverAt) {
      await apiDelay();
      const row = requireRow(id);
      if (row.status === "sent")
        throw new Error("Sent broadcasts cannot be rescheduled.");
      const when = new Date(deliverAt);
      if (Number.isNaN(when.getTime()))
        throw new Error("Pick a valid schedule date and time.");
      if (when.getTime() < Date.now() - 60_000)
        throw new Error("Scheduled time must be in the future.");
      row.status = "scheduled";
      row.deliverAt = when.toISOString();
      return { ...row };
    },
  };
}
