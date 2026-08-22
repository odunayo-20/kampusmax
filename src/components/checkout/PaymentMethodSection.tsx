"use client";

import {
  Wallet,
  CreditCard,
  Banknote,
  CheckCircle2,
  AlertCircle,
  Shield,
} from "lucide-react";
import { PaymentMethod, CheckoutFormData, CheckoutValidation } from "@/types";
import { cn, formatNaira } from "@/lib/utils";

interface PaymentMethodSectionProps {
  form: CheckoutFormData;
  errors: CheckoutValidation;
  walletBalance: number;
  finalTotal: number;
  onFieldChange: <K extends keyof CheckoutFormData>(key: K, value: CheckoutFormData[K]) => void;
}

interface PaymentOption {
  id: PaymentMethod;
  label: string;
  desc: string;
  icon: typeof Wallet;
  available: boolean;
  disabledReason?: string;
}

export function PaymentMethodSection({
  form,
  errors,
  walletBalance,
  finalTotal,
  onFieldChange,
}: PaymentMethodSectionProps) {
  const hasEnoughBalance = walletBalance >= finalTotal;

  const options: PaymentOption[] = [
    {
      id: "wallet",
      label: "Kampmax Wallet",
      desc: `Balance: ${formatNaira(walletBalance)}`,
      icon: Wallet,
      available: true,
      disabledReason: !hasEnoughBalance
        ? `Need ${formatNaira(finalTotal - walletBalance)} more`
        : undefined,
    },
    {
      id: "paystack",
      label: "Paystack",
      desc: "Card, Bank Transfer, USSD",
      icon: CreditCard,
      available: true,
    },
    {
      id: "cod",
      label: "Cash on Pickup",
      desc: "Pay when you collect your order",
      icon: Banknote,
      available: form.deliveryMethod === "campus_pickup" || form.deliveryMethod === "meetup",
      disabledReason:
        form.deliveryMethod === "delivery"
          ? "Only available for pickup/meetup"
          : undefined,
    },
    {
      id: "bank_transfer",
      label: "Direct Bank Transfer",
      desc: "Pay to Kampmax bank account",
      icon: CreditCard,
      available: true,
    },
  ];

  return (
    <section className="bg-white rounded-xl border border-kampmax-border p-4 space-y-3">
      <h3 className="text-sm font-semibold text-kampmax-text flex items-center gap-2">
        <CreditCard className="h-4 w-4 text-kampmax-blue" />
        Payment Method
      </h3>

      <div className="space-y-2">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => opt.available && onFieldChange("paymentMethod", opt.id)}
            disabled={!opt.available}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all",
              form.paymentMethod === opt.id && opt.available
                ? "border-kampmax-blue bg-kampmax-blue/10 ring-1 ring-kampmax-blue"
                : opt.available
                  ? "border-kampmax-border hover:border-kampmax-blue/50"
                  : "border-kampmax-border opacity-50 cursor-not-allowed"
            )}
          >
            <opt.icon
              className={cn(
                "h-5 w-5 shrink-0",
                form.paymentMethod === opt.id && opt.available
                  ? "text-kampmax-blue"
                  : "text-kampmax-text-secondary/60"
              )}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium text-kampmax-text">{opt.label}</p>
                {opt.id === "wallet" && hasEnoughBalance && (
                  <span className="text-[10px] font-medium text-kampmax-success bg-kampmax-success/10 px-1.5 py-0.5 rounded">
                    Sufficient
                  </span>
                )}
              </div>
              <p className="text-xs text-kampmax-text-secondary">{opt.desc}</p>
              {opt.disabledReason && (
                <p className="text-[10px] text-kampmax-error mt-0.5">
                  {opt.disabledReason}
                </p>
              )}
            </div>
            {form.paymentMethod === opt.id && opt.available && (
              <CheckCircle2 className="h-5 w-5 text-kampmax-blue shrink-0" />
            )}
          </button>
        ))}
      </div>

      {errors.paymentMethod && (
        <p className="text-xs text-kampmax-error flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {errors.paymentMethod}
        </p>
      )}

      {form.paymentMethod === "paystack" && (
        <div className="flex items-center gap-1.5 p-2 bg-kampmax-blue/10 rounded-lg">
          <Shield className="w-3.5 h-3.5 text-kampmax-blue shrink-0" />
          <p className="text-[10px] text-kampmax-text-secondary">
            Secured by Paystack. Your card details are never stored.
          </p>
        </div>
      )}

      {form.paymentMethod === "cod" && (
        <div className="flex items-center gap-1.5 p-2 bg-kampmax-gold/10 rounded-lg">
          <AlertCircle className="w-3.5 h-4 text-kampmax-warning shrink-0" />
          <p className="text-[10px] text-kampmax-text-secondary">
            Please have the exact amount ready. Payment is collected at pickup.
          </p>
        </div>
      )}
    </section>
  );
}
