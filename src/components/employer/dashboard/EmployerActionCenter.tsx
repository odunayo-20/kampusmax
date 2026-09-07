"use client";

import Link from "next/link";
import { AlertTriangle, ChevronRight, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { getFriendlyErrorMessage } from "@/lib/error-messages";
import {
  EmployerDashboardEmpty,
  EmployerDashboardError,
  EmployerDashboardSection,
  EmployerDashboardSkeleton,
} from "./EmployerDashboardSection";
import type { EmployerAttentionItem } from "@/services/employer-dashboard";
import type { EmployerDashboardQuerySource } from "./EmployerDashboardSection";

const TONE_META = {
  info: { icon: Info, className: "bg-primary-50 text-primary-600" },
  warning: { icon: AlertTriangle, className: "bg-accent-50 text-accent-700" },
  neutral: { icon: Info, className: "bg-neutral-100 text-neutral-600" },
} as const;

function AttentionRow({ item }: { item: EmployerAttentionItem }) {
  const tone = TONE_META[item.tone];
  const Icon = tone.icon;
  return (
    <li>
      <Link
        href={item.href}
        className="group flex items-center gap-3 py-3 first:pt-0 last:pb-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded"
      >
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            tone.className
          )}
          aria-hidden
        >
          <Icon className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-kampmax-text">
            {item.title}
          </span>
          <span className="block text-xs text-kampmax-text-secondary">{item.detail}</span>
        </span>
        <ChevronRight
          className="h-4 w-4 shrink-0 text-kampmax-text-secondary transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </Link>
    </li>
  );
}

export function EmployerActionCenter({ query }: { query: EmployerDashboardQuerySource }) {
  const items = query.data?.attention ?? [];

  if (query.isPending && !query.data) {
    return (
      <EmployerDashboardSection title="Needs your attention">
        <EmployerDashboardSkeleton rows={3} />
      </EmployerDashboardSection>
    );
  }

  if (query.isError && !query.data) {
    return (
      <EmployerDashboardSection title="Needs your attention">
        <EmployerDashboardError
          message={getFriendlyErrorMessage(query.error)}
          onRetry={query.refetch}
        />
      </EmployerDashboardSection>
    );
  }

  return (
    <EmployerDashboardSection title="Needs your attention" id="attention">
      {items.length === 0 ? (
        <EmployerDashboardEmpty
          title="You're all caught up"
          detail="Nothing is waiting on you right now."
        />
      ) : (
        <ul className="divide-y divide-kampmax-border/70">
          {items.map((item) => (
            <AttentionRow key={item.id} item={item} />
          ))}
        </ul>
      )}
    </EmployerDashboardSection>
  );
}