"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Package,
  Store,
  Truck,
  MapPinned,
  MessageCircle,
  AlertTriangle,
} from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Breadcrumbs, BreadcrumbItem } from "@/components/layout/Breadcrumbs";
import { Button } from "@/components/atoms/Button";
import { OrderStatusBadge } from "@/components/atoms/Badge";
import { OrderTimeline } from "@/components/orders/OrderTimeline";
import { OrderItems } from "@/components/orders/OrderItems";
import { OrderFees } from "@/components/orders/OrderFees";
import { OrderActions } from "@/components/orders/OrderActions";
import { getOrderById } from "@/services/orders";
import { getVendorById } from "@/services/users";
import { PICKUP_LOCATION_LABELS, PickupLocation } from "@/types";
import { formatDate, cn } from "@/lib/utils";

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const order = getOrderById(id);
  const vendor = order ? getVendorById(order.vendorId) : undefined;

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelled, setIsCancelled] = useState(false);

  if (!order) {
    return (
      <PageContainer>
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => router.back()}
            className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-kampmax-muted transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-kampmax-text" />
          </button>
          <h1 className="text-xl font-bold text-kampmax-text">Order Not Found</h1>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-kampmax-muted flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-kampmax-text-secondary/40" />
          </div>
          <h2 className="text-base font-semibold text-kampmax-text mb-1">
            Order not found
          </h2>
          <p className="text-sm text-kampmax-text-secondary max-w-xs mb-5">
            Order #{id} doesn't exist or may have been removed.
          </p>
          <Button
            onClick={() => router.push("/orders")}
            className="bg-kampmax-navy text-white hover:bg-kampmax-navy/90"
          >
            View All Orders
          </Button>
        </div>
      </PageContainer>
    );
  }

  const displayOrder = isCancelled
    ? { ...order, status: "cancelled" as const, cancelReason }
    : order;

  const DELIVERY_ICONS: Record<string, typeof Package> = {
    campus_pickup: Store,
    meetup: MapPinned,
    delivery: Truck,
  };
  const DeliveryIcon = DELIVERY_ICONS[order.deliveryMethod] || Package;

  function handleCancel() {
    setShowCancelModal(true);
  }

  function confirmCancel() {
    setIsCancelled(true);
    setShowCancelModal(false);
  }

  function handleReorder() {
    router.push("/marketplace");
  }

  function handleReview() {
    // Placeholder — will connect to review flow later
    alert("Review flow coming soon!");
  }

  function handleContactVendor() {
    router.push("/chat");
  }

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Orders", href: "/orders" },
    { label: `#${order.id}` },
  ];

  return (
    <PageContainer>
      <div className="space-y-4">
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbs} />

        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-kampmax-muted transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-kampmax-text" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-kampmax-text">
                #{order.id}
              </h1>
              <OrderStatusBadge
                status={isCancelled ? "cancelled" : order.status}
              />
            </div>
            <p className="text-xs text-kampmax-text-secondary mt-0.5">
              Placed {formatDate(new Date(order.createdAt))}
            </p>
          </div>
        </div>

        {/* Timeline */}
        <section className="bg-white rounded-xl border border-kampmax-border p-4">
          <h3 className="text-sm font-semibold text-kampmax-text flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-kampmax-blue" />
            Order Timeline
          </h3>
          <OrderTimeline
            timeline={
              isCancelled
                ? [
                    ...order.timeline,
                    {
                      status: "cancelled" as const,
                      timestamp: new Date().toISOString(),
                      message: cancelReason || "Order cancelled",
                    },
                  ]
                : order.timeline
            }
            currentStatus={isCancelled ? "cancelled" : order.status}
          />
        </section>

        {/* Items */}
        <section className="bg-white rounded-xl border border-kampmax-border p-4">
          <h3 className="text-sm font-semibold text-kampmax-text flex items-center gap-2 mb-3">
            <Package className="h-4 w-4 text-kampmax-blue" />
            Order Items
          </h3>
          <OrderItems items={order.items} />
        </section>

        {/* Fees & Payment */}
        <section className="bg-white rounded-xl border border-kampmax-border p-4">
          <h3 className="text-sm font-semibold text-kampmax-text mb-3">
            Payment Details
          </h3>
          <OrderFees
            subtotal={order.subtotal}
            platformFee={order.platformFee}
            deliveryFee={order.deliveryFee}
            discountAmount={order.discountAmount}
            total={order.total}
            paymentMethod={order.paymentMethod}
            paymentStatus={
              isCancelled ? "refunded" : order.paymentStatus
            }
          />
        </section>

        {/* Delivery / Pickup */}
        <section className="bg-white rounded-xl border border-kampmax-border p-4 space-y-3">
          <h3 className="text-sm font-semibold text-kampmax-text flex items-center gap-2">
            <DeliveryIcon className="h-4 w-4 text-kampmax-blue" />
            {order.deliveryMethod === "campus_pickup"
              ? "Pickup Details"
              : order.deliveryMethod === "delivery"
                ? "Delivery Details"
                : "Meetup Details"}
          </h3>

          <div className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-kampmax-text-secondary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm text-kampmax-text">
                {order.deliveryAddress || "Not specified"}
              </p>
              {order.pickupLocation && (
                <p className="text-xs text-kampmax-text-secondary mt-0.5">
                  {PICKUP_LOCATION_LABELS[
                    order.pickupLocation as PickupLocation
                  ] || order.pickupLocation}
                </p>
              )}
            </div>
          </div>

          {order.estimatedDelivery && !isCancelled && (
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-kampmax-text-secondary shrink-0" />
              <p className="text-sm text-kampmax-text-secondary">
                {order.status === "delivered"
                  ? `Delivered ${formatDate(new Date(order.deliveredAt || order.estimatedDelivery))}`
                  : `Estimated: ${formatDate(new Date(order.estimatedDelivery))}`}
              </p>
            </div>
          )}

          {order.notes && (
            <div className="p-2.5 bg-kampmax-muted rounded-lg">
              <p className="text-xs text-kampmax-text-secondary">
                <span className="font-medium">Note:</span> {order.notes}
              </p>
            </div>
          )}
        </section>

        {/* Vendor */}
        {vendor && (
          <section className="bg-white rounded-xl border border-kampmax-border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-kampmax-navy/10 flex items-center justify-center text-sm font-bold text-kampmax-navy">
                {vendor.storeName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-kampmax-text truncate">
                  {vendor.storeName}
                </p>
                <p className="text-xs text-kampmax-text-secondary">
                  {vendor.rating} ★ · {vendor.totalSales} sales
                  {vendor.verified && " · Verified"}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Actions */}
        <OrderActions
          order={displayOrder}
          onCancel={handleCancel}
          onReorder={handleReorder}
          onReview={handleReview}
          onContactVendor={handleContactVendor}
        />

        {/* Cancel reason (if cancelled) */}
        {(isCancelled || order.status === "cancelled") && (
          <section className="bg-kampmax-error/10 rounded-xl border border-kampmax-error/20 p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-kampmax-error mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-kampmax-error">
                  Order Cancelled
                </p>
                <p className="text-xs text-kampmax-text-secondary mt-0.5">
                  {isCancelled
                    ? cancelReason
                    : order.cancelReason || "No reason provided"}
                </p>
                {order.paymentStatus === "refunded" && (
                  <p className="text-xs text-kampmax-info mt-1">
                    Refund has been processed to your original payment method.
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Back button */}
        <Button
          onClick={() => router.push("/orders")}
          variant="outline"
          className="w-full border-kampmax-border"
        >
          Back to Orders
        </Button>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowCancelModal(false)}
          />
          <div className="relative bg-white rounded-2xl p-5 w-full max-w-sm space-y-4">
            <h3 className="text-base font-semibold text-kampmax-text">
              Cancel Order
            </h3>
            <p className="text-sm text-kampmax-text-secondary">
              Are you sure you want to cancel order #{order.id}? This action
              cannot be undone.
            </p>
            <div>
              <label className="text-xs font-medium text-kampmax-text-secondary mb-1 block">
                Reason for cancellation
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full h-10 px-3 text-sm border border-kampmax-border rounded-lg bg-white focus:outline-none focus:border-kampmax-blue"
              >
                <option value="">Select a reason</option>
                <option value="Changed my mind">Changed my mind</option>
                <option value="Found a better deal">Found a better deal</option>
                <option value="Item no longer needed">Item no longer needed</option>
                <option value="Item no longer available">Item no longer available</option>
                <option value="Duplicate order">Duplicate order</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 h-10 text-sm font-medium border border-kampmax-border rounded-lg hover:bg-kampmax-muted transition-colors"
              >
                Keep Order
              </button>
              <button
                onClick={confirmCancel}
                disabled={!cancelReason}
                className="flex-1 h-10 text-sm font-medium bg-kampmax-error text-white rounded-lg hover:bg-kampmax-error/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
