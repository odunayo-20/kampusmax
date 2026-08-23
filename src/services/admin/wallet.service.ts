import {
  AdminWalletTxn,
  ListQuery,
  Paginated,
  WalletAccount,
} from "@/types/admin";
import { apiDelay, applySearch, applySort, paginate } from "@/lib/admin/api";

export interface WalletTxnFilters {
  direction?: AdminWalletTxn["direction"] | "all";
  status?: AdminWalletTxn["status"] | "all";
}

export interface WalletTxnQuery extends ListQuery, WalletTxnFilters {}

export interface AdminWalletService {
  listAccounts(query?: ListQuery): Promise<Paginated<WalletAccount>>;
  listTransactions(
    query?: WalletTxnQuery
  ): Promise<Paginated<AdminWalletTxn>>;
  setAccountStatus(
    id: string,
    status: WalletAccount["status"]
  ): Promise<WalletAccount>;
  adjustBalance(
    id: string,
    delta: number,
    reason: string
  ): Promise<WalletAccount>;
}

export function createMockWalletService(
  seedAccounts: WalletAccount[],
  seedTxns: AdminWalletTxn[]
): AdminWalletService {
  let accounts = seedAccounts.map((a) => ({ ...a }));
  let txns = [...seedTxns];

  return {
    async listAccounts(query = {}) {
      await apiDelay();
      const { search, sortBy, sortDir = "desc", page = 1, pageSize = 10 } = query;

      let filtered = applySearch(accounts, search, (a) => [
        a.ownerName,
        a.ownerEmail,
        a.id,
      ]);

      filtered = applySort(
        filtered,
        sortBy,
        sortDir,
        {
          balance: (a) => a.balance,
          ownerName: (a) => a.ownerName,
          lastActivityAt: (a) => new Date(a.lastActivityAt).getTime(),
        },
        "balance"
      );

      return paginate(filtered, { page, pageSize });
    },

    async listTransactions(query = {}) {
      await apiDelay();
      const {
        search,
        sortBy,
        sortDir = "desc",
        page = 1,
        pageSize = 10,
        direction = "all",
        status = "all",
      } = query;

      let filtered = txns.filter(
        (t) =>
          (direction === "all" || t.direction === direction) &&
          (status === "all" || t.status === status)
      );

      filtered = applySearch(filtered, search, (t) => [
        t.ownerName,
        t.reference,
        t.id,
      ]);

      filtered = applySort(
        filtered,
        sortBy,
        sortDir,
        { createdAt: (t) => new Date(t.createdAt).getTime(), amount: (t) => t.amount },
        "createdAt"
      );

      return paginate(filtered, { page, pageSize });
    },

    async setAccountStatus(id, status) {
      await apiDelay();
      const idx = accounts.findIndex((a) => a.id === id);
      if (idx === -1) throw new Error(`Wallet ${id} not found`);
      accounts[idx] = { ...accounts[idx], status };
      return accounts[idx];
    },

    async adjustBalance(id, delta, reason) {
      await apiDelay();
      const idx = accounts.findIndex((a) => a.id === id);
      if (idx === -1) throw new Error(`Wallet ${id} not found`);
      const acct = accounts[idx];
      const nextBalance = Math.max(0, acct.balance + delta);
      accounts[idx] = { ...acct, balance: nextBalance };
      txns = [
        {
          id: `wtx-adj-${Date.now()}`,
          accountId: acct.id,
          ownerName: acct.ownerName,
          ownerType: acct.ownerType,
          direction: delta >= 0 ? "credit" : "debit",
          type: "adjustment",
          amount: Math.abs(delta),
          balanceAfter: nextBalance,
          reference: `ADJ-${reason.slice(0, 6).toUpperCase() || "MANUAL"}`,
          status: "completed",
          createdAt: new Date().toISOString(),
        },
        ...txns,
      ];
      return accounts[idx];
    },
  };
}
