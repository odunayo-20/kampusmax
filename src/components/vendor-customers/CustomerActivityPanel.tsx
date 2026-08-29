"use client";

import Link from "next/link";
import { Activity, FileQuestion, MessageSquare, Package, ShoppingBag, Star, XCircle } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import { VENDOR_CUSTOMER_ACTIVITY } from "@/types/vendor-customers";
import type { VendorCustomerActivity } from "@/types/vendor-customers";

interface CustomerActivityPanelProps {
  activity: VendorCustomerActivity[];
}

const ICONS: Record<string, React.ElementType> = {
  [VENDOR_CUSTOMER_ACTIVITY.ORDER_PLACED]: ShoppingBag,
  [VENDOR_CUSTOMER_ACTIVITY.ORDER_COMPLETED]: Package,
  [VENDOR_CUSTOMER_ACTIVITY.ORDER_CANCELLED]: XCircle,
  [VENDOR_CUSTOMER_ACTIVITY.DISPUTE_OPENED]: FileQuestion,
  [VENDOR_CUSTOMER_ACTIVITY.REVIEW_POSTED]: Star,
  [VENDOR_CUSTOMER_ACTIVITY.NOTE_ADDED]: MessageSquare,
  [VENDOR_CUSTOMER_ACTIVITY.MESSAGE_SENT]: MessageSquare,
};

const COLORS: Record<string, string> = {
  [VENDOR_CUSTOMER_ACTIVITY.ORDER_PLACED]: "bg-kampmax-blue/10 text-kampmax-blue",
  [VENDOR_CUSTOMER_ACTIVITY.ORDER_COMPLETED]: "bg-kampmax-success/10 text-kampmax-success",
  [VENDOR_CUSTOMER_ACTIVITY.ORDER_CANCELLED]: "bg-kampmax-error/10 text-kampmax-error",
  [VENDOR_CUSTOMER_ACTIVITY.DISPUTE_OPENED]: "bg-kampmax-warning/10 text-amber-700",
  [VENDOR_CUSTOMER_ACTIVITY.REVIEW_POSTED]: "bg-kampmax-gold/10 text-kampmax-gold",
  [VENDOR_CUSTOMER_ACTIVITY.NOTE_ADDED]: "bg-kampmax-info/10 text-kampmax-info",
  [VENDOR_CUSTOMER_ACTIVITY.MESSAGE_SENT]: "bg-kampmax-info/10 text-kampmax-info",
};

export function CustomerActivityPanel({ activity }: CustomerActivityPanelProps) {
  return (
    <section className="rounded-xl border border-kampmax-border bg-white p-4">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-kampmax-text">
        <Activity className="h-4 w-4 text-kampmax-blue" aria-hidden />
        Activity
      </h2>

      {activity.length === 0 ? (
        <p className="mt-3 text-sm text-kampmax-text-secondary">No recent activity.</p>
      ) : (
        <ol className="mt-3 space-y-0">
          {activity.map((entry, index) => {
            const Icon = ICONS[entry.kind] ?? Activity;
            return (
              <li key={entry.id} className="relative flex gap-3 pb-4 last:pb-0">
                {index < activity.length - 1 && (
                  <span className="absolute left-[15px] top-8 bottom-0 w-px bg-kampmax-border" aria-hidden />
                )}
                <span className={`z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${COLORS[entry.kind] ?? "bg-kampmax-muted text-kampmax-text-secondary"}`}>
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <div className="min-w-0 pt-0.5">
                  <p className="text-sm font-medium text-kampmax-text">{entry.title}</p>
                  {entry.detail && <p className="mt-0.5 line-clamp-2 text-xs text-kampmax-text-secondary">{entry.detail}</p>}
                  <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[10px] text-kampmax-text-secondary">
                    <span>{timeAgo(entry.at)}</span>
                    {entry.orderId && (
                      <>
                        <span aria-hidden>·</span>
                        <Link href={`/vendor/orders/${entry.orderId}`} className="font-medium text-kampmax-blue hover:underline">
                          {entry.orderId}
                        </Link>
                      </>
                    )}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}