"use client";

import Link from "next/link";
import { CalendarSearch } from "lucide-react";

export function BookingEmptyState({
  title,
  description,
  ctaHref,
  ctaLabel,
}: {
  title: string;
  description: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-12 text-center">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-white ring-1 ring-neutral-200">
        <CalendarSearch className="h-5 w-5 text-neutral-400" aria-hidden />
      </div>
      <p className="mt-3 text-sm font-bold text-neutral-700">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-xs text-neutral-500">{description}</p>
      {ctaHref && ctaLabel && (
        <Link
          href={ctaHref}
          className="mt-4 inline-flex rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}