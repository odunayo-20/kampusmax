"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info, Loader2 } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { formatNaira } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type {
  FlPayoutAccount,
  FlPayoutRequestInput,
  FlPayoutRequestResult,
} from "@/types/freelancer-financials";
import { FL_FINANCIAL_LIMITS, FL_FINANCIAL_RESULT } from "@/types/freelancer-financials";

// Payout modal (spec §29) — money-safety requirements:
//   1. A client-generated idempotency key per intended submission prevents
//      double-debits from retries. A fresh key is minted on every open and after
//      every failed submit, so a retry can never replay a used key.
//   2. The service re-validates balance / min / max / account / duplicates.
//   3. Success is shown ONLY after the service returns ok:true — never on
//      client-side optimism. Backend errors are surfaced verbatim.
//   4. Non-whole or malicious amounts are rejected by the service; the modal
//      never assumes its own number is right.

type Phase = "idle" | "amount" | "confirm" | "submitting" | "success" | "error";

interface FlPayoutRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: FlPayoutRequestInput) => FlPayoutRequestResult;
  account: FlPayoutAccount;
  available: number;
}

export function FlPayoutRequestModal({ isOpen, onClose, onSubmit, account, available }: FlPayoutRequestModalProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [amount, setAmount] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [idempotencyKey, setIdempotencyKey] = useState(() => freshKey());

  useEffect(() => {
    if (isOpen) {
      setPhase("amount");
      setAmount("");
      setConfirmed(false);
      setError(undefined);
      setIdempotencyKey(freshKey());
    } else {
      setPhase("idle");
    }
  }, [isOpen]);

  const fee = FL_FINANCIAL_LIMITS.PAYOUT_FEE;
  const min = FL_FINANCIAL_LIMITS.MIN_PAYOUT;
  const max = FL_FINANCIAL_LIMITS.MAX_PAYOUT;
  const amountVal = parseInt(amount, 10) || 0;
  const total = amountVal + fee;
  const maxAffordable = Math.max(0, available - fee);

  const validateAmount = (val: number): string | null => {
    if (!Number.isInteger(val) || val <= 0) return "Enter a valid whole-number amount.";
    if (val < min) return `Minimum payout is ${formatNaira(min)}.`;
    if (val > max) return `Maximum payout is ${formatNaira(max)}.`;
    if (val + fee > available) {
      return `Insufficient balance. Available: ${formatNaira(available)} (includes ${formatNaira(fee)} fee).`;
    }
    return null;
  };

  const handleNext = () => {
    const err = validateAmount(amountVal);
    if (err) { setError(err); return; }
    setError(undefined);
    setPhase("confirm");
  };

  const handleConfirmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateAmount(amountVal);
    if (err) { setError(err); setPhase("amount"); return; }
    if (!confirmed) { setError("Please confirm the payout details."); return; }

    setPhase("submitting");
    setError(undefined);
    const res = onSubmit({ amount: amountVal, payoutMethodId: "default", idempotencyKey, confirmed: true });

    if (res.ok && res.code === FL_FINANCIAL_RESULT.OK) {
      setPhase("success");
    } else {
      // Surface the BACKEND's authoritative error; never fabricate success.
      setError(res.error ?? "Your withdrawal could not be requested.");
      setPhase("error");
      // Fresh key so a retry is a brand-new intended submission.
      setIdempotencyKey(freshKey());
    }
  };

  const handleClose = () => {
    if (phase !== "submitting") onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="fl-payout-modal-title"
      className={cn("fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4", phase === "idle" && "hidden")}
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 id="fl-payout-modal-title" className="text-lg font-semibold text-kampmax-text">Withdraw funds</h2>
          <button
            type="button"
            onClick={handleClose}
            disabled={phase === "submitting"}
            className={cn("text-kampmax-text-secondary hover:text-kampmax-text", phase === "submitting" && "cursor-not-allowed opacity-50")}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {phase === "amount" && (
          <form
            onSubmit={(e) => { e.preventDefault(); handleNext(); }}
          >
            <div className="mt-6 space-y-4">
              <div className="rounded-lg bg-kampmax-muted p-3 text-sm">
                <p className="text-kampmax-text-secondary">
                  Withdrawing to <span className="font-medium text-kampmax-text">{account.bankName}</span>
                </p>
                <p className="font-mono text-kampmax-text-secondary">{account.maskedAccountNumber}</p>
              </div>

              <div>
                <label htmlFor="fl-payout-amount" className="mb-1.5 block text-sm font-medium text-kampmax-text">
                  Amount (NGN)
                </label>
                <Input
                  id="fl-payout-amount"
                  type="text"
                  inputMode="numeric"
                  value={amount}
                  onChange={(e) => { setAmount(e.target.value.replace(/[^0-9]/g, "")); setError(undefined); }}
                  placeholder="Enter amount"
                  error={error}
                  autoFocus
                />
                <p className="mt-1 text-xs text-kampmax-text-secondary">
                  Available: <strong>{formatNaira(available)}</strong> • Min {formatNaira(min)} • Fee {formatNaira(fee)}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <QuickAmount label="₦5,000" value={5000} onSelect={(v) => { setAmount(String(v)); setError(undefined); }} />
                <QuickAmount label="₦10,000" value={10000} onSelect={(v) => { setAmount(String(v)); setError(undefined); }} />
                <QuickAmount label="Withdraw all" value={maxAffordable} onSelect={(v) => { setAmount(String(Math.max(0, v))); setError(undefined); }} />
              </div>

              <div className="pt-2">
                <Button type="submit" className="w-full" disabled={!amount}>
                  Continue
                </Button>
              </div>
            </div>
          </form>
        )}

        {phase === "confirm" && (
          <form onSubmit={handleConfirmSubmit}>
            <div className="mt-6 space-y-4">
              <div className="space-y-3 rounded-lg bg-kampmax-muted p-4">
                <Row label="Payout amount" value={formatNaira(amountVal)} bold />
                <Row label="Fee" value={formatNaira(fee)} muted />
                <div className="flex items-center justify-between border-t border-kampmax-border pt-3">
                  <span className="text-sm font-medium text-kampmax-text">Total debited</span>
                  <span className="text-lg font-bold text-kampmax-text">{formatNaira(total)}</span>
                </div>
              </div>

              <div className="rounded-lg border border-kampmax-info/20 bg-info-50 p-3 text-xs text-kampmax-text-secondary">
                <div className="flex items-start gap-2">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-kampmax-info" />
                  <div className="space-y-1">
                    <p>Funds go to {account.bankName} {account.maskedAccountNumber} ({account.accountName}).</p>
                    <p>Your balance is re-validated on submit. Processing typically completes within 24 hours.</p>
                    <p>This action cannot be reversed once submitted.</p>
                  </div>
                </div>
              </div>

              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-600"
                />
                <span className="text-sm text-kampmax-text">
                  I confirm the amount, destination, and fee, and understand this cannot be reversed.
                </span>
              </label>

              {phase === "confirm" && error && (
                <div className="rounded-lg border border-kampmax-error/20 bg-error-50 p-3 text-sm text-kampmax-error">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" aria-hidden /> {error}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button variant="outline" type="button" onClick={() => setPhase("amount")} className="flex-1">Back</Button>
                <Button type="submit" disabled={!confirmed} className="flex-1">Confirm withdrawal</Button>
              </div>
            </div>
          </form>
        )}

        {phase === "submitting" && (
          <div className="mt-6 space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
              <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-kampmax-text">Processing withdrawal…</h3>
            <p className="text-sm text-kampmax-text-secondary">Please wait while we submit your request.</p>
          </div>
        )}

        {phase === "success" && (
          <div className="mt-6 space-y-4 text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-success-100">
              <CheckCircle className="h-8 w-8 text-kampmax-success" />
            </div>
            <h3 className="text-lg font-semibold text-kampmax-text">Withdrawal requested</h3>
            <p className="text-sm text-kampmax-text-secondary">
              Your withdrawal of {formatNaira(amountVal)} is being processed and should arrive within 24 hours.
            </p>
            <Button
              className="w-full"
              onClick={() => { setPhase("idle"); onClose(); }}
            >
              Done
            </Button>
          </div>
        )}

        {phase === "error" && (
          <div className="mt-6 space-y-4 text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-error-100">
              <AlertCircle className="h-8 w-8 text-kampmax-error" />
            </div>
            <h3 className="text-lg font-semibold text-kampmax-text">Withdrawal not submitted</h3>
            <p className="text-sm text-kampmax-text-secondary">{error ?? "The withdrawal could not be requested."}</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => { setConfirmed(false); setPhase("amount"); }} className="flex-1">
                Try again
              </Button>
              <Button onClick={handleClose} className="flex-1">Close</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function freshKey(): string {
  return `flp-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function QuickAmount({ label, value, onSelect }: { label: string; value: number; onSelect: (v: number) => void }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className="rounded-lg border border-kampmax-border px-3 py-2 text-sm text-kampmax-text hover:bg-neutral-50"
    >
      {label}
    </button>
  );
}

function Row({ label, value, muted, bold }: { label: string; value: string; muted?: boolean; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-kampmax-text-secondary">{label}</span>
      <span className={cn("text-kampmax-text", muted && "font-medium text-kampmax-text-secondary", bold && "font-semibold text-kampmax-text")}>
        {value}
      </span>
    </div>
  );
}
