"use client";

import { cn } from "@/lib/utils";
import { STORE_STATUS } from "@/types/vendor-dashboard";
import type { StoreStatus } from "@/types/vendor-dashboard";

interface StoreStatusControlProps {
  status: StoreStatus;
  platformSuspended: boolean;
  onChange: (s: StoreStatus) => void;
}

const OPTIONS: {
  value: StoreStatus;
  label: string;
  dotClass: string;
}[] = [
  {
    value: STORE_STATUS.OPEN,
    label: "Open",
    dotClass: "bg-kampmax-success",
  },
  {
    value: STORE_STATUS.TEMPORARILY_CLOSED,
    label: "Temporarily Closed",
    dotClass: "bg-kampmax-warning",
  },
  {
    value: STORE_STATUS.UNAVAILABLE,
    label: "Unavailable",
    dotClass: "bg-kampmax-error",
  },
];

export function StoreStatusControl({
  status,
  platformSuspended,
  onChange,
}: StoreStatusControlProps) {
  const disabled = platformSuspended;
  return (
    <div>
      <div
        role="radiogroup"
        aria-label="Store status"
        aria-disabled={disabled}
        className="flex flex-wrap gap-2"
      >
        {OPTIONS.map((opt) => {
          const selected = opt.value === status;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              onClick={() => onChange(opt.value)}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2",
                selected
                  ? "border-primary-600 bg-primary-600 text-white"
                  : "border-kampmax-border bg-white text-neutral-700 hover:bg-neutral-50",
                disabled && "cursor-not-allowed opacity-60"
              )}
            >
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  selected ? "bg-white" : opt.dotClass
                )}
                aria-hidden
              />
              {opt.label}
            </button>
          );
        })}
      </div>

      {disabled && (
        <p className="mt-2 text-xs text-kampmax-warning">
          Your store is under platform review — status can't be changed right now.
        </p>
      )}
    </div>
  );
}
