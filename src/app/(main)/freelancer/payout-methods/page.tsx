"use client";

import { useState } from "react";
import {
  getPayoutAccount,
  updatePayoutAccount,
} from "@/services/freelancer-financials";
import type { FlPayoutAccountInput } from "@/types/freelancer-financials";
import { FlFinancialSubnav } from "@/components/freelancer/financials/FlFinancialSubnav";
import { FlPayoutMethodCard } from "@/components/freelancer/financials/FlPayoutMethodCard";
import { FlPayoutMethodForm } from "@/components/freelancer/financials/FlPayoutMethodForm";

// Payout method (spec §26). Account numbers are masked for display; the form
// collects the raw number only to hand to the service, which returns the masked
// value as the ONLY stored form. Verification status is backend-authoritative.

export default function FreelancerPayoutMethodsPage() {
  const [account, setAccount] = useState(() => getPayoutAccount());
  const [saving, setSaving] = useState(false);
  const hasAccount = account.status !== "missing";

  const handleUpdate = (input: FlPayoutAccountInput) => {
    setSaving(true);
    const result = updatePayoutAccount(input);
    setSaving(false);
    if (result.ok && result.account) {
      setAccount(result.account);
    }
    return result;
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold text-kampmax-text">Payout method</h1>
        <p className="mt-1 text-sm text-kampmax-text-secondary">
          Manage the bank account your withdrawals are sent to.
        </p>
      </header>

      <FlFinancialSubnav />

      {hasAccount && (
        <FlPayoutMethodCard
          account={account}
          canWithdraw={account.status === "verified"}
        />
      )}

      <section aria-labelledby="manage-method-heading" className="space-y-3">
        <h2 id="manage-method-heading" className="text-lg font-semibold text-kampmax-text">
          {hasAccount ? "Update payout method" : "Add payout method"}
        </h2>
        <div className="rounded-xl border border-kampmax-border bg-white p-5">
          {hasAccount ? (
            <p className="mb-4 text-sm text-kampmax-text-secondary">
              Changes are validated and move the account to pending verification before the new details take effect.
            </p>
          ) : (
            <p className="mb-4 text-sm text-kampmax-text-secondary">
              Add and verify a bank account to start withdrawing your earnings.
            </p>
          )}
          <FlPayoutMethodForm
            initial={hasAccount ? { bankName: account.bankName, accountName: account.accountName } : undefined}
            onSubmit={handleUpdate}
            isSubmitting={saving}
          />
        </div>
      </section>
    </div>
  );
}
