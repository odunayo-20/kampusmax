"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { notificationErrorMessage } from "@/lib/notification-utils";

interface NotificationErrorStateProps {
  error?: unknown;
  message?: string;
  onRetry?: () => void;
  compact?: boolean;
}

/**
 * Friendly, server-error-safe failure state for the feed and dropdown.
 * Raw errors are never shown; the message (or its friendlier mapped
 * equivalent) is displayed with a retry action when available.
 */
export function NotificationErrorState({
  error,
  message,
  onRetry,
  compact,
}: NotificationErrorStateProps) {
  const text = message ?? notificationErrorMessage(error);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-8 text-center",
        compact ? "py-8" : "py-16"
      )}
      role="alert"
    >
      <div className="w-12 h-12 rounded-full bg-kampmax-error/10 flex items-center justify-center mb-3">
        <AlertCircle className="h-6 w-6 text-kampmax-error" />
      </div>
      <p className="text-sm font-semibold text-kampmax-text mb-1">
        We couldn't load your notifications
      </p>
      <p className="text-xs text-kampmax-text-secondary max-w-[260px] mb-4">
        {text}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-kampmax-blue bg-kampmax-blue/10 hover:bg-kampmax-blue/15 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kampmax-blue"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </button>
      )}
    </div>
  );
}