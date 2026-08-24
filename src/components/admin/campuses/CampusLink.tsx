"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { mockCampuses } from "@/data/admin/campuses";

/** Small cross-module helper: resolves a campus id to a named deep-link. */
export function CampusLink({ campusId }: { campusId: string }) {
  const campus = mockCampuses.find((c) => c.id === campusId);
  return (
    <Link
      href={`/admin/campuses/${campusId}`}
      className="inline-flex items-center gap-1 text-xs font-medium text-kampmax-blue hover:underline"
    >
      <MapPin className="h-3 w-3 opacity-60" />
      {campus?.name ?? campusId}
    </Link>
  );
}
