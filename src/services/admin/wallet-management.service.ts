import { apiDelay, applySearch, applySort, paginate } from "@/lib/admin/api";
import {
  buildFinanceOverview,
  buildFinanceTransactions,
  buildWithdrawalDetail,
} from "@/data/admin/finance";
import { mockWithdrawals } from "@/data/admin/commerce";
import { createMockWithdrawalService } from "./withdrawals.service";
import type {
  FinanceOverview,
  FinanceTxnQuery,
  ManagedFinanceTxn,
  ManagedWithdrawalDetail,
  Paginated,
  WithdrawalRequest,
  WithdrawalStatus,
  WithdrawalStatusCounts,
} from "@/types/admin";

export interface FinanceWithdrawalQuery {
  search?: string;
  status?: WithdrawalStatus | "all";
  sortBy?: string;
  sortDir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

type WithdrawalLifecycleAction =
  | "approve"
  | "mark_completed"
  | "mark_failed"
  | "reject"
  | "start_processing";

export interface AdminFinanceManagementService {
  /** Headline figures for the /admin/wallet dashboard. */
  getOverview(): Promise<FinanceOverview>;
  listTransactions(query?: FinanceTxnQuery): Promise<Paginated<ManagedFinanceTxn>>;
  listWithdrawals(query?: FinanceWithdrawalQuery): Promise<Paginated<WithdrawalRequest>>;
  getWithdrawalDetail(id: string): Promise<ManagedWithdrawalDetail | null>;
  getWithdrawalCounts(): Promise<WithdrawalStatusCounts>;
  actOnWithdrawal(
    id: string,
    action: WithdrawalLifecycleAction,
    note?: string
  ): Promise<WithdrawalRequest>;
}

function structuredCopy<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

const ALL_WITHDRAWAL_STATUSES: WithdrawalStatus[] = [
  "pending",
  "processing",
  "approved",
  "completed",
  "rejected",
  "failed",
];

const PENDING_SETTLEMENT: WithdrawalStatus[] = ["pending", "processing", "approved"];

export function createFinanceManagementService(): AdminFinanceManagementService {
  const transactions = buildFinanceTransactions();
  const overview = buildFinanceOverview(transactions);
  const withdrawalService = createMockWithdrawalService(mockWithdrawals);

  return {
    async getOverview() {
      await apiDelay();
      return structuredCopy(overview);
    },

    async listTransactions(query = {}) {
      await apiDelay();

      let out = structuredCopy(transactions);

      if (query.type && query.type !== "all") {
        out = out.filter((t) => t.type === query.type);
      }
      if (query.status && query.status !== "all") {
        out = out.filter((t) => t.status === query.status);
      }
      if (query.pool && query.pool !== "all") {
        out = out.filter((t) => t.pool === query.pool);
      }

      const search = query.search?.trim().toLowerCase();
      if (search) {
        out = applySearch(out, search as string, (t) => [
          t.id,
          t.ownerName,
          t.reference,
          t.orderId,
        ]);
      }

      const sortBy = query.sortBy ?? "createdAt";
      const sortDir = query.sortDir ?? "desc";
      out = applySort(out, sortBy, sortDir, {
        createdAt: (t) => new Date(t.createdAt).getTime(),
        amount: (t) => t.amount,
      });

      return paginate(out, query, 15);
    },

    async listWithdrawals(query = {}) {
      return withdrawalService.list(query);
    },

    async getWithdrawalDetail(id) {
      await apiDelay();
      const detail = buildWithdrawalDetail(id);
      return detail ? structuredCopy(detail) : null;
    },

    async getWithdrawalCounts() {
      await apiDelay();
      const rows = await withdrawalService.list({ pageSize: 500 });
      const byStatus = Object.fromEntries(
        ALL_WITHDRAWAL_STATUSES.map((status) => [
          status,
          rows.items.filter((w) => w.status === status).length,
        ])
      ) as WithdrawalStatusCounts["byStatus"];
      const sum = (pred: (w: WithdrawalRequest) => boolean) =>
        rows.items.filter(pred).reduce((s, w) => s + w.amount + w.fee, 0);
      return {
        all: rows.total,
        byStatus,
        pendingAmount: sum((w) => PENDING_SETTLEMENT.includes(w.status)),
        completedAmount: sum((w) => w.status === "completed"),
      };
    },

    async actOnWithdrawal(id, action, note) {
      return withdrawalService.act(id, action, note);
    },
  };
}
