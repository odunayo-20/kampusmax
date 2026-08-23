import { AdminNotification, BroadcastStatus } from "@/types/admin";
import { apiDelay } from "@/lib/admin/api";

export interface AdminNotificationService {
  list(): Promise<AdminNotification[]>;
  send(input: {
    title: string;
    body: string;
    audience: AdminNotification["audience"];
    campusId: string | null;
    scheduledFor?: string | null;
  }): Promise<AdminNotification>;
}

export function createMockNotificationService(
  seed: AdminNotification[]
): AdminNotificationService {
  let rows = [...seed];

  return {
    async list() {
      await apiDelay();
      return rows.sort(
        (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
      );
    },

    async send(input) {
      await apiDelay(400);
      const notification: AdminNotification = {
        id: `ntf-${Date.now()}`,
        title: input.title,
        body: input.body,
        audience: input.audience,
        campusId: input.campusId,
        sentBy: "Current Admin", // resolved server-side by the real API
        sentAt: input.scheduledFor ?? new Date().toISOString(),
        recipients: 0,
        openRate: 0,
        status:
          input.scheduledFor && new Date(input.scheduledFor) > new Date()
            ? "scheduled"
            : ("sent" as BroadcastStatus),
      };
      rows = [notification, ...rows];
      return notification;
    },
  };
}
