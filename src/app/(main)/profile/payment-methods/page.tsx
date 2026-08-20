"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, CreditCard, Plus, Trash2, Check, X, Building2, Wallet,
} from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { SettingsGroup, SettingsRow, SettingsToggle } from "@/components/profile/SettingsGroup";
import { SavedPaymentMethod } from "@/types";
import {
  getSavedPaymentMethods,
  addPaymentMethod,
  deletePaymentMethod,
  setDefaultPaymentMethod,
} from "@/services/profile";

const brandIcons: Record<string, string> = {
  Verve: "💳",
  Mastercard: "💳",
  Visa: "💳",
};

export default function PaymentMethodsPage() {
  const router = useRouter();
  const [methods, setMethods] = useState<SavedPaymentMethod[]>(getSavedPaymentMethods);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formType, setFormType] = useState<"card" | "bank_account">("card");
  const [formLabel, setFormLabel] = useState("");
  const [formLast4, setFormLast4] = useState("");
  const [formBrand, setFormBrand] = useState("Verve");
  const [formBankName, setFormBankName] = useState("");

  function handleAdd() {
    if (!formLabel.trim() || !formLast4.trim()) return;
    addPaymentMethod({
      type: formType,
      label: formLabel,
      last4: formLast4,
      brand: formType === "card" ? formBrand : undefined,
      bankName: formType === "bank_account" ? formBankName : undefined,
      isDefault: methods.length === 0,
    });
    setMethods(getSavedPaymentMethods());
    setShowForm(false);
    setFormLabel("");
    setFormLast4("");
    setFormBrand("Verve");
    setFormBankName("");
  }

  function handleDelete(id: string) {
    deletePaymentMethod(id);
    setMethods(getSavedPaymentMethods());
    setDeletingId(null);
  }

  function handleSetDefault(id: string) {
    setDefaultPaymentMethod(id);
    setMethods(getSavedPaymentMethods());
  }

  function getIcon(method: SavedPaymentMethod) {
    if (method.type === "card") {
      return (
        <div className="w-9 h-9 rounded-lg bg-kampmax-navy/5 flex items-center justify-center">
          <CreditCard className="h-4 w-4 text-kampmax-navy" />
        </div>
      );
    }
    return (
      <div className="w-9 h-9 rounded-lg bg-kampmax-blue/10 flex items-center justify-center">
        <Building2 className="h-4 w-4 text-kampmax-blue" />
      </div>
    );
  }

  return (
    <PageContainer className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Profile", href: "/profile" },
          { label: "Payment Methods" },
        ]}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-lg bg-kampmax-muted flex items-center justify-center"
          >
            <ArrowLeft className="h-5 w-5 text-kampmax-text" />
          </button>
          <h1 className="text-lg font-bold text-kampmax-text">Payment Methods</h1>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="w-9 h-9 rounded-lg bg-kampmax-blue text-white flex items-center justify-center"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {/* Wallet Quick Access */}
      <div
        onClick={() => router.push("/profile/wallet")}
        className="bg-gradient-to-r from-kampmax-navy to-kampmax-blue rounded-xl p-4 cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
            <Wallet className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Kampmax Wallet</p>
            <p className="text-xs text-white/70">Pay instantly from your wallet balance</p>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      {methods.length === 0 && !showForm ? (
        <div className="bg-white rounded-xl border border-kampmax-border p-8 text-center">
          <CreditCard className="h-10 w-10 text-kampmax-text-secondary mx-auto mb-3" />
          <p className="text-sm font-medium text-kampmax-text">No payment methods</p>
          <p className="text-xs text-kampmax-text-secondary mt-1">
            Add a card or bank account for faster checkout
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 px-4 py-2 bg-kampmax-blue text-white text-sm font-medium rounded-lg"
          >
            Add Payment Method
          </button>
        </div>
      ) : (
        <SettingsGroup>
          {methods.map((method) => (
            <div key={method.id} className="p-4">
              <div className="flex items-center gap-3">
                {getIcon(method)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-kampmax-text truncate">
                      {method.label}
                    </span>
                    {method.isDefault && (
                      <span className="text-[10px] bg-kampmax-blue/10 text-kampmax-blue px-1.5 py-0.5 rounded font-medium flex-shrink-0">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-kampmax-text-secondary">
                    {method.type === "card"
                      ? `${method.brand} •••• ${method.last4}`
                      : `${method.bankName} •••• ${method.last4}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-3 ml-12">
                {!method.isDefault && (
                  <button
                    onClick={() => handleSetDefault(method.id)}
                    className="text-xs text-kampmax-blue font-medium flex items-center gap-1"
                  >
                    <Check className="h-3 w-3" /> Set Default
                  </button>
                )}
                {deletingId === method.id ? (
                  <div className="flex items-center gap-2 ml-auto">
                    <span className="text-xs text-kampmax-error">Remove?</span>
                    <button
                      onClick={() => handleDelete(method.id)}
                      className="text-xs text-kampmax-error font-medium"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setDeletingId(null)}
                      className="text-xs text-kampmax-text-secondary"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeletingId(method.id)}
                    className="text-xs text-kampmax-error font-medium flex items-center gap-1 ml-auto"
                  >
                    <Trash2 className="h-3 w-3" /> Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </SettingsGroup>
      )}

      {/* Security Note */}
      <div className="bg-kampmax-muted/50 rounded-xl p-4">
        <p className="text-xs text-kampmax-text-secondary leading-relaxed">
          🔒 Your payment information is encrypted and securely stored. We never share your financial details with vendors.
        </p>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-md sm:rounded-xl rounded-t-xl">
            <div className="sticky top-0 bg-white border-b border-kampmax-border px-4 py-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-kampmax-text">Add Payment Method</h2>
              <button
                onClick={() => setShowForm(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-kampmax-text-secondary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex gap-2">
                {(["card", "bank_account"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFormType(type)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                      formType === type
                        ? "bg-kampmax-blue text-white border-kampmax-blue"
                        : "bg-white text-kampmax-text border-kampmax-border"
                    }`}
                  >
                    {type === "card" ? "Debit Card" : "Bank Account"}
                  </button>
                ))}
              </div>
              <div>
                <label className="block text-xs font-medium text-kampmax-text-secondary mb-1.5">
                  Label
                </label>
                <input
                  type="text"
                  value={formLabel}
                  onChange={(e) => setFormLabel(e.target.value)}
                  placeholder="e.g. GTBank Verve Card"
                  className="w-full px-3 py-2.5 rounded-lg border border-kampmax-border text-sm text-kampmax-text focus:outline-none focus:border-kampmax-blue focus:ring-1 focus:ring-kampmax-blue/20"
                />
              </div>
              {formType === "card" && (
                <div>
                  <label className="block text-xs font-medium text-kampmax-text-secondary mb-1.5">
                    Card Brand
                  </label>
                  <select
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-kampmax-border text-sm text-kampmax-text bg-white focus:outline-none focus:border-kampmax-blue focus:ring-1 focus:ring-kampmax-blue/20"
                  >
                    <option value="Verve">Verve</option>
                    <option value="Mastercard">Mastercard</option>
                    <option value="Visa">Visa</option>
                  </select>
                </div>
              )}
              {formType === "bank_account" && (
                <div>
                  <label className="block text-xs font-medium text-kampmax-text-secondary mb-1.5">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={formBankName}
                    onChange={(e) => setFormBankName(e.target.value)}
                    placeholder="e.g. Guaranty Trust Bank"
                    className="w-full px-3 py-2.5 rounded-lg border border-kampmax-border text-sm text-kampmax-text focus:outline-none focus:border-kampmax-blue focus:ring-1 focus:ring-kampmax-blue/20"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-kampmax-text-secondary mb-1.5">
                  Last 4 Digits
                </label>
                <input
                  type="text"
                  value={formLast4}
                  onChange={(e) => setFormLast4(e.target.value.slice(0, 4))}
                  maxLength={4}
                  placeholder="••••"
                  className="w-full px-3 py-2.5 rounded-lg border border-kampmax-border text-sm text-kampmax-text focus:outline-none focus:border-kampmax-blue focus:ring-1 focus:ring-kampmax-blue/20"
                />
              </div>
            </div>
            <div className="sticky bottom-0 bg-white border-t border-kampmax-border px-4 py-3">
              <button
                onClick={handleAdd}
                disabled={!formLabel.trim() || !formLast4.trim() || formLast4.length < 4}
                className="w-full py-3 rounded-xl bg-kampmax-blue text-white text-sm font-semibold disabled:opacity-40"
              >
                Save Payment Method
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
