"use client";

import { useState } from "react";
import { cn, formatNaira } from "@/lib/utils";
import { X, CreditCard, Building2, Smartphone } from "lucide-react";

interface FundingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFund: (amount: number, method: string) => void;
  balance: number;
}

const quickAmounts = [1000, 2000, 5000, 10000, 20000, 50000];

const fundingMethods = [
  { id: "card", label: "Debit Card", icon: CreditCard, description: "Visa, Mastercard" },
  { id: "bank_transfer", label: "Bank Transfer", icon: Building2, description: "All banks" },
  { id: "ussd", label: "USSD", icon: Smartphone, description: "Dial *737#" },
];

export function FundingModal({ isOpen, onClose, onFund, balance }: FundingModalProps) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("card");
  const [step, setStep] = useState<"form" | "processing" | "success">("form");

  if (!isOpen) return null;

  function handleFund() {
    const amt = Number(amount);
    if (amt < 100) return;
    setStep("processing");
    // Simulate processing
    setTimeout(() => {
      onFund(amt, method);
      setStep("success");
      setTimeout(() => {
        setStep("form");
        setAmount("");
        onClose();
      }, 2000);
    }, 1500);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="shrink-0 border-b border-kampmax-border px-4 py-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-kampmax-text">Fund Wallet</h2>
          <button
            onClick={() => {
              setStep("form");
              onClose();
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-kampmax-text-secondary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {step === "processing" && (
          <div className="p-8 text-center">
            <div className="w-12 h-12 rounded-full border-4 border-kampmax-blue border-t-transparent animate-spin mx-auto mb-4" />
            <p className="text-sm font-semibold text-kampmax-text">Processing...</p>
            <p className="text-xs text-kampmax-text-secondary mt-1">
              Redirecting to payment gateway
            </p>
          </div>
        )}

        {step === "success" && (
          <div className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✓</span>
            </div>
            <p className="text-sm font-semibold text-kampmax-text">Wallet Funded!</p>
            <p className="text-xs text-kampmax-text-secondary mt-1">
              Your balance has been updated
            </p>
          </div>
        )}

        {step === "form" && (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Current balance */}
              <div className="bg-kampmax-muted/50 rounded-xl p-3 flex items-center justify-between">
                <span className="text-xs text-kampmax-text-secondary">Current Balance</span>
                <span className="text-sm font-bold text-kampmax-text">{formatNaira(balance)}</span>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-medium text-kampmax-text-secondary mb-1.5">
                  Amount (₦)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  min={100}
                  className="w-full px-3 py-2.5 rounded-lg border border-kampmax-border text-sm text-kampmax-text focus:outline-none focus:border-kampmax-blue focus:ring-1 focus:ring-kampmax-blue/20"
                />
              </div>

              {/* Quick amounts */}
              <div>
                <p className="text-xs text-kampmax-text-secondary mb-2">Quick amounts</p>
                <div className="grid grid-cols-3 gap-2">
                  {quickAmounts.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setAmount(String(amt))}
                      className={cn(
                        "py-2 rounded-lg text-xs font-medium border transition-colors",
                        amount === String(amt)
                          ? "bg-kampmax-blue text-white border-kampmax-blue"
                          : "bg-white text-kampmax-text border-kampmax-border hover:border-kampmax-blue/50"
                      )}
                    >
                      {formatNaira(amt)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Method */}
              <div>
                <p className="text-xs text-kampmax-text-secondary mb-2">Payment Method</p>
                <div className="space-y-2">
                  {fundingMethods.map((m) => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        onClick={() => setMethod(m.id)}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-xl border transition-colors",
                          method === m.id
                            ? "border-kampmax-blue bg-kampmax-blue/5"
                            : "border-kampmax-border"
                        )}
                      >
                        <div
                          className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center",
                            method === m.id
                              ? "bg-kampmax-blue text-white"
                              : "bg-kampmax-muted text-kampmax-text-secondary"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium text-kampmax-text">{m.label}</p>
                          <p className="text-[10px] text-kampmax-text-secondary">
                            {m.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Note */}
              <div className="bg-kampmax-muted/50 rounded-lg p-3">
                <p className="text-[11px] text-kampmax-text-secondary leading-relaxed">
                  Minimum top-up: {formatNaira(100)}. Funds are added instantly after
                  payment confirmation. Paystack integration coming soon.
                </p>
              </div>
            </div>

            {/* Footer - static, outside scroll area */}
            <div className="shrink-0 border-t border-kampmax-border px-4 py-3">
              <button
                onClick={handleFund}
                disabled={!amount || Number(amount) < 100}
                className="w-full py-3 rounded-xl bg-kampmax-blue text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Fund Wallet · {amount ? formatNaira(Number(amount)) : formatNaira(0)}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
