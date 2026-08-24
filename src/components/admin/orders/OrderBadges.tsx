"use client";

import { Bike, HandCoins, Store } from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  fulfillmentLabel,
  managedOrderStatusVariant,
  managedPaymentStatusVariant,
  orderStatusLabel,
  paymentStatusLabel,
} from "./orders-meta";
import type {
  ManagedOrderPaymentStatus,
  ManagedOrderStatus,
} from "@/types/admin";

export function OrderStatusBadge({ status }: { status: ManagedOrderStatus }) {
  return (
    <StatusBadge variant={managedOrderStatusVariant(status)} label={orderStatusLabel(status)} />
  );
}

export function PaymentStatusBadge({
  status,
  dot = true,
}: {
  status: ManagedOrderPaymentStatus;
  dot?: boolean;
}) {
  return (
    <StatusBadge
      variant={managedPaymentStatusVariant(status)}
      label={paymentStatusLabel(status)}
      dot={dot}
    />
  );
}

export function FulfillmentBadge({ method }: { method: "campus_pickup" | "meetup" | "delivery" }) {
  const Icon = method === "delivery" ? Bike : method === "campus_pickup" ? Store : HandCoins;
  return (
    <span
      className="inline-flex items-center gap-1 whitespace-nowrap text-xs text-kampmax-text-secondary"
      title={fulfillmentLabel(method)}
    >
      <Icon className="h-3.5 w-3.5 opacity-60" />
      {fulfillmentLabel(method)}
    </span>
  );
}
