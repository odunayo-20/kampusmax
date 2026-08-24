"use client";

import {
  ArrowDownToLine,
  Building2,
  Clock3,
  Landmark,
  PiggyBank,
  TrendingUp,
  Undo2,
  Users,
} from "lucide-react";
import { formatNaira, formatNairaCompact } from "@/lib/utils";
import { StatCard } from "@/components/admin/StatCard";
import { PoolChip } from "./FinanceBadges";
import type { FinanceOverview } from "@/types/admin";

/**
 * Fund-pool tiles + headline stats for /admin/wallet.
 *
 * The four pool cards are the reconciliation anchor: platform float,
 * vendor payables, customer wallet liability and in-flight funds are
 * never merged into one number.
 */
export function FinanceOverviewCards({ overview }: { overview: FinanceOverview }) {
  const { platform, vendor, customer, revenue, withdrawals } = overview;

  return (
    <>
      {/* Fund pools - visually distinct by design */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-kampmax-border border-t-2 border-t-kampmax-blue bg-white p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-kampmax-blue">
              <Landmark className="h-3.5 w-3.5" />
              Platform funds
            </span>
            <PoolChip pool="platform" />
          </div>
          <p className="mt-2 text-xl font-semibold tabular-nums text-kampmax-text">
            {formatNaira(platform.balance)}
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-kampmax-text-secondary">
            <span>
              Available
              <span className="block font-medium tabular-nums text-kampmax-text">
                {formatNairaCompact(platform.available)}
              </span>
            </span>
            <span>
              Pending
              <span className="block font-medium tabular-nums text-amber-600">
                {formatNairaCompact(platform.pending)}
              </span>
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-kampmax-border border-t-2 border-t-amber-400 bg-white p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-amber-700">
              <Building2 className="h-3.5 w-3.5" />
              Vendor payable
            </span>
            <PoolChip pool="vendor" />
          </div>
          <p className="mt-2 text-xl font-semibold tabular-nums text-kampmax-text">
            {formatNaira(vendor.payable)}
          </p>
          <p className="mt-2 text-xs text-kampmax-text-secondary">
            Wallets held
            <span className="ml-1 font-medium tabular-nums text-kampmax-text">
              {formatNairaCompact(vendor.walletHeld)}
            </span>
          </p>
        </div>

        <div className="rounded-lg border border-kampmax-border border-t-2 border-t-sky-400 bg-white p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-sky-700">
              <Users className="h-3.5 w-3.5" />
              Customer wallet funds
            </span>
            <PoolChip pool="customer" />
          </div>
          <p className="mt-2 text-xl font-semibold tabular-nums text-kampmax-text">
            {formatNaira(customer.liability)}
          </p>
          <p className="mt-2 text-xs text-kampmax-text-secondary">
            Liability across{" "}
            <span className="font-medium tabular-nums text-kampmax-text">
              {customer.accounts}
            </span>{" "}
            student wallets
          </p>
        </div>

        <div className="rounded-lg border border-kampmax-border border-t-2 border-t-violet-400 bg-white p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-violet-700">
              <Clock3 className="h-3.5 w-3.5" />
              Pending funds
            </span>
            <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-violet-700">
              <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
              In flight
            </span>
          </div>
          <p className="mt-2 text-xl font-semibold tabular-nums text-kampmax-text">
            {formatNaira(withdrawals.pendingAmount)}
          </p>
          <p className="mt-2 text-xs text-kampmax-text-secondary">
            {withdrawals.pendingCount} withdrawal
            {withdrawals.pendingCount === 1 ? "" : "s"} awaiting payout
          </p>
        </div>
      </div>

      {/* Headline stats */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total revenue (net)"
          value={formatNaira(revenue.net)}
          icon={TrendingUp}
          tone="blue"
          hint={`${formatNairaCompact(revenue.gross)} gross − ${formatNairaCompact(revenue.refunds)} refunds`}
        />
        <StatCard
          label="Platform earnings"
          value={formatNaira(platform.earnings)}
          icon={PiggyBank}
          tone="success"
          hint="Commissions + service fees"
        />
        <StatCard
          label="Refunds issued"
          value={formatNaira(revenue.refunds)}
          icon={Undo2}
          tone="warning"
          hint="Returned to customer wallets"
        />
        <StatCard
          label="Withdrawals paid"
          value={formatNaira(withdrawals.paidAmount)}
          icon={ArrowDownToLine}
          tone="gold"
          hint={`${withdrawals.pendingCount} pending · ${formatNairaCompact(withdrawals.pendingAmount)} queued`}
        />
      </div>
    </>
  );
}
