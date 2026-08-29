"use client";

import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, description, id, checked, onChange, ...props }, ref) => {
    const switchId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <label className={cn("flex items-center cursor-pointer gap-3", className)}>
        <div className="relative inline-flex items-center">
          <input
            ref={ref}
            type="checkbox"
            id={switchId}
            className="sr-only peer"
            checked={checked}
            onChange={onChange}
            {...props}
          />
          <div className={cn(
            "w-11 h-6 rounded-full transition-colors peer-focus:ring-2 peer-focus:ring-kampmax-blue peer-focus:ring-offset-2",
            checked ? "bg-kampmax-blue" : "bg-kampmax-border"
          )} />
          <span className={cn(
            "absolute left-1 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow transition-transform",
            checked ? "translate-x-5" : "translate-x-0"
          )} />
        </div>
        {(label || description) && (
          <div className="flex flex-col">
            {label && <span className="text-sm font-medium text-kampmax-text">{label}</span>}
            {description && <p className="text-xs text-kampmax-text-secondary">{description}</p>}
          </div>
        )}
      </label>
    );
  }
);

Switch.displayName = "Switch";