"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal, Heart, MessageCircle, Share2 } from "lucide-react";
import { EmptyState } from "@/components/admin/EmptyState";
import { ErrorState } from "@/components/admin/ErrorState";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// ------------------------------------------------------------
// Shared chrome for every campus-community section: loading /
// error / empty states around a section-specific body.
// ------------------------------------------------------------

export interface CommunitySectionShellProps {
  loading: boolean;
  error: boolean;
  isEmpty: boolean;
  hasActiveFilters: boolean;
  emptyTitle: string;
  emptyMessage: string;
  onRetry: () => void;
  onClearFilters: () => void;
  children: React.ReactNode;
}

export function CommunitySectionShell(props: CommunitySectionShellProps) {
  const {
    loading,
    error,
    isEmpty,
    hasActiveFilters,
    emptyTitle,
    emptyMessage,
    onRetry,
    onClearFilters,
    children,
  } = props;

  if (loading) return <LoadingSkeleton variant="table" rows={6} />;
  if (error) return <ErrorState onRetry={onRetry} />;
  if (isEmpty)
    return (
      <EmptyState
        title={hasActiveFilters ? "Nothing matches these filters" : emptyTitle}
        message={
          hasActiveFilters
            ? "Try different search terms or clear the filters."
            : emptyMessage
        }
        action={
          hasActiveFilters ? (
            <button
              type="button"
              onClick={onClearFilters}
              className="h-8 rounded-md border border-kampmax-border bg-white px-3 text-xs font-medium text-kampmax-text hover:bg-kampmax-muted/60"
            >
              Clear filters
            </button>
          ) : undefined
        }
      />
    );

  return <>{children}</>;
}

// ------------------------------------------------------------
// Row action menu (portal dropdown, flips above last rows).
// Mirrors the pattern used by the promotions/vendors tables.
// ------------------------------------------------------------

export interface RowAction {
  key: string;
  label: string;
  icon: LucideIcon;
  danger?: boolean;
  onSelect: () => void;
}

export function RowMenu({
  label,
  actions,
}: {
  label: string;
  actions: RowAction[];
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || actions.length === 0) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (btnRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const dismiss = () => setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", dismiss, true);
    window.addEventListener("resize", dismiss);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", dismiss, true);
      window.removeEventListener("resize", dismiss);
    };
  }, [open, actions.length]);

  useEffect(() => {
    if (!open || !menuRef.current || !btnRef.current) return;
    const menu = menuRef.current.getBoundingClientRect();
    const btn = btnRef.current.getBoundingClientRect();
    let top = btn.bottom + 4;
    if (top + menu.height > window.innerHeight - 8)
      top = Math.max(8, btn.top - menu.height - 4);
    let left = btn.right - menu.width;
    left = Math.max(8, Math.min(left, window.innerWidth - menu.width - 8));
    menuRef.current.style.top = `${top}px`;
    menuRef.current.style.left = `${left}px`;
    menuRef.current.style.visibility = "visible";
  }, [open]);

  if (actions.length === 0) return null;

  return (
    <div className="relative flex justify-end">
      <button
        type="button"
        ref={btnRef}
        aria-label={`Actions for ${label}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="rounded-md p-1.5 text-kampmax-text-secondary transition-colors hover:bg-kampmax-muted hover:text-kampmax-text"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{
              position: "fixed",
              top: -9999,
              left: -9999,
              visibility: "hidden",
            }}
            className="z-[90] w-48 overflow-hidden rounded-lg border border-kampmax-border bg-white py-1 shadow-lg"
          >
            {actions.map((a) => (
              <button
                key={a.key}
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  a.onSelect();
                }}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors hover:bg-kampmax-muted/60",
                  a.danger ? "text-kampmax-error" : "text-kampmax-text"
                )}
              >
                <a.icon className="h-3.5 w-3.5 opacity-70" />
                {a.label}
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}

/** Compact engagement cell: likes · comments · shares. */
export function EngagementStats({
  likes,
  comments,
  shares,
}: {
  likes: number;
  comments: number;
  shares?: number;
}) {
  return (
    <span className="inline-flex items-center gap-2.5 whitespace-nowrap text-xs tabular-nums text-kampmax-text-secondary">
      <span className="inline-flex items-center gap-1" title={`${likes} likes`}>
        <Heart className="h-3 w-3" aria-hidden />
        {likes}
      </span>
      <span
        className="inline-flex items-center gap-1"
        title={`${comments} comments`}
      >
        <MessageCircle className="h-3 w-3" aria-hidden />
        {comments}
      </span>
      {shares != null && (
        <span className="inline-flex items-center gap-1" title={`${shares} shares`}>
          <Share2 className="h-3 w-3" aria-hidden />
          {shares}
        </span>
      )}
    </span>
  );
}

/** Author cell with initial avatar; `onViewAuthor` renders it as a button. */
export function AuthorCell({
  name,
  onViewAuthor,
}: {
  name: string;
  onViewAuthor?: () => void;
}) {
  const initials = name
    .split(/\s+/)
    .map((w) => w.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const inner = (
    <>
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-kampmax-blue/10 text-[10px] font-semibold text-kampmax-blue">
        {initials}
      </span>
      <span className="truncate text-kampmax-text">{name}</span>
    </>
  );

  if (!onViewAuthor)
    return <span className="flex min-w-0 items-center gap-2">{inner}</span>;

  return (
    <button
      type="button"
      title="View author profile"
      onClick={(e) => {
        e.stopPropagation();
        onViewAuthor();
      }}
      className="group flex min-w-0 items-center gap-2 text-left"
    >
      {inner}
    </button>
  );
}
