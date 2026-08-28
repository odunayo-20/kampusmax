"use client";

import Link from "next/link";
import { ExternalLink, Store } from "lucide-react";
import { VendorStatusBadge } from "./VendorStatusBadge";
import { ProfileSwitcher } from "./ProfileSwitcher";
import { VendorNotifications } from "./VendorNotifications";

export function VendorTopbar({
  storeName,
  storeSlug,
}: {
  storeName: string;
  storeSlug?: string;
}) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-kampmax-border bg-white px-4 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <span className="truncate text-sm font-bold text-kampmax-text">{storeName}</span>
        <VendorStatusBadge status="APPROVED" className="hidden sm:inline-flex" />
      </div>
      <div className="flex items-center gap-2">
        <VendorNotifications />
        <Link
          href={storeSlug ? `/store/${storeSlug}` : "/vendor"}
          className="inline-flex items-center gap-1.5 rounded-md border border-kampmax-border px-3 py-1.5 text-sm font-medium text-kampmax-text hover:bg-neutral-50"
        >
          <Store className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">View Store</span>
          <ExternalLink className="hidden h-3.5 w-3.5 sm:inline" aria-hidden />
        </Link>
        <ProfileSwitcher />
      </div>
    </header>
  );
}
