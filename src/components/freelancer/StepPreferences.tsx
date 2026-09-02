"use client";

import { cn } from "@/lib/utils";
import { FREELANCER_WORK_ARRANGEMENTS, FREELANCER_PROJECT_TYPES } from "@/config/freelancer";
import type { FreelancerOnboardingDraft } from "@/types/freelancer";

interface Props {
  draft: FreelancerOnboardingDraft | null;
  onUpdate: (data: Partial<FreelancerOnboardingDraft>) => void;
}

export function StepPreferences({ draft, onUpdate }: Props) {
  const prefs = draft?.preferences ?? { workArrangements: [], projectTypes: [] };

  const toggleArrangement = (value: string) => {
    const next = prefs.workArrangements.includes(value)
      ? prefs.workArrangements.filter((v) => v !== value)
      : [...prefs.workArrangements, value];
    onUpdate({ preferences: { ...prefs, workArrangements: next } });
  };

  const toggleProjectType = (value: string) => {
    const next = prefs.projectTypes.includes(value)
      ? prefs.projectTypes.filter((v) => v !== value)
      : [...prefs.projectTypes, value];
    onUpdate({ preferences: { ...prefs, projectTypes: next } });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-kampmax-text">Work Preferences</h2>
        <p className="mt-1 text-sm text-kampmax-text-secondary">
          Help clients understand how you prefer to work.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-kampmax-text mb-3">
          Work Arrangements <span className="text-red-500">*</span>
        </label>
        <div className="grid gap-2 sm:grid-cols-2">
          {FREELANCER_WORK_ARRANGEMENTS.map((arr) => {
            const selected = prefs.workArrangements.includes(arr.value);
            return (
              <button
                key={arr.value}
                type="button"
                onClick={() => toggleArrangement(arr.value)}
                className={cn(
                  "text-left p-3 rounded-lg border transition-colors",
                  selected
                    ? "border-primary-600 bg-primary-50 text-primary-700"
                    : "border-neutral-200 hover:border-neutral-300 text-kampmax-text"
                )}
              >
                <p className="text-sm font-medium">{arr.label}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-kampmax-text mb-3">
          Project Types <span className="text-red-500">*</span>
        </label>
        <div className="grid gap-2 sm:grid-cols-2">
          {FREELANCER_PROJECT_TYPES.map((pt) => {
            const selected = prefs.projectTypes.includes(pt.value);
            return (
              <button
                key={pt.value}
                type="button"
                onClick={() => toggleProjectType(pt.value)}
                className={cn(
                  "text-left p-3 rounded-lg border transition-colors",
                  selected
                    ? "border-primary-600 bg-primary-50 text-primary-700"
                    : "border-neutral-200 hover:border-neutral-300 text-kampmax-text"
                )}
              >
                <p className="text-sm font-medium">{pt.label}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
