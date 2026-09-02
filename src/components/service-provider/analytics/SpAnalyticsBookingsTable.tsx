"use client";

import { StatusBadge } from "@/components/admin/StatusBadge";
import { spAnalyticsStatusVariant } from "./sp-analytics-meta";
import type { SpAnalyticsBookingsTableRow } from "@/types/service-provider-analytics";

interface SpAnalyticsBookingsTableProps {
  rows: SpAnalyticsBookingsTableRow[];
  onRowClick?: (row: SpAnalyticsBookingsTableRow) => void;
}

export function SpAnalyticsBookingsTable({ rows, onRowClick }: SpAnalyticsBookingsTableProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-kampmax-border bg-white p-8 text-center text-sm text-kampmax-text-secondary">
        No bookings in this period
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-kampmax-border bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-kampmax-text-secondary">
            <tr>
              <th className="px-4 py-3 font-medium">Reference</th>
              <th className="px-4 py-3 font-medium">Service</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Amount</th>
              <th className="px-4 py-3 font-medium">Starts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-kampmax-border">
            {rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row)}
                className={onRowClick ? "cursor-pointer hover:bg-neutral-50" : ""}
              >
                <td className="px-4 py-3 font-medium text-kampmax-text">{row.reference}</td>
                <td className="px-4 py-3 text-kampmax-text-secondary">{row.serviceName}</td>
                <td className="px-4 py-3 text-kampmax-text-secondary">{row.categoryName}</td>
                <td className="px-4 py-3">
                  <StatusBadge variant={spAnalyticsStatusVariant(row.status)} label={row.status} />
                </td>
                <td className="px-4 py-3 text-right tabular-nums font-medium text-kampmax-text">{row.amount}</td>
                <td className="px-4 py-3 text-kampmax-text-secondary">{row.start}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
