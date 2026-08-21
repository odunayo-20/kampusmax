"use client";

import { Bell, BellOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyNotificationsProps {
  filtered?: boolean;
}

export function EmptyNotifications({ filtered }: EmptyNotificationsProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="w-16 h-16 rounded-full bg-kampmax-muted flex items-center justify-center mb-4">
        {filtered ? (
          <BellOff className="h-7 w-7 text-kampmax-text-secondary/30" />
        ) : (
          <Bell className="h-7 w-7 text-kampmax-text-secondary/30" />
        )}
      </div>
      <p className="text-sm font-semibold text-kampmax-text mb-1">
        {filtered ? "No notifications in this category" : "All caught up!"}
      </p>
      <p className="text-xs text-kampmax-text-secondary max-w-[240px]">
        {filtered
          ? "You're all caught up. Check back later for new updates."
          : "You have no notifications right now. We'll let you know when something happens."}
      </p>
    </div>
  );
}
