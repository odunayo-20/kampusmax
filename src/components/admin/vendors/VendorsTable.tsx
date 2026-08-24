"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  BadgeCheck,
  Eye,
  MoreVertical,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Store,
  UserRound,
} from "lucide-react";
import { cn, formatDate, formatNairaCompact } from "@/lib/utils";
import { EmptyState } from "@/components/admin/EmptyState";
import { ErrorState } from "@/components/admin/ErrorState";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import type { ManagedVendor, Paginated, SortDir } from "@/types/admin";
import type { ManagedVendorSortField } from "@/services/admin";
import { getVendorActionAvailability } from "./vendors-meta";
import {
  OwnerAvatar,
  StoreAvatar,
  StoreStatusBadge,
  VerificationBadge,
} from "./VendorBadges";

export interface VendorRowActions {
  onViewStore: (vendor: ManagedVendor) => void;
  onViewOwner: (vendor: ManagedVendor) => void;
  onReviewVerification: (vendor: ManagedVendor) => void;
  onApprove: (vendor: ManagedVendor) => void;
  onReject: (vendor: ManagedVendor) => void;
  onSuspend: (vendor: ManagedVendor) => void;
  onActivate: (vendor: ManagedVendor) => void;
  onDeactivate: (vendor: ManagedVendor) => void;
}

interface VendorsTableProps extends VendorRowActions {
  campusNames: Record<string, string>;
  page: Paginated<ManagedVendor> | null;
  loading: boolean;
  error: boolean;
  sortBy: ManagedVendorSortField;
  sortDir: SortDir;
  onSort: (field: ManagedVendorSortField) => void;
  onRetry: () => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export function VendorsTable({
  campusNames,
  page,
  loading,
  error,
  sortBy,
  sortDir,
  onSort,
  onRetry,
  hasActiveFilters,
  onClearFilters,
  ...actions
}: VendorsTableProps) {
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
          title="No vendors found"
          message={
            hasActiveFilters
              ? "No vendors match the current search and filters."
              : "Vendors registered on Kampmax will appear here."
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
        <table className="w-full min-w-[1180px] text-sm">
          <thead>
            <tr className="border-b border-kampmax-border bg-kampmax-muted/50 text-left text-xs uppercase tracking-wide text-kampmax-text-secondary">
              <SortableTh
                label="Store"
                active={sortBy === "storeName"}
                dir={sortDir}
                onClick={() => onSort("storeName")}
              />
              <Th className="hidden min-w-[170px] lg:table-cell">Owner</Th>
              <Th>Campus</Th>
              <Th className="hidden xl:table-cell">Category</Th>
              <Th>Verification</Th>
              <Th>Status</Th>
              <SortableTh
                label="Products"
                active={sortBy === "productsCount"}
                dir={sortDir}
                onClick={() => onSort("productsCount")}
              />
              <SortableTh
                label="Orders"
                active={sortBy === "ordersCount"}
                dir={sortDir}
                onClick={() => onSort("ordersCount")}
              />
              <SortableTh
                label="Sales"
                active={sortBy === "totalSales"}
                dir={sortDir}
                onClick={() => onSort("totalSales")}
                className="hidden xl:table-cell"
              />
              <SortableTh
                label="Rating"
                active={sortBy === "rating"}
                dir={sortDir}
                onClick={() => onSort("rating")}
              />
              <SortableTh
                label="Registered"
                active={sortBy === "registeredAt"}
                dir={sortDir}
                onClick={() => onSort("registeredAt")}
                className="hidden xl:table-cell"
              />
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-kampmax-border/70">
            {page.items.map((vendor) => (
              <Row
                key={vendor.id}
                vendor={vendor}
                campusName={campusNames[vendor.campusId] ?? vendor.campusId}
                onOpen={() => router.push(`/admin/vendors/${vendor.id}`)}
                {...actions}
              />
            ))}
          </tbody>
        </table>
      </div>

      <p className="sr-only" aria-live="polite">
        Showing {page.items.length} of {page.total} vendors, page {page.page} of{" "}
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

function Row({
  vendor,
  campusName,
  onOpen,
  ...actions
}: {
  vendor: ManagedVendor;
  campusName: string;
  onOpen: () => void;
} & VendorRowActions) {
  return (
    <tr className="group transition-colors hover:bg-kampmax-muted/40">
      {/* Store */}
      <td className="px-4 py-2.5">
        <button
          type="button"
          onClick={onOpen}
          title={`Open ${vendor.storeName}`}
          className="flex items-center gap-2.5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-kampmax-blue"
        >
          <StoreAvatar vendor={vendor} />
          <span className="min-w-0">
            <span className="flex max-w-[200px] items-center gap-1 truncate font-medium text-kampmax-text group-hover:text-kampmax-blue">
              {vendor.storeName}
            </span>
            <span className="block font-mono text-[11px] text-kampmax-text-secondary">
              {vendor.id}
            </span>
          </span>
        </button>
      </td>

      {/* Owner */}
      <td className="hidden max-w-[180px] px-4 py-2.5 lg:table-cell">
        <span className="flex items-center gap-1.5 truncate text-kampmax-text-secondary">
          <OwnerAvatar name={vendor.owner.name} />
          <span className="truncate">{vendor.owner.name}</span>
        </span>
      </td>

      {/* Campus */}
      <td className="max-w-[150px] truncate whitespace-nowrap px-4 py-2.5 text-kampmax-text-secondary">
        {campusName}
      </td>

      {/* Category */}
      <td className="hidden whitespace-nowrap px-4 py-2.5 text-kampmax-text-secondary xl:table-cell">
        {vendor.category}
      </td>

      {/* Verification */}
      <td className="px-4 py-2.5">
        <VerificationBadge status={vendor.verificationStatus} />
      </td>

      {/* Store status */}
      <td className="px-4 py-2.5">
        <StoreStatusBadge status={vendor.storeStatus} />
      </td>

      {/* Products */}
      <td className="whitespace-nowrap px-4 py-2.5 tabular-nums text-kampmax-text-secondary">
        {vendor.productsCount.toLocaleString("en-NG")}
      </td>

      {/* Orders */}
      <td className="whitespace-nowrap px-4 py-2.5 font-medium tabular-nums text-kampmax-text">
        {vendor.ordersCount.toLocaleString("en-NG")}
      </td>

      {/* Sales */}
      <td className="hidden whitespace-nowrap px-4 py-2.5 font-medium tabular-nums text-kampmax-text xl:table-cell">
        {formatNairaCompact(vendor.totalSales)}
      </td>

      {/* Rating */}
      <td className="whitespace-nowrap px-4 py-2.5">
        <span className="inline-flex items-center gap-1 tabular-nums text-kampmax-text-secondary">
          <span aria-hidden className="text-kampmax-gold-dark">★</span>
          {vendor.rating.toFixed(1)}
          <span className="text-[11px] text-kampmax-text-secondary/70">
            ({vendor.reviewsCount})
          </span>
        </span>
      </td>

      {/* Registered */}
      <td className="hidden whitespace-nowrap px-4 py-2.5 xl:table-cell">
        <span className="tabular-nums text-kampmax-text-secondary">
          {formatDate(vendor.registeredAt)}
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-2.5 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={onOpen}
            className="inline-flex h-8 items-center rounded-md border border-kampmax-border bg-white px-2.5 text-xs font-medium text-kampmax-text transition-colors hover:bg-kampmax-muted"
          >
            Manage
          </button>
          <RowActionsMenu vendor={vendor} onOpen={onOpen} {...actions} />
        </div>
      </td>
    </tr>
  );
}

// ------------------------------------------------------------
// Row kebab menu (fixed-position so table overflow can't clip it)
// ------------------------------------------------------------

const MENU_WIDTH = 210;

function RowActionsMenu({
  vendor,
  onOpen,
  onViewStore,
  onViewOwner,
  onReviewVerification,
  onApprove,
  onReject,
  onSuspend,
  onActivate,
  onDeactivate,
}: { vendor: ManagedVendor; onOpen: () => void } & VendorRowActions) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const availability = getVendorActionAvailability(vendor);

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
      // Menu grows to ~330px with all actions; flip above when near the bottom edge.
      const below = rect.bottom + 6;
      const top =
        below + 330 > window.innerHeight && rect.top - 340 > 0 ? rect.top - 340 : below;
      setCoords({ top, left });
    }
    setOpen((v) => !v);
  }

