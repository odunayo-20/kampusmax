"use client";

import { cn } from "@/lib/utils";
import type { StoreHoursDay } from "@/types/vendor-dashboard";

interface StoreHoursEditorProps {
  hours: StoreHoursDay[];
  onChange: (next: StoreHoursDay[]) => void;
}

export function StoreHoursEditor({ hours, onChange }: StoreHoursEditorProps) {
  function update(index: number, patch: Partial<StoreHoursDay>) {
    const next = hours.map((day, i) => (i === index ? { ...day, ...patch } : day));
    onChange(next);
  }

  return (
    <div className="divide-y divide-kampmax-border rounded-lg border border-kampmax-border">
      {hours.map((day, index) => {
        const isInvalid =
          day.mode === "custom" && day.openTime && day.closeTime && day.closeTime <= day.openTime;
        return (
          <div
            key={day.dayIndex}
            className="grid grid-cols-1 items-center gap-2 p-3 sm:grid-cols-[140px_1fr]"
          >
            <span className="text-sm font-medium text-kampmax-text">{day.label}</span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={day.mode}
                  onChange={(e) =>
                    update(index, { mode: e.target.value as StoreHoursDay["mode"] })
                  }
                  className="rounded-lg border border-kampmax-border bg-white px-3 py-2 text-sm text-kampmax-text focus:border-primary-600 focus:outline-none"
                >
                  <option value="closed">Closed</option>
                  <option value="open_24">Open 24 hours</option>
                  <option value="custom">Custom hours</option>
                </select>

                {day.mode === "custom" && (
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="flex items-center gap-1.5 text-sm text-kampmax-text-secondary">
                      Open
                      <input
                        type="time"
                        value={day.openTime}
                        onChange={(e) => update(index, { openTime: e.target.value })}
                        className={cn(
                          "rounded-lg border border-kampmax-border bg-white px-2 py-2 text-sm text-kampmax-text focus:border-primary-600 focus:outline-none"
                        )}
                      />
                    </label>
                    <label className="flex items-center gap-1.5 text-sm text-kampmax-text-secondary">
                      Close
                      <input
                        type="time"
                        value={day.closeTime}
                        onChange={(e) => update(index, { closeTime: e.target.value })}
                        className="rounded-lg border border-kampmax-border bg-white px-2 py-2 text-sm text-kampmax-text focus:border-primary-600 focus:outline-none"
                      />
                    </label>
                  </div>
                )}
              </div>

              {isInvalid && (
                <p className="mt-1 text-xs text-kampmax-error">
                  Closing time must be later than opening time.
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
