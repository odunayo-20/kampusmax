"use client";

import { Search, TrendingUp, Package, Store, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { TrendingSearch } from "@/types";

interface SearchEmptyStateProps {
  query: string;
  trending?: TrendingSearch[];
  onTrendingClick?: (query: string) => void;
  className?: string;
}

export function SearchEmptyState({
  query,
  trending,
  onTrendingClick,
  className,
}: SearchEmptyStateProps) {
  return (
    <div className={cn("py-16 text-center", className)}>
      <div className="w-16 h-16 rounded-2xl bg-kampmax-muted flex items-center justify-center mx-auto mb-4">
        <Search className="h-7 w-7 text-kampmax-text-secondary/40" />
      </div>

      <p className="text-sm font-semibold text-kampmax-text">
        No results for &ldquo;{query}&rdquo;
      </p>
      <p className="text-xs text-kampmax-text-secondary mt-1 max-w-xs mx-auto">
        Try different keywords or browse categories below
      </p>

      <div className="flex justify-center gap-3 mt-6">
        {[
          { icon: Package, label: "Products", color: "text-kampmax-blue" },
          { icon: Store, label: "Vendors", color: "text-kampmax-navy" },
          { icon: MessageSquare, label: "Posts", color: "text-kampmax-success" },
        ].map((item) => (
          <div key={item.label} className="flex flex-col items-center gap-1.5">
            <div className="w-10 h-10 rounded-xl bg-kampmax-muted flex items-center justify-center">
              <item.icon className={cn("h-5 w-5", item.color)} />
            </div>
            <span className="text-[10px] text-kampmax-text-secondary">{item.label}</span>
          </div>
        ))}
      </div>

      {trending && trending.length > 0 && onTrendingClick && (
        <div className="mt-8 space-y-3">
          <p className="text-xs font-semibold text-kampmax-text-secondary uppercase tracking-wider">
            Try searching for
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {trending.slice(0, 5).map((t) => (
              <button
                key={t.query}
                onClick={() => onTrendingClick(t.query)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-kampmax-muted text-xs font-medium text-kampmax-text hover:bg-kampmax-blue/10 hover:text-kampmax-blue transition-colors"
              >
                <TrendingUp className="h-3 w-3" />
                {t.query}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
