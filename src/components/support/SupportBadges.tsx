"use client";

import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  supportCategoryLabel,
  supportCategoryVariant,
  supportStatusLabel,
  supportStatusVariant,
} from "@/components/admin/support/support-meta";
import { SUPPORT_STATUS_EXPLAINERS } from "@/config/support";
import { cn } from "@/lib/utils";
import type {
  SupportTicketCategory,
  SupportTicketStatus,
} from "@/types/admin";

/**
 * Customer-facing support badges. These intentionally reuse the canonical
 * Module 56 vocabulary (same labels/variants as the admin console) so a
 * status means the same thing on both sides of the counter. Only the
 * customer-appropriate subset is exposed.
 */

export function SupportStatusBadge({
  status,
  className,
}: {
  status: SupportTicketStatus;
  className?: string;
}) {
  return (
    <StatusBadge
      variant={supportStatusVariant(status)}
      label={supportStatusLabel(status)}
      className={className}
    />
  );
}

export function SupportCategoryBadge({
  category,
  className,
}: {
  category: SupportTicketCategory;
  className?: string;
}) {
  return (
    <StatusBadge
      variant={supportCategoryVariant(category)}
      label={supportCategoryLabel(category)}
      dot={false}
      className={className}
    />
  );
}

/** One-line, plain-language explanation of what a status means. */
export function SupportStatusExplainer({
  status,
  className,
}: {
  status: SupportTicketStatus;
  className?: string;
}) {
  return (
    <p className={cn("text-xs text-kampmax-text-secondary", className)}>
      {SUPPORT_STATUS_EXPLAINERS[status]}
    </p>
  );
}