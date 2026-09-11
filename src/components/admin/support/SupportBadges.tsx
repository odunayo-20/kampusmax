"use client";

import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  supportCategoryLabel,
  supportCategoryVariant,
  supportPriorityLabel,
  supportPriorityVariant,
  supportStatusLabel,
  supportStatusVariant,
} from "./support-meta";
import type {
  SupportTicketCategory,
  SupportTicketPriority,
  SupportTicketStatus,
} from "@/types/admin";

export function SupportStatusBadge({ status }: { status: SupportTicketStatus }) {
  return (
    <StatusBadge
      variant={supportStatusVariant(status)}
      label={supportStatusLabel(status)}
    />
  );
}

export function SupportPriorityBadge({
  priority,
}: {
  priority: SupportTicketPriority;
}) {
  return (
    <StatusBadge
      variant={supportPriorityVariant(priority)}
      label={supportPriorityLabel(priority)}
    />
  );
}

export function SupportCategoryBadge({
  category,
}: {
  category: SupportTicketCategory;
}) {
  return (
    <StatusBadge
      variant={supportCategoryVariant(category)}
      label={supportCategoryLabel(category)}
    />
  );
}