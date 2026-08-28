"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/atoms/Button";

interface AccountEmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

/** Polkished empty state used across account pages (never a browser alert). */
export function AccountEmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: AccountEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-12 px-4",
        className
      )}
    >
      <div className="w-14 h-14 rounded-full bg-kampmax-muted flex items-center justify-center mb-4">
        <span className="text-kampmax-text-secondary/60 [&_svg]:w-7 [&_svg]:h-7">
          {icon}
        </span>
      </div>
      <h3 className="text-sm font-semibold text-kampmax-text">{title}</h3>
      {description && (
        <p className="text-xs text-kampmax-text-secondary mt-1 max-w-sm">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="mt-5 bg-kampmax-navy text-white hover:bg-kampmax-navy-light"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
