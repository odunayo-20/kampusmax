"use client";

import { LabelHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function Label({ className, children, required, ...props }: LabelProps) {
  return (
    <label className={cn("block text-xs font-medium text-kampmax-text-secondary mb-1.5", className)} {...props}>
      {children}
      {required && <span className="text-kampmax-error ml-1" aria-hidden="true">*</span>}
    </label>
  );
}