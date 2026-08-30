"use client";

import { ChevronDown } from "lucide-react";
import type { ServiceSortOption } from "@/types/service-marketplace";
import { cn } from "@/lib/utils";
import { SORT_OPTIONS } from "./constants";

interface ServiceSortDropdownProps {
  value: ServiceSortOption;
  onChange: (value: ServiceSortOption) => void;
  className?: string;
}

/** Sort selector. Uses <select> for keyboard/screen-reader friendliness. */
export function ServiceSortDropdown({ value, onChange, className }: ServiceSortDropdownProps) {
  return (
    <div className={cn("relative", className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as ServiceSortOption)}
        aria-label="Sort services"
        className="appearance-none h-9 pl-3 pr-8 text-sm font-medium rounded-md border border-neutral-200 bg-white text-neutral-800 hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-600 cursor-pointer"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" aria-hidden />
    </div>
  );
}