"use client";

import { useEffect, useRef, useState } from "react";
import {
  Ban,
  Eye,
  History,
  MoreVertical,
  Pencil,
  RotateCcw,
  ShieldCheck,
  UserX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ManagedUser } from "@/types/admin";
import { getActionAvailability } from "./users-meta";

export interface UserActionHandlers {
  onView: (user: ManagedUser) => void;
  onEdit: (user: ManagedUser) => void;
  onViewActivity: (user: ManagedUser) => void;
  onSuspend: (user: ManagedUser) => void;
  onActivate: (user: ManagedUser) => void;
  onDeactivate: (user: ManagedUser) => void;
  onResetState: (user: ManagedUser) => void;
}

const MENU_WIDTH = 210;

/**
 * Kebab menu for one user row. Rendered with fixed coordinates so
 * the table's overflow-x container can never clip it.
 */
export function RowActionsMenu({
  user,
  onView,
  onEdit,
  onViewActivity,
  onSuspend,
  onActivate,
  onDeactivate,
  onResetState,
}: { user: ManagedUser } & UserActionHandlers) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const availability = getActionAvailability(user);

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
      // Menu is ~300px tall at most; flip above the button when near
      // the bottom edge of the viewport.
      const below = rect.bottom + 6;
      const top =
        below + 300 > window.innerHeight && rect.top - 306 > 0
          ? rect.top - 306
          : below;
      setCoords({ top, left });
    }
    setOpen((v) => !v);
  }

  function run(fn: (u: ManagedUser) => void) {
    return () => {
      setOpen(false);
      fn(user);
    };
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Actions for ${user.name}`}
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
          aria-label={`${user.name} actions`}
          style={{ top: coords.top, left: coords.left, width: MENU_WIDTH }}
          className="fixed z-50 overflow-hidden rounded-lg border border-kampmax-border bg-white py-1 shadow-lg"
        >
          <MenuItem icon={Eye} label="View profile" onClick={run(onView)} />
          <MenuItem icon={Pencil} label="Edit user" onClick={run(onEdit)} />
          <MenuItem icon={History} label="View activity" onClick={run(onViewActivity)} />

          <div className="my-1 border-t border-kampmax-border" role="separator" />

          {availability.canSuspend && (
            <MenuItem
              icon={Ban}
              label="Suspend user"
              danger
              onClick={run(onSuspend)}
            />
          )}
          {availability.canDeactivate && (
            <MenuItem
              icon={UserX}
              label="Deactivate account"
              danger
              onClick={run(onDeactivate)}
            />
          )}
          {availability.canActivate && (
            <MenuItem
              icon={ShieldCheck}
              label="Activate account"
              onClick={run(onActivate)}
            />
          )}
          <MenuItem
            icon={RotateCcw}
            label="Reset account state"
            disabled={!availability.canResetState}
            onClick={run(onResetState)}
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
  danger,
  disabled,
}: {
  icon: typeof Eye;
  label: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] font-medium transition-colors",
        danger ? "text-kampmax-error hover:bg-kampmax-error/5" : "text-kampmax-text hover:bg-kampmax-muted",
        disabled && "cursor-not-allowed opacity-40 hover:bg-transparent"
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      {label}
    </button>
  );
}
