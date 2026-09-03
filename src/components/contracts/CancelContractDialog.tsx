"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, X, AlertCircle, Ban } from "lucide-react";
import { cn } from "@/lib/utils";

const CANCEL_REASONS = [
  { value: "schedule", label: "I can no longer take on this project" },
  { value: "scope", label: "The scope changed unexpectedly" },
  { value: "communication", label: "Poor communication with the client" },
  { value: "duplicate", label: "This contract is a duplicate or was set up in error" },
  { value: "other", label: "Other reason" },
];

// Cancellation request. The backend validates eligibility and performs the
// transition — the frontend never sets `status = cancelled` directly. The user
// is warned that cancellation may have consequences.

export function CancelContractDialog({
  contractTitle,
  busy,
  error,
  onConfirm,
  onClose,
}: {
  contractTitle: string;
  busy: boolean;
  error: string | null;
  onConfirm: (reason: string, details: string) => void;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const reasonRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    reasonRef.current?.focus();
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

  function confirm() {
    if (busy) return;
    if (!reason) {
      setLocalError("Please select a reason for cancellation.");
      return;
    }
    setLocalError(null);
    onConfirm(reason, details);
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="cancel-contract-title"
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
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-error-50 text-error-600 ring-1 ring-error-100">
            <Ban className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h2 id="cancel-contract-title" className="text-sm font-semibold text-kampmax-text">
              Cancel this contract?
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-kampmax-text-secondary">
              You&apos;re requesting to cancel <strong>{contractTitle}</strong>.
              Cancellation may affect your project history and any in-progress
              work. This requires review by the platform.
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

        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="cancel-reason" className="text-sm font-medium text-kampmax-text">
              Why are you requesting cancellation?
            </label>
            <select
              id="cancel-reason"
              ref={reasonRef}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-kampmax-border bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">Select a reason…</option>
              {CANCEL_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="cancel-details" className="text-sm font-medium text-kampmax-text">
              Additional information (optional)
            </label>
            <textarea
              id="cancel-details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              maxLength={1000}
              placeholder="Any context that will help review your request…"
              className="mt-1.5 w-full rounded-lg border border-kampmax-border px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>

        {(localError || error) && (
          <p
            role="alert"
            className="mt-3 flex items-start gap-2 rounded-lg border border-error-100 bg-error-50 p-2.5 text-xs text-error-700"
          >
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            {localError ?? error}
          </p>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="inline-flex h-9 items-center rounded-md border border-kampmax-border bg-white px-3.5 text-sm font-medium text-kampmax-text hover:bg-kampmax-muted disabled:opacity-60"
          >
            Keep Contract
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={busy}
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-md px-3.5 text-sm font-medium text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60",
              "bg-error-600 hover:bg-error-700 focus-visible:outline-error-600"
            )}
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            {busy ? "Requesting…" : "Cancel Contract"}
          </button>
        </div>
      </div>
    </div>
  );
}
