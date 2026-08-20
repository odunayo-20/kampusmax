"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Phone, MapPin, Package, Check, X } from "lucide-react";
import { cn, formatNaira, formatDate } from "@/lib/utils";
import { getVendorOrderById, updateVendorOrderStatus } from "@/services/vendor";
import { OrderStatus } from "@/types";

const statusConfig: Record<OrderStatus, { label: string; color: string }> = {
  placed: { label: "Placed", color: "bg-gray-100 text-gray-700" },
  confirmed: { label: "Confirmed", color: "bg-purple-50 text-purple-700" },
  preparing: { label: "Preparing", color: "bg-blue-50 text-blue-700" },
  ready: { label: "Ready for Pickup", color: "bg-kampmax-gold/10 text-kampmax-gold" },
  out_for_delivery: { label: "Out for Delivery", color: "bg-indigo-50 text-indigo-700" },
  delivered: { label: "Delivered", color: "bg-green-50 text-green-700" },
  cancelled: { label: "Cancelled", color: "bg-red-50 text-red-700" },
};

const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = {
  placed: "confirmed",
  confirmed: "preparing",
  preparing: "ready",
  ready: "out_for_delivery",
  out_for_delivery: "delivered",
};

export default function VendorOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState(getVendorOrderById(id));

  if (!order) {
    return (
      <div className="space-y-4">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-lg bg-kampmax-muted flex items-center justify-center">
          <ArrowLeft className="h-5 w-5 text-kampmax-text" />
        </button>
        <div className="bg-white rounded-xl border border-kampmax-border p-8 text-center">
          <p className="text-sm text-kampmax-text">Order not found</p>
        </div>
      </div>
    );
  }

  function handleStatusUpdate(newStatus: OrderStatus) {
    updateVendorOrderStatus(order!.id, newStatus);
    setOrder(getVendorOrderById(order!.id));
  }

  const expectedNext = nextStatus[order.status];
  const isCancellable = order.status === "placed" || order.status === "confirmed";

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-lg bg-kampmax-muted flex items-center justify-center">
          <ArrowLeft className="h-5 w-5 text-kampmax-text" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-kampmax-text">{order.id}</h1>
          <p className="text-xs text-kampmax-text-secondary">
            {formatDate(order.createdAt)}
          </p>
        </div>
        <span className={cn("ml-auto text-[10px] px-2 py-1 rounded font-medium", statusConfig[order.status].color)}>
          {statusConfig[order.status].label}
        </span>
      </div>

      {/* Status Actions */}
      {expectedNext && order.status !== "delivered" && order.status !== "cancelled" && (
        <div className="flex gap-2">
          <button onClick={() => handleStatusUpdate(expectedNext)}
            className="flex-1 py-3 rounded-xl bg-kampmax-blue text-white text-sm font-semibold flex items-center justify-center gap-2">
            <Check className="h-4 w-4" />
            Mark as {statusConfig[expectedNext].label}
          </button>
          {isCancellable && (
            <button onClick={() => handleStatusUpdate("cancelled")}
              className="py-3 px-4 rounded-xl border border-kampmax-error text-kampmax-error text-sm font-semibold flex items-center gap-2">
              <X className="h-4 w-4" />
              Cancel
            </button>
          )}
        </div>
      )}

      {/* Buyer Info */}
      <div className="bg-white rounded-xl border border-kampmax-border p-4">
        <h3 className="text-xs font-semibold text-kampmax-text-secondary uppercase tracking-wider mb-3">Buyer</h3>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-kampmax-navy text-white flex items-center justify-center text-sm font-bold">
            {order.buyerName.charAt(0)}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-kampmax-text">{order.buyerName}</p>
            <p className="text-xs text-kampmax-text-secondary">{order.buyerPhone}</p>
          </div>
          <a href={`tel:${order.buyerPhone.replace(/\s/g, "")}`}
            className="w-9 h-9 rounded-lg bg-kampmax-blue/10 text-kampmax-blue flex items-center justify-center">
            <Phone className="h-4 w-4" />
          </a>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-xl border border-kampmax-border p-4">
        <h3 className="text-xs font-semibold text-kampmax-text-secondary uppercase tracking-wider mb-3">Items</h3>
        <div className="space-y-2">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <div className="w-10 h-10 rounded-lg bg-kampmax-muted flex items-center justify-center flex-shrink-0">
                <Package className="h-4 w-4 text-kampmax-text-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-kampmax-text truncate">{item.productTitle}</p>
                <p className="text-xs text-kampmax-text-secondary">{item.quantity}× {formatNaira(item.unitPrice)}</p>
              </div>
              <span className="text-sm font-bold text-kampmax-text">{formatNaira(item.quantity * item.unitPrice)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery / Pickup */}
      <div className="bg-white rounded-xl border border-kampmax-border p-4">
        <h3 className="text-xs font-semibold text-kampmax-text-secondary uppercase tracking-wider mb-3">
          {order.deliveryMethod === "campus_pickup" ? "Pickup Details" : "Delivery Details"}
        </h3>
        <div className="flex items-start gap-3">
          <MapPin className="h-4 w-4 text-kampmax-text-secondary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-kampmax-text">
              {order.deliveryMethod === "campus_pickup"
                ? order.pickupLocation
                : order.deliveryAddress}
            </p>
            <p className="text-xs text-kampmax-text-secondary mt-0.5 capitalize">
              {order.deliveryMethod.replace("_", " ")}
            </p>
          </div>
        </div>
      </div>

      {/* Payment */}
      <div className="bg-white rounded-xl border border-kampmax-border p-4">
        <h3 className="text-xs font-semibold text-kampmax-text-secondary uppercase tracking-wider mb-3">Payment</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-kampmax-text-secondary">Subtotal</span>
            <span className="text-kampmax-text">{formatNaira(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-kampmax-text-secondary">Platform Fee (5%)</span>
            <span className="text-kampmax-text">{formatNaira(order.platformFee)}</span>
          </div>
          <div className="border-t border-kampmax-border pt-2 flex justify-between text-sm">
            <span className="font-semibold text-kampmax-text">Your Earning</span>
            <span className="font-bold text-green-600">{formatNaira(order.vendorEarning)}</span>
          </div>
          <div className="flex justify-between text-xs text-kampmax-text-secondary">
            <span>Payment: {order.paymentMethod.replace("_", " ")}</span>
            <span className={cn(
              "font-medium",
              order.paymentStatus === "paid" ? "text-green-600" : order.paymentStatus === "refunded" ? "text-orange-500" : "text-kampmax-text-secondary"
            )}>
              {order.paymentStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="bg-white rounded-xl border border-kampmax-border p-4">
          <h3 className="text-xs font-semibold text-kampmax-text-secondary mb-2">Notes</h3>
          <p className="text-sm text-kampmax-text">{order.notes}</p>
        </div>
      )}
    </div>
  );
}
