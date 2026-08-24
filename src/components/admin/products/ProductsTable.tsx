"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Archive,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  BadgeCheck,
  Eye,
  MoreVertical,
  RotateCcw,
  ShieldAlert,
  ShieldX,
} from "lucide-react";
import { cn, formatNairaCompact, timeAgo } from "@/lib/utils";
import { EmptyState } from "@/components/admin/EmptyState";
import { ErrorState } from "@/components/admin/ErrorState";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import type { ManagedProduct, Paginated, SortDir } from "@/types/admin";
import type { ManagedProductSortField } from "@/services/admin";
import { getProductActionAvailability, stockTone } from "./products-meta";
import { ProductStatusBadge, ProductThumb } from "./ProductBadges";

export interface ProductRowActions {
  onApprove: (product: ManagedProduct) => void;
  onReject: (product: ManagedProduct) => void;
  onSuspend: (product: ManagedProduct) => void;
  onArchive: (product: ManagedProduct) => void;
  onRestore: (product: ManagedProduct) => void;
}

interface ProductsTableProps extends ProductRowActions {
  campusNames: Record<string, string>;
  page: Paginated<ManagedProduct> | null;
  loading: boolean;
  error: boolean;
  sortBy: ManagedProductSortField;
  sortDir: SortDir;
  onSort: (field: ManagedProductSortField) => void;
  onRetry: () => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export function ProductsTable({
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
}: ProductsTableProps) {
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
          title="No products found"
          message={
            hasActiveFilters
              ? "No listings match the current search and filters."
              : "Vendor listings will appear here once submitted."
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
                label="Product"
                active={sortBy === "title"}
                dir={sortDir}
                onClick={() => onSort("title")}
              />
              <Th className="hidden min-w-[150px] lg:table-cell">Vendor</Th>
              <Th className="hidden xl:table-cell">Category</Th>
              <Th>Campus</Th>
              <SortableTh
                label="Price"
                active={sortBy === "price"}
                dir={sortDir}
                onClick={() => onSort("price")}
              />
              <SortableTh
                label="Stock"
                active={sortBy === "stock"}
                dir={sortDir}
                onClick={() => onSort("stock")}
              />
              <Th>Status</Th>
              <SortableTh
                label="Rating"
                active={sortBy === "rating"}
                dir={sortDir}
                onClick={() => onSort("rating")}
              />
              <SortableTh
                label="Sales"
                active={sortBy === "salesCount"}
                dir={sortDir}
                onClick={() => onSort("salesCount")}
                className="hidden xl:table-cell"
              />
              <Th className="hidden xl:table-cell">Revenue</Th>
              <SortableTh
                label="Created"
                active={sortBy === "createdAt"}
                dir={sortDir}
                onClick={() => onSort("createdAt")}
                className="hidden lg:table-cell"
              />
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-kampmax-border/70">
            {page.items.map((product) => (
              <Row
                key={product.id}
                product={product}
                campusName={campusNames[product.campusId] ?? product.campusId}
                onOpen={() => router.push(`/admin/products/${product.id}`)}
                {...actions}
              />
            ))}
          </tbody>
        </table>
      </div>

      <p className="sr-only" aria-live="polite">
        Showing {page.items.length} of {page.total} products, page {page.page}{" "}
        of {page.totalPages}.
      </p>
    </div>
  );
}

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
  product,
  campusName,
  onOpen,
  onApprove,
  onReject,
  onSuspend,
  onArchive,
  onRestore,
}: {
  product: ManagedProduct;
  campusName: string;
  onOpen: () => void;
} & ProductRowActions) {
  const tone = stockTone(product.stock);
  return (
    <tr className="group transition-colors hover:bg-kampmax-muted/40">
      {/* Product */}
      <td className="px-4 py-2.5">
        <button
          type="button"
          onClick={onOpen}
          title={`Open ${product.title}`}
          className="flex items-center gap-2.5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-kampmax-blue"
        >
          <ProductThumb product={product} />
          <span className="min-w-0">
            <span className="flex max-w-[220px] items-center gap-1 truncate font-medium text-kampmax-text group-hover:text-kampmax-blue">
              {product.title}
            </span>
            <span className="block font-mono text-[11px] text-kampmax-text-secondary">
              {product.id} · {product.condition}
            </span>
          </span>
        </button>
      </td>

      {/* Vendor */}
      <td className="hidden max-w-[170px] truncate whitespace-nowrap px-4 py-2.5 text-kampmax-text-secondary lg:table-cell">
        {product.vendorName}
      </td>

      {/* Category */}
      <td className="hidden max-w-[150px] truncate whitespace-nowrap px-4 py-2.5 text-kampmax-text-secondary xl:table-cell">
        {product.categoryName}
      </td>

      {/* Campus */}
      <td className="max-w-[110px] truncate whitespace-nowrap px-4 py-2.5 text-kampmax-text-secondary">
        {campusName}
      </td>

      {/* Price */}
      <td className="whitespace-nowrap px-4 py-2.5">
        <span className="font-medium tabular-nums text-kampmax-text">
          {formatNairaCompact(product.price)}
        </span>
        {product.originalPrice && product.originalPrice > product.price && (
          <span className="ml-1.5 text-[11px] tabular-nums text-kampmax-text-secondary/70 line-through">
            {formatNairaCompact(product.originalPrice)}
          </span>
        )}
      </td>

      {/* Stock */}
      <td className="whitespace-nowrap px-4 py-2.5">
        <span
          className={cn(
            "inline-flex items-center gap-1 font-medium tabular-nums",
            tone === "success" && "text-kampmax-success",
            tone === "warning" && "text-amber-600",
            tone === "error" && "text-kampmax-error"
          )}
        >
          {product.stock === 0 ? "Sold out" : product.stock.toLocaleString("en-NG")}
        </span>
      </td>

      {/* Status */}
      <td className="px-4 py-2.5">
        <ProductStatusBadge status={product.status} />
      </td>

      {/* Rating */}
      <td className="whitespace-nowrap px-4 py-2.5">
        <span className="inline-flex items-center gap-1 tabular-nums text-kampmax-text-secondary">
          <span aria-hidden className="text-kampmax-gold-dark">★</span>
          {product.rating.toFixed(1)}
          <span className="text-[11px] text-kampmax-text-secondary/70">
            ({product.reviewsCount})
          </span>
        </span>
      </td>

      {/* Sales */}
      <td className="hidden whitespace-nowrap px-4 py-2.5 tabular-nums text-kampmax-text-secondary xl:table-cell">
        {product.salesCount.toLocaleString("en-NG")} sold
      </td>

      {/* Revenue */}
      <td className="hidden whitespace-nowrap px-4 py-2.5 font-medium tabular-nums text-kampmax-text xl:table-cell">
        {formatNairaCompact(product.revenue)}
      </td>

      {/* Created */}
      <td className="hidden whitespace-nowrap px-4 py-2.5 lg:table-cell">
        <span
          className="tabular-nums text-kampmax-text-secondary"
          title={product.createdAt}
        >
          {timeAgo(product.createdAt)}
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
          <RowActionsMenu
            product={product}
            onOpen={onOpen}
            onApprove={onApprove}
            onReject={onReject}
            onSuspend={onSuspend}
            onArchive={onArchive}
            onRestore={onRestore}
          />
        </div>
      </td>
    </tr>
  );
}

