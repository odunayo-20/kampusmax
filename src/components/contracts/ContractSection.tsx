"use client";

import { cn } from "@/lib/utils";

// Reusable section wrapper for contract detail/workspace pages.

export function ContractSection({
  title,
  subtitle,
  action,
  children,
  className,
  id,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} aria-label={title} className={cn("rounded-xl border border-kampmax-border bg-white p-5", className)}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-kampmax-text">{title}</h2>
          {subtitle && (
            <p className="mt-0.5 text-sm text-kampmax-text-secondary">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
