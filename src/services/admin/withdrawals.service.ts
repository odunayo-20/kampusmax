import {
  Paginated,
  WithdrawalAction,
  WithdrawalRequest,
} from "@/types/admin";
import { apiDelay, applySearch, applySort, paginate } from "@/lib/admin/api";

export type { WithdrawalAction };

export interface WithdrawalListQuery {
  search?: string;
  status?: WithdrawalRequest["status"] | "all";
  sortBy?: string;
  sortDir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface AdminWithdrawalService {
  list(query?: WithdrawalListQuery): Promise<Paginated<WithdrawalRequest>>;
  act(id: string, action: WithdrawalAction, note?: string): Promise<WithdrawalRequest>;
}

export function createMockWithdrawalService(
  seed: WithdrawalRequest[]
): AdminWithdrawalService {
  let rows = seed.map((w) => ({ ...w }));

  return {
    async list(query = {}) {
      await apiDelay();
      const {
        search,
        status = "all",
        sortBy,
        sortDir = "desc",
        page = 1,
        pageSize = 10,
      } = query;

      let filtered = rows.filter(
        (w) => status === "all" || w.status === status
      );

      filtered = applySearch(filtered, search, (w) => [
        w.vendorName,
        w.bankName,
        w.accountName,
        w.id,
      ]);

      filtered = applySort(
        filtered,
        sortBy,
        sortDir,
        {
          requestedAt: (w) => new Date(w.requestedAt).getTime(),
          amount: (w) => w.amount,
        },
        "requestedAt"
      );

      return paginate(filtered, { page, pageSize });
    },

    async act(id, action, note) {
      await apiDelay();
      const idx = rows.findIndex((w) => w.id === id);
      if (idx === -1) throw new Error(`Withdrawal ${id} not found`);

      const transitions: Record<
        WithdrawalAction,
        { status: WithdrawalRequest["status"]; requiresNote?: boolean }
      > = {
        approve: { status: "approved" },
        mark_completed: { status: "completed" },
        mark_failed: { status: "failed", requiresNote: true },
        reject: { status: "rejected", requiresNote: true },
        start_processing: { status: "processing" },
      };

      const t = transitions[action];
      if (t.requiresNote && !note?.trim()) {
        throw new Error("A note is required to reject a withdrawal");
      }

      rows[idx] = {
        ...rows[idx],
        status: t.status,
        processedAt: new Date().toISOString(),
        note: note ?? rows[idx].note,
      };
      return rows[idx];
    },
  };
}
