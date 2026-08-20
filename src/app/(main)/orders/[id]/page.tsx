"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, CheckCircle2, Clock, Package,
  MapPin, MessageCircle, Home
} from "lucide-react";
import { Button, OrderStatusBadge, Avatar } from "@/components/ui";
import { PageContainer, Breadcrumbs } from "@/components/layout";
import { formatNaira, formatDate, cn } from "@/lib/utils";
import { getOrderById } from "@/services/orders";
import { getVendorById } from "@/services/users";

const statusSteps = [
  { key: "placed", label: "Order Placed", icon: Package },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle2 },
  { key: "preparing", label: "Preparing", icon: Clock },
  { key: "ready", label: "Ready for Pickup", icon: MapPin },
  { key: "delivered", label: "Completed", icon: CheckCircle2 },
];

const statusOrder = ["placed", "confirmed", "preparing", "ready", "delivered"];

export default function OrderTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const order = getOrderById(id);
  const vendor = order ? getVendorById(order.vendorId) : undefined;

  if (!order) {
    return (
      <PageContainer>
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => router.back()}
            className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-kampmax-muted transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold text-kampmax-text">Order Not Found</h1>
        </div>
        <div className="text-center py-16">
          <p className="text-4xl mb-3">Order not found</p>
          <p className="text-sm font-medium text-kampmax-text mb-1">
            Order #{id} not found
          </p>
          <p className="text-xs text-kampmax-text-secondary mb-6">
            This order may have been removed or the ID is incorrect.
          </p>
          <Button onClick={() => router.push("/orders")} variant="primary">
            View All Orders
          </Button>
        </div>
      </PageContainer>
    );
  }

  const currentIdx = statusOrder.indexOf(order.status);

  return (
    <PageContainer>
      <Breadcrumbs
        items={[
          { label: "Orders", href: "/orders" },
          { label: `#${order.id}` },
        ]}
        className="mb-4"
      />

      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => router.back()}
          className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-kampmax-muted transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-kampmax-text">Order #{order.id}</h1>
          <p className="text-xs text-kampmax-text-secondary">
            Placed {formatDate(new Date(order.createdAt))}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="space-y-4">
        <section className="bg-white rounded-lg border border-kampmax-border p-4">
          <div className="space-y-0">
            {statusSteps.map((step, idx) => {
              const isCompleted = idx <= currentIdx;
              const isCurrent = idx === currentIdx;
              const Icon = step.icon;
              return (
                <div key={step.key} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                        isCompleted
                          ? "bg-kampmax-blue text-white"
                          : "bg-kampmax-muted text-kampmax-text-secondary border border-kampmax-border"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    {idx < statusSteps.length - 1 && (
                      <div
                        className={cn(
                          "w-0.5 h-8 my-1",
                          idx < currentIdx ? "bg-kampmax-blue" : "bg-kampmax-border"
                        )}
                      />
                    )}
                  </div>
                  <div className="pb-6">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        isCurrent
                          ? "text-kampmax-blue"
                          : isCompleted
                            ? "text-kampmax-text"
                            : "text-kampmax-text-secondary"
                      )}
                    >
                      {step.label}
                    </p>
                    {isCurrent && order.estimatedDelivery && (
                      <p className="text-xs text-kampmax-text-secondary mt-0.5">
                        Est. {formatDate(new Date(order.estimatedDelivery))}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-white rounded-lg border border-kampmax-border p-4 space-y-3">
          <h3 className="text-sm font-semibold text-kampmax-text">Order Details</h3>
          <div className="space-y-2">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-kampmax-text-secondary">
                  {item.quantity}x {item.product.title}
                </span>
                <span className="font-medium text-kampmax-text">
                  {formatNaira(item.product.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-kampmax-border pt-2 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-kampmax-text-secondary">Delivery</span>
              <span className="text-kampmax-text">
                {order.deliveryMethod === "campus_pickup"
                  ? "Free (Campus Pickup)"
                  : order.deliveryMethod === "delivery"
                    ? "₦500 (Hostel Delivery)"
                    : "Free (Meetup)"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-kampmax-text">Total Paid</span>
              <span className="font-bold text-kampmax-navy">
                {formatNaira(order.total)}
              </span>
            </div>
          </div>
        </section>

        {order.deliveryAddress && (
          <section className="bg-white rounded-lg border border-kampmax-border p-4 space-y-3">
            <h3 className="text-sm font-semibold text-kampmax-text">
              {order.deliveryMethod === "campus_pickup" ? "Pickup Location" : "Delivery Address"}
            </h3>
            <div className="flex items-center gap-2 text-sm text-kampmax-text-secondary">
              <MapPin className="h-4 w-4 text-kampmax-blue flex-shrink-0" />
              <span>{order.deliveryAddress}</span>
            </div>
          </section>
        )}

        {vendor && (
          <section className="bg-white rounded-lg border border-kampmax-border p-4">
            <div className="flex items-center gap-3">
              <Avatar name={vendor.storeName} size="md" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-kampmax-text">
                  {vendor.storeName}
                </p>
                <p className="text-xs text-kampmax-text-secondary">
                  {vendor.rating} · {vendor.totalSales} sales
                </p>
              </div>
              <Button variant="outline" size="sm">
                <MessageCircle className="h-3.5 w-3.5 mr-1" />
                Chat
              </Button>
            </div>
          </section>
        )}

        <Button
          onClick={() => router.push("/home")}
          variant="primary"
          size="lg"
          className="w-full"
        >
          <Home className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
      </div>
    </PageContainer>
  );
}
