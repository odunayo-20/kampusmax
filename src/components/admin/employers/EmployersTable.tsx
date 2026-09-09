"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Eye,
  Handshake,
  MoreVertical,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { EmptyState } from "@/components/admin/EmptyState";
import { ErrorState } from "@/components/admin/ErrorState";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import type { ManagedEmployer, Paginated, SortDir } from "@/types/admin";
import type { ManagedEmployerSortField } from "@/services/admin";
import { getEmployerActionAvailability } from "./employers-meta";
import {
  EmployerProfileCell,
  EmployerStatusBadge,
  EmployerVerificationBadge,
  EmployerHiringBadge,
} from "./EmployerBadges";

export interface EmployerRowActions {
  onViewProfile: (employer: ManagedEmployer) => void;
  onApprove: (employer: ManagedEmployer) => void;
  onReject: (employer: ManagedEmployer) => void;
  onSuspend: (employer: ManagedEmployer) => void;
  onRestore: (employer: ManagedEmployer) => void;
}

interface EmployersTableProps extends EmployerRowActions {
  page: Paginated<ManagedEmployer> | null;
  loading: boolean;
  error: boolean;
  sortBy: ManagedEmployerSortField;
  sortDir: SortDir;
  onSort: (field: ManagedEmployerSortField) => void;
  onRetry: () => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

const SORT_FIELD_LABELS: Record<ManagedEmployerSortField, string> = {
  name: "Name",
  joinedAt: "Joined",
  activeJobs: "Open jobs",
  applicationsReceived: "Applications",
  rating: "Rating",
};

function SortableHeader({
  field,
  currentSort,
  sortDir,
  onSort,
}: {
  field: ManagedEmployerSortField;
  currentSort: ManagedEmployerSortField;
  sortDir: SortDir;
  onSort: (field: ManagedEmployerSortField) => void;
}) {
  const isActive = currentSort === field;
  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className={cn(
        "flex items-center gap-1.5 px-3 py-2 text-left text-sm font-medium text-kampmax-text-secondary hover:text-kampmax-text-primary transition-colors",
        isActive && "text-kampmax-primary"
      )}
    >
      {SORT_FIELD_LABELS[field]}
      {isActive ? (sortDir === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />) : (
        <ArrowUpDown className="h-4 w-4 text-kampmax-text-tertiary" />
      )}
    </button>
  );
}

const MENU_WIDTH = 200;
const MENU_HEIGHT = 280;

