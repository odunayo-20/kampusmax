"use client";

import { StatusBadge } from "@/components/admin/StatusBadge";
import type {
  ManagedVerificationApplicantType,
  ManagedVerificationStatus,
  ManagedVerificationType,
} from "@/types/admin";
import {
  applicantTypeLabel,
  applicantTypeVariant,
  verificationStatusVariant,
  verificationStatusLabel,
  verificationTypeLabel,
  verificationTypeVariant,
} from "./verifications-meta";

export function VerificationStatusBadge({
  status,
  className,
}: {
  status: ManagedVerificationStatus;
  className?: string;
}) {
  return (
    <StatusBadge
      variant={verificationStatusVariant(status)}
      label={verificationStatusLabel(status)}
      className={className}
    />
  );
}

export function VerificationApplicantTypeBadge({
  type,
  className,
}: {
  type: ManagedVerificationApplicantType;
  className?: string;
}) {
  return (
    <StatusBadge
      variant={applicantTypeVariant(type)}
      label={applicantTypeLabel(type)}
      className={className}
    />
  );
}

export function VerificationTypeBadge({
  type,
  className,
}: {
  type: ManagedVerificationType | null;
  className?: string;
}) {
  if (!type) {
    return (
      <StatusBadge variant="neutral" label="—" className={className} />
    );
  }
  return (
    <StatusBadge
      variant={verificationTypeVariant(type)}
      label={verificationTypeLabel(type)}
      className={className}
    />
  );
}
