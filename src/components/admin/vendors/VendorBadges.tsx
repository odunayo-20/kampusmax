"use client";

import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type {
  ManagedVendor,
  VendorStoreLifecycle,
  VendorVerificationStatus,
} from "@/types/admin";
import {
  storeStatusBadgeVariant,
  storeStatusLabel,
  verificationBadgeVariant,
  verificationLabel,
} from "./vendors-meta";

// ------------------------------------------------------------
// StoreAvatar - storefront tile (monogram from the store name)
// ------------------------------------------------------------

const STORE_TINTS = [
  "bg-kampmax-blue/15 text-kampmax-blue",
  "bg-kampmax-gold/20 text-kampmax-gold-dark",
  "bg-kampmax-success/10 text-kampmax-success",
  "bg-kampmax-info/10 text-kampmax-info",
  "bg-rose-100 text-rose-600",
  "bg-violet-100 text-violet-600",
];

function storeTint(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return STORE_TINTS[hash % STORE_TINTS.length];
}

export function StoreAvatar({
  vendor,
  size = "md",
}: {
  vendor: Pick<ManagedVendor, "id" | "storeName">;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const dims = {
    sm: "h-8 w-8 text-[10px]",
    md: "h-9 w-9 text-[11px]",
    lg: "h-12 w-12 text-sm",
    xl: "h-14 w-14 text-base",
  }[size];

  const words = vendor.storeName.split(/\s+/).filter(Boolean);

  return (
    <div
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-lg font-bold leading-none",
        storeTint(vendor.id),
        dims
      )}
    >
      <span>
        {(words.length > 1 ? words : [vendor.storeName.slice(0, 4)])
          .slice(0, 2)
          .map((w) => w.charAt(0).toUpperCase())
          .join("")}
      </span>
    </div>
  );
}

// ------------------------------------------------------------
// Owner avatar chip
// ------------------------------------------------------------

export function OwnerAvatar({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
  return (
    <span
      aria-hidden
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-kampmax-muted text-[10px] font-semibold text-kampmax-text-secondary"
    >
      {initials}
    </span>
  );
}

// ------------------------------------------------------------
// Status badges
// ------------------------------------------------------------

export function VerificationBadge({
  status,
}: {
  status: VendorVerificationStatus;
}) {
  return (
    <StatusBadge
      variant={verificationBadgeVariant(status)}
      label={verificationLabel(status)}
    />
  );
}

export function StoreStatusBadge({
  status,
}: {
  status: VendorStoreLifecycle;
}) {
  return (
    <StatusBadge
      variant={storeStatusBadgeVariant(status)}
      label={storeStatusLabel(status)}
    />
  );
}
