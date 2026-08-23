"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  MapPin,
  MoreVertical,
  Pencil,
  Power,
  ShieldCheck,
} from "lucide-react";
import { cn, formatDate, formatNairaCompact } from "@/lib/utils";
import { EmptyState } from "@/components/admin/EmptyState";
import { ErrorState } from "@/components/admin/ErrorState";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import type { ManagedCampus, Paginated, SortDir } from "@/types/admin";
import type { ManagedCampusSortField } from "@/services/admin";
import { CampusAvatar, CampusStatusBadge } from "./CampusBadges";

interface CampusActionHandlers {
  onEdit: (campus: ManagedCampus) => void;
  onActivate: (campus: ManagedCampus) => void;
  onDeactivate: (campus: ManagedCampus) => void;
}

interface CampusesTableProps extends CampusActionHandlers {
  page: Paginated<ManagedCampus> | null;
  loading: boolean;
  error: boolean;
  sortBy: ManagedCampusSortField;
  sortDir: SortDir;
  onSort: (field: ManagedCampusSortField) => void;
  onRetry: () => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export function CampusesTable({
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
}: CampusesTableProps) {
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
          title="No campuses found"
          message={
            hasActiveFilters
              ? "No campuses match the current search and filters."
              : "Campuses added to Kampmax will appear here."
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
        <table className="w-full min-w-[1080px] text-sm">
          <thead>
            <tr className="border-b border-kampmax-border bg-kampmax-muted/50 text-left text-xs uppercase tracking-wide text-kampmax-text-secondary">
              <SortableTh
                label="Campus"
                active={sortBy === "name"}
                dir={sortDir}
                onClick={() => onSort("name")}
              />
              <Th className="hidden min-w-[180px] lg:table-cell">Institution</Th>
              <Th>State</Th>
              <Th className="hidden xl:table-cell">Location</Th>
              <SortableTh
                label="Users"
                active={sortBy === "usersCount"}
                dir={sortDir}
                onClick={() => onSort("usersCount")}
              />
              <Th>Vendors</Th>
              <Th className="hidden lg:table-cell">Products</Th>
              <SortableTh
                label="Orders"
                active={sortBy === "ordersCount"}
                dir={sortDir}
                onClick={() => onSort("ordersCount")}
              />
              <Th className="hidden xl:table-cell">Revenue</Th>
              <Th>Status</Th>
              <SortableTh
                label="Date added"
                active={sortBy === "createdAt"}
                dir={sortDir}
                onClick={() => onSort("createdAt")}
              />
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-kampmax-border/70">
            {page.items.map((campus) => (
              <Row
                key={campus.id}
                campus={campus}
                onOpen={() => router.push(`/admin/campuses/${campus.id}`)}
                onEdit={actions.onEdit}
                onActivate={actions.onActivate}
                onDeactivate={actions.onDeactivate}
              />
            ))}
          </tbody>
        </table>
      </div>

      <p className="sr-only" aria-live="polite">
        Showing {page.items.length} of {page.total} campuses, page {page.page} of{" "}
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
  campus,
  onOpen,
  onEdit,
  onActivate,
  onDeactivate,
}: {
  campus: ManagedCampus;
  onOpen: () => void;
} & CampusActionHandlers) {
  return (
    <tr className="group transition-colors hover:bg-kampmax-muted/40">
      {/* Campus */}
      <td className="px-4 py-2.5">
        <button
          type="button"
          onClick={onOpen}
          title={`Open ${campus.name}`}
          className="flex items-center gap-2.5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-kampmax-blue"
        >
          <CampusAvatar campus={campus} />
          <span className="min-w-0">
            <span className="flex max-w-[200px] items-center gap-1 truncate font-medium text-kampmax-text group-hover:text-kampmax-blue">
              {campus.name}
            </span>
            <span className="block font-mono text-[11px] text-kampmax-text-secondary">
              {campus.shortName} · {campus.id}
            </span>
          </span>
        </button>
      </td>

      {/* Institution */}
      <td className="hidden max-w-[210px] truncate px-4 py-2.5 text-kampmax-text-secondary lg:table-cell">
        {campus.institution}
      </td>

      {/* State */}
      <td className="whitespace-nowrap px-4 py-2.5 text-kampmax-text-secondary">
        {campus.state}
      </td>

      {/* Location */}
      <td className="hidden whitespace-nowrap px-4 py-2.5 xl:table-cell">
        <span className="inline-flex items-center gap-1.5 text-kampmax-text-secondary">
          <MapPin className="h-3.5 w-3.5 shrink-0 opacity-60" />
          {campus.city || "—"}
        </span>
      </td>

      {/* Users */}
      <td className="whitespace-nowrap px-4 py-2.5 font-medium tabular-nums text-kampmax-text">
        {campus.usersCount.toLocaleString("en-NG")}
      </td>

      {/* Vendors */}
      <td className="whitespace-nowrap px-4 py-2.5 tabular-nums text-kampmax-text-secondary">
        {campus.vendorsCount.toLocaleString("en-NG")}
      </td>

      {/* Products */}
      <td className="hidden whitespace-nowrap px-4 py-2.5 tabular-nums text-kampmax-text-secondary lg:table-cell">
        {campus.productsCount.toLocaleString("en-NG")}
      </td>

      {/* Orders */}
      <td className="whitespace-nowrap px-4 py-2.5 font-medium tabular-nums text-kampmax-text">
        {campus.ordersCount.toLocaleString("en-NG")}
      </td>

      {/* Revenue */}
      <td className="hidden whitespace-nowrap px-4 py-2.5 font-medium tabular-nums text-kampmax-text xl:table-cell">
        {formatNairaCompact(campus.revenue)}
      </td>

      {/* Status */}
      <td className="px-4 py-2.5">
        <CampusStatusBadge status={campus.status} />
      </td>

      {/* Date added */}
      <td className="hidden whitespace-nowrap px-4 py-2.5 xl:table-cell">
        <span className="tabular-nums text-kampmax-text-secondary">
          {formatDate(campus.createdAt)}
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
            campus={campus}
            onOpen={onOpen}
            onEdit={onEdit}
            onActivate={onActivate}
            onDeactivate={onDeactivate}
          />
        </div>
      </td>
    </tr>
  );
}

// ------------------------------------------------------------
// Row kebab menu (fixed-position so table overflow can't clip it)
// ------------------------------------------------------------

const MENU_WIDTH = 190;

function RowActionsMenu({
  campus,
  onOpen,
  onEdit,
  onActivate,
  onDeactivate,
}: { campus: ManagedCampus; onOpen: () => void } & CampusActionHandlers) {
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
      // Menu is ~170px tall at most; flip above when near the bottom edge.
      const below = rect.bottom + 6;
      const top =
        below + 180 > window.innerHeight && rect.top - 186 > 0 ? rect.top - 186 : below;
      setCoords({ top, left });
    }
    setOpen((v) => !v);
  }

  function run(fn: (c: ManagedCampus) => void) {
    return () => {
      setOpen(false);
      fn(campus);
    };
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Actions for ${campus.name}`}
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
          aria-label={`${campus.name} actions`}
          style={{ top: coords.top, left: coords.left, width: MENU_WIDTH }}
          className="fixed z-50 overflow-hidden rounded-lg border border-kampmax-border bg-white py-1 shadow-lg"
        >
          <MenuItem icon={Pencil} label="Edit campus" onClick={run(onEdit)} />
          {campus.status !== "active" ? (
            <MenuItem
              icon={ShieldCheck}
              label="Activate campus"
              onClick={run(onActivate)}
            />
          ) : (
            <MenuItem
              icon={Power}
              label="Deactivate campus"
              danger
              onClick={run(onDeactivate)}
            />
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
  icon: typeof Pencil;
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
