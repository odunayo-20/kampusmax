import {
  CommunitySectionCounts,
  ListQuery,
  ManagedReview,
  ManagedReviewDetail,
  ManagedReviewStatus,
  ManagedReviewTargetType,
  Paginated,
  ReviewListQuery,
  ReviewReport,
  ReviewReportStatus,
} from "@/types/admin";
import { apiDelay, applySearch, applySort, paginate } from "@/lib/admin/api";
import { reviewManagementDataset } from "@/data/admin/review-management";

// ------------------------------------------------------------
// CONTRACT (future NestJS resource: /admin/reviews)
// ------------------------------------------------------------

export interface ReviewVendorOption {
  id: string;
  name: string;
}

export interface AdminReviewManagementService {
  list(query?: ReviewListQuery): Promise<Paginated<ManagedReview>>;
  getById(id: string): Promise<ManagedReviewDetail | null>;
  setStatus(
    id: string,
    status: ManagedReviewStatus
  ): Promise<ManagedReview>;
  getCounts(): Promise<CommunitySectionCounts<ManagedReviewStatus>>;
  getVendorOptions(): Promise<ReviewVendorOption[]>;
  /** Triage flow for "investigate report". */
  setReportStatus(
    id: string,
    status: Exclude<ReviewReportStatus, "open">
  ): Promise<ReviewReport>;
}

// ------------------------------------------------------------
// MOCK IMPLEMENTATION
// ------------------------------------------------------------

const REVIEW_STATUSES: ManagedReviewStatus[] = [
  "published",
  "reported",
  "hidden",
  "removed",
  "under_review",
];

export function createReviewManagementService(): AdminReviewManagementService {
  const reviews = reviewManagementDataset.reviews.map((r) => ({ ...r }));
  const reports = reviewManagementDataset.reports.map((r) => ({ ...r }));

  function requireRow<T extends { id: string }>(
    rows: T[],
    id: string,
    label: string
  ): T {
    const row = rows.find((r) => r.id === id);
    if (!row) throw new Error(`${label} ${id} not found`);
    return row;
  }

  /** Keep the derived counter in sync with triage decisions. */
  function syncReportsCount(reviewId: string): void {
    const review = reviews.find((r) => r.id === reviewId);
    if (!review) return;
    review.reportsCount = reports.filter((x) => x.reviewId === reviewId).length;
  }

  return {
    async list(query = {}) {
      await apiDelay();
      const {
        search,
        status = "all",
        rating = "all",
        vendorId = "all",
        campusId = "all",
        purchase = "all",
        reportedOnly = false,
        ...rest
      } = query;

      let rows = reviews.filter(
        (r) =>
          (status === "all" || r.status === status) &&
          (rating === "all" || r.rating === rating) &&
          (vendorId === "all" || r.vendorId === vendorId) &&
          (campusId === "all" || r.campusId === campusId) &&
          (purchase === "all" ||
            (purchase === "verified"
              ? r.verifiedPurchase
              : !r.verifiedPurchase)) &&
          (!reportedOnly || r.reportsCount > 0)
      );

      rows = applySearch(rows, search, (r) => [
        r.comment,
        r.reviewer.name,
        r.targetTitle,
        r.vendorName,
        r.orderRef,
        r.id,
      ]);

      rows = applySort(
        rows,
        rest.sortBy,
        rest.sortDir ?? "desc",
        {
          createdAt: (r) => new Date(r.createdAt).getTime(),
          rating: (r) => r.rating,
          helpful: (r) => r.helpfulCount,
          reports: (r) => r.reportsCount,
        },
        "createdAt"
      );

      return paginate(rows, rest as ListQuery);
    },

    async getById(id) {
      await apiDelay(160);
      const review = reviews.find((r) => r.id === id);
      if (!review) return null;
      return {
        review: { ...review },
        reports: reports
          .filter((x) => x.reviewId === id)
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .map((x) => ({ ...x })),
      };
    },

    async setStatus(id, status) {
      await apiDelay();
      const row = requireRow(reviews, id, "Review");
      row.status = status;
      syncReportsCount(id);
      return { ...row };
    },

    async getCounts() {
      await apiDelay(80);
      const byStatus = Object.fromEntries(
        REVIEW_STATUSES.map((s) => [
          s,
          reviews.filter((r) => r.status === s).length,
        ])
      ) as Record<ManagedReviewStatus, number>;
      return { all: reviews.length, byStatus };
    },

    async getVendorOptions() {
      await apiDelay(60);
      const seen = new Map<string, ReviewVendorOption>();
      reviews.forEach((r) => {
        if (!seen.has(r.vendorId))
          seen.set(r.vendorId, { id: r.vendorId, name: r.vendorName });
      });
      return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
    },

    async setReportStatus(id, status) {
      await apiDelay();
      const row = requireRow(reports, id, "Report");
      row.status = status;
      syncReportsCount(row.reviewId);
      // Triaging every report of a "reported" review clears its flag.
      if (
        status !== "reviewing" &&
        reviews.some((r) => r.id === row.reviewId && r.status === "reported") &&
        !reports.some(
          (x) =>
            x.reviewId === row.reviewId &&
            (x.status === "open" || x.status === "reviewing")
        )
      ) {
        const review = reviews.find((r) => r.id === row.reviewId)!;
        review.status = "published";
      }
      return { ...row };
    },
  };
}
