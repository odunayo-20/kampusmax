import {
  AdminReview,
  CampusPost,
  ContentReport,
  Dispute,
  ListQuery,
  Paginated,
} from "@/types/admin";
import { apiDelay, applySearch, paginate } from "@/lib/admin/api";

// ------------------------------------------------------------
// CAMPUS FEED
// ------------------------------------------------------------

export interface AdminContentService {
  listPosts(query?: {
    search?: string;
    status?: CampusPost["status"] | "all";
    page?: number;
    pageSize?: number;
  }): Promise<Paginated<CampusPost>>;
  moderatePost(id: string, action: "publish" | "remove" | "unflag"): Promise<CampusPost>;
}

export function createMockPostService(seed: CampusPost[]): AdminContentService {
  let rows = seed.map((p) => ({ ...p }));

  return {
    async listPosts(query = {}) {
      await apiDelay();
      const { search, status = "all", page = 1, pageSize = 10 } = query;
      let filtered = rows.filter(
        (p) => status === "all" || p.status === status
      );
      filtered = applySearch(filtered, search, (p) => [
        p.excerpt,
        p.authorName,
        p.id,
      ]);
      filtered.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      return paginate(filtered, { page, pageSize });
    },

    async moderatePost(id, action) {
      await apiDelay();
      const idx = rows.findIndex((p) => p.id === id);
      if (idx === -1) throw new Error(`Post ${id} not found`);
      const nextStatus =
        action === "publish"
          ? "published"
          : action === "remove"
            ? "removed"
            : "published";
      rows[idx] = {
        ...rows[idx],
        status: nextStatus,
        reportsCount: action === "remove" || action === "unflag" ? 0 : rows[idx].reportsCount,
      };
      return rows[idx];
    },
  };
}

// ------------------------------------------------------------
// REPORTS
// ------------------------------------------------------------

export interface AdminReportService {
  list(query?: ListQuery & { status?: ContentReport["status"] | "all" }): Promise<Paginated<ContentReport>>;
  resolve(id: string, outcome: "resolved" | "dismissed"): Promise<ContentReport>;
}

export function createMockReportService(seed: ContentReport[]): AdminReportService {
  let rows = seed.map((r) => ({ ...r }));

  return {
    async list(query = {}) {
      await apiDelay();
      const { search, status = "all", page = 1, pageSize = 10 } = query;
      let filtered = rows.filter(
        (r) => status === "all" || r.status === status
      );
      filtered = applySearch(filtered, search, (r) => [
        r.targetPreview,
        r.reporterName,
        r.reportedName,
        r.reason,
      ]);
      filtered.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      return paginate(filtered, { page, pageSize });
    },

    async resolve(id, outcome) {
      await apiDelay();
      const idx = rows.findIndex((r) => r.id === id);
      if (idx === -1) throw new Error(`Report ${id} not found`);
      rows[idx] = { ...rows[idx], status: outcome };
      return rows[idx];
    },
  };
}

// ------------------------------------------------------------
// REVIEWS
// ------------------------------------------------------------

export interface AdminReviewService {
  list(query?: ListQuery & { status?: AdminReview["status"] | "all" }): Promise<Paginated<AdminReview>>;
  moderate(id: string, action: "approve" | "flag" | "remove"): Promise<AdminReview>;
}

export function createMockReviewService(seed: AdminReview[]): AdminReviewService {
  let rows = seed.map((r) => ({ ...r }));

  return {
    async list(query = {}) {
      await apiDelay();
      const { search, status = "all", page = 1, pageSize = 10 } = query;
      let filtered = rows.filter(
        (r) => status === "all" || r.status === status
      );
      filtered = applySearch(filtered, search, (r) => [
        r.targetName,
        r.customerName,
        r.vendorName,
        r.comment,
      ]);
      filtered.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      return paginate(filtered, { page, pageSize });
    },

    async moderate(id, action) {
      await apiDelay();
      const idx = rows.findIndex((r) => r.id === id);
      if (idx === -1) throw new Error(`Review ${id} not found`);
      rows[idx] = {
        ...rows[idx],
        status:
          action === "approve" ? "published" : action === "flag" ? "flagged" : "removed",
      };
      return rows[idx];
    },
  };
}

// ------------------------------------------------------------
// DISPUTES
// ------------------------------------------------------------

export interface AdminDisputeService {
  list(query?: ListQuery & { status?: Dispute["status"] | "all" }): Promise<Paginated<Dispute>>;
  setStatus(id: string, status: Dispute["status"]): Promise<Dispute>;
}

export function createMockDisputeService(seed: Dispute[]): AdminDisputeService {
  let rows = seed.map((d) => ({ ...d }));

  return {
    async list(query = {}) {
      await apiDelay();
      const { search, status = "all", page = 1, pageSize = 10 } = query;
      let filtered = rows.filter(
        (d) => status === "all" || d.status === status
      );
      filtered = applySearch(filtered, search, (d) => [
        d.orderId,
        d.customerName,
        d.vendorName,
        d.subject,
      ]);
      filtered.sort(
        (a, b) =>
          new Date(b.openedAt).getTime() - new Date(a.openedAt).getTime()
      );
      return paginate(filtered, { page, pageSize });
    },

    async setStatus(id, status) {
      await apiDelay();
      const idx = rows.findIndex((d) => d.id === id);
      if (idx === -1) throw new Error(`Dispute ${id} not found`);
      rows[idx] = {
        ...rows[idx],
        status,
        resolvedAt: status === "resolved" || status === "closed" ? new Date().toISOString() : null,
      };
      return rows[idx];
    },
  };
}