  function run(fn: (v: ManagedVendor) => void) {
    return () => {
      setOpen(false);
      fn(vendor);
    };
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Actions for ${vendor.storeName}`}
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
          aria-label={`${vendor.storeName} actions`}
          style={{ top: coords.top, left: coords.left, width: MENU_WIDTH }}
          className="fixed z-50 overflow-hidden rounded-lg border border-kampmax-border bg-white py-1 shadow-lg"
        >
          <MenuSectionLabel>Lifecycle</MenuSectionLabel>
          {availability.canApprove && (
            <MenuItem icon={ShieldCheck} label="Approve vendor" onClick={run(onApprove)} />
          )}
          {availability.canReject && (
            <MenuItem icon={ShieldX} label="Reject…" danger onClick={run(onReject)} />
          )}
          {availability.canReviewVerification && (
            <MenuItem
              icon={BadgeCheck}
              label="Review verification info"
              onClick={run(onReviewVerification)}
            />
          )}
          {availability.canActivate && (
            <MenuItem icon={ShieldCheck} label="Activate store" onClick={run(onActivate)} />
          )}
          {availability.canSuspend && (
            <MenuItem icon={ShieldAlert} label="Suspend store" danger onClick={run(onSuspend)} />
          )}
          {availability.canDeactivate && (
            <MenuItem icon={ShieldX} label="Deactivate store" danger onClick={run(onDeactivate)} />
          )}

          <div role="separator" className="my-1 border-t border-kampmax-border" />
          <MenuSectionLabel>Inspect</MenuSectionLabel>
          {availability.canViewStorefront && (
            <MenuItem icon={Eye} label="View store" onClick={run(onViewStore)} />
          )}
          <MenuItem icon={UserRound} label="View owner" onClick={run(onViewOwner)} />
          <MenuItem icon={Store} label="Full profile" onClick={run(onOpen)} />
        </div>
      )}
    </>
  );
}

function MenuSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 pb-0.5 pt-1.5 text-[10px] font-semibold uppercase tracking-wide text-kampmax-text-secondary/70">
      {children}
    </p>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: typeof Store;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] font-medium transition-colors",
        danger ? "text-kampmax-error hover:bg-kampmax-error/5" : "text-kampmax-text hover:bg-kampmax-muted"
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      {label}
    </button>
  );
}
