"use client";

import type {
  ManagedPayout,
  ManagedPayoutSortField,
} from "@/types/admin";
import type { SortDir } from "@/types/admin";
import { formatNaira } from "@/lib/utils";
import {
  PayoutMethodBadge,
  PayoutRecipientBadge,
  PayoutStatusBadge,
} from "./PayoutBadges";
import { formatPayoutDate } from "./payouts-meta";

export function PayoutsTable({
  rows,
  sortBy,
  sortDir,
  onSort,
  onOpen,
  emptyHint,
}: {
  rows: ManagedPayout[];
  sortBy: ManagedPayoutSortField;
  sortDir: SortDir;
  onSort: (field: ManagedPayoutSortField) => void;
  onOpen: (id: string) => void;
  emptyHint?: string;
}) {
  if (!rows.length) {
    return (
      <div className="rounded-lg border border-kampmax-border bg-kampmax-surface p-12 text-center text-sm text-kampmax-text-muted">
        {emptyHint ?? "No payouts match the current filters."}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-kampmax-border">
      <table className="min-w-full divide-y divide-kampmax-border text-sm">
        <thead className="bg-kampmax-surface-hover">
          <tr>
            <Th>Payout</Th>
            <Th>Recipient</Th>
            <SortableTh field="amount" active={sortBy === "amount"} dir={sortDir} onClick={onSort}>
              Amount
            </SortableTh>
            <Th>Method</Th>
            <Th>Recipient</Th>
            <Th>Status</Th>
            <SortableTh field="createdAt" active={sortBy === "createdAt"} dir={sortDir} onClick={onSort}>
              Date
            </SortableTh>
            <Th className="text-right">Open</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-kampmax-border bg-kampmax-surface">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-kampmax-surface-hover/50">
              <td>
                <div className="flex flex-col">
                  <span className="font-mono text-xs font-semibold text-kampmax-text">
                    {row.id}
                    {row.reference ? ` · ${row.reference}` : ""}
                  </span>
                  <span className="text-xs text-kampmax-text-muted">
                    {row.source}
                    {row.fee > 0 ? ` · fee ${formatNaira(row.fee)}` : ""}
                  </span>
                </div>
              </td>
              <td>
                <div className="flex flex-col">
                  <span className="font-medium text-kampmax-text">{row.recipientName}</span>
                  <span className="text-xs text-kampmax-text-muted">{row.recipientId}</span>
                </div>
              </td>
              <td className="whitespace-nowrap text-sm font-semibold tabular-nums text-kampmax-text">
                {formatNaira(row.amount)}
              </td>
              <td>
                <PayoutMethodBadge method={row.method} />
              </td>
              <td>
                <PayoutRecipientBadge type={row.recipientType} />
              </td>
              <td>
                <PayoutStatusBadge status={row.status} />
              </td>
              <td className="whitespace-nowrap text-xs text-kampmax-text-muted">
                {formatPayoutDate(row.createdAt)}
              </td>
              <td className="text-right">
                <button
                  onClick={() => onOpen(row.id)}
                  className="inline-flex items-center rounded-md bg-kampmax-primary/10 px-2.5 py-1 text-xs font-medium text-kampmax-primary hover:bg-kampmax-primary/20"
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-kampmax-text-muted ${className ?? ""}`}
    >
      {children}
    </th>
  );
}

function SortableTh({
  field,
  active,
  dir,
  onClick,
  children,
  className,
}: {
  field: ManagedPayoutSortField;
  active: boolean;
  dir: SortDir;
  onClick: (field: ManagedPayoutSortField) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
        active ? "text-kampmax-primary" : "text-kampmax-text-muted"
      } ${className ?? ""}`}
    >
      <button
        onClick={() => onClick(field)}
        className="inline-flex items-center gap-1 hover:text-kampmax-primary"
      >
        {children}
        {active && (
          <span className="text-[10px]">{dir === "asc" ? "▲" : "▼"}</span>
        )}
      </button>
    </th>
  );
}