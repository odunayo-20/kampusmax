"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ShoppingCart, Package } from "lucide-react";
import { cn, formatNaira } from "@/lib/utils";
import { getVendorOrders } from "@/services/vendor";
import { VendorOrder, OrderStatus } from "@/types";

const statusConfig: Record<OrderStatus, { label: string; color: string }> = {
  placed: { label: "Placed", color: "bg-gray-100 text-gray-700" },
  confirmed: { label: "Confirmed", color: "bg-purple-50 text-purple-700" },
  preparing: { label: "Preparing", color: "bg-blue-50 text-blue-700" },
  ready: { label: "Ready", color: "bg-kampmax-gold/10 text-kampmax-gold" },
  out_for_delivery: { label: "Out for Delivery", color: "bg-indigo-50 text-indigo-700" },
  delivered: { label: "Delivered", color: "bg-green-50 text-green-700" },
  cancelled: { label: "Cancelled", color: "bg-red-50 text-red-700" },
};

export default function VendorOrdersPage() {
  const router = useRouter();
  const [orders] = useState<VendorOrder[]>(getVendorOrders);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed" | "cancelled">("all");

  const activeStatuses: OrderStatus[] = ["placed", "confirmed", "preparing", "ready", "out_for_delivery"];

  const filtered = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.buyerName.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "active" && activeStatuses.includes(o.status)) ||
      (filter === "completed" && o.status === "delivered") ||
      (filter === "cancelled" && o.status === "cancelled");
    return matchesSearch && matchesFilter;
  });

  const counts = {
    all: orders.length,
    active: orders.filter((o) => activeStatuses.includes(o.status)).length,
    completed: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-kampmax-text">Orders</h1>
        <p className="text-sm text-kampmax-text-secondary">Manage your incoming and past orders</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-kampmax-text-secondary" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by order ID or buyer..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-kampmax-border text-sm bg-white focus:outline-none focus:border-kampmax-blue" />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {(["all", "active", "completed", "cancelled"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn("px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors",
              filter === f ? "bg-kampmax-navy text-white" : "bg-white text-kampmax-text-secondary border border-kampmax-border"
            )}>
            {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-kampmax-border p-8 text-center">
          <ShoppingCart className="h-10 w-10 text-kampmax-text-secondary mx-auto mb-3" />
          <p className="text-sm font-medium text-kampmax-text">No orders found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((order) => (
            <button key={order.id} onClick={() => router.push(`/vendor/orders/${order.id}`)}
              className="w-full bg-white rounded-xl border border-kampmax-border p-4 text-left hover:bg-kampmax-muted/50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-kampmax-text">{order.id}</span>
                <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", statusConfig[order.status].color)}>
                  {statusConfig[order.status].label}
                </span>
              </div>
              <p className="text-sm text-kampmax-text mb-1">{order.buyerName}</p>
              <p className="text-xs text-kampmax-text-secondary truncate mb-2">
                {order.items.map((i) => `${i.quantity}× ${i.productTitle}`).join(", ")}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-kampmax-text">{formatNaira(order.subtotal)}</span>
                <span className="text-[11px] text-kampmax-text-secondary">
                  {new Date(order.createdAt).toLocaleDateString("en-NG", { month: "short", day: "numeric" })}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
