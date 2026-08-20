"use client";

import { useRouter } from "next/navigation";
import {
  Package, ShoppingCart, DollarSign, Clock, TrendingUp, ArrowUpRight,
  ArrowDownRight, AlertTriangle, Eye, Star,
} from "lucide-react";
import { cn, formatNaira } from "@/lib/utils";
import {
  getVendorProducts,
  getVendorOrders,
  getEarningsSummary,
} from "@/services/vendor";

export default function VendorDashboardPage() {
  const router = useRouter();
  const products = getVendorProducts();
  const orders = getVendorOrders();
  const earnings = getEarningsSummary();

  const activeProducts = products.filter((p) => p.status === "active").length;
  const lowStock = products.filter((p) => p.stock <= 3 && p.status === "active");
  const pendingOrders = orders.filter((o) =>
    ["placed", "confirmed", "preparing"].includes(o.status)
  );
  const recentOrders = orders.slice(0, 5);

  const stats = [
    {
      label: "Total Revenue",
      value: formatNaira(earnings.totalRevenue),
      icon: DollarSign,
      color: "text-green-600 bg-green-50",
      change: `+${earnings.growth}%`,
      positive: true,
    },
    {
      label: "Total Orders",
      value: earnings.orderCount,
      icon: ShoppingCart,
      color: "text-kampmax-blue bg-blue-50",
      change: `${pendingOrders.length} pending`,
      positive: null,
    },
    {
      label: "Active Products",
      value: activeProducts,
      icon: Package,
      color: "text-kampmax-navy bg-kampmax-navy/10",
      change: `${lowStock.length} low stock`,
      positive: null,
    },
    {
      label: "This Month",
      value: formatNaira(earnings.thisMonth),
      icon: TrendingUp,
      color: "text-kampmax-gold bg-yellow-50",
      change: `${earnings.growth > 0 ? "+" : ""}${earnings.growth}%`,
      positive: earnings.growth > 0,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-kampmax-text">Dashboard</h1>
        <p className="text-sm text-kampmax-text-secondary mt-0.5">
          Overview of your store performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-kampmax-border p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", stat.color)}>
                <stat.icon className="h-4 w-4" />
              </div>
              {stat.change && (
                <span className={cn(
                  "text-[11px] font-medium",
                  stat.positive === true && "text-green-600",
                  stat.positive === false && "text-kampmax-error",
                  stat.positive === null && "text-kampmax-text-secondary"
                )}>
                  {stat.change}
                </span>
              )}
            </div>
            <p className="text-lg font-bold text-kampmax-text">{stat.value}</p>
            <p className="text-xs text-kampmax-text-secondary">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Pending Orders Banner */}
      {pendingOrders.length > 0 && (
        <button
          onClick={() => router.push("/vendor/orders")}
          className="w-full bg-kampmax-gold/10 border border-kampmax-gold/30 rounded-xl p-4 flex items-center gap-3 text-left"
        >
          <div className="w-10 h-10 rounded-lg bg-kampmax-gold/20 flex items-center justify-center flex-shrink-0">
            <Clock className="h-5 w-5 text-kampmax-gold" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-kampmax-text">
              {pendingOrders.length} pending order{pendingOrders.length > 1 ? "s" : ""}
            </p>
            <p className="text-xs text-kampmax-text-secondary">
              Orders waiting for your confirmation or preparation
            </p>
          </div>
          <ArrowUpRight className="h-4 w-4 text-kampmax-text-secondary" />
        </button>
      )}

      {/* Low Stock Alert */}
      {lowStock.length > 0 && (
        <div className="bg-white rounded-xl border border-kampmax-border p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <h3 className="text-sm font-semibold text-kampmax-text">Low Stock Alert</h3>
          </div>
          <div className="space-y-2">
            {lowStock.map((product) => (
              <div
                key={product.id}
                onClick={() => router.push(`/vendor/products/${product.id}/edit`)}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-kampmax-muted/50 cursor-pointer hover:bg-kampmax-muted"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-kampmax-text truncate">
                    {product.title}
                  </p>
                </div>
                <span className={cn(
                  "text-xs font-bold ml-3",
                  product.stock === 0 ? "text-kampmax-error" : "text-orange-500"
                )}>
                  {product.stock === 0 ? "Out of stock" : `${product.stock} left`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Earnings Summary */}
      <div className="bg-white rounded-xl border border-kampmax-border p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-kampmax-text">Earnings Summary</h3>
          <button
            onClick={() => router.push("/vendor/earnings")}
            className="text-xs text-kampmax-blue font-medium"
          >
            View details
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="text-[11px] text-kampmax-text-secondary">Pending Payout</p>
            <p className="text-sm font-bold text-kampmax-gold">
              {formatNaira(earnings.pendingPayout)}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-kampmax-text-secondary">Platform Fees</p>
            <p className="text-sm font-bold text-kampmax-text">
              {formatNaira(earnings.platformFees)}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-kampmax-text-secondary">Net Earnings</p>
            <p className="text-sm font-bold text-green-600">
              {formatNaira(earnings.totalEarning)}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-kampmax-border">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h3 className="text-sm font-semibold text-kampmax-text">Recent Orders</h3>
          <button
            onClick={() => router.push("/vendor/orders")}
            className="text-xs text-kampmax-blue font-medium"
          >
            View all
          </button>
        </div>
        <div className="divide-y divide-kampmax-border">
          {recentOrders.map((order) => (
            <button
              key={order.id}
              onClick={() => router.push(`/vendor/orders/${order.id}`)}
              className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-kampmax-muted/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-medium text-kampmax-text">
                    {order.buyerName}
                  </span>
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded font-medium",
                    order.status === "delivered" && "bg-green-50 text-green-700",
                    order.status === "preparing" && "bg-blue-50 text-blue-700",
                    order.status === "ready" && "bg-kampmax-gold/10 text-kampmax-gold",
                    order.status === "cancelled" && "bg-red-50 text-red-700",
                    order.status === "placed" && "bg-gray-50 text-gray-700",
                    order.status === "confirmed" && "bg-purple-50 text-purple-700",
                    order.status === "out_for_delivery" && "bg-indigo-50 text-indigo-700",
                  )}>
                    {order.status.replace("_", " ")}
                  </span>
                </div>
                <p className="text-xs text-kampmax-text-secondary truncate">
                  {order.items.map((i) => i.productTitle).join(", ")}
                </p>
              </div>
              <span className="text-sm font-bold text-kampmax-text flex-shrink-0">
                {formatNaira(order.subtotal)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-xl border border-kampmax-border p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-kampmax-text">Top Products</h3>
          <button
            onClick={() => router.push("/vendor/products")}
            className="text-xs text-kampmax-blue font-medium"
          >
            View all
          </button>
        </div>
        <div className="space-y-2">
          {[...products]
            .filter((p) => p.status === "active")
            .sort((a, b) => b.soldCount - a.soldCount)
            .slice(0, 3)
            .map((product) => (
              <div
                key={product.id}
                onClick={() => router.push(`/vendor/products/${product.id}/edit`)}
                className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-kampmax-muted/50 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-kampmax-muted flex items-center justify-center flex-shrink-0">
                  <Package className="h-4 w-4 text-kampmax-text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-kampmax-text truncate">
                    {product.title}
                  </p>
                  <p className="text-[11px] text-kampmax-text-secondary">
                    {product.soldCount} sold &middot; ⭐ {product.rating || "N/A"}
                  </p>
                </div>
                <span className="text-sm font-bold text-kampmax-text flex-shrink-0">
                  {formatNaira(product.price)}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
