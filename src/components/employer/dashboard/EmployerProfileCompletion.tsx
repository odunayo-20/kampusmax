"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import type { EmployerDashboardQuerySource } from "./EmployerDashboardSection";

export function EmployerProfileCompletion({
  query,
}: {
  query: EmployerDashboardQuerySource;
}) {
  const company = query.data?.company;
  if (!company) return null;

  const completion = company.profileCompletion;
  const complete = completion >= 100;

  return (
    <section aria-labelledby="profile-completion" className="rounded-xl border border-kampmax-border bg-white">
      <div className="px-4 py-4 sm:px-5">
        <div className="flex items-center justify-between gap-2">
          <h2 id="profile-completion" className="text-sm font-bold text-kampmax-text">
            Employer profile
          </h2>
          {complete ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-success-700">
              <CheckCircle2 className="h-4 w-4" aria-hidden />
              Complete
            </span>
          ) : (
            <span className="text-xs font-semibold text-kampmax-text-secondary">{completion}%</span>
          )}
        </div>

        <div
          className="mt-3 h-2 w-full overflow-hidden rounded-full bg-kampmax-muted"
          role="progressbar"
          aria-valuenow={completion}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Employer profile completion"
        >
          <div
            className="h-full rounded-full bg-primary-600 transition-all"
            style={{ width: `${completion}%` }}
          />
        </div>

        <p className="mt-2 text-xs text-kampmax-text-secondary">
          {complete
            ? "Your profile is ready — candidates can find and trust you."
            : "Completing your profile helps more candidates find and trust you."}
        </p>

        {!complete && (
          <Link
            href="/onboarding/employer"
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
          >
            Complete your profile
          </Link>
        )}
      </div>
    </section>
  );
}