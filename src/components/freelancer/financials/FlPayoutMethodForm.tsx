"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FlPayoutAccountInput, FlPayoutAccountResult } from "@/types/freelancer-financials";
import { FL_PAYOUT_ACCOUNT_RESULT } from "@/types/freelancer-financials";

// Payout method form (spec §26). The plan specifies that the backend MASK the
// account number — the client never stores a full number. This form collects the
// raw number only to hand it to updatePayoutAccount(), which returns the masked
// representation as the ONLY persisted account value.

export function FlPayoutMethodForm({
  initial,
  onSubmit,
  isSubmitting,
}: {
  initial?: { bankName: string; accountName: string };
  onSubmit: (input: FlPayoutAccountInput) => FlPayoutAccountResult;
  isSubmitting: boolean;
}) {
  const [bankName, setBankName] = useState(initial?.bankName ?? "");
  const [accountName, setAccountName] = useState(initial?.accountName ?? "");
  const [accountNumber, setAccountNumber] = useState("");
  const [confirmNumber, setConfirmNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (accountNumber !== confirmNumber) {
      setError("Account numbers do not match.");
      return;
    }
    if (bankName.trim() === "" || accountName.trim() === "") {
      setError("Fill in your bank and account name.");
      return;
    }
    if (accountNumber.replace(/\D/g, "").length !== 10) {
      setError("Enter a valid 10-digit NUBAN account number.");
      return;
    }

    const result = onSubmit({ bankName, accountName, accountNumber });
    if (!result.ok || result.code !== FL_PAYOUT_ACCOUNT_RESULT.OK) {
      setError(result.error ?? "Could not save payout method.");
      return;
    }

    setAccountNumber("");
    setConfirmNumber("");
    setSuccess("Payout method submitted. It’s being verified by the payment system.");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Bank">
        <input
          type="text"
          value={bankName}
          onChange={(e) => setBankName(e.target.value)}
          className={inputClass}
          placeholder="e.g. Guaranty Trust Bank"
          autoComplete="organization"
        />
      </Field>

      <Field label="Account name">
        <input
          type="text"
          value={accountName}
          onChange={(e) => setAccountName(e.target.value)}
          className={inputClass}
          placeholder="Name on the account"
          autoComplete="name"
        />
      </Field>

      <Field label="Account number">
        <input
          type="text"
          inputMode="numeric"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          className={inputClass}
          placeholder="10-digit NUBAN"
          maxLength={10}
          autoComplete="off"
        />
      </Field>

      <Field label="Confirm account number">
        <input
          type="text"
          inputMode="numeric"
          value={confirmNumber}
          onChange={(e) => setConfirmNumber(e.target.value)}
          className={inputClass}
          placeholder="Re-enter account number"
          maxLength={10}
          autoComplete="off"
        />
      </Field>

      {error && <p role="alert" className="text-sm text-error-700">{error}</p>}
      {success && (
        <p role="status" className="flex items-center gap-2 text-sm text-kampmax-success">
          <CheckCircle2 className="h-4 w-4" aria-hidden /> {success}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex h-10 items-center rounded-md bg-primary-600 px-4 text-sm font-semibold text-white hover:bg-[#1258C7] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
      >
        {isSubmitting ? "Saving…" : "Save payout method"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-kampmax-text">{label}</span>
      {children}
    </label>
  );
}

const inputClass = cn(
  "w-full rounded-md border border-kampmax-border bg-white px-3 py-2 text-sm text-kampmax-text",
  "placeholder:text-kampmax-text-muted focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-600/20"
);
