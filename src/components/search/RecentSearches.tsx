"use client";

import { Clock, TrendingUp, X, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { TrendingSearch } from "@/types";

// ── Recent Searches ──────────────────────────────────────

interface RecentSearchesProps {
  searches: string[];
  onSelect: (query: string) => void;
  onRemove: (query: string) => void;
  onClear: () => void;
  className?: string;
}

export function RecentSearches({
  searches,
  onSelect,
  onRemove,
  onClear,
  className,
}: RecentSearchesProps) {
  if (searches.length === 0) return null;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-kampmax-text-secondary uppercase tracking-wider">
          Recent Searches
        </h3>
        <button
          onClick={onClear}
          className="text-xs text-kampmax-text-secondary hover:text-kampmax-error transition-colors flex items-center gap-1"
        >
          <Trash2 className="h-3 w-3" />
          Clear all
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {searches.map((query) => (
          <div
            key={query}
            className="flex items-center gap-1 bg-kampmax-muted rounded-full"
          >
            <button
              onClick={() => onSelect(query)}
              className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 text-sm text-kampmax-text hover:text-kampmax-blue transition-colors"
            >
              <Clock className="h-3 w-3 text-kampmax-text-secondary" />
              {query}
            </button>
            <button
              onClick={() => onRemove(query)}
              className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-kampmax-muted/80 transition-colors mr-0.5"
            >
              <X className="h-3 w-3 text-kampmax-text-secondary" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Trending Searches ────────────────────────────────────

interface TrendingSearchesProps {
  trending: TrendingSearch[];
  onSelect: (query: string) => void;
  className?: string;
}

export function TrendingSearches({
  trending,
  onSelect,
  className,
}: TrendingSearchesProps) {
  if (trending.length === 0) return null;

  return (
    <div className={cn("space-y-3", className)}>
      <h3 className="text-xs font-semibold text-kampmax-text-secondary uppercase tracking-wider">
        Trending Searches
      </h3>

      <div className="space-y-1">
        {trending.slice(0, 8).map((item, i) => (
          <button
            key={item.query}
            onClick={() => onSelect(item.query)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-kampmax-muted transition-colors group"
          >
            <span className="text-xs font-bold text-kampmax-text-secondary/40 w-5 shrink-0">
              {i + 1}
            </span>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-medium text-kampmax-text group-hover:text-kampmax-blue transition-colors truncate">
                {item.query}
              </p>
              {item.category && (
                <p className="text-[10px] text-kampmax-text-secondary">{item.category}</p>
              )}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-kampmax-text-secondary shrink-0">
              <TrendingUp className="h-3 w-3" />
              {item.count}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
