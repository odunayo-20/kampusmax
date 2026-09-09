// ============================================================
// JOB MANAGEMENT SERVICE (Module 40)
// ============================================================
//
// Read-only admin service over the real jobs marketplace. Per the
// Module 40 API-contract audit, the opportunity store (the backend
// surrogate) exposes NO admin moderation transitions and NO job-reports
// store, so this console intentionally implements no mutations — every
// pipeline the backend does not provide is surfaced as an honest gap.
// ============================================================

import type {
  ManagedJobActivityEvent,
  ManagedJobDetail,
  ManagedJobFacets,
  ManagedJobListQuery,
  ManagedJobRow,
  ManagedJobStatusCounts,
  ManagedJobSortField,
  Paginated,
} from "@/types/admin";
import {
  buildJobDataset,
  computeJobCounts,
  computeJobFacets,
  filterJobs,
} from "@/data/admin/job-management";

export interface AdminJobManagementService {
  /** Backend-search / filter / sort / paginate over real jobs. */
  list(query?: ManagedJobListQuery): Promise<Paginated<ManagedJobRow>>;
  /** Detailed operational view of a single job (null when unknown). */
  getById(id: string): Promise<ManagedJobDetail | null>;
  /** Honest live status metrics (reported is always 0 — no store). */
  getCounts(): Promise<ManagedJobStatusCounts>;
  /** Facet counts derived from real rows. */
  getFacets(): Promise<ManagedJobFacets>;
  /** Deterministic job activity timeline (no invented admin events). */
  getActivity(id: string): Promise<ManagedJobActivityEvent[]>;
}

export function createJobManagementService(): AdminJobManagementService {
  return {
    async list(query = {}) {
      const { rows } = buildJobDataset();
      const result = filterJobs(rows, query);
      return {
        items: result.items,
        total: result.total,
        page: result.page,
        pageSize: Math.max(1, query.pageSize ?? 10),
        totalPages: result.totalPages,
      };
    },

    async getById(id) {
      const { details } = buildJobDataset();
      return details.get(id) ?? null;
    },

    async getCounts() {
      const { rows } = buildJobDataset();
      return computeJobCounts(rows);
    },

    async getFacets() {
      const { rows } = buildJobDataset();
      return computeJobFacets(rows);
    },

    async getActivity(id) {
      const { details } = buildJobDataset();
      return details.get(id)?.activity ?? [];
    },
  };
}

export type { ManagedJobSortField };