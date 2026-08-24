"use client";

import { useState } from "react";
import { PackageX } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { ManagedProduct } from "@/types/admin";
import { productManagementStatusVariant, productStatusLabel } from "./products-meta";

// ------------------------------------------------------------
// ProductThumb - primary image with graceful fallback
// ------------------------------------------------------------

export function ProductThumb({
  product,
  size = "md",
}: {
  product: Pick<ManagedProduct, "id" | "title" | "images">;
  size?: "sm" | "md" | "lg";
}) {
  const [failed, setFailed] = useState(false);
  const dims = {
    sm: "h-9 w-9",
    md: "h-11 w-11",
    lg: "h-14 w-14",
  }[size];

  return (
    <div
      aria-hidden
      className={cn(
        "relative shrink-0 overflow-hidden rounded-lg border border-kampmax-border bg-kampmax-muted/60",
        dims
      )}
    >
      {product.images[0] && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={product.images[0]}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-kampmax-text-secondary/50">
          <PackageX className="h-4 w-4" />
        </span>
      )}
    </div>
  );
}

// ------------------------------------------------------------
// Status badge
// ------------------------------------------------------------

export function ProductStatusBadge({ status }: { status: ManagedProduct["status"] }) {
  return (
    <StatusBadge
      variant={productManagementStatusVariant(status)}
      label={productStatusLabel(status)}
    />
  );
}
