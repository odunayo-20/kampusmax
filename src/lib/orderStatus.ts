import type { OrderStatus } from "@/types";

/**
 * Centralized order-status configuration.
 *
 * All status labels, semantic tones and tracking steps live here so status
 * logic is not scattered across components. Status *values* always come from
 * the backend; we never fabricate tracking events.
 */

export type StatusTone = "info" | "neutral" | "success" | "warning" | "error";

export interface OrderStatusMeta {
  /** Machine status value (from the backend). */
  key: OrderStatus;
  /** Human label. */
  label: string;
  /** Semantic tone (never color-only — always pair with text). */
  tone: StatusTone;
  /** Short label for compact badges. */
  short: string;
  /** True when the order is still in progress (not delivered/cancelled). */
  active: boolean;
}

export const ORDER_STATUS_CONFIG: Record<OrderStatus, OrderStatusMeta> = {
  placed: {
    key: "placed",
    label: "Order Placed",
    short: "Placed",
    tone: "info",
    active: true,
  },
  confirmed: {
    key: "confirmed",
    label: "Confirmed",
    short: "Confirmed",
    tone: "neutral",
    active: true,
  },
  preparing: {
    key: "preparing",
    label: "Preparing",
    short: "Preparing",
    tone: "warning",
    active: true,
  },
  ready: {
    key: "ready",
    label: "Ready for Pickup",
    short: "Ready",
    tone: "warning",
    active: true,
  },
  out_for_delivery: {
    key: "out_for_delivery",
    label: "Out for Delivery",
    short: "Out for Delivery",
    tone: "info",
    active: true,
  },
  delivered: {
    key: "delivered",
    label: "Delivered",
    short: "Delivered",
    tone: "success",
    active: false,
  },
  cancelled: {
    key: "cancelled",
    label: "Cancelled",
    short: "Cancelled",
    tone: "error",
    active: false,
  },
};

export function orderStatusMeta(status: OrderStatus): OrderStatusMeta {
  return ORDER_STATUS_CONFIG[status] || ORDER_STATUS_CONFIG.placed;
}

/** Helper that returns a tone, so callers can style without hard-coding. */
export function statusToneClasses(tone: StatusTone): string {
  switch (tone) {
    case "success":
      return "bg-success-50 text-success-700 border border-success-100";
    case "warning":
      return "bg-accent-50 text-accent-700 border border-accent-100";
    case "error":
      return "bg-error-50 text-error-700 border border-error-100";
    case "neutral":
      return "bg-neutral-100 text-neutral-700 border border-neutral-200";
    case "info":
    default:
      return "bg-info-50 text-info-700 border border-info-100";
  }
}

// ── Tracking steps ──────────────────────────────────────────────────────

export interface TrackingStep {
  key: string;
  label: string;
}

/** Delivery-fulfillment flow. */
export const DELIVERY_TRACKING_STEPS: TrackingStep[] = [
  { key: "placed", label: "Order placed" },
  { key: "payment", label: "Payment confirmed" },
  { key: "processing", label: "Processing" },
  { key: "ready", label: "Ready / Shipped" },
  { key: "delivered", label: "Delivered" },
];

/** Pickup-fulfillment flow. */
export const PICKUP_TRACKING_STEPS: TrackingStep[] = [
  { key: "placed", label: "Order placed" },
  { key: "payment", label: "Payment confirmed" },
  { key: "preparing", label: "Preparing" },
  { key: "ready", label: "Ready for pickup" },
  { key: "delivered", label: "Collected" },
];

/** Determine which step is "current" from an order status. */
export function currentTrackingStepIndex(
  status: OrderStatus,
  isPickup: boolean
): number {
  if (status === "cancelled") return -1;
  const steps = isPickup ? PICKUP_TRACKING_STEPS : DELIVERY_TRACKING_STEPS;

  switch (status) {
    case "placed":
      return 0;
    case "confirmed":
      return 1; // payment confirmed
    case "preparing":
      return 2;
    case "ready":
      return 2; // ready / shipped
    case "out_for_delivery":
      return 3;
    case "delivered":
      return steps.length - 1;
    default:
      return 0;
  }
}
