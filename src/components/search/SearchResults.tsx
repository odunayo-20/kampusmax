"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Package, Store, Tag, MessageSquare, CalendarDays,
  Star, MapPin, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchResultItem, SearchEntityType } from "@/types";
import { formatNaira } from "@/lib/utils";

const typeConfig: Record<
  SearchEntityType,
  { icon: React.ElementType; color: string; bg: string; label: string }
> = {
  product: { icon: Package, color: "text-kampmax-blue", bg: "bg-kampmax-blue/10", label: "Product" },
  vendor: { icon: Store, color: "text-kampmax-navy", bg: "bg-kampmax-navy/10", label: "Vendor" },
  category: { icon: Tag, color: "text-kampmax-gold", bg: "bg-kampmax-gold/10", label: "Category" },
  post: { icon: MessageSquare, color: "text-green-600", bg: "bg-green-50", label: "Post" },
  event: { icon: CalendarDays, color: "text-purple-600", bg: "bg-purple-50", label: "Event" },
};

interface SearchResultsProps {
  results: SearchResultItem[];
  query: string;
  className?: string;
}

export function SearchResults({ results, query, className }: SearchResultsProps) {
  if (results.length === 0) return null;

  // Group by type
  const grouped = results.reduce(
    (acc, r) => {
      (acc[r.type] = acc[r.type] || []).push(r);
      return acc;
    },
    {} as Record<SearchEntityType, SearchResultItem[]>
  );

  return (
    <div className={cn("space-y-5", className)}>
      {Object.entries(grouped).map(([type, items]) => {
        const config = typeConfig[type as SearchEntityType];
        const Icon = config.icon;

        return (
          <div key={type}>
            <div className="flex items-center gap-2 mb-2">
              <div className={cn("w-6 h-6 rounded flex items-center justify-center", config.bg)}>
                <Icon className={cn("h-3.5 w-3.5", config.color)} />
              </div>
              <h3 className="text-xs font-semibold text-kampmax-text uppercase tracking-wider">
                {config.label}s
              </h3>
              <span className="text-[10px] text-kampmax-text-secondary">({items.length})</span>
            </div>

            <div className="space-y-2">
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={item.url}
                  className="flex items-center gap-3 p-3 bg-white border border-kampmax-border rounded-xl hover:border-kampmax-blue/30 hover:shadow-sm transition-all group"
                >
                  {item.image ? (
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-kampmax-muted shrink-0 relative">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                  ) : (
                    <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center shrink-0", config.bg)}>
                      <Icon className={cn("h-5 w-5", config.color)} />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-kampmax-text truncate group-hover:text-kampmax-blue transition-colors">
                        {item.title}
                      </p>
                      {item.rating !== undefined && item.rating > 0 && (
                        <span className="flex items-center gap-0.5 text-[10px] text-kampmax-gold shrink-0">
                          <Star className="h-3 w-3 fill-kampmax-gold" />
                          {item.rating}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-kampmax-text-secondary truncate mt-0.5">
                      {item.subtitle}
                    </p>
                    {item.price !== undefined && (
                      <p className="text-xs font-bold text-kampmax-navy mt-0.5">
                        {formatNaira(item.price)}
                      </p>
                    )}
                  </div>

                  <ChevronRight className="h-4 w-4 text-kampmax-text-secondary/40 shrink-0 group-hover:text-kampmax-blue transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
