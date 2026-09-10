import {
  AdminAuditEvent,
  AdminAuditEventActor,
  AdminAuditMetrics,
  AdminAuditQuery,
  Paginated,
} from "@/types/admin";
import { apiDelay } from "@/lib/admin/api";
import {
  buildAuditMetrics,
  filterAuditEvents,
  getAuditActorOptions,
  getAuditEventById,
} from "@/data/admin/audit-trail";

// ------------------------------------------------------------
// CONTRACT (future NestJS resource: /admin/audit-logs)
//
// READ-ONLY by design: this service exposes no mutations because
// audit records are immutable. The real backend appends rows from
// an interceptor; this console only ever queries them. There is no
// export endpoint in the prototype (see MODULE-48-BACKEND-GAPS.md).
// ------------------------------------------------------------

export interface AdminAuditTrailService {
  list(query?: AdminAuditQuery): Promise<Paginated<AdminAuditEvent>>;
  getById(id: string): Promise<AdminAuditEvent | null>;
  getMetrics(): Promise<AdminAuditMetrics>;
  getActorOptions(): Promise<AdminAuditEventActor[]>;
}

export function createAdminAuditTrailService(): AdminAuditTrailService {
  return {
    async list(query = {}) {
      await apiDelay(160);
      return filterAuditEvents(query);
    },

    async getById(id) {
      await apiDelay(120);
      return getAuditEventById(id);
    },

    async getMetrics() {
      await apiDelay(120);
      return buildAuditMetrics();
    },

    async getActorOptions() {
      await apiDelay(60);
      return getAuditActorOptions();
    },
  };
}