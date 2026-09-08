"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

/**
 * Profile-completion card for the profile page. The percentage comes from the
 * existing `computeEmployerCompletion` (backend-approximating) — displayed as
 * a UI aid, never treated as authoritative verification.
 */
export function EmployerProfileCompletionCard({
  completion,
}: {
  completion: number;
}) {
  const complete = completion >= 100;

  return (
    <section
      aria-labelledby="profile-completion"
      className="h-full rounded-xl border border-kampmax-border bg-white"
    >
      <div className="px-5 py-4">
        <div className="flex items-center justify-between gap-2">
          <h2 id="profile-completion" className="text-sm font-bold text-kampmax-text">
            Profile completion
          </h2>
          {complete ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-success-700">
              <CheckCircle2 className="h-4 w-4" aria-hidden />
              Complete
            </span>
          ) : (
            <span className="text-xs font-semibold text-kampmax-text-secondary">
              {completion}%
            </span>
          )}
        </div>

        <div
          className="mt-3 h-2 w-full overflow-hidden rounded-full bg-kampmax-muted"
          role="progressbar"
          aria-valuenow={completion}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuetext={`${completion}% complete`}
          aria-label="Profile completion"
        >
          <div
            className="h-full rounded-full bg-primary-600 transition-all"
            style={{ width: `${completion}%` }}
          />
        </div>

        <p className="mt-2 text-xs text-kampmax-text-secondary">
          {complete
            ? "Your profile is ready. Adding more detail helps freelancers find and trust you."
            : "Adding more detail helps freelancers find and trust you."}
        </p>

        {!complete && (
          <Link
            href="/employer/profile/edit"
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
          >
            Complete your profile
          </Link>
        )}
      </div>
    </section>
  );
}
