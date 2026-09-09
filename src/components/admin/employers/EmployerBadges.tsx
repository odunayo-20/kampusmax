"use client";

import { StatusBadge } from "@/components/admin/StatusBadge";
import { cn } from "@/lib/utils";
import type {
  EmployerConsoleStatus,
  EmployerHiringStatus,
  ManagedEmployer,
} from "@/types/admin";
import {
  employerHiringBadgeVariant,
  employerHiringLabel,
  employerStatusBadgeVariant,
  employerStatusLabel,
  employerVerificationBadgeVariant,
} from "./employers-meta";
import { EMPLOYER_VERIFICATION_LABELS } from "./employers-meta";

export function EmployerStatusBadge({ status, className }: { status: EmployerConsoleStatus; className?: string }) {
  return (
    <StatusBadge
      variant={employerStatusBadgeVariant(status)}
      label={employerStatusLabel(status)}
      dot
      className={cn("gap-1.5", className)}
    />
  );
}

export function EmployerVerificationBadge({ status, className }: { status: string | null; className?: string }) {
  if (!status) {
    return (
      <StatusBadge
        variant="neutral"
        label="No verification"
        dot
        className={cn("gap-1.5", className)}
      />
    );
  }
  return (
    <StatusBadge
      variant={employerVerificationBadgeVariant(status)}
      label={EMPLOYER_VERIFICATION_LABELS[status] ?? status}
      dot
      className={cn("gap-1.5", className)}
    />
  );
}

export function EmployerHiringBadge({ status, className }: { status: EmployerHiringStatus; className?: string }) {
  return (
    <StatusBadge
      variant={employerHiringBadgeVariant(status)}
      label={employerHiringLabel(status)}
      dot
      className={cn("gap-1.5", className)}
    />
  );
}

export function EmployerAvatar({ name, className }: { name: string; className?: string }) {
  const fallback = name.trim() || "?";
  const initials = fallback
    .split(/\s+/)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full bg-kampmax-navy/10 text-kampmax-navy font-medium text-sm",
        className
      )}
      aria-label={name}
    >
      {initials}
    </div>
  );
}

export function EmployerProfileCell({ employer }: { employer: ManagedEmployer }) {
  return (
    <div className="flex items-center gap-3">
      <EmployerAvatar name={employer.name} />
      <div className="min-w-0">
        <p className="truncate font-medium text-kampmax-text-primary">{employer.name}</p>
        <p className="truncate text-sm text-kampmax-text-secondary">
          {employer.descriptor || "No descriptor"}
        </p>
      </div>
    </div>
  );
}