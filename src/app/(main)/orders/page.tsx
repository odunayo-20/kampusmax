"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getOrdersByUser, getActiveOrders, getCompletedOrders, getCancelledOrders } from "@/services/orders";
import { getVendorById } from "@/services/users";
import { PageContainer } from "@/components/layout/PageContainer";
import { OrderCard } from "@/components/orders/OrderCard";
import { EmptyOrdersState } from "@/components/orders/EmptyOrdersState";
import { cn } from "@/lib/utils";

type TabKey = "all" | "active" | "completed" | "cancelled";

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

export default function OrdersPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const userId = user?.id || "u1";

  const orders = useMemo(() => {
    switch (activeTab) {
      case "active":
        return getActiveOrders(userId);
      case "completed":
        return getCompletedOrders(userId);
      case "cancelled":
        return getCancelledOrders(userId);
      default:
        return getOrdersByUser(userId);
    }
  }, [activeTab, userId]);

  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const q = searchQuery.toLowerCase();
    return orders.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.items.some((i) =>
          i.product.title.toLowerCase().includes(q)
        )
    );
  }, [orders, searchQuery]);

  const tabCounts = useMemo(() => ({
    all: getOrdersByUser(userId).length,
    active: getActiveOrders(userId).length,
    completed: getCompletedOrders(userId).length,
    cancelled: getCancelledOrders(userId).length,
  }), [userId]);

  // Vendor name cache
  const vendorCache = useMemo(() => {
    const cache: Record<string, string> = {};
    orders.forEach((o) => {
      if (!cache[o.vendorId]) {
        const v = getVendorById(o.vendorId);
        cache[o.vendorId] = v?.storeName || "Unknown";
      }
    });
    return cache;
  }, [orders]);

  return (
    <PageContainer>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-kampmax-text">My Orders</h1>
          <p className="text-xs text-kampmax-text-secondary mt-0.5">
            Track and manage your orders
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-kampmax-text-secondary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order ID or product name..."
            className="w-full h-10 pl-9 pr-4 text-sm bg-white border border-kampmax-border rounded-lg focus:outline-none focus:border-kampmax-blue focus:ring-1 focus:ring-kampmax-blue placeholder:text-kampmax-text-secondary"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-kampmax-muted rounded-lg p-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium rounded-md transition-all",
                activeTab === tab.key
                  ? "bg-white text-kampmax-navy shadow-sm"
                  : "text-kampmax-text-secondary hover:text-kampmax-text"
              )}
            >
              {tab.label}
              {tabCounts[tab.key] > 0 && (
                <span
                  className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center",
                    activeTab === tab.key
                      ? "bg-kampmax-blue text-white"
                      : "bg-kampmax-border text-kampmax-text-secondary"
                  )}
                >
                  {tabCounts[tab.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Orders list */}
        {filteredOrders.length === 0 ? (
          searchQuery ? (
            <EmptyOrdersState type="search" searchQuery={searchQuery} />
          ) : (
            <EmptyOrdersState type={activeTab} />
          )
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                vendorName={vendorCache[order.vendorId]}
              />
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