function ActionMenu({
  employer,
  onViewProfile,
  onApprove,
  onReject,
  onSuspend,
  onRestore,
}: {
  employer: ManagedEmployer;
  onViewProfile: (e: ManagedEmployer) => void;
  onApprove: (e: ManagedEmployer) => void;
  onReject: (e: ManagedEmployer) => void;
  onSuspend: (e: ManagedEmployer) => void;
  onRestore: (e: ManagedEmployer) => void;
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const availability = getEmployerActionAvailability(employer);

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
        below + MENU_HEIGHT > window.innerHeight && rect.top - MENU_HEIGHT - 6 > 0
          ? rect.top - MENU_HEIGHT - 6
          : below;
      setCoords({ top, left });
    }
    setOpen((v) => !v);
  }

  function run(fn: (e: ManagedEmployer) => void) {
    return () => {
      setOpen(false);
      fn(employer);
    };
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Actions for ${employer.name}`}
        onClick={toggle}
        className={cn(
          "p-1.5 rounded-lg hover:bg-kampmax-surface transition-colors",
          open && "bg-kampmax-surface text-kampmax-text"
        )}
      >
        <MoreVertical className="h-4 w-4 text-kampmax-text-secondary" />
      </button>

      {open && coords && (
        <div
          ref={menuRef}
          role="menu"
          aria-label={`${employer.name} actions`}
          style={{ top: coords.top, left: coords.left, width: MENU_WIDTH }}
          className="fixed z-50 overflow-hidden rounded-lg border border-kampmax-border bg-white py-1 shadow-lg"
        >
          <button
            type="button"
            onClick={run(onViewProfile)}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-kampmax-text-primary hover:bg-kampmax-surface"
            role="menuitem"
          >
            <Eye className="h-4 w-4" />
            View profile
          </button>
          {availability.canApprove && (
            <button
              type="button"
              onClick={run(onApprove)}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-green-600 hover:bg-green-50"
              role="menuitem"
            >
              <ShieldCheck className="h-4 w-4" />
              Approve profile
            </button>
          )}
          {availability.canRestore && (
            <button
              type="button"
              onClick={run(onRestore)}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-green-600 hover:bg-green-50"
              role="menuitem"
            >
              <ShieldCheck className="h-4 w-4" />
              Restore profile
            </button>
          )}
          {availability.canSuspend && (
            <button
              type="button"
              onClick={run(onSuspend)}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-amber-600 hover:bg-amber-50"
              role="menuitem"
            >
              <ShieldAlert className="h-4 w-4" />
              Suspend
            </button>
          )}
          {availability.canReject && (
            <button
              type="button"
              onClick={run(onReject)}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              role="menuitem"
            >
              <ShieldX className="h-4 w-4" />
              Reject profile
            </button>
          )}
        </div>
      )}
    </>
  );
}

export function EmployersTable({
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
}: EmployersTableProps) {
  if (loading && !page) {
    return <LoadingSkeleton variant="table" rows={6} />;
  }

  if (error && !page) {
    return <ErrorState onRetry={onRetry} />;
  }

  if (!page || page.items.length === 0) {
    return (
      <EmptyState
        icon={Handshake}
        title="No employers found"
        message={hasActiveFilters ? "Try adjusting your filters or search terms." : "No employer or client records have been created yet."}
        action={hasActiveFilters ? (
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-kampmax-border bg-white px-3.5 text-sm font-medium text-kampmax-text transition-colors hover:bg-kampmax-muted/60"
          >
            Clear filters
          </button>
        ) : undefined}
      />
    );
  }

  return (
    <div className="rounded-lg border border-kampmax-border bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full" role="grid">
          <thead className="bg-kampmax-surface/50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-kampmax-text-tertiary">
                Employer
              </th>
              <th scope="col" className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-kampmax-text-tertiary md:table-cell">
                Industry
              </th>
              <th scope="col" className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-kampmax-text-tertiary md:table-cell">
                <SortableHeader field="activeJobs" currentSort={sortBy} sortDir={sortDir} onSort={onSort} />
              </th>
              <th scope="col" className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-kampmax-text-tertiary lg:table-cell">
                <SortableHeader field="applicationsReceived" currentSort={sortBy} sortDir={sortDir} onSort={onSort} />
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-kampmax-text-tertiary">
                Verification
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-kampmax-text-tertiary">
                Status
              </th>
              <th scope="col" className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-kampmax-text-tertiary md:table-cell">
                <SortableHeader field="joinedAt" currentSort={sortBy} sortDir={sortDir} onSort={onSort} />
              </th>
              <th scope="col" className="w-[56px] px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-kampmax-text-tertiary">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-kampmax-border">
            {page.items.map((employer) => (
              <tr key={employer.id} className="hover:bg-kampmax-surface/50 transition-colors">
                <td className="px-4 py-3">
                  <EmployerProfileCell employer={employer} />
                </td>
                <td className="hidden px-4 py-3 md:table-cell text-sm text-kampmax-text-secondary">
                  {employer.industry || "—"}
                </td>
                <td className="hidden px-4 py-3 md:table-cell">
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-medium tabular-nums text-kampmax-text-primary">
                      {employer.activeJobs}
                    </span>
                    <EmployerHiringBadge status={employer.hiringStatus} />
                  </span>
                </td>
                <td className="hidden px-4 py-3 lg:table-cell text-sm text-kampmax-text-secondary tabular-nums">
                  {employer.applicationsReceived.toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <EmployerVerificationBadge status={employer.verificationStatus} />
                </td>
                <td className="px-4 py-3">
                  <EmployerStatusBadge status={employer.status} />
                </td>
                <td className="hidden px-4 py-3 md:table-cell text-sm text-kampmax-text-secondary">
                  {formatDate(employer.joinedAt)}
                </td>
                <td className="w-[56px] px-4 py-3 text-right">
                  <ActionMenu employer={employer} {...actions} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}