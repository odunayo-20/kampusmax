"use client";

import { Clock, X, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
            className="flex items-center gap-1 bg-kampmax-muted rounded-full max-w-full"
          >
            <button
              onClick={() => onSelect(query)}
              className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 text-sm text-kampmax-text hover:text-kampmax-blue transition-colors min-w-0 max-w-[220px]"
            >
              <Clock className="h-3 w-3 text-kampmax-text-secondary shrink-0" />
              <span className="truncate">{query}</span>
            </button>
            <button
              onClick={() => onRemove(query)}
              aria-label={`Remove ${query}`}
              className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-kampmax-text-secondary/10 transition-colors mr-0.5 shrink-0"
            >
              <X className="h-3 w-3 text-kampmax-text-secondary" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
