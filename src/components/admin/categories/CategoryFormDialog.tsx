"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils";
import { CategoryAvatar } from "./CategoryBadges";
import { ICON_PICKER_KEYS, categoryIcon } from "./categories-meta";
import type {
  CategoryInput,
  CategoryParentOption,
  ManagedCategory,
} from "@/types/admin";

export type CategoryFormMode = "create" | "edit" | "sub";

interface CategoryFormDialogProps {
  open: boolean;
  mode: CategoryFormMode;
  category?: ManagedCategory | null;
  parent?: ManagedCategory | null;
  parentOptions: CategoryParentOption[];
  loading?: boolean;
  onClose: () => void;
  onSubmit: (input: CategoryInput) => void;
}

const EMPTY_FORM = {
  name: "",
  description: "",
  icon: "package",
  parentId: "",
};

export function CategoryFormDialog({
  open,
  mode,
  category,
  parent,
  parentOptions,
  loading = false,
  onClose,
  onSubmit,
}: CategoryFormDialogProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<{ name?: string; icon?: string }>({});
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    if (mode === "edit" && category) {
      setForm({
        name: category.name,
        description: category.description,
        icon: category.icon,
        parentId: category.parentId ?? "",
      });
    } else if (mode === "sub" && parent) {
      setForm({ ...EMPTY_FORM, parentId: parent.id });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [open, mode, category, parent]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, loading, onClose]);

  if (!open) return null;

  function patch(next: Partial<typeof form>) {
    setForm((f) => ({ ...f, ...next }));
  }

  function submit() {
    const nextErrors: typeof errors = {};
    if (form.name.trim().length < 2) {
      nextErrors.name = "Give the category a name (at least 2 characters).";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onSubmit({
      name: form.name.trim(),
      description: form.description.trim(),
      icon: form.icon,
      parentId: form.parentId || null,
    });
  }

  const title =
    mode === "edit"
      ? `Edit “${category?.name}”`
      : mode === "sub"
        ? `New subcategory of “${parent?.name}”`
        : "New top-level category";

  const description =
    mode === "edit"
      ? "Changes apply to the marketplace taxonomy immediately in this prototype."
      : mode === "sub"
        ? "The subcategory nests under its parent everywhere categories are shown."
        : "Top-level categories anchor the storefront navigation and filters.";

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:items-center"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-lg rounded-xl bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="border-b border-kampmax-border px-5 py-4">
          <h2 className="text-sm font-semibold text-kampmax-text">{title}</h2>
          <p className="mt-0.5 text-xs leading-relaxed text-kampmax-text-secondary">
            {description}
          </p>
        </div>

        {/* Body */}
        <div className="space-y-4 px-5 py-4">
          <Input
            label="Name"
            value={form.name}
            placeholder="e.g. Gaming"
            error={errors.name}
            onChange={(e) => patch({ name: e.target.value })}
          />

          <Select
            label="Parent category"
            value={mode === "sub" ? (parent?.id ?? "") : form.parentId}
            disabled={mode === "sub"}
            hint={
              mode === "sub"
                ? undefined
                : "Leave as top level to anchor the storefront navbar."
            }
            onChange={(e) => patch({ parentId: e.target.value })}
          >
            <option value="">Top level (no parent)</option>
            {parentOptions
              .filter((o) => o.id !== category?.id)
              .map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
          </Select>

          <div>
            <span className="mb-1.5 block text-sm font-medium text-kampmax-text">
              Icon
            </span>
            <div role="radiogroup" aria-label="Category icon" className="grid grid-cols-10 gap-1.5">
              {ICON_PICKER_KEYS.map((key) => {
                const Icon = categoryIcon(key);
                const selected = form.icon === key;
                return (
                  <button
                    key={key}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    title={key.replace(/-/g, " ")}
                    onClick={() => patch({ icon: key })}
                    className={cn(
                      "flex h-9 w-full items-center justify-center rounded-md border transition-colors",
                      selected
                        ? "border-kampmax-blue bg-kampmax-blue/10 text-kampmax-blue"
                        : "border-kampmax-border bg-white text-kampmax-text-secondary hover:bg-kampmax-muted/60"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
            {errors.icon && <p className="mt-1 text-xs text-kampmax-error">{errors.icon}</p>}
          </div>

          <div>
            <label
              htmlFor="category-description"
              className="mb-1.5 block text-sm font-medium text-kampmax-text"
            >
              Description{" "}
              <span className="font-normal text-kampmax-text-secondary">(optional)</span>
            </label>
            <textarea
              id="category-description"
              value={form.description}
              rows={3}
              placeholder="One line buyers see when filtering by this category."
              onChange={(e) => patch({ description: e.target.value })}
              className="w-full rounded-lg border border-kampmax-border bg-white px-3 py-2 text-sm placeholder:text-kampmax-text-secondary/60 focus:border-kampmax-blue focus:outline-none focus:ring-1 focus:ring-kampmax-blue"
            />
          </div>

          {/* Live preview */}
          <div className="flex items-center gap-2.5 rounded-lg border border-dashed border-kampmax-border bg-kampmax-muted/30 px-3 py-2.5">
            <CategoryAvatar
              category={{ id: category?.id ?? "preview", name: form.name || "Preview", icon: form.icon }}
              size="sm"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-kampmax-text">
                {form.name.trim() || "Category preview"}
              </p>
              <p className="truncate text-[11px] text-kampmax-text-secondary">
                {form.parentId
                  ? `Under ${
                      parentOptions.find((o) => o.id === form.parentId)?.name ??
                      parent?.name ??
                      ""
                    }`
                  : "Top-level category"}
                {form.description.trim() ? ` · ${form.description.trim()}` : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-kampmax-border px-5 py-3.5">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="h-9 rounded-md border border-kampmax-border bg-white px-3.5 text-sm font-medium text-kampmax-text transition-colors hover:bg-kampmax-muted/60 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={loading}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-kampmax-blue px-3.5 text-sm font-medium text-white transition-colors hover:bg-kampmax-blue/90 disabled:opacity-60"
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {mode === "edit" ? "Save changes" : "Create category"}
          </button>
        </div>
      </div>
    </div>
  );
}
