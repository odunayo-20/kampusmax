"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type {
  MarketplaceListingRow,
  MarketplaceVisibility,
  ProductStatusCompat,
} from "@/types/admin";
import {
  publicationBadgeVariant,
  statusBadgeVariant,
  visibilityBadgeVariant,
} from "./marketplace-meta";

export function ListingStatusBadge({
  status,
  className,
}: {
  status: ProductStatusCompat;
  className?: string;
}) {
  return <StatusBadge variant={statusBadgeVariant(status)} label={status} className={className} />;
}

export function VisibilityBadge({
  visibility,
  className,
}: {
  visibility: MarketplaceVisibility;
  className?: string;
}) {
  return (
    <StatusBadge
      variant={visibilityBadgeVariant(visibility)}
      label={visibility}
      className={className}
    />
  );
}

export function PublicationBadge({
  publication,
  className,
}: {
  publication: MarketplaceListingRow["publishedStatus"];
  className?: string;
}) {
  return (
    <StatusBadge
      variant={publicationBadgeVariant(publication)}
      label={publication ?? "Not recorded"}
      className={className}
    />
  );
}

/** Secure thumbnail with graceful placeholder fallback. */
export function ListingThumb({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [errored, setErrored] = useState(false);
  return (
    <span
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-kampmax-muted",
        className
      )}
    >
      {errored || !src ? (
        <ImageOff aria-hidden className="h-4 w-4 text-kampmax-text-secondary/60" />
      ) : (
        <img
          src={src}
          alt={alt}
          referrerPolicy="no-referrer"
          onError={() => setErrored(true)}
          className="h-full w-full object-cover"
        />
      )}
    </span>
  );
}