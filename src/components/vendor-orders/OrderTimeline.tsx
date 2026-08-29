"use client";

import { Check, Package, Truck, CreditCard, XCircle, AlertTriangle, Circle, Loader } from "lucide-react";
import { cn, timeAgo } from "@/lib/utils";
import type { VendorOrderTimelineEvent, VendorOrderEventKind } from "@/types/vendor-orders";

const KIND_STYLE: Partial<Record<VendorOrderEventKind, { dot: string; icon: React.ReactNode }>> = {
  accepted: { dot: "bg-kampmax-info", icon: <Check className="h-3 w-3 text-kampmax-info" aria-hidden /> },
  processing: { dot: "bg-kampmax-blue", icon: <Loader className="h-3 w-3 text-kampmax-blue" aria-hidden /> },
  ready_for_pickup: { dot: "bg-kampmax-gold", icon: <Check className="h-3 w-3 text-kampmax-gold-dark" aria-hidden /> },
  shipped: { dot: "bg-kampmax-blue", icon: <Truck className="h-3 w-3 text-kampmax-blue" aria-hidden /> },
  out_for_delivery: { dot: "bg-kampmax-blue", icon: <Truck className="h-3 w-3 text-kampmax-blue" aria-hidden /> },
  delivered: { dot: "bg-kampmax-success", icon: <Package className="h-3 w-3 text-kampmax-success" aria-hidden /> },
  completed: { dot: "bg-kampmax-success", icon: <Check className="h-3 w-3 text-kampmax-success" aria-hidden /> },
  cancelled: { dot: "bg-kampmax-error", icon: <XCircle className="h-3 w-3 text-kampmax-error" aria-hidden /> },
  payment_paid: { dot: "bg-kampmax-success", icon: <CreditCard className="h-3 w-3 text-kampmax-success" aria-hidden /> },
  payment_processing: { dot: "bg-kampmax-warning", icon: <CreditCard className="h-3 w-3 text-kampmax-warning" aria-hidden /> },
  placed: { dot: "bg-kampmax-text-secondary/50", icon: <Circle className="h-3 w-3 text-kampmax-text-secondary/60" aria-hidden /> },
  refund_requested: { dot: "bg-kampmax-warning", icon: <CreditCard className="h-3 w-3 text-kampmax-warning" aria-hidden /> },
  dispute_opened: { dot: "bg-kampmax-error", icon: <AlertTriangle className="h-3 w-3 text-kampmax-error" aria-hidden /> },
  vendor_responded: { dot: "bg-kampmax-info", icon: <AlertTriangle className="h-3 w-3 text-kampmax-info" aria-hidden /> },
  note_added: { dot: "bg-kampmax-muted", icon: <Circle className="h-3 w-3 text-kampmax-text-secondary/60" aria-hidden /> },
  expired: { dot: "bg-kampmax-warning", icon: <XCircle className="h-3 w-3 text-kampmax-warning" aria-hidden /> },
};

export function OrderTimeline({ events }: { events: VendorOrderTimelineEvent[] }) {
  const sorted = [...events].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
  );

  return (
    <div className="rounded-xl border border-kampmax-border bg-white p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-kampmax-text-secondary">
        Order activity
      </h3>
      <ol className="relative space-y-3 border-l border-kampmax-border pl-4">
        {sorted.map((evt) => {
          const style = KIND_STYLE[evt.kind] ?? { dot: "bg-kampmax-blue", icon: <Circle className="h-3 w-3 text-kampmax-blue" aria-hidden /> };
          return (
            <li key={evt.id} className="relative">
              <span
                className={cn(
                  "absolute -left-[21px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white",
                  style.dot
                )}
              >
                {style.icon}
              </span>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-kampmax-text">{evt.title}</p>
                  {evt.detail && (
                    <p className="mt-0.5 text-xs text-kampmax-text-secondary">{evt.detail}</p>
                  )}
                </div>
                <span className="shrink-0 text-[11px] text-kampmax-text-secondary/80">
                  {timeAgo(evt.at)}
                </span>
              </div>
              {evt.actor && (
                <p className="mt-0.5 text-[11px] text-kampmax-text-secondary/80">by {evt.actor}</p>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}