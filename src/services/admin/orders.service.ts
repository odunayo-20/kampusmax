import { AdminOrder, ListQuery, Paginated } from "@/types/admin";
import {
  apiDelay,
  applySearch,
  applySort,
  inDateRange,
  paginate,
} from "@/lib/admin/api";

export interface OrderListFilters {
  status?: AdminOrder["status"] | "all";
  paymentStatus?: AdminOrder["paymentStatus"] | "all";
  campusId?: string | "all";
  from?: string;
  to?: string;
}

export interface OrderListQuery extends ListQuery, OrderListFilters {}

export interface AdminOrderService {
  list(query?: OrderListQuery): Promise<Paginated<AdminOrder>>;
  getById(id: string): Promise<AdminOrder | null>;
  advanceStatus(id: string): Promise<AdminOrder>;
  refund(id: string): Promise<AdminOrder>;
}

const FLOW: AdminOrder["status"][] = [
  "placed",
  "confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
];

export function createMockOrderService(seed: AdminOrder[]): AdminOrderService {
  let rows = seed.map((o) => ({ ...o }));

  return {
    async list(query = {}) {
      await apiDelay();
      const {
        search,
        sortBy,
        sortDir = "desc",
        page = 1,
        pageSize = 10,
        status = "all",
        paymentStatus = "all",
        campusId = "all",
        from,
        to,
      } = query;

      let filtered = rows.filter(
        (o) =>
          (status === "all" || o.status === status) &&
          (paymentStatus === "all" || o.paymentStatus === paymentStatus) &&
          (campusId === "all" || o.campusId === campusId) &&
          inDateRange(o.createdAt, from, to)
      );

      filtered = applySearch(filtered, search, (o) => [
        o.id,
        o.customerName,
        o.vendorName,
      ]);

      filtered = applySort(
        filtered,
        sortBy,
        sortDir,
        {
          createdAt: (o) => new Date(o.createdAt).getTime(),
          total: (o) => o.total,
        },
        "createdAt"
      );

      return paginate(filtered, { page, pageSize });
    },

    async getById(id) {
      await apiDelay(120);
      return rows.find((o) => o.id === id) ?? null;
    },

    async advanceStatus(id) {
      await apiDelay();
      const idx = rows.findIndex((o) => o.id === id);
      if (idx === -1) throw new Error(`Order ${id} not found`);
      const current = rows[idx];
      if (current.status === "delivered" || current.status === "cancelled") {
        return current;
      }
      const nextIdx =
        FLOW.findIndex((s) => s === current.status) + 1;
      rows[idx] = { ...current, status: FLOW[Math.min(nextIdx, FLOW.length - 1)] };
      return rows[idx];
    },

    async refund(id) {
      await apiDelay();
      const idx = rows.findIndex((o) => o.id === id);
      if (idx === -1) throw new Error(`Order ${id} not found`);
      rows[idx] = {
        ...rows[idx],
        status: "cancelled",
        paymentStatus: "refunded",
      };
      return rows[idx];
    },
  };
}
