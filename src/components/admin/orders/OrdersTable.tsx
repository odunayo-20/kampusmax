"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, ArrowUpDown, Eye, ShoppingBag } from "lucide-react";
import { cn, formatNairaCompact, timeAgo } from "@/lib/utils";
import { EmptyState } from "@/components/admin/EmptyState";
import { ErrorState } from "@/components/admin/ErrorState";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { FulfillmentBadge, OrderStatusBadge, PaymentStatusBadge } from "./OrderBadges";
import type {
  ManagedOrder,
  OrderSortField,
  Paginated,
  SortDir,
} from "@/types/admin";

interface OrdersTableProps {
  page: Paginated<ManagedOrder> | null;
  loading: boolean;
  error: boolean;
  campusNames: Record<string, string>;
  sortBy: OrderSortField;
  sortDir: SortDir;
  onSort: (field: OrderSortField) => void;
  onRetry: () => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export function OrdersTable({
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
}: OrdersTableProps) {
  const router = useRouter();
  const open = (id: string) => router.push(`/admin/orders/${id}`);

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
      <div className="rounded-lg border border-kampmax-border bg-white p-4">
        <EmptyState
          icon={ShoppingBag}
          title="No orders found"
          message={
            hasActiveFilters
              ? "No order matches the current search or filters."
              : "Orders will appear here as customers check out."
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
      </div>
    );
  }

  function Th({
    label,
    field,
    align = "left",
    className,
  }: {
    label: string;
    field?: OrderSortField;
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
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-kampmax-border bg-kampmax-muted/40 text-[11px] uppercase tracking-wide text-kampmax-text-secondary">
            <tr>
              <Th label="Order" field="orderNumber" />
              <Th label="Customer" />
              <Th label="Vendor" className="hidden lg:table-cell" />
              <Th label="Campus" className="hidden xl:table-cell" />
              <Th label="Total" field="total" align="right" />
              <Th label="Payment" />
              <Th label="Order status" />
              <Th label="Fulfilment" className="hidden md:table-cell" />
              <Th label="Placed" field="createdAt" className="hidden md:table-cell" />
              <Th label="" align="right" />
            </tr>
          </thead>
          <tbody className="divide-y divide-kampmax-border/70">
            {page.items.map((order) => (
              <tr
                key={order.id}
                className="group cursor-pointer transition-colors hover:bg-kampmax-muted/40"
                onClick={() => open(order.id)}
              >
                {/* Order number + summary */}
                <td className="whitespace-nowrap px-4 py-2.5">
                  <span className="font-mono text-[13px] font-medium text-kampmax-blue group-hover:underline">
                    {order.id}
                  </span>
                  <span className="block max-w-[180px] truncate text-[11px] text-kampmax-text-secondary">
                    {order.itemsSummary}
                  </span>
                </td>

                {/* Customer */}
                <td className="max-w-[150px] px-4 py-2.5">
                  <span className="block truncate font-medium text-kampmax-text">
                    {order.customerName}
                  </span>
                </td>

                {/* Vendor */}
                <td className="hidden max-w-[160px] truncate whitespace-nowrap px-4 py-2.5 text-kampmax-text-secondary lg:table-cell">
                  {order.vendorName}
                </td>

                {/* Campus */}
                <td className="hidden max-w-[100px] truncate whitespace-nowrap px-4 py-2.5 text-kampmax-text-secondary xl:table-cell">
                  {campusNames[order.campusId] ?? order.campusId}
                </td>

                {/* Total */}
                <td className="whitespace-nowrap px-4 py-2.5 text-right font-medium tabular-nums text-kampmax-text">
                  {formatNairaCompact(order.total)}
                </td>

                {/* Payment */}
                <td className="px-4 py-2.5">
                  <PaymentStatusBadge status={order.paymentStatus} dot={false} />
                </td>

                {/* Status */}
                <td className="px-4 py-2.5">
                  <OrderStatusBadge status={order.status} />
                </td>

                {/* Fulfilment */}
                <td className="hidden px-4 py-2.5 md:table-cell">
                  <FulfillmentBadge method={order.deliveryMethod} />
                </td>

                {/* Placed */}
                <td
                  className="hidden whitespace-nowrap px-4 py-2.5 tabular-nums text-kampmax-text-secondary md:table-cell"
                  title={order.createdAt}
                >
                  {timeAgo(order.createdAt)}
                </td>

                {/* Actions */}
                <td className="relative px-4 py-2.5 text-right">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    aria-label={`View order ${order.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-kampmax-text-secondary transition-colors hover:border-kampmax-border hover:bg-white hover:text-kampmax-text group-hover:border-kampmax-border"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="sr-only" aria-live="polite">
        Showing {page.items.length} of {page.total} orders, page {page.page} of{" "}
        {page.totalPages}.
      </p>
    </div>
  );
}
