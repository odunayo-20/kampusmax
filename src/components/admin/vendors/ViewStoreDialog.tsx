"use client";

import { useEffect } from "react";
import { ExternalLink, MapPin, Package, Star, X } from "lucide-react";
import { cn, formatNaira, formatNairaCompact, timeAgo } from "@/lib/utils";
import type { ManagedVendor } from "@/types/admin";
import { StoreAvatar, StoreStatusBadge, VerificationBadge } from "./VendorBadges";

interface ViewStoreDialogProps {
  open: boolean;
  vendor: ManagedVendor | null;
  campusName?: string;
  onClose: () => void;
  onOpenProfile: (vendorId: string) => void;
}

/**
 * Storefront preview - what the vendor's public presence looks like
 * without leaving the console.
 */
export function ViewStoreDialog({
  open,
  vendor,
  campusName,
  onClose,
  onOpenProfile,
}: ViewStoreDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || !vendor) return null;

  const stats = [
    { label: "Products", value: vendor.productsCount.toLocaleString("en-NG"), icon: Package },
    { label: "Orders fulfilled", value: vendor.ordersCount.toLocaleString("en-NG") },
    {
      label: "Lifetime sales",
      value: formatNairaCompact(vendor.totalSales),
    },
    { label: "Rating", value: `${vendor.rating.toFixed(1)} / 5`, icon: Star },
  ];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="view-store-title"
    >
      <button
        type="button"
        aria-label="Close dialog"
        tabIndex={-1}
        className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
        onClick={onClose}
      />

      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-kampmax-border bg-white shadow-xl">
        {/* Banner */}
        <div className="relative h-20 shrink-0 bg-gradient-to-r from-kampmax-navy via-kampmax-blue to-kampmax-info">
          <div className="absolute -bottom-7 left-5">
            <div className="rounded-xl ring-4 ring-white">
              <StoreAvatar vendor={vendor} size="xl" />
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 rounded-md bg-white/15 p-1 text-white transition-colors hover:bg-white/30"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Identity */}
        <div className="shrink-0 px-5 pt-10">
          <h2 id="view-store-title" className="text-base font-semibold text-kampmax-text">
            {vendor.storeName}
          </h2>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-kampmax-text-secondary">
            <span>{vendor.category}</span>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {campusName ?? vendor.campusId}
            </span>
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <VerificationBadge status={vendor.verificationStatus} />
            <StoreStatusBadge status={vendor.storeStatus} />
          </div>
          <p className="mt-3 border-l-2 border-kampmax-muted pl-3 text-sm leading-relaxed text-kampmax-text-secondary">
            “{vendor.description}”
          </p>
        </div>

        {/* Stats */}
        <div className="grid shrink-0 grid-cols-2 gap-2 px-5 py-4 sm:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-lg border border-kampmax-border bg-kampmax-muted/40 px-3 py-2"
            >
              <p className="text-[11px] uppercase tracking-wide text-kampmax-text-secondary">
                {s.label}
              </p>
              <p className="mt-0.5 truncate text-sm font-semibold tabular-nums text-kampmax-text">
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className={cn(
          "flex shrink-0 items-center justify-between gap-3 border-t border-kampmax-border bg-kampmax-muted/30 px-5 py-3",
        )}>
          <p className="text-xs text-kampmax-text-secondary">
            Last active {timeAgo(vendor.lastActiveAt)}
          </p>
          <div className="flex items-center gap-2">
            <span className="hidden text-xs tabular-nums text-kampmax-text-secondary sm:inline">
              Wallet {formatNaira(vendor.walletBalance)}
            </span>
            <button
              type="button"
              onClick={() => onOpenProfile(vendor.id)}
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-kampmax-blue px-3 text-xs font-medium text-white transition-colors hover:bg-kampmax-blue-dark"
            >
              Open full profile
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
