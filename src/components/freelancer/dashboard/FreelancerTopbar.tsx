"use client";

import { Briefcase } from "lucide-react";
import { FreelancerStatusBadge } from "./FreelancerStatusBadge";
import { FreelancerNotifications } from "./FreelancerNotifications";
import { ProfileSwitcher } from "@/components/vendor-dashboard/ProfileSwitcher";
import type { FreelancerOnboardingStatus } from "@/types/freelancer";

export function FreelancerTopbar({
  displayName,
  status,
}: {
  displayName: string;
  status: FreelancerOnboardingStatus;
}) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-kampmax-border bg-white px-4 lg:px-8">
      <div className="flex min-w-0 items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-kampmax-gold text-kampmax-navy lg:hidden">
          <Briefcase className="h-4 w-4" aria-hidden />
        </span>
        <span className="truncate text-sm font-bold text-kampmax-text">{displayName}</span>
        <FreelancerStatusBadge status={status} className="hidden sm:inline-flex" />
      </div>
      <div className="flex items-center gap-2">
        <FreelancerNotifications />
        <ProfileSwitcher />
      </div>
    </header>
  );
}
