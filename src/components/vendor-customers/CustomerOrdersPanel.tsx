"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatNaira, formatDateTime } from "@/lib/utils";
import { fulfillmentStatusLabel, fulfillmentStatusVariant, paymentStatusLabel, paymentStatusVariant } from "@/components/vendor-orders/orders-meta";
import type { VendorOrder } from "@/types/vendor-orders";

interface CustomerOrdersPanelProps {
  orders: VendorOrder[];
}

export function CustomerOrdersPanel({ orders }: CustomerOrdersPanelProps) {
  return (
    <section className="rounded-xl border border-kampmax-border bg-white">
      <header className="flex items-center gap-2 border-b border-kampmax-border px-4 py-3">
        <ShoppingBag className="h-4 w-4 text-kampmax-blue" aria-hidden />
        <h2 className="text-sm font-semibold text-kampmax-text">
          Order history <span className="font-normal text-kampmax-text-secondary">({orders.length})</span>
        </h2>
      </header>

      {orders.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-kampmax-text-secondary">No orders yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-kampmax-border text-[10px] uppercase tracking-wide text-kampmax-text-secondary">
                <th className="px-4 py-2 font-medium">Order</th>
                <th className="px-4 py-2 font-medium">Date</th>
                <th className="px-4 py-2 font-medium">Items</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Payment</th>
                <th className="px-4 py-2 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-kampmax-border/60 last:border-b-0">
                  <td className="px-4 py-3">
                    <Link href={`/vendor/orders/${order.id}`} className="font-medium text-kampmax-blue hover:underline">
                      {order.id}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-kampmax-text-secondary">{formatDateTime(order.createdAt)}</td>
                  <td className="px-4 py-3 text-kampmax-text-secondary">
                    {order.items.length} item{order.items.length === 1 ? "" : "s"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge variant={fulfillmentStatusVariant(order.fulfillmentStatus)} label={fulfillmentStatusLabel(order.fulfillmentStatus)} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge variant={paymentStatusVariant(order.paymentStatus)} label={paymentStatusLabel(order.paymentStatus)} />
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-kampmax-text">{formatNaira(order.totals.customerTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}