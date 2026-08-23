"use client";

import {
  AlertTriangle,
  Building2,
  History,
  Package,
  ShieldCheck,
  ShoppingBag,
  UserPlus,
} from "lucide-react";
import { cn, timeAgo } from "@/lib/utils";
import { EmptyState } from "@/components/admin/EmptyState";
import type { CampusActivityEvent } from "@/types/admin";
import { CAMPUS_ACTIVITY_LABELS } from "./campuses-meta";

const ACTIVITY_ICONS: Record<
  CampusActivityEvent["kind"],
  typeof ShoppingBag
> = {
  order: ShoppingBag,
  vendor: UserPlus,
  user: Building2,
  listing: Package,
  moderation: AlertTriangle,
  admin: ShieldCheck,
};

const ACTIVITY_ICON_STYLES: Record<CampusActivityEvent["kind"], string> = {
  order: "bg-kampmax-blue/10 text-kampmax-blue",
  vendor: "bg-kampmax-gold/15 text-kampmax-gold-dark",
  user: "bg-kampmax-info/10 text-kampmax-info",
  listing: "bg-violet-100 text-violet-600",
  moderation: "bg-kampmax-warning/10 text-amber-600",
  admin: "bg-kampmax-navy/10 text-kampmax-navy",
};

export function CampusActivityTimeline({
  events,
}: {
  events: CampusActivityEvent[];
}) {
  if (events.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="No activity yet"
        message="Campus events will appear here as they happen."
      />
    );
  }

  return (
    <ol role="list" className="relative space-y-4 before:absolute before:bottom-2 before:left-[15px] before:top-2 before:w-px before:bg-kampmax-border">
      {events.map((event) => {
        const Icon = ACTIVITY_ICONS[event.kind];
        return (
          <li key={event.id} className="relative flex gap-3 pl-0">
            <span
              aria-hidden
              className={cn(
                "relative z-10 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ring-white",
                ACTIVITY_ICON_STYLES[event.kind]
              )}
            >
              <Icon className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0 flex-1 pt-1">
              <p className="text-sm leading-snug text-kampmax-text">
                {event.message}
              </p>
              <p className="mt-0.5 text-xs text-kampmax-text-secondary">
                {CAMPUS_ACTIVITY_LABELS[event.kind]} · {event.meta} ·{" "}
                <span title={new Date(event.at).toLocaleString("en-NG")}>
                  {timeAgo(event.at)}
                </span>
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
