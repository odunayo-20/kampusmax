"use client";

import { AlertTriangle, RefreshCw, X, ShieldAlert } from "lucide-react";
import { CheckoutErrorInfo } from "@/types/checkout";

interface CheckoutErrorBannerProps {
  error: CheckoutErrorInfo | null;
  onDismiss?: () => void;
  onRefresh?: () => void;
  showRefresh?: boolean;
  variant?: "error" | "warning" | "info";
}

export function CheckoutErrorBanner({
  error,
  onDismiss,
  onRefresh,
  showRefresh,
  variant = "error",
}: CheckoutErrorBannerProps) {
  if (!error?.message) return null;

  const styles: Record<string, string> = {
    error: "bg-kampmax-error/10 border-kampmax-error/30 text-kampmax-error",
    warning: "bg-kampmax-warning/10 border-kampmax-warning/40 text-kampmax-warning",
    info: "bg-kampmax-blue/10 border-kampmax-blue/30 text-kampmax-blue",
  };

  const Icon = variant === "error" ? ShieldAlert : AlertTriangle;

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 p-3.5 rounded-lg border ${styles[variant]}`}
    >
      <Icon className="h-5 w-5 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{error.message}</p>
        {error.reference && (
          <p className="text-xs opacity-70 mt-0.5">Ref: {error.reference}</p>
        )}
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold underline underline-offset-2 hover:opacity-80"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {showRefresh ? "Refresh Checkout" : "Retry"}
          </button>
        )}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss message"
          className="p-1 rounded hover:bg-black/5 transition-colors shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
