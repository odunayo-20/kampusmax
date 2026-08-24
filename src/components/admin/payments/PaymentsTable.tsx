"use client";

import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, ArrowUpDown, Eye, ReceiptText } from "lucide-react";
import { cn, formatNairaCompact, timeAgo } from "@/lib/utils";
import { EmptyState } from "@/components/admin/EmptyState";
import { ErrorState } from "@/components/admin/ErrorState";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { paymentTypeLabel } from "./payments-meta";
import { MethodBadge, PaymentTxnStatusBadge } from "./PaymentBadges";
import type {
  ManagedPayment,
  Paginated,
  PaymentSortField,
  SortDir,
} from "@/types/admin";

interface PaymentsTableProps {
  page: Paginated<ManagedPayment> | null;
  loading: boolean;
  error: boolean;
  campusNames: Record<string, string>;
  sortBy: PaymentSortField;
  sortDir: SortDir;
  onSort: (field: PaymentSortField) => void;
  onRetry: () => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export function PaymentsTable({
  page,
  loading,
  error,
  campusNames,
  sortBy,
  sortDir,
  onSort,
  onRetry,
  hasActiveFilters,
  onClearFilters,
}: PaymentsTableProps) {
  const router = useRouter();
  const open = (id: string) => router.push(`/admin/payments/${id}`);

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
            ? "No payment matches the current search or filters."
            : "Payment activity will appear here as orders flow through."
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
    field?: PaymentSortField;
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
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="border-b border-kampmax-border bg-kampmax-muted/40 text-[11px] uppercase tracking-wide text-kampmax-text-secondary">
            <tr>
              <Th label="Transaction" />
              <Th label="Order" />
              <Th label="Customer" />
              <Th label="Vendor" className="hidden lg:table-cell" />
              <Th label="Campus" className="hidden xl:table-cell" />
              <Th label="Amount" field="amount" align="right" />
              <Th label="Method" />
              <Th label="Status" />
              <Th label="Reference" className="hidden lg:table-cell" />
              <Th label="Date" field="createdAt" className="hidden md:table-cell" />
              <Th label="" align="right" />
            </tr>
          </thead>
          <tbody className="divide-y divide-kampmax-border/70">
            {page.items.map((txn) => (
              <tr
                key={txn.id}
                className="group cursor-pointer transition-colors hover:bg-kampmax-muted/40"
                onClick={() => open(txn.id)}
              >
                {/* Transaction ID + type */}
                <td className="whitespace-nowrap px-4 py-2.5">
                  <span className="font-mono text-[13px] font-medium text-kampmax-blue group-hover:underline">
                    {txn.id}
                  </span>
                  <span className="block text-[11px] capitalize text-kampmax-text-secondary">
                    {paymentTypeLabel(txn.type)}
                  </span>
                </td>

                {/* Order */}
                <td className="whitespace-nowrap px-4 py-2.5">
                  {txn.orderId ? (
                    <a
                      href={`/admin/orders/${txn.orderId}`}
                      onClick={(e) => e.stopPropagation()}
                      className="font-mono text-xs text-kampmax-blue hover:underline"
                    >
                      {txn.orderId}
                    </a>
                  ) : (
                    <span className="text-xs text-kampmax-text-secondary">—</span>
                  )}
                </td>

                {/* Customer */}
                <td className="max-w-[150px] px-4 py-2.5">
                  <span className="block truncate font-medium text-kampmax-text">
                    {txn.customerName}
                  </span>
                </td>

                {/* Vendor */}
                <td className="hidden max-w-[160px] truncate whitespace-nowrap px-4 py-2.5 text-kampmax-text-secondary lg:table-cell">
                  {txn.vendorName ?? "—"}
                </td>

                {/* Campus */}
                <td className="hidden max-w-[100px] truncate whitespace-nowrap px-4 py-2.5 text-kampmax-text-secondary xl:table-cell">
                  {campusNames[txn.campusId] ?? txn.campusId}
                </td>

                {/* Amount */}
                <td className="whitespace-nowrap px-4 py-2.5 text-right tabular-nums">
                  <span
                    className={cn(
                      "font-medium",
                      txn.status === "failed" || txn.status === "reversed"
                        ? "text-kampmax-text-secondary line-through decoration-red-400/60"
                        : "text-kampmax-text"
                    )}
                  >
                    {formatNairaCompact(txn.amount)}
                  </span>
                  {txn.refundedAmount > 0 && (
                    <span className="block text-[10px] tabular-nums text-sky-600">
                      −{formatNairaCompact(txn.refundedAmount)} refunded
                    </span>
                  )}
                </td>

                {/* Method */}
                <td className="px-4 py-2.5">
                  <MethodBadge method={txn.method} />
                </td>

                {/* Status */}
                <td className="px-4 py-2.5">
                  <PaymentTxnStatusBadge status={txn.status} />
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

                {/* Actions */}
                <td className="relative px-4 py-2.5 text-right">
                  <button
                    type="button"
                    aria-label={`View transaction ${txn.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      open(txn.id);
                    }}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-kampmax-text-secondary transition-colors hover:border-kampmax-border hover:bg-white hover:text-kampmax-text group-hover:border-kampmax-border"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
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
