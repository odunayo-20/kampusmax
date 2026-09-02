"use client";

import { Button, Input } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { FreelancerOnboardingDraft } from "@/types/freelancer";

interface Props {
  draft: FreelancerOnboardingDraft | null;
  onUpdate: (data: Partial<FreelancerOnboardingDraft>) => void;
}

export function StepRates({ draft, onUpdate }: Props) {
  const rates = draft?.rates ?? { negotiable: true };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-kampmax-text">Rates</h2>
        <p className="mt-1 text-sm text-kampmax-text-secondary">
          Set your pricing. You can change these later.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="hourlyRate" className="block text-sm font-medium text-kampmax-text mb-1.5">Hourly Rate (₦)</label>
          <Input
            id="hourlyRate"
            type="number"
            min={0}
            step={500}
            value={rates.hourlyRate ?? ""}
            onChange={(e) => onUpdate({ rates: { ...rates, hourlyRate: e.target.value ? Number(e.target.value) : undefined } })}
            placeholder="e.g., 5000"
          />
          <p className="mt-1 text-xs text-kampmax-text-secondary">Your rate per hour of work.</p>
        </div>
        <div>
          <label htmlFor="projectRate" className="block text-sm font-medium text-kampmax-text mb-1.5">Project Rate (₦)</label>
          <Input
            id="projectRate"
            type="number"
            min={0}
            step={5000}
            value={rates.projectRate ?? ""}
            onChange={(e) => onUpdate({ rates: { ...rates, projectRate: e.target.value ? Number(e.target.value) : undefined } })}
            placeholder="e.g., 50000"
          />
          <p className="mt-1 text-xs text-kampmax-text-secondary">Your starting rate per project.</p>
        </div>
      </div>

      <div className="border border-neutral-200 rounded-lg p-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={rates.negotiable}
            onChange={(e) => onUpdate({ rates: { ...rates, negotiable: e.target.checked } })}
            className="rounded border-neutral-300 h-4 w-4"
          />
          <div>
            <p className="text-sm font-medium text-kampmax-text">Rates are negotiable</p>
            <p className="text-xs text-kampmax-text-secondary">Show clients you&apos;re open to discussion</p>
          </div>
        </label>
      </div>

      {/* Preview */}
      <div className="bg-neutral-50 rounded-lg p-4">
        <p className="text-xs text-kampmax-text-secondary mb-2">Preview</p>
        <div className="flex items-baseline gap-3">
          {rates.hourlyRate && (
            <span className="text-lg font-bold text-kampmax-text">₦{rates.hourlyRate.toLocaleString()}/hr</span>
          )}
          {rates.projectRate && (
            <span className="text-sm text-kampmax-text-secondary">From ₦{rates.projectRate.toLocaleString()} per project</span>
          )}
          {!rates.hourlyRate && !rates.projectRate && (
            <span className="text-sm text-neutral-400 italic">No rates set yet</span>
          )}
        </div>
      </div>
    </div>
  );
}
