import { apiDelay, applySearch, applySort, paginate } from "@/lib/admin/api";
import { buildManagedOrderDataset } from "@/data/admin/order-management";
import type {
  ManagedOrder,
  ManagedOrderDetail,
  OrderFacets,
  OrderListQuery,
  OrderSortField,
  OrderStatusCounts,
  Paginated,
} from "@/types/admin";
import { mockCampuses } from "@/data/admin/campuses";

export interface AdminOrderManagementService {
  list(query?: OrderListQuery): Promise<Paginated<ManagedOrder>>;
  getById(id: string): Promise<ManagedOrderDetail | null>;
  getCounts(): Promise<OrderStatusCounts>;
  getFacets(): Promise<OrderFacets>;
}

function structuredCopy<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

const PAGE_SIZE = 15;

const ALL_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "ready_for_pickup",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "disputed",
] as const;

export function createOrderManagementService(): AdminOrderManagementService {
  const dataset = buildManagedOrderDataset();
  const rows = dataset.rows;
  const details = new Map<string, ManagedOrderDetail>();
  dataset.details.forEach((detail, id) => details.set(id, structuredCopy(detail)));

  const campusNames: Record<string, string> = Object.fromEntries(
    mockCampuses.map((c) => [c.id, c.name])
  );

  return {
    async list(query = {}) {
      await apiDelay();

      let out = structuredCopy(rows);

      if (query.status && query.status !== "all") {
        out = out.filter((o) => o.status === query.status);
      }
      if (query.paymentStatus && query.paymentStatus !== "all") {
        out = out.filter((o) => o.paymentStatus === query.paymentStatus);
      }
      if (query.fulfillment && query.fulfillment !== "all") {
        out = out.filter((o) => o.deliveryMethod === query.fulfillment);
      }
      if (query.campusId) {
        out = out.filter((o) => o.campusId === query.campusId);
      }
      if (query.vendorId) {
        out = out.filter((o) => o.vendorName === query.vendorId);
      }

      const search = query.search?.trim().toLowerCase();
      if (search) {
        out = applySearch(out, search as string, (o) => [
          o.id,
          o.customerName,
          o.vendorName,
          o.itemsSummary,
        ]);
      }

      const sortBy: OrderSortField = query.sortBy ?? "createdAt";
      const sortDir = query.sortDir ?? "desc";
      // KMP-2412 sorts numerically instead of lexicographically.
      out = applySort(
        out,
        sortBy,
        sortDir,
        {
          orderNumber: (o) => Number(o.id.replace(/\D+/g, "")),
          createdAt: (o) => new Date(o.createdAt).getTime(),
          total: (o) => o.total,
        },
        "createdAt"
      );

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
          rows.filter((o) => o.status === status).length,
        ])
      ) as OrderStatusCounts["byStatus"];
      return {
        all: rows.length,
        byStatus,
        paymentIssues: rows.filter(
          (o) => o.paymentStatus === "pending" || o.paymentStatus === "failed"
        ).length,
      };
    },

    async getFacets() {
      await apiDelay();
      return {
        campuses: [...new Set(rows.map((o) => o.campusId))].map((id) => ({
          id,
          name: campusNames[id] ?? id,
        })),
        vendors: [...new Set(rows.map((o) => o.vendorName))]
          .map((name) => ({ id: name, name }))
          .sort((a, b) => a.name.localeCompare(b.name)),
      };
    },
  };
}
