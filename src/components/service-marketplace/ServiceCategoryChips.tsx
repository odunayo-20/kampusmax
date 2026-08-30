"use client";

import Link from "next/link";
import type { ServiceMarketplaceCategory } from "@/types/service-marketplace";
import { cn } from "@/lib/utils";

interface ServiceCategoryChipsProps {
  categories: ServiceMarketplaceCategory[];
  /** Optional "All services" first chip linking to /services. */
  showAll?: boolean;
  className?: string;
}

/**
 * Horizontal scrollable category chips linking to the category landing routes
 * (`/services/categories/[slug]`). Only chips, no client state — URLs own state.
 */
export function ServiceCategoryChips({ categories, showAll = true, className }: ServiceCategoryChipsProps) {
  return (
    <div className={cn("flex gap-2 overflow-x-auto pb-2 scrollbar-hide", className)}>
      {showAll && (
        <Link
          href="/services"
          className="flex items-center px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors shrink-0 bg-primary-600 text-white"
        >
          All services
        </Link>
      )}
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/services/categories/${cat.slug}`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors shrink-0 bg-white text-neutral-700 border border-neutral-200 hover:border-primary-400 hover:text-primary-700"
        >
          <span>{cat.name}</span>
          {cat.serviceCount > 0 && (
            <span className="text-[11px] text-neutral-400">{cat.serviceCount}</span>
          )}
        </Link>
      ))}
    </div>
  );
}