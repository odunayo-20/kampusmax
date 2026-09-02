"use client";

import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { FREELANCER_WORKING_DAYS, FREELANCER_AVAILABILITY_OPTIONS } from "@/config/freelancer";
import type { FreelancerAvailabilityStatus, FreelancerOnboardingDraft } from "@/types/freelancer";

interface Props {
  draft: FreelancerOnboardingDraft | null;
  onUpdate: (data: Partial<FreelancerOnboardingDraft>) => void;
}

export function StepAvailability({ draft, onUpdate }: Props) {
  const availability = draft?.availability ?? {
    status: "available_now" as FreelancerAvailabilityStatus,
    workingDays: ["mon", "tue", "wed", "thu", "fri"],
    workingHoursStart: "09:00",
    workingHoursEnd: "17:00",
    timezone: "Africa/Lagos",
  };

  const toggleDay = (day: string) => {
    const next = availability.workingDays.includes(day)
      ? availability.workingDays.filter((d) => d !== day)
      : [...availability.workingDays, day];
    onUpdate({ availability: { ...availability, workingDays: next } });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-kampmax-text">Availability</h2>
        <p className="mt-1 text-sm text-kampmax-text-secondary">
          When are you available to take on work?
        </p>
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-kampmax-text mb-3">Availability Status</label>
        <div className="space-y-2">
          {FREELANCER_AVAILABILITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onUpdate({ availability: { ...availability, status: opt.value } })}
              className={cn(
                "w-full text-left p-3 rounded-lg border transition-colors",
                availability.status === opt.value
                  ? "border-primary-600 bg-primary-50"
                  : "border-neutral-200 hover:border-neutral-300"
              )}
            >
              <p className={cn("text-sm font-medium", availability.status === opt.value ? "text-primary-700" : "text-kampmax-text")}>
                {opt.label}
              </p>
              <p className="text-xs text-kampmax-text-secondary">{opt.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Working days */}
      <div>
        <label className="block text-sm font-medium text-kampmax-text mb-3">Working Days</label>
        <div className="flex flex-wrap gap-2">
          {FREELANCER_WORKING_DAYS.map((day) => (
            <button
              key={day.value}
              type="button"
              onClick={() => toggleDay(day.value)}
              className={cn(
                "w-12 h-10 rounded-lg text-sm font-medium border transition-colors",
                availability.workingDays.includes(day.value)
                  ? "bg-primary-600 text-white border-primary-600"
                  : "bg-white text-kampmax-text border-neutral-200 hover:border-primary-300"
              )}
            >
              {day.label}
            </button>
          ))}
        </div>
      </div>

      {/* Working hours */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="startTime" className="block text-sm font-medium text-kampmax-text mb-1.5">Start Time</label>
          <input
            id="startTime"
            type="time"
            value={availability.workingHoursStart}
            onChange={(e) => onUpdate({ availability: { ...availability, workingHoursStart: e.target.value } })}
            className="w-full px-3 py-2 text-sm bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600"
          />
        </div>
        <div>
          <label htmlFor="endTime" className="block text-sm font-medium text-kampmax-text mb-1.5">End Time</label>
          <input
            id="endTime"
            type="time"
            value={availability.workingHoursEnd}
            onChange={(e) => onUpdate({ availability: { ...availability, workingHoursEnd: e.target.value } })}
            className="w-full px-3 py-2 text-sm bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600"
          />
        </div>
      </div>

      {/* Timezone */}
      <div>
        <label className="block text-sm font-medium text-kampmax-text mb-1.5">Timezone</label>
        <select
          value={availability.timezone}
          onChange={(e) => onUpdate({ availability: { ...availability, timezone: e.target.value } })}
          className="w-full px-3 py-2 text-sm bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600"
        >
          <option value="Africa/Lagos">West Africa Time (WAT) — Lagos</option>
          <option value="Africa/Accra">West Africa Time (WAT) — Accra</option>
          <option value="Africa/Nairobi">East Africa Time (EAT) — Nairobi</option>
          <option value="Africa/Johannesburg">South Africa Standard Time (SAST)</option>
          <option value="Europe/London">Greenwich Mean Time (GMT) — London</option>
          <option value="America/New_York">Eastern Time (ET) — New York</option>
        </select>
      </div>
    </div>
  );
}
