"use client";

import { useEffect, useRef } from "react";
import { Loader2, X, AlertCircle, Flag } from "lucide-react";
import { cn } from "@/lib/utils";

// Completion confirmation. The backend determines whether completion is allowed;
// the UI never locally marks the contract complete and never touches financial
// status.

export function CompleteContractDialog({
  projectTitle,
  busy,
  error,
  onConfirm,
  onClose,
}: {
  projectTitle: string;
  busy: boolean;
  error: string | null;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    confirmRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [busy, onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="complete-contract-title"
      aria-describedby="complete-contract-desc"
    >
      <button
        type="button"
        aria-label="Cancel"
        tabIndex={-1}
        className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
        onClick={() => !busy && onClose()}
      />
      <div className="relative w-full max-w-md rounded-xl border border-kampmax-border bg-white p-5 shadow-xl">
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success-50 text-success-600 ring-1 ring-success-100">
            <Flag className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h2 id="complete-contract-title" className="text-sm font-semibold text-kampmax-text">
              Complete Project?
            </h2>
            <p id="complete-contract-desc" className="mt-1.5 text-sm leading-relaxed text-kampmax-text-secondary">
              Please confirm that you have completed the required work for{" "}
              <strong>{projectTitle}</strong>.
            </p>
          </div>
          {!busy && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="-mr-1 -mt-1 rounded-md p-1 text-kampmax-text-secondary hover:bg-kampmax-muted hover:text-kampmax-text"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <p className="mt-3 text-xs text-kampmax-text-muted">
          Completion is subject to backend review and approval. This does not
          release or affect any payments.
        </p>

        {error && (
          <p
            role="alert"
            className="mt-3 flex items-start gap-2 rounded-lg border border-error-100 bg-error-50 p-2.5 text-xs text-error-700"
          >
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            {error}
          </p>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="inline-flex h-9 items-center rounded-md border border-kampmax-border bg-white px-3.5 text-sm font-medium text-kampmax-text hover:bg-kampmax-muted disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-md px-3.5 text-sm font-medium text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60",
              "bg-success-600 hover:bg-success-700 focus-visible:outline-success-600"
            )}
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            {busy ? "Submitting…" : "Confirm Completion"}
          </button>
        </div>
      </div>
    </div>
  );
}
