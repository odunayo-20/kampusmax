"use client";

import { forwardRef, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg" | "icon";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-semibold tracking-tight transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2",
          "disabled:pointer-events-none",
          {
            // Primary: #1769E0 / hover #1258C7 / active #0F4CAD / disabled #93BDF5
            "bg-primary-600 text-white hover:bg-[#1258C7] active:bg-[#0F4CAD] disabled:bg-[#93BDF5] disabled:text-white": variant === "primary",
            // Secondary: #E8F1FD text #164A8A hover #D8E8FB
            "bg-primary-100 text-primary-700 hover:bg-[#D8E8FB] border border-transparent": variant === "secondary",
            // Outline: transparent border #D1D5DB text #1F2937 hover #F3F4F6
            "border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-100": variant === "outline",
            "text-neutral-700 hover:bg-neutral-100": variant === "ghost",
            "bg-error-600 text-white hover:bg-error-700": variant === "destructive",
          },
          {
            "h-8 px-3 text-xs rounded-md": size === "sm",
            "h-10 px-5 text-sm rounded-md": size === "md",
            "h-12 px-6 text-base rounded-md": size === "lg",
            "h-10 w-10 rounded-md p-0": size === "icon",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, type ButtonProps };
