import type {
  AdminCommunicationService,
  ManagedAdminNotificationAudience,
} from "@/types/admin";
import { apiDelay, paginate } from "@/lib/admin/api";
import {
  buildAdminNotificationOverview,
  buildAudiencePreview,
  createAdminNotification,
  filterAdminNotifications,
  getAdminNotificationRow,
} from "@/data/admin/communication-management";

export type { AdminCommunicationService };

// ------------------------------------------------------------
// CONTRACT (future NestJS resource: /admin/notifications)
// ------------------------------------------------------------

// AdminCommunicationService is declared in @/types/admin so the
// container and hooks share one interface. This module wires the
// mock implementation over the REAL Module 26A notification store
// and the real user registry — it is the admin operations console
// for the platform's in-app communications, not a second system.

// ------------------------------------------------------------
// MOCK IMPLEMENTATION
//
// Read-only console + ONE mutation (create) that dispatches real
// in-app records through pushNotificationRecord(), the same path
// the user-facing services use, so notifications appear in the
// recipient's notification center immediately.
//
// No actor/ctx: communications are platform-scoped and the console
// is ADMIN/SUPER_ADMIN only (nav-permission gate). There is no
// email/SMS/push provider, no scheduler, no retry pipeline, no
// template engine and no writable audit path in the prototype —
// those surfaces are honest backend gaps, never fake UI.
//
// Deliberately NOT named notificationManagementService (that name
// belongs to the fabricated Module 33 broadcast console).
// ------------------------------------------------------------

export function createAdminCommunicationService(): AdminCommunicationService {
  return {
    async getOverview() {
      await apiDelay(160);
      return buildAdminNotificationOverview();
    },

    async list(query) {
      await apiDelay(160);
      return paginate(filterAdminNotifications(query), query ?? {});
    },

    async getById(id) {
      await apiDelay(140);
      return getAdminNotificationRow(id);
    },

    async getAudiencePreview(
      audience: ManagedAdminNotificationAudience,
      campusId?: string | null,
      userId?: string | null
    ) {
      await apiDelay(120);
      return buildAudiencePreview(audience, campusId, userId);
    },

    async create(input) {
      await apiDelay(300);
      return createAdminNotification(input);
    },
  };
}