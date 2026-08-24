"use client";

import {
  CircleUserRound,
  KeyRound,
  Package,
  ShoppingBag,
  ShieldAlert,
  Wallet,
} from "lucide-react";
import { cn, formatDateTime, timeAgo } from "@/lib/utils";
import type { VendorActivityEvent } from "@/types/admin";

const KIND_ICONS = {
  order: ShoppingBag,
  product: Package,
  wallet: Wallet,
  moderation: ShieldAlert,
  admin: ShieldAlert,
  auth: KeyRound,
} as const;

const KIND_STYLES: Record<VendorActivityEvent["kind"], string> = {
  order: "bg-kampmax-success/10 text-kampmax-success",
  product: "bg-kampmax-info/10 text-kampmax-info",
  wallet: "bg-kampmax-gold/20 text-kampmax-gold-dark",
  moderation: "bg-rose-100 text-rose-600",
  admin: "bg-kampmax-blue/10 text-kampmax-blue",
  auth: "bg-violet-100 text-violet-600",
};

/**
 * Vertical timeline of store-level events (orders, catalog changes,
 * moderation outcomes and platform admin actions).
 */
export function VendorActivityTimeline({
  events,
}: {
  events: VendorActivityEvent[];
}) {
  if (events.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-kampmax-border px-4 py-6 text-center text-sm text-kampmax-text-secondary">
        No activity recorded for this vendor yet.
      </p>
    );
  }

  return (
    <ol className="relative space-y-4 before:absolute before:bottom-1.5 before:left-[13px] before:top-1.5 before:w-px before:bg-kampmax-border">
      {events.map((event) => {
        const Icon =
          event.kind === "admin" && event.meta === "Verification"
            ? CircleUserRound
            : KIND_ICONS[event.kind];
        return (
          <li key={event.id} className="relative flex gap-3 pl-0">
            <span
              aria-hidden
              className={cn(
                "z-10 mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ring-2 ring-white",
                KIND_STYLES[event.kind]
              )}
            >
              <Icon className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-[13px] font-medium leading-snug text-kampmax-text">
                {event.message}
              </p>
              <p className="mt-0.5 text-xs text-kampmax-text-secondary">
                <span title={formatDateTime(event.at)}>{timeAgo(event.at)}</span>
                {" · "}
                {event.meta}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
