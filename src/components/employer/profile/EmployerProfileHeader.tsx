"use client";

import Link from "next/link";
import { ArrowLeft, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui";

export function EmployerProfileHeader({
  avatarUrl,
  name,
  headline,
  clientTypeLabel,
  descriptor,
  location,
  verified,
  publicSlug,
  backHref,
  backLabel,
}: {
  avatarUrl?: string | null;
  name: string;
  headline?: string;
  clientTypeLabel: string;
  descriptor?: string;
  location?: string;
  verified: boolean;
  publicSlug?: string;
  backHref?: string;
  backLabel?: string;
}) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="overflow-hidden rounded-xl border border-kampmax-border bg-white">
      <div className="h-20 w-full bg-gradient-to-r from-primary-600 to-kampmax-blue" />
      <div className="px-5 pb-5 sm:px-6">
        {backHref && (
          <Link
            href={backHref}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-kampmax-text-secondary hover:text-kampmax-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            {backLabel ?? "Back"}
          </Link>
        )}

        <div className="flex flex-wrap items-end gap-4">
          <div
            className={cn(
              "-mt-10 flex h-20 w-20 items-center justify-center rounded-2xl border border-kampmax-border bg-white text-2xl font-bold text-white shadow",
              "bg-kampmax-navy"
            )}
            aria-hidden
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt=""
                className="h-full w-full rounded-2xl object-cover"
              />
            ) : (
              initials
            )}
          </div>

          <div className="min-w-0 flex-1 pt-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-2xl font-bold text-kampmax-text">{name}</h1>
              <Badge variant="outline" className="text-kampmax-text-secondary">
                {clientTypeLabel}
              </Badge>
              {verified && <Badge variant="success">Verified</Badge>}
            </div>
            {headline && <p className="mt-0.5 text-sm font-medium text-kampmax-text">{headline}</p>}
            {(descriptor || location) && (
              <p className="mt-0.5 text-sm text-kampmax-text-secondary">
                {[descriptor, location].filter(Boolean).join(" • ")}
              </p>
            )}
          </div>
        </div>

        {publicSlug && (
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-kampmax-text-secondary">
            <Building2 className="h-3.5 w-3.5" aria-hidden />
            Public page:
            <Link
              href={`/employers/${publicSlug}`}
              className="font-medium text-primary-600 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded"
            >
              /employers/{publicSlug}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
