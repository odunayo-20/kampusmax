"use client";

import Link from "next/link";
import { ChevronDown, User } from "lucide-react";
import { getCustomerProfiles } from "@/services/account";
import { useAuth } from "@/lib/auth-context";

/**
 * Profile switcher. Because a single Kampmax account holds multiple profiles,
 * this shows the current (active) profile and links to the multi-profile
 * center. It never triggers a separate authentication flow.
 */
export function ProfileSwitcher() {
  const { user } = useAuth();
  if (!user) return null;

  const profiles = getCustomerProfiles(user.id);
  const active = profiles.find((p) => p.active);

  return (
    <Link
      href="/account/profiles"
      aria-label="Switch Kampmax profile"
      className="inline-flex items-center gap-1.5 text-xs font-medium text-kampmax-text-secondary bg-white border border-kampmax-border rounded-full px-3 py-1.5 hover:border-kampmax-blue/40 hover:text-kampmax-blue transition-colors"
    >
      <User className="h-3.5 w-3.5" />
      {active ? active.label : "Customer"}
      <ChevronDown className="h-3 w-3" />
    </Link>
  );
}
