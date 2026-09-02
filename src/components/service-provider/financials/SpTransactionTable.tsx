"use client";

import { ArrowUp, ArrowDown, ExternalLink } from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatNaira, formatDateTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { spTxTypeLabel, spTxStatusLabel, spTxStatusVariant, spSignIcon, SP_SIGN_LABELS } from "./sp-financials-meta";
import type { SpFinancialTransaction, SpFinSign } from "@/types/service-provider-financials";

interface SpTransactionTableProps {
  items: SpFinancialTransaction[];
  compact?: boolean;
  onRowClick?: (tx: SpFinancialTransaction) => void;
}

export function SpTransactionTable({ items, compact = false, onRowClick }: SpTransactionTableProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-kampmax-border bg-white p-8 text-center">
        <p className="text-kampmax-text-secondary">No transactions found</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-kampmax-border bg-white">
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
              Booking
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
                  <p className="truncate font-medium text-kampmax-text">{tx.description}</p>
                  <p className="text-xs font-mono text-kampmax-text-secondary">{tx.reference}</p>
                </div>
              </td>
              {!compact && (
                <>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-sm text-kampmax-text-secondary">
                      {spSignIcon(tx.sign) === "arrow-up" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                      {SP_SIGN_LABELS[tx.sign]}
                    </span>
                    <p className="text-xs text-kampmax-text-secondary capitalize">{spTxTypeLabel(tx.type)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge variant={spTxStatusVariant(tx.status)} label={spTxStatusLabel(tx.status)} />
                  </td>
                </>
              )}
              <td className="px-4 py-3 text-right">
                <div className={cn("font-mono font-semibold", tx.sign === "credit" ? "text-kampmax-success" : "text-kampmax-error")}>
                  {tx.sign === "credit" ? "+" : "−"}{formatNaira(tx.amount)}
                </div>
                {tx.fee && tx.fee > 0 && (
                  <p className="text-xs text-kampmax-text-secondary">Fee: {formatNaira(tx.fee)}</p>
                )}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-kampmax-text-secondary">
                {formatDateTime(tx.at)}
              </td>
              <td className="px-4 py-3">
                {tx.orderId ? (
                  <a
                    href={`/service-provider/bookings/${tx.orderId}`}
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