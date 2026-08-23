import { ListQuery, Paginated, PaymentRecord } from "@/types/admin";
import {
  apiDelay,
  applySearch,
  applySort,
  paginate,
} from "@/lib/admin/api";

export interface PaymentListFilters {
  type?: PaymentRecord["type"] | "all";
  status?: PaymentRecord["status"] | "all";
  method?: PaymentRecord["method"] | "all";
}

export interface PaymentListQuery
  extends ListQuery,
    PaymentListFilters {}

export interface AdminPaymentService {
  list(query?: PaymentListQuery): Promise<Paginated<PaymentRecord>>;
  totals(query?: PaymentListQuery): Promise<{
    successful: number;
    pending: number;
    failed: number;
    refunded: number;
    volume: number;
    fees: number;
  }>;
}

export function createMockPaymentService(
  seed: PaymentRecord[]
): AdminPaymentService {
  const rows = seed.map((p) => ({ ...p }));

  function filterRows(query: PaymentListQuery): PaymentRecord[] {
    const { search, type = "all", status = "all", method = "all" } = query;

    let filtered = rows.filter(
      (p) =>
        (type === "all" || p.type === type) &&
        (status === "all" || p.status === status) &&
        (method === "all" || p.method === method)
    );

    if (search) {
      filtered = applySearch(filtered, search, (p) => [
        p.reference,
        p.userName,
        p.counterparty,
      ]);
    }
    return filtered;
  }

  return {
    async list(query = {}) {
      await apiDelay();
      const {
        sortBy,
        sortDir = "desc",
        page = 1,
        pageSize = 10,
      } = query;

      const filtered = applySort(
        filterRows(query),
        sortBy,
        sortDir,
        { createdAt: (p) => new Date(p.createdAt).getTime(), amount: (p) => p.amount },
        "createdAt"
      );

      return paginate(filtered, { page, pageSize });
    },

    async totals(query = {}) {
      await apiDelay(140);
      const filtered = filterRows({ ...query, search: undefined });
      const sum = (s: PaymentRecord["status"]) =>
        filtered.filter((p) => p.status === s).reduce((acc, p) => acc + p.amount, 0);

      return {
        successful: sum("successful"),
        pending: sum("pending"),
        failed: sum("failed"),
        refunded: sum("refunded"),
        volume: filtered.reduce((acc, p) => acc + p.amount, 0),
        fees: filtered.reduce((acc, p) => acc + p.fee, 0),
      };
    },
  };
}
