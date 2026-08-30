"use client";

import { Clock, Plus, Minus, Calendar, Sun, Moon, HelpCircle } from "lucide-react";
import { Button, Input, Select } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { ServiceProviderOnboardingDraft, ServiceProviderAvailabilityDay, ServiceProviderBookingPreference } from "@/types/service-provider";

const DAY_LABELS = [
  { index: 0, label: "Monday", short: "Mon" },
  { index: 1, label: "Tuesday", short: "Tue" },
  { index: 2, label: "Wednesday", short: "Wed" },
  { index: 3, label: "Thursday", short: "Thu" },
  { index: 4, label: "Friday", short: "Fri" },
  { index: 5, label: "Saturday", short: "Sat" },
  { index: 6, label: "Sunday", short: "Sun" },
];

interface StepAvailabilityProps {
  draft: ServiceProviderOnboardingDraft | null;
  onUpdate: (data: Partial<ServiceProviderOnboardingDraft>) => void;
}

export function StepAvailability({ draft, onUpdate }: StepAvailabilityProps) {
  const availability = draft?.availability;

  const handleDayToggle = (dayIndex: number) => {
    const days = [...(availability?.days ?? [])];
    const dayIdx = days.findIndex((d) => d.dayIndex === dayIndex);
    if (dayIdx >= 0) {
      days[dayIdx] = { ...days[dayIdx], isAvailable: !days[dayIdx].isAvailable };
    }
    onUpdate({ availability: { ...availability, days } });
  };

  const handleTimeChange = (dayIndex: number, field: "openTime" | "closeTime", value: string) => {
    const days = [...(availability?.days ?? [])];
    const dayIdx = days.findIndex((d) => d.dayIndex === dayIndex);
    if (dayIdx >= 0) {
      days[dayIdx] = { ...days[dayIdx], [field]: value || undefined };
    }
    onUpdate({ availability: { ...availability, days } });
  };

  const handleBufferChange = (value: number) => {
    onUpdate({ availability: { ...availability, appointmentBufferMinutes: value } });
  };

  const handleAdvanceChange = (value: number) => {
    onUpdate({ availability: { ...availability, minAdvanceNoticeHours: value } });
  };

  const handleMaxAdvanceChange = (value: number) => {
    onUpdate({ availability: { ...availability, maxAdvanceBookingDays: value } });
  };

  const handleBookingPrefChange = (value: ServiceProviderBookingPreference) => {
    onUpdate({ availability: { ...availability, bookingPreference: value } });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-kampmax-text">Availability & Booking</h2>
        <p className="mt-1 text-sm text-kampmax-text-secondary">
          Set your working hours and booking preferences. Customers will only see available slots.
        </p>
      </div>

      {/* Weekly Schedule */}
      <div>
        <label className="block text-sm font-medium text-kampmax-text mb-4">
          Weekly Schedule
        </label>
        <div className="space-y-3">
          {DAY_LABELS.map((day) => {
            const dayData = availability?.days?.find((d) => d.dayIndex === day.index);
            const isAvailable = dayData?.isAvailable ?? (day.index < 5);
            const openTime = dayData?.openTime ?? "09:00";
            const closeTime = dayData?.closeTime ?? "18:00";

            return (
              <div
                key={day.index}
                className={cn(
                  "grid gap-3 p-4 rounded-lg border transition-colors sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-5",
                  isAvailable ? "border-primary-200 bg-primary-50" : "border-neutral-200 bg-neutral-50"
                )}
              >
                <button
                  type="button"
                  onClick={() => handleDayToggle(day.index)}
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg font-medium",
                    isAvailable
                      ? "bg-primary-600 text-white"
                      : "bg-neutral-200 text-neutral-400 hover:bg-neutral-300"
                  )}
                  aria-pressed={isAvailable}
                >
                  {day.short}
                </button>
                <div className="min-w-0">
                  <p className={cn("font-medium", isAvailable ? "text-kampmax-text" : "text-neutral-400")}>
                    {day.label}
                  </p>
                  {isAvailable && (
                    <p className="text-sm text-kampmax-text-secondary">
                      {openTime} – {closeTime}
                    </p>
                  )}
                </div>
                {isAvailable ? (
                  <div className="flex flex-wrap items-center justify-start gap-3 sm:justify-end">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4 text-kampmax-text-secondary shrink-0" />
                      <Input
                        type="time"
                        value={openTime}
                        onChange={(e) => handleTimeChange(day.index, "openTime", e.target.value)}
                        className="w-28 sm:w-32"
                      />
                    </div>
                    <span className="text-kampmax-text-secondary">to</span>
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4 text-kampmax-text-secondary shrink-0" />
                      <Input
                        type="time"
                        value={closeTime}
                        onChange={(e) => handleTimeChange(day.index, "closeTime", e.target.value)}
                        className="w-28 sm:w-32"
                      />
                    </div>
                  </div>
                ) : (
                  <span className="text-sm text-neutral-400 sm:justify-self-end">Unavailable</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

        {/* Booking Preferences */}
      <div className="rounded-xl border border-kampmax-border bg-white p-6 space-y-6">
        <h3 className="text-lg font-semibold text-kampmax-text">Booking Preferences</h3>

        <div>
          <label className="block text-sm font-medium text-kampmax-text mb-2">
            Booking Mode
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => handleBookingPrefChange("instant")}
              className={cn(
                "p-4 rounded-lg border-2 text-left transition-colors",
                availability?.bookingPreference === "instant"
                  ? "border-primary-600 bg-primary-50"
                  : "border-neutral-200 hover:border-primary-300"
              )}
            >
              <p className="font-semibold text-kampmax-text">Instant Booking</p>
              <p className="mt-1 text-sm text-kampmax-text-secondary">
                Customers book and confirm immediately. You'll receive notifications.
              </p>
            </button>
            <button
              type="button"
              onClick={() => handleBookingPrefChange("request_approval")}
              className={cn(
                "p-4 rounded-lg border-2 text-left transition-colors",
                availability?.bookingPreference === "request_approval"
                  ? "border-primary-600 bg-primary-50"
                  : "border-neutral-200 hover:border-primary-300"
              )}
            >
              <p className="font-semibold text-kampmax-text">Request Approval</p>
              <p className="mt-1 text-sm text-kampmax-text-secondary">
                Customers request a time. You approve or suggest alternatives.
              </p>
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-kampmax-text mb-1.5">
              Buffer Between Appointments (min)
            </label>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min="0"
                max="60"
                step="5"
                value={availability?.appointmentBufferMinutes ?? 15}
                onChange={(e) => handleBufferChange(parseInt(e.target.value) || 0)}
                className="w-24"
                inputMode="numeric"
              />
              <span className="text-sm text-kampmax-text-secondary">minutes</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-kampmax-text mb-1.5">
              Minimum Advance Notice (hours)
            </label>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min="0"
                max="168"
                value={availability?.minAdvanceNoticeHours ?? 2}
                onChange={(e) => handleAdvanceChange(parseInt(e.target.value) || 0)}
                className="w-24"
                inputMode="numeric"
              />
              <span className="text-sm text-kampmax-text-secondary">hours</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-kampmax-text mb-1.5">
              Maximum Advance Booking (days)
            </label>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min="1"
                max="365"
                value={availability?.maxAdvanceBookingDays ?? 30}
                onChange={(e) => handleMaxAdvanceChange(parseInt(e.target.value) || 30)}
                className="w-24"
                inputMode="numeric"
              />
              <span className="text-sm text-kampmax-text-secondary">days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Unavailable Dates */}
      <div className="rounded-xl border border-kampmax-border bg-white p-6">
        <h3 className="text-lg font-semibold text-kampmax-text mb-2">Unavailable Dates (Optional)</h3>
        <p className="text-sm text-kampmax-text-secondary mb-4">
          Add specific dates when you're unavailable (holidays, exams, etc.). Feature coming soon.
        </p>
        <Button variant="outline" disabled>
          <Calendar className="h-4 w-4 mr-2" />
          Add Unavailable Dates
        </Button>
      </div>
    </div>
  );
}