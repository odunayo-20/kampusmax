"use client";

import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  POOL_LABELS,
  TXN_STATUS_LABELS,
  poolChipClass,
  txnStatusVariant,
  withdrawalStatusVariant,
  WITHDRAWAL_STATUS_LABELS,
} from "./finance-meta";
import type { FinanceFundPool, WalletTxnStatus, WithdrawalStatus } from "@/types/admin";

/** Colored chip that always identifies which books a row/figure belongs to. */
export function PoolChip({ pool }: { pool: FinanceFundPool }) {
  return (
    <span
      className={cnPool(pool)}
      title={POOL_LABELS[pool]}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {POOL_LABELS[pool]}
    </span>
  );
}

function cnPool(pool: FinanceFundPool): string {
  return `inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${poolChipClass(pool)}`;
}

export function TxnStatusBadge({ status }: { status: WalletTxnStatus }) {
  return (
    <StatusBadge variant={txnStatusVariant(status)} label={TXN_STATUS_LABELS[status]} />
  );
}

export function WithdrawalStatusBadge({ status }: { status: WithdrawalStatus }) {
  return (
    <StatusBadge
      variant={withdrawalStatusVariant(status)}
      label={WITHDRAWAL_STATUS_LABELS[status]}
    />
  );
}
