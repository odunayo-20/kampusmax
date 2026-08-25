import {
  AdminRoleKey,
  AuditActionType,
  AuditLog,
  AuditLogListQuery,
  AuditResource,
  AuditResult,
  ListQuery,
  Paginated,
} from "@/types/admin";
import { apiDelay, applySearch, applySort, paginate } from "@/lib/admin/api";
import { auditLogsDataset } from "@/data/admin/audit-logs";

// ------------------------------------------------------------
// CONTRACT (future NestJS resource: /admin/audit-logs)
//
// READ-ONLY by design: the mock service exposes no mutations.
// The real backend will append rows from an interceptor/middleware;
// this console only ever queries them.
// ------------------------------------------------------------

export interface AuditLogService {
  list(query?: AuditLogListQuery): Promise<Paginated<AuditLog>>;
  getById(id: string): Promise<AuditLog | null>;
  getAdminOptions(): Promise<{ id: string; name: string; role: AdminRoleKey }[]>;
}

function inDateRange(
  isoDate: string,
  from?: string,
  to?: string
): boolean {
  const t = new Date(isoDate).getTime();
  if (from && t < new Date(`${from}T00:00:00`).getTime()) return false;
  if (to && t > new Date(`${to}T23:59:59`).getTime()) return false;
  return true;
}

export function createMockAuditLogService(): AuditLogService {
  const logs = auditLogsDataset.logs.map((l) => ({ ...l }));

  return {
    async list(query = {}) {
      await apiDelay();
      const {
        search,
        adminId = "all",
        action = "all",
        resource = "all",
        result = "all",
        dateFrom,
        dateTo,
        ...rest
      } = query;

      let rows = logs.filter(
        (l) =>
          (adminId === "all" || l.adminId === adminId) &&
          (action === "all" || l.action === action) &&
          (resource === "all" || l.resource === resource) &&
          (result === "all" || l.result === result) &&
          inDateRange(l.at, dateFrom, dateTo)
      );

      rows = applySearch(rows, search, (l) => [
        l.description,
        l.adminName,
        l.resourceId,
        l.id,
      ]);
      rows = applySort(
        rows,
        rest.sortBy,
        rest.sortDir ?? "desc",
        { at: (l) => new Date(l.at).getTime() },
        "at"
      );
      return paginate(rows, rest as ListQuery);
    },

    async getById(id) {
      await apiDelay(140);
      const row = logs.find((l) => l.id === id);
      return row ? { ...row } : null;
    },

    async getAdminOptions() {
      await apiDelay(60);
      const seen = new Map<string, { id: string; name: string; role: AdminRoleKey }>();
      logs.forEach((l) => {
        if (!seen.has(l.adminId))
          seen.set(l.adminId, {
            id: l.adminId,
            name: l.adminName,
            role: l.adminRole,
          });
      });
      return [...seen.values()];
    },
  };
}
