"use client";

import { forwardRef, InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
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
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full h-11 px-3 text-sm bg-white border rounded-lg",
              "placeholder:text-kampmax-text-secondary/60",
              "focus:outline-none focus:ring-1 transition-colors",
              error
                ? "border-kampmax-error focus:ring-kampmax-error focus:border-kampmax-error"
                : "border-kampmax-border focus:ring-kampmax-blue focus:border-kampmax-blue",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-kampmax-text-secondary">
              {rightIcon}
            </div>
          )}
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

Input.displayName = "Input";
