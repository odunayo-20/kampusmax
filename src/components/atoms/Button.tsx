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
          "inline-flex items-center justify-center font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kampmax-blue focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:pointer-events-none",
          {
            "bg-kampmax-navy text-white hover:bg-kampmax-navy-light": variant === "primary",
            "bg-kampmax-blue text-white hover:bg-kampmax-blue-dark": variant === "secondary",
            "border border-kampmax-border bg-white text-kampmax-text hover:bg-kampmax-muted": variant === "outline",
            "text-kampmax-text hover:bg-kampmax-muted": variant === "ghost",
            "bg-kampmax-error text-white hover:bg-kampmax-error/90": variant === "destructive",
          },
          {
            "h-8 px-3 text-xs rounded": size === "sm",
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
