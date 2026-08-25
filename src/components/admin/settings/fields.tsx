"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

// ------------------------------------------------------------
// Form primitives for the settings console. Each control takes
// label / hint / error so section forms stay declarative.
// ------------------------------------------------------------

const inputBase =
  "w-full h-10 rounded-lg border bg-white px-3 text-sm transition-colors focus:outline-none focus:ring-1";
const inputOk = "border-kampmax-border focus:border-kampmax-blue focus:ring-kampmax-blue";
const inputErr = "border-kampmax-error focus:border-kampmax-error focus:ring-kampmax-error";

function FieldWrap({
  label,
  htmlFor,
  error,
  hint,
  children,
  className,
}: {
  label?: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="mb-1 block text-[13px] font-medium text-kampmax-text"
        >
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p className="mt-1 text-xs text-kampmax-error" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1 text-[11px] leading-snug text-kampmax-text-secondary">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function TextField({
  label,
  value,
  onChange,
  error,
  hint,
  placeholder,
  type = "text",
  id,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  hint?: string;
  placeholder?: string;
  type?: string;
  id?: string;
}) {
  const inputId = id ?? `f-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <FieldWrap label={label} htmlFor={inputId} error={error} hint={hint}>
      <input
        id={inputId}
        type={type}
        value={value}
        placeholder={placeholder}
        aria-invalid={!!error}
        onChange={(e) => onChange(e.target.value)}
        className={cn(inputBase, error ? inputErr : inputOk)}
      />
    </FieldWrap>
  );
}

export function NumberField({
  label,
  value,
  onChange,
  error,
  hint,
  min,
  max,
  step = 1,
  prefix,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  error?: string;
  hint?: string;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
}) {
  const inputId = `f-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <FieldWrap
      label={label}
      htmlFor={inputId}
      error={error}
      hint={hint ?? (min !== undefined || max !== undefined ? `Allowed range: ${min ?? "-∞"} – ${max ?? "∞"}` : undefined)}
    >
      <div
        className={cn(
          "flex h-10 items-center overflow-hidden rounded-lg border bg-white transition-colors focus-within:ring-1",
          error
            ? "border-kampmax-error focus-within:ring-kampmax-error"
            : "border-kampmax-border focus-within:ring-kampmax-blue"
        )}
      >
        {prefix && (
          <span className="pl-3 text-sm tabular-nums text-kampmax-text-secondary">
            {prefix}
          </span>
        )}
        <input
          id={inputId}
          type="number"
          value={Number.isFinite(value) ? value : ""}
          min={min}
          max={max}
          step={step}
          aria-invalid={!!error}
          onChange={(e) => {
            const n = Number(e.target.value);
            onChange(Number.isFinite(n) ? n : 0);
          }}
          className="h-full w-full bg-transparent px-3 text-sm tabular-nums focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        />
        {suffix && (
          <span className="whitespace-nowrap pr-3 text-sm text-kampmax-text-secondary">
            {suffix}
          </span>
        )}
      </div>
    </FieldWrap>
  );
}

export function ToggleField({
  label,
  checked,
  onChange,
  hint,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-kampmax-text">{label}</p>
        {hint && (
          <p className="mt-0.5 text-[11px] leading-snug text-kampmax-text-secondary">
            {hint}
          </p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors",
          checked ? "bg-kampmax-success" : "bg-kampmax-border"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
            checked ? "left-[22px]" : "left-0.5"
          )}
        />
      </button>
    </div>
  );
}

export function SelectField<T extends string>({
  label,
  value,
  onChange,
  options,
  error,
  hint,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  error?: string;
  hint?: string;
}) {
  const inputId = `f-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <FieldWrap label={label} htmlFor={inputId} error={error} hint={hint}>
      <div className="relative">
        <select
          id={inputId}
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          className={cn("h-10 w-full appearance-none rounded-lg border bg-white px-3 pr-8 text-sm focus:outline-none focus:ring-1", error ? inputErr : inputOk)}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-kampmax-text-secondary"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </FieldWrap>
  );
}

/** Two-column responsive grid for related controls. */
export function FieldGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">{children}</div>;
}

/** Grouped subsection inside a settings form. */
export function FieldGroup({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="rounded-lg border border-kampmax-border p-4">
      <legend className="-ml-1 px-1 text-[13px] font-semibold text-kampmax-text">
        {title}
      </legend>
      {description && (
        <p className="-mt-1 mb-3 text-[11px] leading-snug text-kampmax-text-secondary">
          {description}
        </p>
      )}
      <div className="space-y-4">{children}</div>
    </fieldset>
  );
}
