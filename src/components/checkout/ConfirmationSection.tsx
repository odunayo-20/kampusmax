"use client";

import { useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Shield,
  Clock,
  Loader2,
} from "lucide-react";
import { formatNaira } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ConfirmationSectionProps {
  finalTotal: number;
  isPlacing: boolean;
  paymentMethod: string;
  onPlaceOrder: () => void;
}

export function ConfirmationSection({
  finalTotal,
  isPlacing,
  paymentMethod,
  onPlaceOrder,
}: ConfirmationSectionProps) {
  const [agreed, setAgreed] = useState(false);

  return (
    <section className="bg-white rounded-xl border border-kampmax-border p-4 space-y-4">
      {/* Terms */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-kampmax-border text-kampmax-blue focus:ring-kampmax-blue"
        />
        <span className="text-xs text-kampmax-text-secondary leading-relaxed">
          I agree to the{" "}
          <span className="text-kampmax-blue font-medium cursor-pointer">
            Terms of Service
          </span>{" "}
          and{" "}
          <span className="text-kampmax-blue font-medium cursor-pointer">
            Purchase Policy
          </span>
          . I understand this is a prototype and no real payment will be processed.
        </span>
      </label>

      {/* CTA */}
      <button
        onClick={onPlaceOrder}
        disabled={!agreed || isPlacing}
        className={cn(
          "w-full h-12 rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition-all",
          agreed && !isPlacing
            ? "bg-kampmax-blue text-white hover:bg-kampmax-blue-dark active:scale-[0.98]"
            : "bg-kampmax-border text-kampmax-text-secondary/60 cursor-not-allowed"
        )}
      >
        {isPlacing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Placing Order...
          </>
        ) : (
          <>
            Place Order — {formatNaira(finalTotal)}
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      {/* Trust signals */}
      <div className="flex items-center justify-center gap-4 text-[10px] text-kampmax-text-secondary">
        <span className="flex items-center gap-1">
          <Shield className="w-3 h-3" />
          Secure checkout
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Instant confirmation
        </span>
        <span className="flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          Buyer protection
        </span>
      </div>
    </section>
  );
}
