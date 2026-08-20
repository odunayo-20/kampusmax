"use client";

import { forwardRef, SelectHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  placeholder?: string;
  leftIcon?: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      hint,
      placeholder,
      leftIcon,
      id,
      children,
      ...props
    },
    ref
  ) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-kampmax-text mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-kampmax-text-secondary pointer-events-none">
              {leftIcon}
            </div>
          )}
          <select
            ref={ref}
            id={selectId}
            className={cn(
              "w-full h-11 px-3 text-sm bg-white border rounded-lg appearance-none",
              "focus:outline-none focus:ring-1 transition-colors",
              error
                ? "border-kampmax-error focus:ring-kampmax-error focus:border-kampmax-error"
                : "border-kampmax-border focus:ring-kampmax-blue focus:border-kampmax-blue",
              leftIcon && "pl-10",
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {children}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg
              className="h-4 w-4 text-kampmax-text-secondary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {error && (
          <p className="mt-1 text-xs text-kampmax-error">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-1 text-xs text-kampmax-text-secondary">{hint}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
