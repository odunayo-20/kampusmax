"use client";

import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown, ReceiptText } from "lucide-react";
import { cn, formatNaira, timeAgo } from "@/lib/utils";
import { EmptyState } from "@/components/admin/EmptyState";
import { ErrorState } from "@/components/admin/ErrorState";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { financeTypeLabel } from "./finance-meta";
import { PoolChip, TxnStatusBadge } from "./FinanceBadges";
import type {
  ManagedFinanceTxn,
  Paginated,
  SortDir,
} from "@/types/admin";

interface TransactionsTableProps {
  page: Paginated<ManagedFinanceTxn> | null;
  loading: boolean;
  error: boolean;
  sortBy: "createdAt" | "amount";
  sortDir: SortDir;
  onSort: (field: "createdAt" | "amount") => void;
  onRetry: () => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export function TransactionsTable({
  page,
  loading,
  error,
  sortBy,
  sortDir,
  onSort,
  onRetry,
  hasActiveFilters,
  onClearFilters,
}: TransactionsTableProps) {
  if (loading && !page) return <LoadingSkeleton variant="table" rows={8} />;

  if (error) {
    return (
      <div className="rounded-lg border border-kampmax-border bg-white p-4">
        <ErrorState onRetry={onRetry} />
      </div>
    );
  }

  if (!page || page.items.length === 0) {
    return (
      <EmptyState
        icon={ReceiptText}
        title="No transactions match"
        message={
          hasActiveFilters
            ? "No ledger entry matches the current search or filters."
            : "Wallet activity will appear here as money moves."
        }
        action={
          hasActiveFilters ? (
            <button
              type="button"
              onClick={onClearFilters}
              className="h-9 rounded-md bg-kampmax-blue px-3.5 text-sm font-medium text-white hover:bg-kampmax-blue/90"
            >
              Clear filters
            </button>
          ) : undefined
        }
      />
    );
  }

  function Th({
    label,
    field,
    align = "left",
    className,
  }: {
    label: string;
    field?: "createdAt" | "amount";
    align?: "left" | "right";
    className?: string;
  }) {
    const active = field != null && sortBy === field;
    const Icon = !active ? ArrowUpDown : sortDir === "asc" ? ArrowUp : ArrowDown;
    return (
      <th
        scope="col"
        aria-sort={active ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
        className={cn("px-4 py-2.5 font-medium", align === "right" && "text-right", className)}
      >
        {field == null ? (
          label
        ) : (
          <button
            type="button"
            onClick={() => onSort(field)}
            className={cn(
              "inline-flex items-center gap-1 whitespace-nowrap uppercase tracking-wide transition-colors hover:text-kampmax-text",
              active && "text-kampmax-text",
              align === "right" && "flex-row-reverse"
            )}
          >
            {label}
            <Icon className={cn("h-3 w-3", active ? "text-kampmax-blue" : "opacity-50")} />
          </button>
        )}
      </th>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-kampmax-border bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] text-left text-sm">
          <thead className="border-b border-kampmax-border bg-kampmax-muted/40 text-[11px] uppercase tracking-wide text-kampmax-text-secondary">
            <tr>
              <Th label="Transaction" />
              <Th label="Type" />
              <Th label="User / Vendor" />
              <Th label="Amount" field="amount" align="right" />
              <Th label="Status" />
              <Th label="Reference" className="hidden lg:table-cell" />
              <Th label="Date" field="createdAt" className="hidden md:table-cell" />
            </tr>
          </thead>
          <tbody className="divide-y divide-kampmax-border/70">
            {page.items.map((txn) => {
              const credit = txn.direction === "credit";
              return (
                <tr key={txn.id} className="transition-colors hover:bg-kampmax-muted/40">
                  {/* ID */}
                  <td className="whitespace-nowrap px-4 py-2.5 font-mono text-[13px] font-medium text-kampmax-blue">
                    {txn.id}
                  </td>

                  {/* Type + pool */}
                  <td className="whitespace-nowrap px-4 py-2.5">
                    <span className="text-[13px] font-medium text-kampmax-text">
                      {financeTypeLabel(txn.type)}
                    </span>
                    <span className="mt-0.5 block">
                      <PoolChip pool={txn.pool} />
                    </span>
                  </td>

                  {/* Owner (+ order link when scoped) */}
                  <td className="max-w-[180px] px-4 py-2.5">
                    <span className="block truncate text-[13px] text-kampmax-text">
                      {txn.ownerName}
                    </span>
                    {txn.orderId && (
                      <Link
                        href={`/admin/orders/${txn.orderId}`}
                        className="font-mono text-[11px] text-kampmax-blue hover:underline"
                      >
                        {txn.orderId}
                      </Link>
                    )}
                  </td>

                  {/* Signed amount */}
                  <td
                    className={cn(
                      "whitespace-nowrap px-4 py-2.5 text-right font-medium tabular-nums",
                      credit ? "text-kampmax-success" : "text-kampmax-error"
                    )}
                  >
                    {credit ? "+" : "−"}
                    {formatNaira(txn.amount)}
                    <span className="block text-[10px] font-normal text-kampmax-text-secondary">
                      bal. {formatNaira(txn.balanceAfter)}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-2.5">
                    <TxnStatusBadge status={txn.status} />
                  </td>

                  {/* Reference */}
                  <td className="hidden whitespace-nowrap px-4 py-2.5 font-mono text-[11px] text-kampmax-text-secondary lg:table-cell">
                    {txn.reference}
                  </td>

                  {/* Date */}
                  <td
                    className="hidden whitespace-nowrap px-4 py-2.5 tabular-nums text-kampmax-text-secondary md:table-cell"
                    title={txn.createdAt}
                  >
                    {timeAgo(txn.createdAt)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="sr-only" aria-live="polite">
        Showing {page.items.length} of {page.total} transactions, page {page.page} of{" "}
        {page.totalPages}.
      </p>
    </div>
  );
}
