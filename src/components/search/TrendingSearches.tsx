"use client";

import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { TrendingSearch } from "@/types";

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
                <p className="text-[10px] text-kampmax-text-secondary truncate">
                  {item.category}
                </p>
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
