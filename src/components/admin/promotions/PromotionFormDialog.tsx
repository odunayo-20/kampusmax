"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils";
import {
  PROMOTION_PLACEMENT_LABELS,
  PROMOTION_TYPE_LABELS,
} from "./promotions-meta";
import type {
  ManagedPromotion,
  PromotionInput,
  PromotionTargetingOptions,
} from "@/types/admin";

interface PromotionFormDialogProps {
  open: boolean;
  /** null = create mode */
  promotion?: ManagedPromotion | null;
  options: PromotionTargetingOptions;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (input: PromotionInput) => void;
}

const DISCOUNT_TYPES = ["percentage_discount", "fixed_discount", "promo_code"];

function toDatePickerValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function emptyForm(): FormState {
  const today = new Date();
  const inTwoWeeks = new Date(today.getTime() + 14 * 24 * 3600 * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  return {
    name: "",
    description: "",
    type: "percentage_discount",
    code: "",
    discountValue: "",
    minSpend: "",
    placement: "homepage_banner",
    usageLimit: "",
    startDate: fmt(today),
    endDate: fmt(inTwoWeeks),
    campusIds: [],
    vendorIds: [],
    productIds: [],
    categoryIds: [],
  };
}

interface FormState {
  name: string;
  description: string;
  type: ManagedPromotion["type"];
  code: string;
  discountValue: string;
  minSpend: string;
  placement: ManagedPromotion["placement"];
  usageLimit: string;
  startDate: string;
  endDate: string;
  campusIds: string[];
  vendorIds: string[];
  productIds: string[];
  categoryIds: string[];
}

export function PromotionFormDialog({
  open,
  promotion,
  options,
  loading = false,
  onClose,
  onSubmit,
}: PromotionFormDialogProps) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setErrors({});
    if (promotion) {
      setForm({
        name: promotion.name,
        description: promotion.description,
        type: promotion.type,
        code: promotion.code ?? "",
        discountValue:
          promotion.discountValue != null ? String(promotion.discountValue) : "",
        minSpend: promotion.minSpend != null ? String(promotion.minSpend) : "",
        placement: promotion.placement,
        usageLimit:
          promotion.usageLimit != null ? String(promotion.usageLimit) : "",
        startDate: toDatePickerValue(promotion.startsAt),
        endDate: toDatePickerValue(promotion.endsAt),
        ...promotion.targeting,
      });
    } else {
      setForm(emptyForm());
    }
  }, [open, promotion]);

  if (!open) return null;

  const isDiscountType = DISCOUNT_TYPES.includes(form.type);

  function patch(next: Partial<FormState>) {
    setForm((f) => ({ ...f, ...next }));
  }

  function toggle(list: keyof Pick<FormState, "campusIds" | "vendorIds" | "productIds" | "categoryIds">, id: string) {
    setForm((f) => {
      const current = f[list];
      return {
        ...f,
        [list]: current.includes(id)
          ? current.filter((x) => x !== id)
          : [...current, id],
      };
    });
  }

  function submit() {
    const nextErrors: Record<string, string> = {};
    if (form.name.trim().length < 3) {
      nextErrors.name = "Give the promotion a name (at least 3 characters).";
    }
    if (new Date(form.endDate).getTime() <= new Date(form.startDate).getTime()) {
      nextErrors.endDate = "End date must be after the start date.";
    }
    if (isDiscountType) {
      const v = Number(form.discountValue);
      if (!form.discountValue || Number.isNaN(v)) {
        nextErrors.discountValue =
          form.type === "fixed_discount"
            ? "Enter the naira amount to knock off."
            : "Enter a discount percentage.";
      } else if (
        (form.type === "percentage_discount" || form.type === "promo_code") &&
        (v < 1 || v > 90)
      ) {
        nextErrors.discountValue = "Percentage must be between 1 and 90.";
      } else if (form.type === "fixed_discount" && v < 100) {
        nextErrors.discountValue = "Fixed discounts start from N100.";
      }
    }
    if (form.type === "promo_code" && form.code.trim().length < 4) {
      nextErrors.code = "Codes need at least 4 characters (e.g. CAMPUS15).";
    }
    if (form.type === "featured_product" && form.productIds.length === 0) {
      nextErrors.productIds = "Pick at least one product to feature.";
    }
    if (form.type === "featured_vendor" && form.vendorIds.length === 0) {
      nextErrors.vendorIds = "Pick at least one vendor to feature.";
    }
    if (form.type === "campus_promotion" && form.campusIds.length === 0) {
      nextErrors.campusIds = "Pick at least one campus.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const num = (s: string): number | null => {
      if (!s.trim()) return null;
      const n = Number(s);
      return Number.isNaN(n) ? null : n;
    };

    onSubmit({
      name: form.name.trim(),
      description: form.description.trim(),
      type: form.type,
      code: form.type === "promo_code" ? form.code.trim().toUpperCase() : null,
      discountValue: isDiscountType ? num(form.discountValue) : null,
      minSpend: num(form.minSpend),
      placement: form.placement,
      usageLimit: num(form.usageLimit),
      targeting: {
        campusIds: form.campusIds,
        vendorIds: form.vendorIds,
        productIds: form.productIds,
        categoryIds: form.categoryIds,
      },
      startsAt: new Date(`${form.startDate}T00:00:00`).toISOString(),
      endsAt: new Date(`${form.endDate}T23:59:59`).toISOString(),
    });
  }

  const targetingFields: {
    key: keyof Pick<
      FormState,
      "campusIds" | "vendorIds" | "productIds" | "categoryIds"
    >;
    label: string;
    items: { id: string; name: string }[];
    required: boolean;
    searchable?: boolean;
    error?: string;
  }[] = [
    {
      key: "campusIds",
      label: "Campuses",
      items: options.campuses,
      required: form.type === "campus_promotion",
      error: errors.campusIds,
    },
    {
      key: "vendorIds",
      label: "Vendors",
      items: options.vendors,
      required: form.type === "featured_vendor",
      searchable: true,
      error: errors.vendorIds,
    },
    {
      key: "productIds",
      label: "Products",
      items: options.products,
      required: form.type === "featured_product",
      searchable: true,
      error: errors.productIds,
    },
    {
      key: "categoryIds",
      label: "Categories",
      items: options.categories,
      required: false,
      error: errors.categoryIds,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:items-center"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={promotion ? `Edit ${promotion.name}` : "New promotion"}
        className="w-full max-w-2xl rounded-xl bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="border-b border-kampmax-border px-5 py-4">
          <h2 className="text-sm font-semibold text-kampmax-text">
            {promotion ? `Edit “${promotion.name}”` : "New promotion"}
          </h2>
          <p className="mt-0.5 text-xs leading-relaxed text-kampmax-text-secondary">
            Mock configuration only - discounts are not yet calculated against
            real orders at checkout.
          </p>
        </div>

        {/* Body */}
        <div className="max-h-[70vh] space-y-4 overflow-y-auto px-5 py-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Name"
              value={form.name}
              placeholder="e.g. Back to Campus Sale"
              error={errors.name}
              onChange={(e) => patch({ name: e.target.value })}
            />
            <Select
              label="Type"
              value={form.type}
              onChange={(e) =>
                patch({ type: e.target.value as FormState["type"] })
              }
            >
              {(
                Object.entries(PROMOTION_TYPE_LABELS) as [
                  FormState["type"],
                  string,
                ][]
              ).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>

          {(isDiscountType || form.type === "promo_code") && (
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label={
                  form.type === "fixed_discount"
                    ? "Amount off (₦)"
                    : "Discount (%)"
                }
                type="number"
                min={form.type === "fixed_discount" ? 100 : 1}
                max={form.type === "fixed_discount" ? undefined : 90}
                value={form.discountValue}
                placeholder={form.type === "fixed_discount" ? "1500" : "15"}
                error={errors.discountValue}
                onChange={(e) => patch({ discountValue: e.target.value })}
              />
              {form.type === "promo_code" && (
                <Input
                  label="Code"
                  value={form.code}
                  placeholder="CAMPUS15"
                  error={errors.code}
                  onChange={(e) => patch({ code: e.target.value.toUpperCase() })}
                />
              )}
              <Input
                label="Min. spend (₦)"
                hint="Optional"
                type="number"
                min={0}
                value={form.minSpend}
                placeholder="5000"
                onChange={(e) => patch({ minSpend: e.target.value })}
              />
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            <Select
              label="Placement"
              value={form.placement}
              onChange={(e) =>
                patch({
                  placement: e.target.value as FormState["placement"],
                })
              }
            >
              {(
                Object.entries(PROMOTION_PLACEMENT_LABELS) as [
                  FormState["placement"],
                  string,
                ][]
              ).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
            {!isDiscountType ? null : (
              <Input
                label="Usage limit"
                hint="Optional - total redemptions"
                type="number"
                min={1}
                value={form.usageLimit}
                placeholder="200"
                onChange={(e) => patch({ usageLimit: e.target.value })}
              />
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Start date"
              type="date"
              value={form.startDate}
              onChange={(e) => patch({ startDate: e.target.value })}
            />
            <Input
              label="End date"
              type="date"
              value={form.endDate}
              error={errors.endDate}
              onChange={(e) => patch({ endDate: e.target.value })}
            />
          </div>

          <div>
            <label
              htmlFor="promo-description"
              className="mb-1.5 block text-sm font-medium text-kampmax-text"
            >
              Description{" "}
              <span className="font-normal text-kampmax-text-secondary">
                (internal note)
              </span>
            </label>
            <textarea
              id="promo-description"
              value={form.description}
              rows={2}
              placeholder="What is this campaign trying to achieve?"
              onChange={(e) => patch({ description: e.target.value })}
              className="w-full rounded-lg border border-kampmax-border bg-white px-3 py-2 text-sm placeholder:text-kampmax-text-secondary/60 focus:border-kampmax-blue focus:outline-none focus:ring-1 focus:ring-kampmax-blue"
            />
          </div>

          {/* Targeting */}
          <div className="rounded-lg border border-dashed border-kampmax-border bg-kampmax-muted/30 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-kampmax-text-secondary">
              Targeting{" "}
              <span className="font-normal normal-case">
                - empty lists mean everyone / everything
              </span>
            </p>
            <div className="mt-3 space-y-3">
              {targetingFields.map((field) => (
                <ChipMultiSelect
                  key={field.key}
                  label={field.label}
                  items={field.items}
                  selected={form[field.key]}
                  required={field.required}
                  searchable={field.searchable}
                  error={field.error}
                  onToggle={(id) => toggle(field.key, id)}
                  onClearAll={() =>
                    setForm((f) => ({ ...f, [field.key]: [] }))
                  }
                />
              ))}
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
            {promotion ? "Save changes" : "Create promotion"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ChipMultiSelect({
  label,
  items,
  selected,
  required = false,
  searchable = false,
  error,
  onToggle,
  onClearAll,
}: {
  label: string;
  items: { id: string; name: string }[];
  selected: string[];
  required?: boolean;
  searchable?: boolean;
  error?: string;
  onToggle: (id: string) => void;
  onClearAll: () => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.trim().toLowerCase();
    return items.filter((i) => i.name.toLowerCase().includes(q));
  }, [items, query]);

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-kampmax-text">
          {label}
          {required && <span className="ml-1 text-kampmax-error">*</span>}
        </span>
        <span className="text-[11px] tabular-nums text-kampmax-text-secondary">
          {selected.length === 0
            ? `All ${label.toLowerCase()}`
            : `${selected.length} of ${items.length}`}
        </span>
      </div>

      <div
        className={cn(
          "rounded-md border bg-white",
          error ? "border-kampmax-error" : "border-kampmax-border"
        )}
      >
        <div className="flex items-center justify-between gap-2 px-2 pt-2">
          {searchable ? (
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-kampmax-text-secondary" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${label.toLowerCase()}…`}
                aria-label={`Search ${label.toLowerCase()}`}
                className="w-full rounded border-0 bg-transparent pl-6 pr-2 text-xs focus:outline-none focus:ring-0"
              />
            </div>
          ) : (
            <span />
          )}
          {selected.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="shrink-0 rounded px-1.5 py-0.5 text-[11px] font-medium text-kampmax-blue transition-colors hover:bg-kampmax-blue/10"
            >
              Clear
            </button>
          )}
        </div>
        <div className="max-h-36 space-y-px overflow-y-auto p-2">
          {filtered.map((item) => {
            const checked = selected.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                role="checkbox"
                aria-checked={checked}
                onClick={() => onToggle(item.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded px-2 py-1 text-left text-xs transition-colors hover:bg-kampmax-muted/60",
                  checked && "bg-kampmax-blue/10"
                )}
              >
                <span
                  className={cn(
                    "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border",
                    checked
                      ? "border-kampmax-blue bg-kampmax-blue text-white"
                      : "border-kampmax-border bg-white"
                  )}
                >
                  {checked && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                </span>
                <span className="min-w-0 flex-1 truncate text-kampmax-text">
                  {item.name}
                </span>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <p className="px-2 py-1.5 text-xs text-kampmax-text-secondary">
              No matches for “{query.trim()}”.
            </p>
          )}
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-kampmax-error">{error}</p>}
    </div>
  );
}
