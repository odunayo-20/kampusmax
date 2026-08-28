"use client";

import { cn } from "@/lib/utils";
import {
  VENDOR_ONBOARDING_STEPS,
  ONBOARDING_STEP_LABELS,
  ONBOARDING_STEP_DESCRIPTIONS,
  type VendorOnboardingStepId,
} from "@/types/onboarding";

interface OnboardingProgressProps {
  currentStep: VendorOnboardingStepId;
  /** Optionally reveal completed steps as navigable links. */
  onJump?: (step: VendorOnboardingStepId) => void;
  className?: string;
}

/**
 * Accessible progress indicator for the 8-step vendor onboarding flow.
 * Uses a live region for screen readers and visible (non-colour-only) state:
 * completed steps carry a check, the active step is bolded, remaining steps
 * are muted.
 */
export function OnboardingProgress({
  currentStep,
  onJump,
  className,
}: OnboardingProgressProps) {
  const progressPercent = Math.round((currentStep / VENDOR_ONBOARDING_STEPS) * 100);

  return (
    <div className={cn("w-full", className)}>
      {/* Live-region progress readout for screen readers */}
      <p className="sr-only" role="status" aria-live="polite">
        Step {currentStep} of {VENDOR_ONBOARDING_STEPS}: {ONBOARDING_STEP_LABELS[currentStep]}
      </p>

      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="font-semibold text-primary-700">
          Step {currentStep} of {VENDOR_ONBOARDING_STEPS}
        </span>
        <span className="tabular-nums text-neutral-500">{progressPercent}%</span>
      </div>

      <div
        className="h-2 w-full rounded-full bg-neutral-200 overflow-hidden"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={VENDOR_ONBOARDING_STEPS}
        aria-valuenow={currentStep}
        aria-label="Onboarding progress"
      >
        <div
          className="h-full rounded-full bg-primary-600 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Compact desktop step dots (hidden on small screens where the %
          bar reads better) */}
      <div className="hidden sm:flex items-center justify-between mt-3">
        {Array.from({ length: VENDOR_ONBOARDING_STEPS }, (_, i) => {
          const n = (i + 1) as VendorOnboardingStepId;
          const completed = n < currentStep;
          const active = n === currentStep;
          const inner = (
            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full border-2 text-[11px] font-bold transition-colors",
                completed && "border-primary-600 bg-primary-600 text-white",
                active && "border-primary-600 bg-primary-50 text-primary-700",
                !completed && !active && "border-neutral-300 bg-white text-neutral-400"
              )}
            >
              {completed ? (
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                n
              )}
            </span>
          );

          return (
            <div key={n} className="flex flex-1 last:flex-none items-center gap-0">
              {onJump && !active ? (
                <button
                  type="button"
                  onClick={() => onJump(n)}
                  className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded-full"
                  aria-label={`Go to ${ONBOARDING_STEP_LABELS[n]}`}
                >
                  {inner}
                </button>
              ) : (
                inner
              )}
              {n < VENDOR_ONBOARDING_STEPS && (
                <span
                  className={cn(
                    "mx-1 h-0.5 flex-1 rounded",
                    n < currentStep ? "bg-primary-600" : "bg-neutral-200"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step title + description shown by the shell, but expose the active
          label here too for the compact mobile header */}
      <p className="sm:hidden mt-2 text-sm font-semibold text-neutral-900">
        {ONBOARDING_STEP_LABELS[currentStep]}
      </p>
      <p className="sm:hidden text-xs text-neutral-500">
        {ONBOARDING_STEP_DESCRIPTIONS[currentStep]}
      </p>
    </div>
  );
}
