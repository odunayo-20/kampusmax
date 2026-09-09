"use client";

import { StatusBadge } from "@/components/admin/StatusBadge";
import { cn } from "@/lib/utils";
import type { FreelancerConsoleStatus, ManagedFreelancer } from "@/types/admin";
import { freelancerStatusBadgeVariant, freelancerStatusLabel } from "./freelancers-meta";

export function FreelancerStatusBadge({ status, className }: { status: FreelancerConsoleStatus; className?: string }) {
  const variant = freelancerStatusBadgeVariant(status);
  const label = freelancerStatusLabel(status);

  return (
    <StatusBadge
      variant={variant}
      label={label}
      dot
      className={cn("gap-1.5", className)}
    />
  );
}

export function FreelancerAvatar({ name, className }: { name: string; className?: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full bg-kampmax-primary/10 text-kampmax-primary font-medium text-sm",
        className
      )}
      aria-label={name}
    >
      {initials}
    </div>
  );
}

export function FreelancerProfileCell({ freelancer }: { freelancer: ManagedFreelancer }) {
  return (
    <div className="flex items-center gap-3">
      <FreelancerAvatar name={freelancer.displayName} />
      <div className="min-w-0">
        <p className="truncate font-medium text-kampmax-text-primary">{freelancer.displayName}</p>
        <p className="truncate text-sm text-kampmax-text-secondary">
          {freelancer.headline || "No headline"}
        </p>
      </div>
    </div>
  );
}

export function FreelancerSkillsCell({ freelancer }: { freelancer: ManagedFreelancer }) {
  return (
    <div className="flex flex-wrap gap-1">
      {freelancer.skills.slice(0, 3).map((skill, i) => (
        <span
          key={i}
          className="inline-flex items-center rounded-full bg-kampmax-primary/10 px-2 py-0.5 text-xs text-kampmax-primary"
        >
          {skill}
        </span>
      ))}
      {freelancer.skills.length > 3 && (
        <span className="inline-flex items-center rounded-full bg-kampmax-primary/10 px-2 py-0.5 text-xs text-kampmax-primary">
          +{freelancer.skills.length - 3}
        </span>
      )}
    </div>
  );
}

export function FreelancerServicesBadge({ count, isActive }: { count: number; isActive?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-kampmax-text-primary">{count}</span>
      {isActive !== undefined && (
        <span className={cn("text-xs px-1.5 py-0.5 rounded", isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600")}>
          {isActive ? "Active" : "Inactive"}
        </span>
      )}
    </div>
  );
}