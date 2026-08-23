"use client";

import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type {
  CampusAdminAssignment,
  CampusStatus,
  ManagedCampus,
} from "@/types/admin";
import {
  assignmentStatusBadgeVariant,
  campusStatusLabel,
  campusStatusBadgeVariant,
  logoTint,
} from "./campuses-meta";

// ------------------------------------------------------------
// CampusAvatar - logo image, emoji or shortName monogram tile
// ------------------------------------------------------------

export function CampusAvatar({
  campus,
  size = "md",
}: {
  campus: Pick<ManagedCampus, "id" | "shortName" | "logo">;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const dims = {
    sm: "h-8 w-8 text-[10px]",
    md: "h-9 w-9 text-[11px]",
    lg: "h-12 w-12 text-sm",
    xl: "h-14 w-14 text-base",
  }[size];

  const isImageUrl =
    !!campus.logo && /^(https?:\/\/|\/|data:image)/.test(campus.logo);

  return (
    <div
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-lg font-bold",
        logoTint(campus.id),
        dims
      )}
    >
      {isImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={campus.logo!}
          alt=""
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="leading-none">
          {campus.logo?.trim() || campus.shortName.slice(0, 4)}
        </span>
      )}
    </div>
  );
}

// ------------------------------------------------------------
// Status badges
// ------------------------------------------------------------

export function CampusStatusBadge({ status }: { status: CampusStatus }) {
  return (
    <StatusBadge
      variant={campusStatusBadgeVariant(status)}
      label={campusStatusLabel(status)}
    />
  );
}

export function AdminAssignmentBadge({
  status,
}: {
  status: CampusAdminAssignment["status"];
}) {
  return (
    <StatusBadge
      variant={assignmentStatusBadgeVariant(status)}
      label={status === "active" ? "Active admin" : "Invite sent"}
    />
  );
}
