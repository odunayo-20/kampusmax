"use client";

import { Lock, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DayAvailability } from "@/types/booking";

/**
 * Horizontal scrolling day picker (next N days). Disabled days carry a text
 * reason in an expanded hint — never communicated by color alone.
 */
export function BookingDayPicker({
  days,
  selectedDate,
  onSelect,
  timeZone,
}: {
  days: DayAvailability[];
  selectedDate: string;
  onSelect: (date: string) => void;
  timeZone: string;
}) {
  const selected = days.find((d) => d.date === selectedDate);

  return (
    <div>
      <div
        role="tablist"
        aria-label="Select a day"
        className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 [scrollbar-width:thin]"
      >
        {days.map((day) => {
          const isSelected = day.date === selectedDate;
          const unavailable = !day.available;
          return (
            <button
              key={day.date}
              role="tab"
              aria-selected={isSelected}
              aria-disabled={unavailable}
              disabled={unavailable}
              onClick={() => onSelect(day.date)}
              title={unavailable ? day.reasonLabel : undefined}
              className={cn(
                "flex min-w-[64px] flex-col items-center gap-0.5 rounded-xl border px-3 py-2 text-center transition-colors",
                isSelected
                  ? "border-primary-600 bg-primary-50 text-primary-700 shadow-sm"
                  : "border-neutral-200 bg-white text-neutral-700 hover:border-primary-300",
                unavailable && "cursor-not-allowed border-neutral-100 bg-neutral-50 text-neutral-400"
              )}
            >
              <span className="text-[10px] uppercase tracking-wide text-neutral-500">
                {day.label === "Today" || day.label === "Tomorrow"
                  ? day.label
                  : day.label.split(" ")[0]}
              </span>
              <span className="text-sm font-bold">
                {day.label === "Today" || day.label === "Tomorrow"
                  ? day.label
                  : day.label.split(" ").slice(1).join(" ")}
              </span>
              {unavailable && <Lock className="mt-0.5 h-3 w-3 text-neutral-400" aria-hidden />}
            </button>
          );
        })}
      </div>

      <div className="mt-1 flex min-h-4 items-center justify-between text-[11px] text-neutral-400">
        {selected ? (
          <p
            className={cn(
              "flex items-center gap-1",
              !selected.available && "text-neutral-500"
            )}
          >
            {selected.fullLabel}
            {!selected.available && (
              <>
                <span aria-hidden>·</span>
                <span className="flex items-center gap-1">
                  <Lock className="h-3 w-3" aria-hidden /> {selected.reasonLabel}
                </span>
              </>
            )}
          </p>
        ) : (
          <span />
        )}
        <span className="flex items-center gap-1">
          <ChevronUp className="h-3 w-3" aria-hidden /> Times in {timeZone}
        </span>
      </div>
    </div>
  );
}