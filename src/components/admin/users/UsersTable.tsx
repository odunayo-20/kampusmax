"use client";

import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  BadgeCheck,
} from "lucide-react";
import { cn, formatDate, timeAgo } from "@/lib/utils";
import { EmptyState } from "@/components/admin/EmptyState";
import { ErrorState } from "@/components/admin/ErrorState";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import type { ManagedUser, Paginated, SortDir } from "@/types/admin";
import type { ManagedUserSortField } from "@/services/admin";
import { UserAvatar, UserRoleBadge, UserStatusBadge } from "./UserBadges";
import type { UserActionHandlers } from "./UserActionMenu";
import { RowActionsMenu } from "./UserActionMenu";

interface UsersTableProps extends UserActionHandlers {
  page: Paginated<ManagedUser> | null;
  loading: boolean;
  error: boolean;
  campusNames: Record<string, string>;
  sortBy: ManagedUserSortField;
  sortDir: SortDir;
  onSort: (field: ManagedUserSortField) => void;
  onRetry: () => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export function UsersTable({
  page,
  loading,
  error,
  campusNames,
  sortBy,
  sortDir,
  onSort,
  onRetry,
  hasActiveFilters,
  onClearFilters,
  ...actions
}: UsersTableProps) {
  if (loading && !page) {
    return <LoadingSkeleton variant="table" rows={8} />;
  }

  if (error && !page) {
    return <ErrorState onRetry={onRetry} />;
  }

  if (!page || page.items.length === 0) {
    return (
      <div className="rounded-lg border border-kampmax-border bg-white p-4">
        <EmptyState
          title="No users found"
          message={
            hasActiveFilters
              ? "No accounts match the current search and filters."
              : "New signups will appear here as they register."
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
        <table className="w-full min-w-[1024px] text-sm">
          <thead>
            <tr className="border-b border-kampmax-border bg-kampmax-muted/50 text-left text-xs uppercase tracking-wide text-kampmax-text-secondary">
              <SortableTh
                label="User"
                active={sortBy === "name"}
                dir={sortDir}
                onClick={() => onSort("name")}
              />
              <Th className="hidden min-w-[190px] lg:table-cell">Email</Th>
              <Th className="hidden xl:table-cell">Phone</Th>
              <Th>Role</Th>
              <Th>Campus</Th>
              <Th>Status</Th>
              <SortableTh
                label="Date joined"
                className="hidden xl:table-cell"
                active={sortBy === "joinedAt"}
                dir={sortDir}
                onClick={() => onSort("joinedAt")}
              />
              <SortableTh
                label="Last active"
                active={sortBy === "lastActiveAt"}
                dir={sortDir}
                onClick={() => onSort("lastActiveAt")}
              />
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-kampmax-border/70">
            {page.items.map((user) => (
              <Row
                key={user.id}
                user={user}
                campusName={campusNames[user.campusId] ?? "—"}
                actions={actions}
              />
            ))}
          </tbody>
        </table>
      </div>

      <p className="sr-only" aria-live="polite">
        Showing {page.items.length} of {page.total} users, page {page.page} of{" "}
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
  user,
  campusName,
  actions,
}: {
  user: ManagedUser;
  campusName: string;
  actions: UserActionHandlers;
}) {
  return (
    <tr className="group transition-colors hover:bg-kampmax-muted/40">
      {/* User */}
      <td className="px-4 py-2.5">
        <button
          type="button"
          onClick={() => actions.onView(user)}
          title="View profile"
          className="flex items-center gap-2.5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-kampmax-blue"
        >
          <UserAvatar user={user} />
          <span className="min-w-0">
            <span className="flex items-center gap-1 font-medium text-kampmax-text group-hover:text-kampmax-blue">
              <span className="max-w-[160px] truncate">{user.name}</span>
              {user.isVerified && (
                <BadgeCheck
                  aria-label="Verified account"
                  className="h-3.5 w-3.5 shrink-0 text-kampmax-info"
                />
              )}
            </span>
            <span className="block max-w-[160px] truncate font-mono text-[11px] text-kampmax-text-secondary">
              {user.id}
            </span>
          </span>
        </button>
      </td>

      {/* Email */}
      <td className="hidden max-w-[210px] truncate px-4 py-2.5 text-kampmax-text-secondary lg:table-cell">
        {user.email}
      </td>

      {/* Phone */}
      <td className="hidden whitespace-nowrap px-4 py-2.5 tabular-nums text-kampmax-text-secondary xl:table-cell">
        {user.phone}
      </td>

      {/* Role */}
      <td className="px-4 py-2.5">
        <UserRoleBadge role={user.role} />
      </td>

      {/* Campus */}
      <td className="whitespace-nowrap px-4 py-2.5 text-kampmax-text-secondary">
        {campusName}
      </td>

      {/* Status */}
      <td className="px-4 py-2.5">
        <UserStatusBadge status={user.status} />
      </td>

      {/* Date joined */}
      <td className="hidden whitespace-nowrap px-4 py-2.5 xl:table-cell">
        <span className="tabular-nums text-kampmax-text-secondary">
          {formatDate(user.joinedAt)}
        </span>
      </td>

      {/* Last active */}
      <td className="whitespace-nowrap px-4 py-2.5">
        <span className="font-medium tabular-nums text-kampmax-text">
          {timeAgo(user.lastActiveAt)}
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-2.5 text-right">
        <RowActionsMenu user={user} {...actions} />
      </td>
    </tr>
  );
}
