"use client";

import {
  CheckCircle2,
  Clock,
  Package,
  MapPin,
  Truck,
  XCircle,
} from "lucide-react";
import { OrderStatus, OrderTimelineEntry } from "@/types";
import { formatDateTime, cn } from "@/lib/utils";

interface OrderTimelineProps {
  timeline: OrderTimelineEntry[];
  currentStatus: OrderStatus;
}

const STATUS_CONFIG: Record<
  OrderStatus,
  { icon: typeof Package; color: string; bgColor: string; label: string }
> = {
  placed: { icon: Package, color: "text-kampmax-info", bgColor: "bg-kampmax-info", label: "Order Placed" },
  confirmed: { icon: CheckCircle2, color: "text-indigo-600", bgColor: "bg-indigo-500", label: "Confirmed" },
  preparing: { icon: Clock, color: "text-kampmax-warning", bgColor: "bg-amber-500", label: "Preparing" },
  ready: { icon: MapPin, color: "text-purple-600", bgColor: "bg-purple-500", label: "Ready" },
  out_for_delivery: { icon: Truck, color: "text-orange-600", bgColor: "bg-orange-500", label: "Out for Delivery" },
  delivered: { icon: CheckCircle2, color: "text-kampmax-success", bgColor: "bg-green-500", label: "Delivered" },
  cancelled: { icon: XCircle, color: "text-kampmax-error", bgColor: "bg-red-500", label: "Cancelled" },
};

export function OrderTimeline({ timeline, currentStatus }: OrderTimelineProps) {
  const isCancelled = currentStatus === "cancelled";

  return (
    <div className="space-y-0">
      {timeline.map((entry, idx) => {
        const config = STATUS_CONFIG[entry.status];
        const Icon = config.icon;
        const isLast = idx === timeline.length - 1;
        const isActive = isLast && !isCancelled;

        return (
          <div key={idx} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
                  isActive
                    ? `${config.bgColor} text-white`
                    : isCancelled && entry.status === "cancelled"
                      ? "bg-red-500 text-white"
                      : "bg-kampmax-muted text-kampmax-text-secondary border border-kampmax-border"
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              {!isLast && (
                <div
                  className={cn(
                    "w-0.5 flex-1 min-h-[2rem] my-1",
                    idx < timeline.length - 1
                      ? "bg-kampmax-blue/30"
                      : "bg-kampmax-border"
                  )}
                />
              )}
            </div>
            <div className={cn("pb-6", isLast && "pb-0")}>
              <p
                className={cn(
                  "text-sm font-medium",
                  isActive ? config.color : "text-kampmax-text"
                )}
              >
                {config.label}
              </p>
              <p className="text-xs text-kampmax-text-secondary mt-0.5">
                {entry.message}
              </p>
              <p className="text-[10px] text-kampmax-text-secondary/70 mt-0.5">
                {formatDateTime(new Date(entry.timestamp))}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
