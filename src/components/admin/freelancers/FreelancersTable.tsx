"use client";

import { useEffect, useRef, useState } from "react";
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
  Star,
  UserRound,
  Briefcase,
} from "lucide-react";
import { cn, formatDate, formatNairaCompact } from "@/lib/utils";
import { EmptyState } from "@/components/admin/EmptyState";
import { ErrorState } from "@/components/admin/ErrorState";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import type { ManagedFreelancer, Paginated, SortDir, FreelancerBucket } from "@/types/admin";
import type { ManagedFreelancerSortField } from "@/services/admin";
import { getFreelancerActionAvailability } from "./freelancers-meta";
import {
  FreelancerProfileCell,
  FreelancerSkillsCell,
  FreelancerServicesBadge,
  FreelancerStatusBadge,
} from "./FreelancerBadges";

export interface FreelancerRowActions {
  onViewProfile: (freelancer: ManagedFreelancer) => void;
  onSuspend: (freelancer: ManagedFreelancer) => void;
  onActivate: (freelancer: ManagedFreelancer) => void;
  onDeactivate: (freelancer: ManagedFreelancer) => void;
  onFeature: (freelancer: ManagedFreelancer) => void;
  onUnfeature: (freelancer: ManagedFreelancer) => void;
}

interface FreelancersTableProps extends FreelancerRowActions {
  campusNames: Record<string, string>;
  page: Paginated<ManagedFreelancer> | null;
  loading: boolean;
  error: boolean;
  sortBy: ManagedFreelancerSortField;
  sortDir: SortDir;
  onSort: (field: ManagedFreelancerSortField) => void;
  onRetry: () => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

const SORT_FIELD_LABELS: Record<ManagedFreelancerSortField, string> = {
  displayName: "Name",
  joinedAt: "Joined",
  servicesCount: "Services",
  totalBookings: "Bookings",
  rating: "Rating",
};

function SortableHeader({
  field,
  currentSort,
  sortDir,
  onSort,
}: {
  field: ManagedFreelancerSortField;
  currentSort: ManagedFreelancerSortField;
  sortDir: SortDir;
  onSort: (field: ManagedFreelancerSortField) => void;
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

function ActionMenu({
  freelancer,
  onViewProfile,
  onSuspend,
  onActivate,
  onDeactivate,
  onFeature,
  onUnfeature,
}: {
  freelancer: ManagedFreelancer;
  onViewProfile: (f: ManagedFreelancer) => void;
  onSuspend: (f: ManagedFreelancer) => void;
  onActivate: (f: ManagedFreelancer) => void;
  onDeactivate: (f: ManagedFreelancer) => void;
  onFeature: (f: ManagedFreelancer) => void;
  onUnfeature: (f: ManagedFreelancer) => void;
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const availability = getFreelancerActionAvailability(freelancer);

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
      const MENU_HEIGHT = 260;
      const below = rect.bottom + 6;
      const top =
        below + MENU_HEIGHT > window.innerHeight && rect.top - MENU_HEIGHT - 6 > 0
          ? rect.top - MENU_HEIGHT - 6
          : below;
      setCoords({ top, left });
    }
    setOpen((v) => !v);
  }

  function run(fn: (f: ManagedFreelancer) => void) {
    return () => {
      setOpen(false);
      fn(freelancer);
    };
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Actions for ${freelancer.displayName}`}
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
          aria-label={`${freelancer.displayName} actions`}
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
          {availability.canFeature && (
            <button
              type="button"
              onClick={run(onFeature)}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-kampmax-text-primary hover:bg-kampmax-surface"
              role="menuitem"
            >
              <Star className="h-4 w-4" />
              Feature on marketplace
            </button>
          )}
          {availability.canUnfeature && (
            <button
              type="button"
              onClick={run(onUnfeature)}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-kampmax-text-primary hover:bg-kampmax-surface"
              role="menuitem"
            >
              <Star className="h-4 w-4 opacity-50" />
              Unfeature
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
          {availability.canActivate && (
            <button
              type="button"
              onClick={run(onActivate)}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-green-600 hover:bg-green-50"
              role="menuitem"
            >
              <ShieldCheck className="h-4 w-4" />
              Activate
            </button>
          )}
          {availability.canDeactivate && (
            <button
              type="button"
              onClick={run(onDeactivate)}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              role="menuitem"
            >
              <ShieldX className="h-4 w-4" />
              Deactivate
            </button>
          )}
        </div>
      )}
    </>
  );
}

export function FreelancersTable({
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
}: FreelancersTableProps) {

  if (loading && !page) {
    return <LoadingSkeleton variant="table" rows={6} />;
  }

  if (error && !page) {
    return <ErrorState onRetry={onRetry} />;
  }

  if (!page || page.items.length === 0) {
    return (
      <EmptyState
        icon={UserRound}
        title="No freelancers found"
        message={hasActiveFilters ? "Try adjusting your filters or search terms." : "No freelancers have been onboarded yet."}
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
                Freelancer
              </th>
              <th scope="col" className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-kampmax-text-tertiary md:table-cell">
                Skills
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-kampmax-text-tertiary">
                <SortableHeader field="servicesCount" currentSort={sortBy} sortDir={sortDir} onSort={onSort} />
              </th>
              <th scope="col" className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-kampmax-text-tertiary md:table-cell">
                <SortableHeader field="totalBookings" currentSort={sortBy} sortDir={sortDir} onSort={onSort} />
              </th>
              <th scope="col" className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-kampmax-text-tertiary lg:table-cell">
                <SortableHeader field="rating" currentSort={sortBy} sortDir={sortDir} onSort={onSort} />
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
            {page.items.map((freelancer) => (
              <tr key={freelancer.id} className="hover:bg-kampmax-surface/50 transition-colors">
                <td className="px-4 py-3">
                  <FreelancerProfileCell freelancer={freelancer} />
                </td>
                <td className="hidden px-4 py-3 md:table-cell">
                  <FreelancerSkillsCell freelancer={freelancer} />
                </td>
                <td className="px-4 py-3">
                  <FreelancerServicesBadge count={freelancer.servicesCount} />
                </td>
                <td className="hidden px-4 py-3 md:table-cell text-sm text-kampmax-text-secondary">
                  {freelancer.totalBookings.toLocaleString()}
                </td>
                <td className="hidden px-4 py-3 lg:table-cell text-sm text-kampmax-text-secondary">
                  {freelancer.rating.toFixed(1)}
                  <BadgeCheck className="inline h-3 w-3 ml-1 text-kampmax-success" aria-hidden="true" />
                </td>
                <td className="px-4 py-3">
                  <FreelancerStatusBadge status={freelancer.status} />
                </td>
                <td className="hidden px-4 py-3 md:table-cell text-sm text-kampmax-text-secondary">
                  {formatDate(freelancer.joinedAt)}
                </td>
                <td className="w-[56px] px-4 py-3 text-right">
                  <ActionMenu freelancer={freelancer} {...actions} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}