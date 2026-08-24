"use client";

import { useEffect } from "react";
import { BadgeCheck, BadgeX, ExternalLink, Mail, Phone, X } from "lucide-react";
import { formatDate, formatNaira } from "@/lib/utils";
import type { ManagedVendor } from "@/types/admin";

interface ViewOwnerDialogProps {
  open: boolean;
  vendor: ManagedVendor | null;
  onClose: () => void;
  onOpenProfile: (vendorId: string) => void;
}

/**
 * Owner identity card - who is behind the store. Self-contained
 * (owner records are not shared with the users directory).
 */
export function ViewOwnerDialog({
  open,
  vendor,
  onClose,
  onOpenProfile,
}: ViewOwnerDialogProps) {
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

  const owner = vendor.owner;
  const ownerInitials = owner.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  const rows = [
    {
      label: "Email",
      value: owner.email,
      icon: Mail,
      href: `mailto:${owner.email}`,
    },
    {
      label: "Phone",
      value: owner.phone,
      icon: Phone,
      href: `tel:${owner.phone.replace(/\s+/g, "")}`,
    },
    { label: "Joined Kampmax", value: formatDate(owner.joinedAt) },
    {
      label: "Purchases as a buyer",
      value: `${owner.ordersCount.toLocaleString("en-NG")} orders · ${formatNaira(owner.totalSpent)}`,
    },
    {
      label: "Stores owned",
      value: "1 store",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="view-owner-title"
    >
      <button
        type="button"
        aria-label="Close dialog"
        tabIndex={-1}
        className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
        onClick={onClose}
      />

      <div className="relative flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-xl border border-kampmax-border bg-white shadow-xl">
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-kampmax-border px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-kampmax-blue/10 text-sm font-bold text-kampmax-blue">
              {ownerInitials}
            </span>
            <div className="min-w-0">
              <h2 id="view-owner-title" className="truncate text-sm font-semibold text-kampmax-text">
                {owner.name}
              </h2>
              <p className="text-xs text-kampmax-text-secondary">
                Store owner · {vendor.storeName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-kampmax-text-secondary transition-colors hover:bg-kampmax-muted hover:text-kampmax-text"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <dl className="flex-1 divide-y divide-kampmax-border/70 overflow-y-auto px-5 py-2">
          {rows.map((row) => (
            <div key={row.label} className="flex items-start justify-between gap-4 py-2.5 text-sm">
              <dt className="shrink-0 text-kampmax-text-secondary">{row.label}</dt>
              <dd className="text-right font-medium text-kampmax-text">
                {row.href ? (
                  <a
                    href={row.href}
                    className="inline-flex items-center gap-1 break-all transition-colors hover:text-kampmax-blue"
                  >
                    {row.value}
                  </a>
                ) : (
                  row.value
                )}
              </dd>
            </div>
          ))}

          {/* ID verification */}
          <div className="flex items-center justify-between gap-4 py-2.5 text-sm">
            <dt className="text-kampmax-text-secondary">Identity</dt>
            <dd>
              {owner.isIdVerified ? (
                <span className="inline-flex items-center gap-1.5 font-medium text-kampmax-success">
                  <BadgeCheck className="h-4 w-4" />
                  ID verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 font-medium text-kampmax-warning">
                  <BadgeX className="h-4 w-4" />
                  Not verified
                </span>
              )}
            </dd>
          </div>
        </dl>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-kampmax-border bg-kampmax-muted/30 px-5 py-3">
          <span className="font-mono text-[11px] text-kampmax-text-secondary">
            {owner.id}
          </span>
          <button
            type="button"
            onClick={() => onOpenProfile(vendor.id)}
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-kampmax-blue px-3 text-xs font-medium text-white transition-colors hover:bg-kampmax-blue-dark"
          >
            Back to vendor profile
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
