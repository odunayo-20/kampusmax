"use client";

import Link from "next/link";
import { MapPin, Globe, Pencil, Wifi } from "lucide-react";
import { Avatar } from "@/components/ui";
import type { FreelancerProfileSummary } from "@/types/freelancer-dashboard";

/** Read-only preview of the freelancer's public profile. Images/skills come
 * straight from the backend-supplied profile summary. */
export function FreelancerProfilePreview({
  profile,
  displayName,
}: {
  profile: FreelancerProfileSummary;
  displayName: string;
}) {
  const skills = profile.skills.slice(0, 6);
  return (
    <section
      aria-label="Profile preview"
      className="rounded-xl border border-kampmax-border bg-white p-5"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <Avatar name={displayName} src={profile.photoUrl ?? undefined} size="lg" />
          <div className="min-w-0">
            <h2 className="truncate font-bold text-kampmax-text">{displayName}</h2>
            <p className="truncate text-sm text-primary-700">{profile.headline ?? "Freelancer"}</p>
          </div>
        </div>
        <Link
          href="/freelancer/profile"
          className="inline-flex items-center gap-1 rounded-md border border-kampmax-border px-2.5 py-1.5 text-xs font-medium text-kampmax-text hover:bg-neutral-50"
        >
          <Pencil className="h-3.5 w-3.5" aria-hidden />
          Edit
        </Link>
      </div>

      {profile.bio && <p className="mt-3 line-clamp-3 text-sm text-kampmax-text-secondary">{profile.bio}</p>}

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-kampmax-text-muted">
        {profile.city && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" aria-hidden />
            {profile.city}
          </span>
        )}
        {profile.remoteAvailable && (
          <span className="inline-flex items-center gap-1 text-success-600">
            <Globe className="h-3.5 w-3.5" aria-hidden />
            Open to remote
          </span>
        )}
      </div>

      {skills.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5 border-t border-kampmax-border pt-3">
          {skills.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] font-medium text-kampmax-text-secondary"
            >
              <Wifi className="h-3 w-3 text-neutral-400" aria-hidden />
              {s}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
