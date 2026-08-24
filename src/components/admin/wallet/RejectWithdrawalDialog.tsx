"use client";

import { FormEvent, useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import type { WithdrawalRequest } from "@/types/admin";

interface RejectWithdrawalDialogProps {
  open: boolean;
  withdrawal: WithdrawalRequest | null;
  working?: boolean;
  onClose: () => void;
  onReject: (withdrawal: WithdrawalRequest, note: string) => Promise<void>;
}

/** Rejection requires a reason - it is written back to the vendor. */
export function RejectWithdrawalDialog({
  open,
  withdrawal,
  working = false,
  onClose,
  onReject,
}: RejectWithdrawalDialogProps) {
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setNote("");
      setError(null);
    }
  }, [open]);

  if (!open || !withdrawal) return null;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (note.trim().length < 8) {
      setError("Give the vendor a clear reason (at least 8 characters).");
      return;
    }
    await onReject(withdrawal, note.trim());
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Reject withdrawal request"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !working) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-lg border border-kampmax-border bg-white p-4 shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-kampmax-text">Reject withdrawal</h2>
            <p className="mt-0.5 text-xs text-kampmax-text-secondary">
              {withdrawal.vendorName} · {withdrawal.bankName} ·{" "}
              {withdrawal.accountNumberMasked}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            disabled={working}
            className="rounded-md p-1 text-kampmax-text-secondary hover:bg-kampmax-muted hover:text-kampmax-text disabled:opacity-40"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={submit} className="mt-3">
          <label
            htmlFor="reject-note"
            className="block text-xs font-medium uppercase tracking-wide text-kampmax-text-secondary"
          >
            Reason (sent to vendor)
          </label>
          <textarea
            id="reject-note"
            value={note}
            onChange={(e) => {
              setNote(e.target.value);
              if (error) setError(null);
            }}
            rows={3}
            autoFocus
            placeholder="e.g. Bank account name does not match BVN records"
            className="mt-1 w-full rounded-md border border-kampmax-border bg-white px-3 py-2 text-sm text-kampmax-text placeholder:text-kampmax-text-secondary/60 focus:border-kampmax-blue focus:outline-none focus:ring-1 focus:ring-kampmax-blue"
          />
          {error && <p className="mt-1 text-xs text-kampmax-error">{error}</p>}

          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={working}
              className="h-9 rounded-md border border-kampmax-border bg-white px-3.5 text-sm font-medium text-kampmax-text hover:bg-kampmax-muted disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={working}
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-kampmax-error px-3.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
            >
              {working && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Reject request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
