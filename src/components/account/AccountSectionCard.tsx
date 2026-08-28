"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AccountSectionCardProps {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  padded?: boolean;
}

/** Reusable titled card used across the customer account area. */
export function AccountSectionCard({
  title,
  subtitle,
  action,
  children,
  className,
  padded = true,
}: AccountSectionCardProps) {
  return (
    <section
      className={cn(
        "bg-white rounded-xl border border-kampmax-border",
        className
      )}
    >
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 px-4 sm:px-5 pt-4">
          <div className="min-w-0">
            {title && (
              <h2 className="text-sm font-semibold text-kampmax-text">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-xs text-kampmax-text-secondary mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={padded ? "p-4 sm:p-5" : ""}>{children}</div>
    </section>
  );
}
