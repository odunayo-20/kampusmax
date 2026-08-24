"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  CornerDownRight,
  MoreVertical,
  Pencil,
  PlusCircle,
  Power,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { EmptyState } from "@/components/admin/EmptyState";
import { ErrorState } from "@/components/admin/ErrorState";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import type {
  CategoryReorderDirection,
  ManagedCategory,
} from "@/types/admin";
import { CategoryAvatar, CategoryStatusBadge } from "./CategoryBadges";

export interface CategoryRowActions {
  onEdit: (category: ManagedCategory) => void;
  onCreateSub: (category: ManagedCategory) => void;
  onToggleStatus: (category: ManagedCategory) => void;
  onDelete: (category: ManagedCategory) => void;
  onReorder: (category: ManagedCategory, direction: CategoryReorderDirection) => void;
}

interface CategoriesTableProps extends CategoryRowActions {
  items: ManagedCategory[];
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export function CategoriesTable({
  items,
  loading,
  error,
  onRetry,
  hasActiveFilters,
  onClearFilters,
  ...actions
}: CategoriesTableProps) {
  if (loading) return <LoadingSkeleton variant="table" rows={6} />;

  if (error) {
    return (
      <div className="rounded-lg border border-kampmax-border bg-white p-4">
        <ErrorState onRetry={onRetry} />
      </div>
    );
  }

  if (items.length === 0) {
    return hasActiveFilters ? (
      <EmptyState
        icon={PlusCircle}
        title="No categories match"
        message="No category matches the current search or status filter."
        action={
          <button
            type="button"
            onClick={onClearFilters}
            className="h-9 rounded-md bg-kampmax-blue px-3.5 text-sm font-medium text-white hover:bg-kampmax-blue/90"
          >
            Clear filters
          </button>
        }
      />
    ) : (
      <EmptyState
        icon={PlusCircle}
        title="No categories yet"
        message="Create your first top-level category to structure the marketplace."
      />
    );
  }

  const topLevelCount = items.filter((c) => !c.parentId).length;

  return (
    <div className="overflow-hidden rounded-lg border border-kampmax-border bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="border-b border-kampmax-border bg-kampmax-muted/40 text-[11px] uppercase tracking-wide text-kampmax-text-secondary">
            <tr>
              <th scope="col" className="px-4 py-2.5 font-medium">Category</th>
              <th scope="col" className="px-4 py-2.5 text-right font-medium">Products</th>
              <th scope="col" className="hidden px-4 py-2.5 text-right font-medium md:table-cell">
                Subcategories
              </th>
              <th scope="col" className="px-4 py-2.5 text-center font-medium">Order</th>
              <th scope="col" className="px-4 py-2.5 font-medium">Status</th>
              <th scope="col" className="hidden px-4 py-2.5 font-medium lg:table-cell">Updated</th>
              <th scope="col" className="px-4 py-2.5 text-right font-medium">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-kampmax-border/70">
            {items.map((category) => (
              <Row key={category.id} category={category} {...actions} />
            ))}
          </tbody>
        </table>
      </div>
      <p className="sr-only" aria-live="polite">
        Showing {items.length} categories across {topLevelCount} top-level groups.
      </p>
    </div>
  );
}

// ------------------------------------------------------------
// Rows (tree: children indented under their parent)
// ------------------------------------------------------------

function Row({
  category,
  onEdit,
  onCreateSub,
  onToggleStatus,
  onDelete,
  onReorder,
}: { category: ManagedCategory } & CategoryRowActions) {
  const isChild = Boolean(category.parentId);
  const deletable = category.productCount === 0 && category.subcategoryCount === 0;

  return (
    <tr
      className={cn(
        "group transition-colors hover:bg-kampmax-muted/40",
        isChild && "bg-kampmax-muted/20"
      )}
    >
      {/* Category */}
      <td className="px-4 py-2.5">
        <div className={cn("flex min-w-0 items-center gap-2.5", isChild && "pl-6")}>
          {isChild ? (
            <>
              <CornerDownRight className="h-3.5 w-3.5 shrink-0 text-kampmax-text-secondary/60" />
              <CategoryAvatar category={category} size="sm" />
            </>
          ) : (
            <CategoryAvatar category={category} />
          )}
          <div className="min-w-0">
            <p
              className={cn(
                "truncate text-kampmax-text",
                isChild ? "text-[13px]" : "font-medium"
              )}
            >
              {category.name}
              {isChild && (
                <span className="ml-1.5 text-[11px] font-normal text-kampmax-text-secondary">
                  in {category.parentName}
                </span>
              )}
            </p>
            <p className="truncate font-mono text-[11px] text-kampmax-text-secondary">
              /{category.slug}
              {!isChild && category.description ? ` · ${category.description}` : ""}
            </p>
          </div>
        </div>
      </td>

      {/* Products */}
      <td className="whitespace-nowrap px-4 py-2.5 text-right tabular-nums">
        <span className="font-medium text-kampmax-text">
          {category.productCount.toLocaleString("en-NG")}
        </span>
        {category.totalProductCount > category.productCount && (
          <span className="ml-1 text-[11px] text-kampmax-text-secondary">
            (+{(category.totalProductCount - category.productCount).toLocaleString("en-NG")} sub)
          </span>
        )}
      </td>

      {/* Subcategories */}
      <td className="hidden whitespace-nowrap px-4 py-2.5 text-right tabular-nums text-kampmax-text-secondary md:table-cell">
        {isChild ? "—" : category.subcategoryCount}
      </td>

      {/* Order controls */}
      <td className="px-4 py-2.5">
        <div className="flex items-center justify-center gap-1">
          <button
            type="button"
            aria-label={`Move ${category.name} up`}
            onClick={() => onReorder(category, "up")}
            className="rounded p-1 text-kampmax-text-secondary transition-colors hover:bg-kampmax-muted hover:text-kampmax-text"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            aria-label={`Move ${category.name} down`}
            onClick={() => onReorder(category, "down")}
            className="rounded p-1 text-kampmax-text-secondary transition-colors hover:bg-kampmax-muted hover:text-kampmax-text"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
          <span className="ml-1 w-10 text-center text-[11px] tabular-nums text-kampmax-text-secondary">
            #{category.sortOrder}
          </span>
        </div>
      </td>

      {/* Status */}
      <td className="px-4 py-2.5">
        <CategoryStatusBadge status={category.status} />
      </td>

      {/* Updated */}
      <td
        className="hidden whitespace-nowrap px-4 py-2.5 text-kampmax-text-secondary lg:table-cell"
        title={category.updatedAt}
      >
        {formatDate(category.updatedAt)}
      </td>

      {/* Actions */}
      <td className="relative px-4 py-2.5 text-right">
        <CategoryRowMenu
          category={category}
          deletable={deletable}
          onEdit={onEdit}
          onCreateSub={onCreateSub}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
        />
      </td>
    </tr>
  );
}

// ------------------------------------------------------------
// Row kebab menu (fixed-position so table overflow can't clip it)
// ------------------------------------------------------------

const MENU_WIDTH = 210;

function CategoryRowMenu({
  category,
  deletable,
  onEdit,
  onCreateSub,
  onToggleStatus,
  onDelete,
}: {
  category: ManagedCategory;
  deletable: boolean;
} & Pick<CategoryRowActions, "onEdit" | "onCreateSub" | "onToggleStatus" | "onDelete">) {
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
      // Menu is at most ~260px tall; flip above when near the bottom edge.
      const below = rect.bottom + 6;
      const top =
        below + 260 > window.innerHeight && rect.top - 270 > 0 ? rect.top - 270 : below;
      setCoords({ top, left });
    }
    setOpen((o) => !o);
  }

  const run = (fn: () => void) => () => {
    setOpen(false);
    fn();
  };

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-label={`Actions for ${category.name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={toggle}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-kampmax-text-secondary transition-colors hover:border-kampmax-border hover:bg-white hover:text-kampmax-text group-hover:border-kampmax-border"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && coords && (
        <div
          ref={menuRef}
          role="menu"
          aria-label={`Actions for ${category.name}`}
          style={{ position: "fixed", top: coords.top, left: coords.left, width: MENU_WIDTH }}
          className="z-50 overflow-hidden rounded-lg border border-kampmax-border bg-white py-1 shadow-xl animate-[kampmax-fade-in_.12s_ease-out]"
        >
          <MenuItem icon={Pencil} label="Edit category" onClick={run(() => onEdit(category))} />
          <MenuItem
            icon={PlusCircle}
            label="Create subcategory"
            onClick={run(() => onCreateSub(category))}
          />
          <MenuItem
            icon={category.status === "active" ? Power : RotateCcw}
            label={category.status === "active" ? "Deactivate" : "Activate"}
            onClick={run(() => onToggleStatus(category))}
          />
          <div className="my-1 border-t border-kampmax-border/70" />
          <MenuItem
            icon={Trash2}
            label={
              deletable
                ? "Delete category"
                : `Deletion blocked (${category.subcategoryCount > 0 ? "has subcategories" : "products assigned"})`
            }
            danger
            disabled={!deletable}
            onClick={run(() => onDelete(category))}
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
  icon: typeof Pencil;
  label: string;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onClick}
      title={disabled ? label : undefined}
      className={cn(
        "flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] transition-colors",
        disabled
          ? "cursor-not-allowed text-kampmax-text-secondary/50"
          : danger
            ? "text-kampmax-error hover:bg-kampmax-error/5"
            : "text-kampmax-text hover:bg-kampmax-muted/60"
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="min-w-0 truncate">{label}</span>
    </button>
  );
}
