"use client";

import { FormEvent, useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReasonDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  /** Visual severity of the action button. */
  tone?: "danger" | "warning" | "default";
  placeholder?: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
}

const TONE_BUTTON = {
  danger: "bg-kampmax-error text-white hover:bg-kampmax-error/90",
  warning: "bg-amber-500 text-white hover:bg-amber-600",
  default: "bg-kampmax-blue text-white hover:bg-kampmax-blue-dark",
} as const;

/**
 * Small modal that collects a mandatory free-text reason before a
 * destructive moderation action (reject / suspend).
 */
export function ReasonDialog({
  open,
  title,
  description,
  confirmLabel,
  tone = "danger",
  placeholder = "Explain this decision for the audit log…",
  loading = false,
  onClose,
  onConfirm,
}: ReasonDialogProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    if (!open) return;
    setReason("");
    setError(null);
    setWorking(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading && !working) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, loading, working, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (reason.trim().length < 10) {
      setError("Give a clear reason (at least 10 characters).");
      return;
    }
    setWorking(true);
    try {
      await onConfirm(reason.trim());
    } finally {
      setWorking(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reason-dialog-title"
    >
      <button
        type="button"
        aria-label="Close dialog"
        tabIndex={-1}
        className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
        onClick={() => !loading && !working && onClose()}
      />

      <form
        noValidate
        onSubmit={handleSubmit}
        className="relative w-full max-w-md overflow-hidden rounded-xl border border-kampmax-border bg-white shadow-xl"
      >
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between gap-3 px-5 py-4">
          <div>
            <h2 id="reason-dialog-title" className="text-sm font-semibold text-kampmax-text">
              {title}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-kampmax-text-secondary">
              {description}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            disabled={loading || working}
            className="rounded-md p-1 text-kampmax-text-secondary transition-colors hover:bg-kampmax-muted hover:text-kampmax-text disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 pb-1">
          <label htmlFor="moderation-reason" className="block text-xs font-semibold text-kampmax-text">
            Reason <span aria-hidden className="text-kampmax-error">*</span>
          </label>
          <textarea
            id="moderation-reason"
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError(null);
            }}
            rows={3}
            autoFocus
            placeholder={placeholder}
            className={cn(
              "mt-1.5 w-full resize-none rounded-lg border bg-white px-3 py-2 text-sm text-kampmax-text placeholder:text-kampmax-text-secondary/60 focus:outline-none focus:ring-1",
              error
                ? "border-kampmax-error focus:border-kampmax-error focus:ring-kampmax-error"
                : "border-kampmax-border focus:border-kampmax-blue focus:ring-kampmax-blue"
            )}
          />
          {error && (
            <p role="alert" className="mt-1 text-xs font-medium text-kampmax-error">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-kampmax-border bg-kampmax-muted/30 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading || working}
            className="inline-flex h-8 items-center rounded-md border border-kampmax-border bg-white px-3 text-xs font-medium text-kampmax-text transition-colors hover:bg-kampmax-muted disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || working}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors disabled:opacity-50",
              TONE_BUTTON[tone]
            )}
          >
            {(loading || working) && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {loading || working ? "Working…" : confirmLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
