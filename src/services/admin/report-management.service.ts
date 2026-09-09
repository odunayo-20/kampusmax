// ============================================================
// TRUST & SAFETY SERVICE (Module 42)
// ============================================================
//
// Read-only admin service over the real report stores. Per the Module 42
// API-contract audit, no Kampmax store exposes report-level triage:
//   - Storefront review reports (data/reviews.ts reviewReports) are a
//     in-memory array with no admin mutation API.
//   - Profile review reports (data/profile-reviews.ts) are author-facing
//     only; the store ships no review-report triage surface.
//   - Campus post reports (data/posts.ts reportedPosts) are author-facing
//     only; the post store ships no moderation transitions.
// So this console intentionally implements no mutations — assignment,
// status changes, severity, escalation, notes and history are all honest
// gaps documented in MODULE-42-BACKEND-GAPS.md.
// ============================================================

import type {
  TrustSafetyReportCounts,
  TrustSafetyReportDetail,
  TrustSafetyReportFacets,
  TrustSafetyReportListQuery,
  TrustSafetyReportRow,
  TrustSafetySortField,
  Paginated,
} from "@/types/admin";
import {
  buildTrustSafetyDataset,
  buildTrustSafetyDetail,
  computeTrustSafetyCounts,
  computeTrustSafetyFacets,
  filterTrustSafetyReports,
} from "@/data/admin/report-management";

export interface AdminTrustSafetyService {
  /** Backend-search / filter / sort / paginate over real reports. */
  list(query?: TrustSafetyReportListQuery): Promise<Paginated<TrustSafetyReportRow>>;
  /** Detailed operational view of a single report (null when unknown). */
  getById(id: string): Promise<TrustSafetyReportDetail | null>;
  /** Honest live metrics derived from real report rows. */
  getCounts(): Promise<TrustSafetyReportCounts>;
  /** Facet counts derived from real rows. */
  getFacets(): Promise<TrustSafetyReportFacets>;
  /** Distinct reason values present in real rows, for the reason filter. */
  getReasonOptions(): Promise<{ reason: string; count: number }[]>;
  /**
   * Moderation mutations are intentionally absent — see module header.
   * Actions in the UI deep-link into Modules 35-41 consoles (reports = why,
   * those consoles = how), which is what the stores can honestly support.
   */
}

export function createTrustSafetyService(): AdminTrustSafetyService {
  return {
    async list(query = {}) {
      const dataset = buildTrustSafetyDataset();
      const result = filterTrustSafetyReports(dataset, query);
      return {
        items: result.items,
        total: result.total,
        page: result.page,
        pageSize: Math.max(1, query.pageSize ?? 10),
        totalPages: result.totalPages,
      };
    },

    async getById(id) {
      const dataset = buildTrustSafetyDataset();
      return buildTrustSafetyDetail(dataset, id);
    },

    async getCounts() {
      const { rows } = buildTrustSafetyDataset();
      return computeTrustSafetyCounts(rows);
    },

    async getFacets() {
      const dataset = buildTrustSafetyDataset();
      return computeTrustSafetyFacets(dataset);
    },

    async getReasonOptions() {
      const dataset = buildTrustSafetyDataset();
      const { reasons } = computeTrustSafetyFacets(dataset);
      return reasons.map((r) => ({ reason: r.reason, count: r.count }));
    },
  };
}

export type { TrustSafetySortField };