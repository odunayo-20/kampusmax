"use client";

import Link from "next/link";
import {
  User,
  Store,
  Briefcase,
  Wrench,
  Building2,
  Megaphone,
  CheckCircle2,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";
import type { KampmaxProfile } from "@/types/account";

const PROFILE_ICONS: Record<string, LucideIcon> = {
  customer: User,
  vendor: Store,
  freelancer: Briefcase,
  service_provider: Wrench,
  employer: Building2,
  ambassador: Megaphone,
};

interface MultiProfilesListProps {
  profiles: KampmaxProfile[];
}

/**
 * "My Kampmax Profiles" — multi-profile center.
 *
 * Architecture: a single account holds multiple profiles; there is never a
 * separate login per profile. Only the Customer profile is active in this
 * prototype; other profiles appear as clear entry points with no fake
 * switching (backend profile-activation isn't built yet).
 */
export function MultiProfilesList({ profiles }: MultiProfilesListProps) {
  return (
    <ul className="space-y-3">
      {profiles.map((profile) => {
        const Icon = PROFILE_ICONS[profile.key] || User;
        return (
          <li
            key={profile.key}
            className="bg-white rounded-xl border border-kampmax-border p-4 flex items-start gap-3"
          >
            <div
              className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${
                profile.active
                  ? "bg-kampmax-blue/10 text-kampmax-blue"
                  : "bg-kampmax-muted text-kampmax-text-secondary/60"
              }`}
            >
              <Icon className="h-5 w-5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-kampmax-text">
                  {profile.label}
                </h3>
                {profile.active ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-success-700 bg-success-50 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="h-3 w-3" />
                    Active
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-kampmax-text-muted bg-kampmax-muted px-2 py-0.5 rounded-full">
                    Not active
                  </span>
                )}
              </div>
              <p className="text-xs text-kampmax-text-secondary mt-0.5">
                {profile.description}
              </p>

              {profile.active ? (
                <p className="text-[11px] text-kampmax-text-muted mt-2.5">
                  Managed with your existing Kampmax account. No separate
                  sign-in needed.
                </p>
              ) : (
                profile.cta && (
                  <Link
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="inline-flex items-center gap-1 mt-2.5 text-xs font-semibold text-kampmax-blue"
                    aria-disabled="true"
                    title="Coming soon — profile activation is not available yet"
                  >
                    {profile.cta}
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                )
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
