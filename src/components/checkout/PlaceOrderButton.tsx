"use client";

import { Check, Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import { CHECKOUT_STATES, CheckoutState } from "@/types/checkout";
import { cn } from "@/lib/utils";

interface PlaceOrderButtonProps {
  state: CheckoutState;
  disabled?: boolean;
  loadingLabel?: string;
  onClick: () => void;
}

const LABELS: Record<string, string> = {
  [CHECKOUT_STATES.VALIDATING]: "Validating order…",
  [CHECKOUT_STATES.PAYMENT_INITIALIZING]: "Contacting secure payment…",
  [CHECKOUT_STATES.PAYMENT_PENDING]: "Completing payment in Paystack…",
  [CHECKOUT_STATES.PAYMENT_SUCCESS]: "Confirming your order…",
};

export function PlaceOrderButton({
  state,
  disabled,
  loadingLabel,
  onClick,
}: PlaceOrderButtonProps) {
  const busyStates: string[] = [
    CHECKOUT_STATES.VALIDATING,
    CHECKOUT_STATES.PAYMENT_INITIALIZING,
    CHECKOUT_STATES.PAYMENT_PENDING,
    CHECKOUT_STATES.PAYMENT_SUCCESS,
  ];
  const isBusy = busyStates.includes(state);
  const failedStates: string[] = [
    CHECKOUT_STATES.PAYMENT_FAILED,
    CHECKOUT_STATES.PAYMENT_CANCELLED,
    CHECKOUT_STATES.SESSION_EXPIRED,
    CHECKOUT_STATES.VALIDATION_FAILED,
    CHECKOUT_STATES.NETWORK_ERROR,
  ];
  const failed = failedStates.includes(state);

  return (
    <div className="space-y-2">
      <button
        onClick={onClick}
        disabled={disabled || isBusy}
        className={cn(
          "w-full h-12 px-6 rounded-xl text-base font-bold transition-colors",
          "inline-flex items-center justify-center gap-2",
          failed
            ? "bg-kampmax-error text-white hover:bg-kampmax-error/90"
            : "bg-kampmax-navy text-white hover:bg-kampmax-navy-light",
          (disabled || isBusy) && "opacity-70 cursor-not-allowed"
        )}
      >
        {isBusy ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            {loadingLabel ||
              LABELS[state as keyof typeof LABELS] ||
              "Processing…"}
          </>
        ) : failed ? (
          <>
            <AlertCircle className="h-5 w-5" />
            Retry payment
          </>
        ) : (
          <>
            <ShieldCheck className="h-5 w-5" />
            Place order securely
          </>
        )}
      </button>

      {!isBusy && !failed && (
        <p className="text-[11px] text-center text-kampmax-text-secondary flex items-center justify-center gap-1">
          <Check className="w-3 h-3 text-kampmax-success" />
          You&apos;ll confirm the total before you&apos;re charged.
        </p>
      )}
    </div>
  );
}
