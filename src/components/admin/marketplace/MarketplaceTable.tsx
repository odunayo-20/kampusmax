"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  BadgeCheck,
  Boxes,
  ExternalLink,
  Eye,
  MoreVertical,
  Store,
} from "lucide-react";
import { cn, formatDate, formatNaira, formatNairaCompact } from "@/lib/utils";
import { EmptyState } from "@/components/admin/EmptyState";
import { ErrorState } from "@/components/admin/ErrorState";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import type { MarketplaceListingRow, Paginated, SortDir } from "@/types/admin";
import type { MarketplaceSortField } from "@/services/admin";
import {
  ListingStatusBadge,
  ListingThumb,
  PublicationBadge,
  VisibilityBadge,
} from "./MarketplaceBadges";

interface MarketplaceTableProps {
  page: Paginated<MarketplaceListingRow> | null;
  loading: boolean;
  error: boolean;
  sortBy: MarketplaceSortField;
  sortDir: SortDir;
  onSort: (field: MarketplaceSortField) => void;
  onRetry: () => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export function MarketplaceTable({
  page,
  loading,
  error,
  sortBy,
  sortDir,
  onSort,
  onRetry,
  hasActiveFilters,
  onClearFilters,
}: MarketplaceTableProps) {
  const router = useRouter();

  if (loading && !page) {
    return <LoadingSkeleton variant="table" rows={6} />;
  }

  if (error && !page) {
    return <ErrorState onRetry={onRetry} />;
  }

  if (!page || page.items.length === 0) {
    return (
      <div className="rounded-lg border border-kampmax-border bg-white p-4">
        <EmptyState
          title="No listings found"
          message={
            hasActiveFilters
              ? "No listings match the current search and filters."
              : "Marketplace listings will appear here."
          }
          action={
            hasActiveFilters ? (
              <button
                type="button"
                onClick={onClearFilters}
                className="inline-flex h-9 items-center rounded-md border border-kampmax-border bg-white px-3 text-sm font-medium text-kampmax-text transition-colors hover:bg-kampmax-muted/60"
              >
                Clear filters
              </button>
            ) : undefined
          }
        />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-kampmax-border bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1280px] text-sm">
          <thead>
            <tr className="border-b border-kampmax-border bg-kampmax-muted/50 text-left text-xs uppercase tracking-wide text-kampmax-text-secondary">
              <SortableTh
                label="Listing"
                active={sortBy === "name"}
                dir={sortDir}
                onClick={() => onSort("name")}
              />
              <Th>Vendor</Th>
              <Th>Campus</Th>
              <Th>Category</Th>
              <Th>Status</Th>
              <Th>Visibility</Th>
              <Th>Publication</Th>
              <SortableTh
                label="Price"
                active={sortBy === "price"}
                dir={sortDir}
                onClick={() => onSort("price")}
              />
              <SortableTh
                label="Rating"
                active={sortBy === "rating"}
                dir={sortDir}
                onClick={() => onSort("rating")}
              />
              <SortableTh
                label="Views"
                active={sortBy === "viewCount"}
                dir={sortDir}
                onClick={() => onSort("viewCount")}
                className="hidden xl:table-cell"
              />
              <SortableTh
                label="Listed"
                active={sortBy === "createdAt"}
                dir={sortDir}
                onClick={() => onSort("createdAt")}
              />
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-kampmax-border/70">
            {page.items.map((listing) => (
              <Row
                key={listing.id}
                listing={listing}
                onOpen={() => router.push(`/admin/marketplace/${listing.id}`)}
              />
            ))}
          </tbody>
        </table>
      </div>

      <p className="sr-only" aria-live="polite">
        Showing {page.items.length} of {page.total} listings, page {page.page} of{" "}
        {page.totalPages}.
      </p>
    </div>
  );
}

// ------------------------------------------------------------
// Header cells
// ------------------------------------------------------------

function Th({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      scope="col"
      className={cn("whitespace-nowrap px-4 py-2.5 font-medium", className)}
    >
      {children}
    </th>
  );
}

function SortableTh({
  label,
  active,
  dir,
  onClick,
  className,
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
  className?: string;
}) {
  const Icon = !active ? ArrowUpDown : dir === "asc" ? ArrowUp : ArrowDown;
  return (
    <th
      scope="col"
      aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"}
      className={cn("px-4 py-2.5 font-medium", className)}
    >
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "inline-flex items-center gap-1 whitespace-nowrap uppercase tracking-wide transition-colors hover:text-kampmax-text",
          active && "text-kampmax-text"
        )}
      >
        {label}
        <Icon
          className={cn("h-3 w-3", active ? "text-kampmax-blue" : "opacity-50")}
        />
      </button>
    </th>
  );
}

// ------------------------------------------------------------
// Rows
// ------------------------------------------------------------

