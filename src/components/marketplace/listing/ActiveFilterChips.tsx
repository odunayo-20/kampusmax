"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ActiveFilter } from "./types";

interface ActiveFilterChipsProps {
  filters: ActiveFilter[];
  onRemove: (key: string) => void;
  onClearAll: () => void;
  className?: string;
}

export function ActiveFilterChips({ filters, onRemove, onClearAll, className }: ActiveFilterChipsProps) {
  if (!filters.length) return null;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {filters.map((filter) => (
        <span key={filter.key} className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 border border-primary-100 rounded-full">
          <span className="text-sm font-medium text-primary-700">{filter.label}</span>
          <button
            onClick={() => onRemove(filter.key)}
            className="p-0.5 rounded-full text-primary-600 hover:bg-primary-100 transition-colors"
            aria-label={`Remove ${filter.label} filter`}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <button
        onClick={onClearAll}
        className="inline-flex items-center gap-1 px-2.5 py-1 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
      >
        <X className="h-3.5 w-3.5" />
        Clear all
      </button>
    </div>
  );
}