"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  FINANCE_TYPE_LABELS,
  TXN_STATUS_LABELS,
} from "./finance-meta";
import type {
  FinanceFundPool,
  ManagedFinanceTxnType,
  WalletTxnStatus,
} from "@/types/admin";

export interface FinanceTxnFilterState {
  search: string;
  type: ManagedFinanceTxnType | "all";
  status: WalletTxnStatus | "all";
  pool: FinanceFundPool | "all";
}

interface TransactionsFiltersProps {
  filters: FinanceTxnFilterState;
  onChange: (patch: Partial<FinanceTxnFilterState>) => void;
}

const ALL = "all";

export function TransactionsFilters({ filters, onChange }: TransactionsFiltersProps) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <div className="w-full sm:w-60">
        <Input
          value={filters.search}
          placeholder="Search txn, reference, owner, order…"
          leftIcon={<Search className="h-4 w-4" />}
          aria-label="Search transactions"
          onChange={(e) => onChange({ search: e.target.value })}
        />
      </div>

      <Select
        aria-label="Filter by transaction type"
        value={filters.type}
        onChange={(e) =>
          onChange({ type: e.target.value as FinanceTxnFilterState["type"] })
        }
        className="w-auto"
      >
        <option value={ALL}>All types</option>
        {(Object.keys(FINANCE_TYPE_LABELS) as ManagedFinanceTxnType[]).map((t) => (
          <option key={t} value={t}>
            {FINANCE_TYPE_LABELS[t]}
          </option>
        ))}
      </Select>

      <Select
        aria-label="Filter by fund pool"
        value={filters.pool}
        onChange={(e) => onChange({ pool: e.target.value as FinanceTxnFilterState["pool"] })}
        className="w-auto"
      >
        <option value={ALL}>All pools</option>
        <option value="platform">Platform funds</option>
        <option value="vendor">Vendor funds</option>
        <option value="customer">Customer funds</option>
      </Select>

      <Select
        aria-label="Filter by status"
        value={filters.status}
        onChange={(e) =>
          onChange({ status: e.target.value as FinanceTxnFilterState["status"] })
        }
        className="hidden w-auto md:block"
      >
        <option value={ALL}>All statuses</option>
        {(Object.keys(TXN_STATUS_LABELS) as WalletTxnStatus[]).map((s) => (
          <option key={s} value={s}>
            {TXN_STATUS_LABELS[s]}
          </option>
        ))}
      </Select>
    </div>
  );
}
