"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui";

interface CategorySearchProps {
  value: string;
  onChange: (value: string) => void;
  onFilterClick: () => void;
  placeholder?: string;
  showFilterButton?: boolean;
  className?: string;
}

export function CategorySearch({ 
  value, 
  onChange, 
  onFilterClick, 
  placeholder = "Search products...",
  showFilterButton = true,
  className 
}: CategorySearchProps) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        inputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className={cn("relative", className)}>
      <label htmlFor="category-search" className="sr-only">Search products</label>
      <div className={cn(
        "relative flex items-center",
        focused && "ring-2 ring-primary-600/20"
      )}>
        <Search className="absolute left-3 h-5 w-5 text-neutral-400 pointer-events-none" aria-hidden="true" />
        <input
          ref={inputRef}
          id="category-search"
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className="w-full h-12 pl-10 pr-12 lg:pr-40 rounded-[10px] border border-neutral-200 bg-white text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 transition-all"
          autoComplete="off"
        />
        {showFilterButton && (
          <button
            type="button"
            onClick={onFilterClick}
            className="absolute right-2 lg:right-12 top-1/2 -translate-y-1/2 h-9 lg:h-10 px-3 lg:px-4 rounded-[8px] bg-primary-600 text-white text-sm font-medium flex items-center gap-1.5 hover:bg-primary-700 transition-colors"
            aria-label="Open filters"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        )}
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-2 lg:right-42 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-200 transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}