// ------------------------------------------------------------
// Row kebab menu (fixed-position so table overflow can't clip it)
// ------------------------------------------------------------

const MENU_WIDTH = 200;

function RowActionsMenu({
  product,
  onOpen,
  onApprove,
  onReject,
  onSuspend,
  onArchive,
  onRestore,
}: { product: ManagedProduct; onOpen: () => void } & ProductRowActions) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const availability = getProductActionAvailability(product.status);

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
      // Menu is at most ~300px tall; flip above when near the bottom edge.
      const below = rect.bottom + 6;
      const top =
        below + 300 > window.innerHeight && rect.top - 310 > 0 ? rect.top - 310 : below;
      setCoords({ top, left });
    }
    setOpen((v) => !v);
  }

  function run(fn: (p: ManagedProduct) => void) {
    return () => {
      setOpen(false);
      fn(product);
    };
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Actions for ${product.title}`}
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
          aria-label={`${product.title} actions`}
          style={{ top: coords.top, left: coords.left, width: MENU_WIDTH }}
          className="fixed z-50 overflow-hidden rounded-lg border border-kampmax-border bg-white py-1 shadow-lg"
        >
          <MenuItem icon={Eye} label="View product" onClick={run(onOpen)} />
          {availability.canApprove && (
            <MenuItem icon={BadgeCheck} label="Approve listing" onClick={run(onApprove)} />
          )}
          {availability.canReject && (
            <MenuItem icon={ShieldX} label="Reject…" danger onClick={run(onReject)} />
          )}
          {availability.canSuspend && (
            <MenuItem icon={ShieldAlert} label="Suspend…" danger onClick={run(onSuspend)} />
          )}
          {availability.canRestore && (
            <MenuItem icon={RotateCcw} label="Restore listing" onClick={run(onRestore)} />
          )}
          {availability.canArchive && (
            <MenuItem icon={Archive} label="Archive listing" danger onClick={run(onArchive)} />
          )}
        </div>
      )}
    </>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: typeof Eye;
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
