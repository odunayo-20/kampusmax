"use client";

import type { OrderStatus } from "@/types";
import {
  orderStatusMeta,
  statusToneClasses,
} from "@/lib/orderStatus";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: OrderStatus;
  /** Use the short label (for compact spaces). */
  short?: boolean;
}

/**
 * Order status badge driven by the centralized order-status config.
 * Never relies on color alone to communicate status — the text label always
 * carries the meaning.
 */
export function StatusBadge({ status, short }: StatusBadgeProps) {
  const meta = orderStatusMeta(status);
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full",
        statusToneClasses(meta.tone)
      )}
      aria-label={`Order status: ${meta.label}`}
    >
      {short ? meta.short : meta.label}
    </span>
  );
}
