"use client";

import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  categoryIcon,
  categoryStatusBadgeVariant,
  categoryStatusLabel,
} from "./categories-meta";
import type { ManagedCategory } from "@/types/admin";

const TINTS = [
  "bg-kampmax-blue/15 text-kampmax-blue",
  "bg-kampmax-gold/20 text-kampmax-gold-dark",
  "bg-kampmax-success/10 text-kampmax-success",
  "bg-kampmax-info/10 text-kampmax-info",
  "bg-rose-100 text-rose-600",
  "bg-violet-100 text-violet-600",
];

function tintFor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return TINTS[hash % TINTS.length];
}

export function CategoryAvatar({
  category,
  size = "md",
}: {
  category: Pick<ManagedCategory, "id" | "name" | "icon">;
  size?: "sm" | "md";
}) {
  const Icon = categoryIcon(category.icon);
  return (
    <span
      aria-hidden
      title={category.name}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg",
        tintFor(category.id),
        size === "sm" ? "h-7 w-7 rounded-md" : "h-9 w-9"
      )}
    >
      <Icon className={size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5"} />
    </span>
  );
}

export function CategoryStatusBadge({
  status,
}: {
  status: ManagedCategory["status"];
}) {
  return (
    <StatusBadge
      variant={categoryStatusBadgeVariant(status)}
      label={categoryStatusLabel(status)}
    />
  );
}
