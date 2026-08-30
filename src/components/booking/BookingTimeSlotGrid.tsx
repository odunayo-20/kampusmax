"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BookingSlot, DayAvailability } from "@/types/booking";

/**
 * Time slot grid. Taken slots are disabled and their reason is spoken via the
 * button label (accessibility) and shown via the tone legend before the grid —
 * never through colour alone.
 */
export function BookingTimeSlotGrid({
  day,
  selectedStartAt,
  onSelect,
  noticeHint,
}: {
  day: DayAvailability;
  selectedStartAt: string;
  onSelect: (slot: BookingSlot) => void;
  noticeHint?: string;
}) {
  if (day.slots.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-8 text-center">
        <p className="text-sm font-semibold text-neutral-600">No available times</p>
        <p className="mt-1 text-xs text-neutral-500">{day.reasonLabel}</p>
      </div>
    );
  }

  const freeCount = day.slots.filter((s) => !s.taken).length;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-neutral-500">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="h-2.5 w-2.5 rounded border border-primary-500 bg-white" />
          Available
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="h-2.5 w-2.5 rounded border border-neutral-300 bg-neutral-100" />
          Taken or too late
        </span>
        {noticeHint && (
          <span className="basis-full text-info-600">{noticeHint}</span>
        )}
      </div>

      <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {day.slots.map((slot) => {
          const isSelected = slot.startAt === selectedStartAt;
          return (
            <li key={slot.startAt}>
              <button
                type="button"
                disabled={slot.taken}
                aria-pressed={isSelected}
                aria-label={
                  slot.taken
                    ? `${slot.startTime} to ${slot.endTime} · unavailable · ${slot.reason ?? "no free slot"}`
                    : `${slot.startTime} to ${slot.endTime} · available`
                }
                onClick={() => onSelect(slot)}
                title={slot.taken ? slot.reason : undefined}
                className={cn(
                  "w-full rounded-lg border px-2 py-2.5 text-center text-sm font-semibold transition-colors",
                  slot.taken
                    ? "cursor-not-allowed border-neutral-100 bg-neutral-50 text-neutral-400 line-through"
                    : isSelected
                      ? "border-primary-600 bg-primary-600 text-white shadow-sm"
                      : "border-neutral-200 bg-white text-neutral-800 hover:border-primary-400"
                )}
              >
                {slot.startTime}–{slot.endTime}
              </button>
            </li>
          );
        })}
      </ul>

      {freeCount === 0 && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-warning-600">
          <X className="h-3.5 w-3.5" aria-hidden />
          Every time on this day is taken — pick another day.
        </p>
      )}
    </div>
  );
}