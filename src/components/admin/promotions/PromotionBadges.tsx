"use client";

import { Ticket } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  PROMOTION_TYPE_ICONS,
  promotionStatusBadgeVariant,
  promotionStatusLabel,
  promotionTypeBadgeVariant,
  promotionTypeLabel,
} from "./promotions-meta";
import type { ManagedPromotionStatus, ManagedPromotionType } from "@/types/admin";

const TYPE_TINTS: Record<ManagedPromotionType, string> = {
  percentage_discount: "bg-kampmax-blue/10 text-kampmax-blue",
  fixed_discount: "bg-kampmax-gold/20 text-kampmax-gold-dark",
  promo_code: "bg-sky-100 text-sky-700",
  featured_product: "bg-amber-100 text-amber-700",
  featured_vendor: "bg-emerald-100 text-emerald-700",
  campus_promotion: "bg-violet-100 text-violet-700",
};

export function PromotionTypeIcon({
  type,
  size = "md",
}: {
  type: ManagedPromotionType;
  size?: "sm" | "md";
}) {
  const Icon = PROMOTION_TYPE_ICONS[type] ?? Ticket;
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg",
        TYPE_TINTS[type],
        size === "sm" ? "h-7 w-7 rounded-md" : "h-9 w-9"
      )}
    >
      <Icon className={size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5"} />
    </span>
  );
}

export function PromotionTypeBadge({ type }: { type: ManagedPromotionType }) {
  return (
    <StatusBadge
      variant={promotionTypeBadgeVariant(type)}
      label={promotionTypeLabel(type)}
    />
  );
}

export function PromotionStatusBadge({
  status,
}: {
  status: ManagedPromotionStatus;
}) {
  return (
    <StatusBadge
      variant={promotionStatusBadgeVariant(status)}
      label={promotionStatusLabel(status)}
    />
  );
}
