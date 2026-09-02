"use client";

import { Clock, AlertCircle, CheckCircle, XCircle, Building, Copy } from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatNaira, formatDateTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { spPayoutStatusLabel, spPayoutStatusVariant } from "./sp-financials-meta";
import type { SpPayout } from "@/types/service-provider-financials";

interface SpPayoutsTableProps {
  items: SpPayout[];
  compact?: boolean;
  onRowClick?: (payout: SpPayout) => void;
}

const STATUS_ICONS = {
  processing: <Clock className="h-4 w-4 text-kampmax-info" />,
  successful: <CheckCircle className="h-4 w-4 text-kampmax-success" />,
  failed: <XCircle className="h-4 w-4 text-kampmax-error" />,
};

export function SpPayoutsTable({ items, compact = false, onRowClick }: SpPayoutsTableProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-kampmax-border bg-white p-8 text-center">
        <p className="text-kampmax-text-secondary">No payouts found</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-kampmax-border bg-white">
      <table className="w-full" role="table">
        <thead>
          <tr className="border-b border-kampmax-border bg-neutral-50">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-kampmax-text-secondary">
              Payout
            </th>
            {!compact && (
              <>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-kampmax-text-secondary">
                  Bank
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
              Requested
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-kampmax-text-secondary">
              Reference
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-kampmax-border">
          {items.map((payout) => (
            <tr
              key={payout.id}
              className={cn(
                "transition-colors hover:bg-neutral-50",
                onRowClick && "cursor-pointer"
              )}
              onClick={() => onRowClick?.(payout)}
            >
              <td className="px-4 py-3">
                <div className="flex min-w-0 items-center gap-2">
                  {STATUS_ICONS[payout.status]}
                  <div>
                    <p className="font-medium text-kampmax-text">Payout {payout.id}</p>
                    <p className="text-xs font-mono text-kampmax-text-secondary">{payout.reference}</p>
                  </div>
                </div>
              </td>
              {!compact && (
                <>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-kampmax-text-secondary" />
                      <span className="text-sm text-kampmax-text-secondary">{payout.bankName}</span>
                    </div>
                    <p className="text-xs font-mono text-kampmax-text-secondary">{payout.maskedAccountNumber}</p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge variant={spPayoutStatusVariant(payout.status)} label={spPayoutStatusLabel(payout.status)} />
                  </td>
                </>
              )}
              <td className="px-4 py-3 text-right">
                <div className="font-mono font-semibold text-kampmax-error">
                  −{formatNaira(payout.amount + payout.fee)}
                </div>
                <p className="text-xs text-kampmax-text-secondary">Fee: {formatNaira(payout.fee)}</p>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-kampmax-text-secondary">
                {formatDateTime(payout.requestedAt)}
              </td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(payout.reference);
                  }}
                  className="inline-flex items-center gap-1 text-sm font-mono text-primary-600 hover:underline"
                >
                  {payout.reference}
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}