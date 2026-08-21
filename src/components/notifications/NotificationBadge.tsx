"use client";

import { cn } from "@/lib/utils";

interface NotificationBadgeProps {
  count: number;
  className?: string;
}

export function NotificationBadge({ count, className }: NotificationBadgeProps) {
  if (count <= 0) return null;
  return (
    <span
      className={cn(
        "min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-kampmax-blue text-white text-[10px] font-bold px-1",
        className
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
