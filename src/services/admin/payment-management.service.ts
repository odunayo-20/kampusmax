import { apiDelay, applySearch, applySort, paginate } from "@/lib/admin/api";
import { buildManagedPaymentDataset } from "@/data/admin/payment-management";
import { mockCampuses } from "@/data/admin/campuses";
import type {
  ManagedPayment,
  ManagedPaymentDetail,
  Paginated,
  PaymentFacets,
  PaymentListQuery,
  PaymentSortField,
  PaymentStatusCounts,
} from "@/types/admin";

export interface AdminPaymentManagementService {
  list(query?: PaymentListQuery): Promise<Paginated<ManagedPayment>>;
  getById(id: string): Promise<ManagedPaymentDetail | null>;
  getCounts(): Promise<PaymentStatusCounts>;
  getFacets(): Promise<PaymentFacets>;
}

function structuredCopy<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

const PAGE_SIZE = 15;

const ALL_STATUSES = [
  "pending",
  "successful",
  "failed",
  "reversed",
  "refunded",
  "partially_refunded",
] as const;

export function createPaymentManagementService(): AdminPaymentManagementService {
  const dataset = buildManagedPaymentDataset();
  const rows = dataset.rows;
  const details = new Map<string, ManagedPaymentDetail>();
  dataset.details.forEach((detail, id) => details.set(id, structuredCopy(detail)));

  const campusNames: Record<string, string> = Object.fromEntries(
    mockCampuses.map((c) => [c.id, c.name])
  );

  return {
    async list(query = {}) {
      await apiDelay();

      let out = structuredCopy(rows);

      if (query.status && query.status !== "all") {
        out = out.filter((p) => p.status === query.status);
      }
      if (query.method && query.method !== "all") {
        out = out.filter((p) => p.method === query.method);
      }
      if (query.campusId) {
        out = out.filter((p) => p.campusId === query.campusId);
      }
      if (query.vendorId) {
        // Facets expose the store name as the option value because
        // payment rows only carry the denormalised name.
        out = out.filter((p) => p.vendorName === query.vendorId);
      }

      const search = query.search?.trim().toLowerCase();
      if (search) {
        out = applySearch(out, search as string, (p) => [
          p.id,
          p.reference,
          p.gatewayRef,
          p.customerName,
          p.vendorName,
          p.orderId,
        ]);
      }

      const sortBy: PaymentSortField = query.sortBy ?? "createdAt";
      const sortDir = query.sortDir ?? "desc";
      out = applySort(out, sortBy, sortDir, {
        createdAt: (p) => new Date(p.createdAt).getTime(),
        amount: (p) => p.amount,
      });

      return paginate(out, query, PAGE_SIZE);
    },

    async getById(id) {
      await apiDelay();
      const detail = details.get(id.trim().toUpperCase());
      return detail ? structuredCopy(detail) : null;
    },

    async getCounts() {
      await apiDelay();
      const byStatus = Object.fromEntries(
        ALL_STATUSES.map((status) => [
          status,
          rows.filter((p) => p.status === status).length,
        ])
      ) as PaymentStatusCounts["byStatus"];
      return {
        all: rows.length,
        byStatus,
        totalVolume: rows
          .filter((p) => p.status === "successful")
          .reduce((sum, p) => sum + p.amount, 0),
        settlementPending: rows
          .filter((p) => p.status === "pending")
          .reduce((sum, p) => sum + p.amount, 0),
      };
    },

    async getFacets() {
      await apiDelay();
      return {
        campuses: [...new Set(rows.map((p) => p.campusId))].map((id) => ({
          id,
          name: campusNames[id] ?? id,
        })),
        vendors: [
          ...new Map(
            rows
              .map((p) => p.vendorName)
              .filter((n): n is string => Boolean(n))
              .map((name) => [name, name])
          ).entries(),
        ]
          .map(([name]) => ({ id: name, name }))
          .sort((a, b) => a.name.localeCompare(b.name)),
      };
    },
  };
}