function Row({ listing, onOpen }: { listing: MarketplaceListingRow; onOpen: () => void }) {
  return (
    <tr className="group transition-colors hover:bg-kampmax-muted/40">
      {/* Listing */}
      <td className="px-4 py-2.5">
        <button
          type="button"
          onClick={onOpen}
          title={`Open ${listing.title}`}
          className="flex items-center gap-2.5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-kampmax-blue"
        >
          <ListingThumb src={listing.images[0]} alt={listing.title} />
          <span className="min-w-0">
            <span className="block max-w-[230px] truncate font-medium text-kampmax-text group-hover:text-kampmax-blue">
              {listing.title}
            </span>
            <span className="flex items-center gap-2 font-mono text-[11px] text-kampmax-text-secondary">
              {listing.id}
              <span className="inline-flex items-center gap-0.5 font-sans tabular-nums">
                <Eye className="h-3 w-3" aria-hidden />
                {listing.viewCount?.toLocaleString("en-NG") ?? "—"}
              </span>
            </span>
          </span>
        </button>
      </td>

      {/* Vendor */}
      <td className="max-w-[170px] px-4 py-2.5">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-kampmax-text-secondary">{listing.vendorName}</span>
          {listing.vendorVerified && (
            <BadgeCheck aria-label="Verified seller" className="h-3.5 w-3.5 shrink-0 text-kampmax-success" />
          )}
        </span>
      </td>

      {/* Campus */}
      <td className="whitespace-nowrap px-4 py-2.5 text-xs font-medium text-kampmax-text-secondary">
        {listing.campusAbbr}
      </td>

      {/* Category */}
      <td className="whitespace-nowrap px-4 py-2.5 text-kampmax-text-secondary">
        {listing.categoryName}
      </td>

      {/* Status */}
      <td className="px-4 py-2.5">
        <ListingStatusBadge status={listing.status} />
      </td>

      {/* Visibility */}
      <td className="px-4 py-2.5">
        <VisibilityBadge visibility={listing.visibility} />
      </td>

      {/* Publication */}
      <td className="px-4 py-2.5">
        <PublicationBadge publication={listing.publishedStatus} />
      </td>

      {/* Price */}
      <td className="whitespace-nowrap px-4 py-2.5 font-medium tabular-nums text-kampmax-text">
        {formatNaira(listing.price)}
        {listing.originalPrice !== null && (
          <span className="ml-1 text-[11px] font-normal text-kampmax-text-secondary/70 line-through">
            {formatNairaCompact(listing.originalPrice)}
          </span>
        )}
      </td>

      {/* Rating */}
      <td className="whitespace-nowrap px-4 py-2.5">
        <span className="inline-flex items-center gap-1 tabular-nums text-kampmax-text-secondary">
          <span aria-hidden className="text-kampmax-gold-dark">★</span>
          {listing.rating !== null ? listing.rating.toFixed(1) : "—"}
          {listing.ratingCount !== null && (
            <span className="text-[11px] text-kampmax-text-secondary/70">
              ({listing.ratingCount})
            </span>
          )}
        </span>
      </td>

      {/* Views */}
      <td className="hidden whitespace-nowrap px-4 py-2.5 tabular-nums text-kampmax-text-secondary xl:table-cell">
        {listing.viewCount?.toLocaleString("en-NG") ?? "—"}
      </td>

      {/* Listed */}
      <td className="whitespace-nowrap px-4 py-2.5">
        <span className="block tabular-nums text-kampmax-text-secondary">
          {formatDate(listing.createdAt)}
        </span>
        {listing.updatedAt && (
          <span className="block text-[11px] text-kampmax-text-secondary/70">
            Updated {formatDate(listing.updatedAt)}
          </span>
        )}
      </td>

      {/* Actions */}
      <td className="px-4 py-2.5 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={onOpen}
            className="inline-flex h-8 items-center rounded-md border border-kampmax-border bg-white px-2.5 text-xs font-medium text-kampmax-text transition-colors hover:bg-kampmax-muted"
          >
            Inspect
          </button>
          <RowActionsMenu listing={listing} onOpen={onOpen} />
        </div>
      </td>
    </tr>
  );
}

// ------------------------------------------------------------
// Row kebab menu (fixed-position so table overflow can't clip it)
// ------------------------------------------------------------

const MENU_WIDTH = 230;

function RowActionsMenu({
  listing,
  onOpen,
}: {
  listing: MarketplaceListingRow;
  onOpen: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (btnRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function toggle() {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const left = Math.max(
        8,
        Math.min(rect.right - MENU_WIDTH, window.innerWidth - MENU_WIDTH - 8)
      );
      const below = rect.bottom + 6;
      const top =
        below + 220 > window.innerHeight && rect.top - 240 > 0 ? rect.top - 240 : below;
      setCoords({ top, left });
    }
    setOpen((v) => !v);
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Actions for ${listing.title}`}
        onClick={toggle}
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-md text-kampmax-text-secondary transition-colors hover:bg-kampmax-muted hover:text-kampmax-text",
          open && "bg-kampmax-muted text-kampmax-text"
        )}
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && coords && (
        <div
          ref={menuRef}
          role="menu"
          aria-label={`${listing.title} actions`}
          style={{ top: coords.top, left: coords.left, width: MENU_WIDTH }}
          className="fixed z-50 overflow-hidden rounded-lg border border-kampmax-border bg-white py-1 shadow-lg"
        >
          <MenuItem
            icon={Boxes}
            label="Full listing"
            onClick={() => {
              setOpen(false);
              onOpen();
            }}
          />
          <MenuItem
            icon={ExternalLink}
            label="View public listing"
            onClick={() => {
              setOpen(false);
              window.open(`/marketplace/${listing.id}`, "_blank", "noopener,noreferrer");
            }}
          />
          <MenuItem
            icon={Store}
            label={`Open ${listing.vendorName} profile`}
            onClick={() => {
              setOpen(false);
              window.open(`/admin/vendors/${listing.vendorId}`, "_blank", "noopener,noreferrer");
            }}
          />
        </div>
      )}
    </>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Boxes;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] font-medium text-kampmax-text transition-colors hover:bg-kampmax-muted"
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  );
}