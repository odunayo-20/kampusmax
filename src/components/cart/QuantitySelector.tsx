"use client";

import { useEffect, useRef, useState } from "react";
import { Minus, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuantitySelectorProps {
  value: number;
  min?: number;
  max?: number;
  loading?: boolean;
  disabled?: boolean;
  onChange: (quantity: number) => void;
  /** Optional trailing label, e.g. "Max 4". */
  hint?: string;
  size?: "sm" | "md";
  className?: string;
}

/**
 * Reusable, accessible quantity control.
 *
 * - Clamps to [min, max].
 * - Disables the increment button once the limit is reached.
 * - Coalesces rapid clicks so duplicate requests aren't fired (debounce).
 * - Shows a loading state while a change is being persisted.
 */
export function QuantitySelector({
  value,
  min = 1,
  max = Number.POSITIVE_INFINITY,
  loading = false,
  disabled = false,
  onChange,
  hint,
  size = "sm",
  className,
}: QuantitySelectorProps) {
  const atMin = value <= min;
  const atMax = value >= max;
  const busy = loading || disabled;

  // Coalesce rapid clicks into a final value (prevents duplicate requests).
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [queued, setQueued] = useState<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const commit = (next: number) => {
    const clamped = Math.max(min, Math.min(max, next));
    setQueued(clamped);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setQueued(null);
      onChange(clamped);
    }, 250);
  };

  const btnSize =
    size === "md"
      ? "h-9 w-9 text-base"
      : "h-7 w-7";

  return (
    <div className={cn("flex items-center", className)}>
      <div
        className={cn(
          "inline-flex items-center rounded-lg border border-neutral-300 bg-white",
          size === "md" ? "h-10" : "h-8"
        )}
      >
        <button
          type="button"
          onClick={() => commit(value - 1)}
          disabled={busy || atMin}
          aria-label="Decrease quantity"
          className={cn(
            "flex items-center justify-center rounded-l-lg text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600",
            btnSize
          )}
        >
          <Minus className="h-3.5 w-3.5" />
        </button>

        <span
          className={cn(
            "text-center text-sm font-semibold tabular-nums",
            size === "md" ? "w-10" : "w-8"
          )}
          aria-live="polite"
        >
          {queued ?? value}
        </span>

        <button
          type="button"
          onClick={() => commit(value + 1)}
          disabled={busy || atMax}
          aria-label="Increase quantity"
          className={cn(
            "flex items-center justify-center rounded-r-lg text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600",
            btnSize
          )}
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Plus className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {hint && (
        <span className="ml-2 text-xs text-neutral-500">{hint}</span>
      )}
    </div>
  );
}
