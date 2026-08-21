"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSuggestions } from "@/services/search";
import { SearchSuggestion } from "@/types";

interface SearchInputProps {
  defaultValue?: string;
  placeholder?: string;
  autoFocus?: boolean;
  showBackButton?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  className?: string;
}

export function SearchInput({
  defaultValue = "",
  placeholder = "Search products, vendors, events...",
  autoFocus = false,
  showBackButton = false,
  onFocus,
  onBlur,
  className,
}: SearchInputProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    if (value.trim().length >= 2) {
      const s = getSuggestions(value);
      setSuggestions(s);
      setShowSuggestions(s.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    setSelectedIndex(-1);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSubmit(query?: string) {
    const q = (query || value).trim();
    if (!q) return;
    setShowSuggestions(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleSubmit(suggestions[selectedIndex].text);
      } else {
        handleSubmit();
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  }

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <div className="flex items-center gap-2">
        {showBackButton && (
          <button
            onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-kampmax-muted transition-colors shrink-0"
          >
            <ArrowLeft className="h-5 w-5 text-kampmax-text" />
          </button>
        )}

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-kampmax-text-secondary pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
              onFocus?.();
            }}
            onBlur={() => {
              onBlur?.();
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full h-10 pl-10 pr-10 rounded-xl bg-kampmax-muted border border-transparent text-sm text-kampmax-text placeholder:text-kampmax-text-secondary/60 focus:outline-none focus:border-kampmax-blue focus:bg-white transition-colors"
          />
          {value && (
            <button
              onClick={() => {
                setValue("");
                setSuggestions([]);
                setShowSuggestions(false);
                inputRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-kampmax-text-secondary/20 flex items-center justify-center hover:bg-kampmax-text-secondary/30 transition-colors"
            >
              <X className="h-3 w-3 text-kampmax-text-secondary" />
            </button>
          )}
        </div>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-kampmax-border rounded-xl shadow-lg py-1 z-50 max-h-72 overflow-y-auto">
          {suggestions.map((s, i) => (
            <button
              key={`${s.text}-${i}`}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSubmit(s.text);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors",
                i === selectedIndex ? "bg-kampmax-blue/5" : "hover:bg-kampmax-muted"
              )}
            >
              <Search className="h-3.5 w-3.5 text-kampmax-text-secondary shrink-0" />
              <span className="text-sm text-kampmax-text truncate">{s.text}</span>
              {s.entityType && (
                <span className="text-[10px] text-kampmax-text-secondary bg-kampmax-muted px-1.5 py-0.5 rounded capitalize ml-auto shrink-0">
                  {s.entityType}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
