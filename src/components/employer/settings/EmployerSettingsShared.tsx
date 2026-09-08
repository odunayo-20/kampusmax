"use client";

import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { SettingsGroup } from "@/components/profile/SettingsGroup";

/** Section heading shown above a settings section's content. */
export function SettingsSectionHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <header className="space-y-1">
      <h1 className="text-xl font-bold text-kampmax-text">{title}</h1>
      {description && (
        <p className="text-sm text-kampmax-text-secondary">{description}</p>
      )}
    </header>
  );
}

/** Read-only label/value row used inside a SettingsGroup. */
export function SettingsValueRow({
  label,
  children,
  value,
  note,
}: {
  label: string;
  children?: React.ReactNode;
  value?: string;
  note?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-kampmax-text">{label}</p>
        {note && (
          <p className="mt-0.5 text-xs text-kampmax-text-secondary">{note}</p>
        )}
      </div>
      <div className="flex-shrink-0 text-sm text-kampmax-text-secondary">
        {value ?? children}
      </div>
    </div>
  );
}

/** Loading state for a settings section. */
export function SettingsLoading({ label = "Loading settings" }: { label?: string }) {
  return (
    <div
      role="status"
      aria-label={label}
      className="flex h-40 items-center justify-center"
    >
      <div className="flex items-center gap-2 text-sm text-kampmax-text-secondary">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        {label}…
      </div>
    </div>
  );
}

/** Error state with a retry action. */
export function SettingsError({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="space-y-3">
      <SettingsGroup>
        <div className="flex items-center gap-3 px-4 py-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-kampmax-error" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-kampmax-error">
              Could not load settings
            </p>
            <p className="mt-0.5 text-xs text-kampmax-text-secondary">
              {message}
            </p>
          </div>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="flex flex-shrink-0 items-center gap-1.5 rounded-lg border border-kampmax-border bg-white px-2.5 py-1.5 text-xs font-semibold text-kampmax-text transition-colors hover:bg-kampmax-muted"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden />
              Retry
            </button>
          )}
        </div>
      </SettingsGroup>
    </div>
  );
}

/** Inline note card mirroring the platform settings info blocks. */
export function SettingsNote({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-xl bg-kampmax-muted/50 p-4",
        className
      )}
    >
      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-kampmax-text-secondary" aria-hidden />
      <p className="text-xs leading-relaxed text-kampmax-text-secondary">
        {children}
      </p>
    </div>
  );
}