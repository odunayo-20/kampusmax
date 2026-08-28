"use client";

import { Check, X } from "lucide-react";
import type { OrderStatus } from "@/types";
import {
  DELIVERY_TRACKING_STEPS,
  PICKUP_TRACKING_STEPS,
  currentTrackingStepIndex,
} from "@/lib/orderStatus";
import { cn } from "@/lib/utils";

interface OrderTrackingProps {
  status: OrderStatus;
  isPickup?: boolean;
}

/**
 * Visual order-progress tracker. Steps reflect the backend-provided status;
 * we never fabricate tracking events. If the order was cancelled, a clear
 * cancelled state is shown instead of a progress bar (status is conveyed with
 * text, not colour alone).
 */
export function OrderTracking({ status, isPickup = false }: OrderTrackingProps) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg bg-error-50 border border-error-100">
        <X className="h-4 w-4 text-error-700 shrink-0" />
        <p className="text-sm font-medium text-error-700">
          This order was cancelled
        </p>
      </div>
    );
  }

  const steps = isPickup ? PICKUP_TRACKING_STEPS : DELIVERY_TRACKING_STEPS;
  const current = currentTrackingStepIndex(status, isPickup);

  return (
    <ol className="space-y-3" aria-label="Order progress">
      <li className="text-xs text-kampmax-text-secondary">
        Tracking is based on your order&apos;s current status (step{" "}
        {Math.max(current + 1, 1)} of {steps.length}).
      </li>
      {steps.map((step, i) => {
        const done = i < current;
        const isCurrent = i === current;
        return (
          <li
            key={step.key}
            className="flex items-start gap-3"
            aria-current={isCurrent ? "step" : undefined}
          >
            <span
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center shrink-0 border",
                done && "bg-success-600 border-success-600 text-white",
                isCurrent &&
                  "bg-success-600 border-success-600 text-white ring-4 ring-success-100",
                !done &&
                  !isCurrent &&
                  "bg-white border-neutral-300 text-neutral-400"
              )}
            >
              {done || isCurrent ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
              )}
            </span>
            <span
              className={cn(
                "text-sm",
                (done || isCurrent)
                  ? "font-medium text-kampmax-text"
                  : "text-kampmax-text-muted"
              )}
            >
              {step.label}
              {isCurrent && (
                <span className="ml-2 text-xs font-medium text-kampmax-success">
                  Current
                </span>
              )}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
