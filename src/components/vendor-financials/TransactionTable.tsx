"use client";

import { ChevronRight, ArrowUp, ArrowDown, ExternalLink } from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatNaira, formatDateTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { txTypeLabel, txStatusLabel, txStatusVariant, signIcon, SIGN_LABELS } from "./financials-meta";
import type { VendorFinancialTransaction, VendorFinSign } from "@/types/vendor-financials";

interface TransactionTableProps {
  items: VendorFinancialTransaction[];
  compact?: boolean;
  onRowClick?: (tx: VendorFinancialTransaction) => void;
}

export function TransactionTable({ items, compact = false, onRowClick }: TransactionTableProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-kampmax-border bg-white p-8 text-center">
        <p className="text-kampmax-text-secondary">No transactions found</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-kampmax-border bg-white overflow-hidden">
      <table className="w-full" role="table">
        <thead>
          <tr className="border-b border-kampmax-border bg-neutral-50">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-kampmax-text-secondary">
              Transaction
            </th>
            {!compact && (
              <>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-kampmax-text-secondary">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-kampmax-text-secondary">
                  Status
                </th>
              </>
            )}
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-kampmax-text-secondary">
              Amount
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-kampmax-text-secondary">
              Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-kampmax-text-secondary">
              Order
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-kampmax-border">
          {items.map((tx) => (
            <tr
              key={tx.id}
              className={cn(
                "transition-colors hover:bg-neutral-50",
                onRowClick && "cursor-pointer"
              )}
              onClick={() => onRowClick?.(tx)}
            >
              <td className="px-4 py-3">
                <div className="min-w-0">
                  <p className="font-medium text-kampmax-text truncate">{tx.description}</p>
                  <p className="text-xs text-kampmax-text-secondary font-mono">{tx.reference}</p>
                </div>
              </td>
              {!compact && (
                <>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-sm text-kampmax-text-secondary">
                      {signIcon(tx.sign) === "arrow-up" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                      {SIGN_LABELS[tx.sign]}
                    </span>
                    <p className="text-xs text-kampmax-text-secondary capitalize">{txTypeLabel(tx.type)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge variant={txStatusVariant(tx.status)} label={txStatusLabel(tx.status)} />
                  </td>
                </>
              )}
              <td className="px-4 py-3 text-right">
                <div className={cn("font-mono font-semibold", tx.sign === "credit" ? "text-kampmax-success" : "text-kampmax-error")}>
                  {tx.sign === "credit" ? "+" : "−"}{formatNaira(tx.amount)}
                </div>
                {tx.fee && tx.fee > 0 && (
                  <p className="text-xs text-kampmax-text-secondary">Fee: {tx.sign === "debit" ? "+" : "−"}{formatNaira(tx.fee)}</p>
                )}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-kampmax-text-secondary">
                {formatDateTime(tx.at)}
              </td>
              <td className="px-4 py-3">
                {tx.orderId ? (
                  <a
                    href={`/vendor/orders/${tx.orderId}`}
                    className="inline-flex items-center gap-1 text-sm font-mono text-primary-600 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {tx.orderId}
                    <ExternalLink className="h-3 w-3" aria-hidden />
                  </a>
                ) : (
                  <span className="text-xs text-kampmax-text-secondary">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}