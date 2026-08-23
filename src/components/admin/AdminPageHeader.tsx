"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

/**
 * Standard page title block. Sits under the sticky header and above
 * page content; `actions` render on the right (primary buttons,
 * filters, exports).
 */
export function AdminPageHeader({
  title,
  description,
  actions,
  className,
}: AdminPageHeaderProps) {
  return (
    <div
      className={cn(
        "mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
        className
      )}
    >
      <div className="min-w-0">
        <h1 className="text-lg font-bold tracking-tight text-kampmax-text">
          {title}
        </h1>
        {description && (
          <p className="mt-0.5 text-xs text-kampmax-text-secondary sm:text-sm">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
