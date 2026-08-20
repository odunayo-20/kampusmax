"use client";

import { useState } from "react";
import { Tag, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { PromoCode } from "@/types";
import { cn } from "@/lib/utils";

interface PromoCodeSectionProps {
  appliedPromo: PromoCode | null;
  promoError: string | null;
  promoCode: string;
  onPromoCodeChange: (code: string) => void;
  onApply: () => void;
  onRemove: () => void;
}

export function PromoCodeSection({
  appliedPromo,
  promoError,
  promoCode,
  onPromoCodeChange,
  onApply,
  onRemove,
}: PromoCodeSectionProps) {
  const [isFocused, setIsFocused] = useState(false);

  if (appliedPromo) {
    return (
      <section className="bg-white rounded-xl border border-kampmax-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-kampmax-success/10 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-kampmax-success" />
            </div>
            <div>
              <p className="text-sm font-semibold text-kampmax-text">
                {appliedPromo.code}
              </p>
              <p className="text-xs text-kampmax-text-secondary">
                {appliedPromo.description}
              </p>
            </div>
          </div>
          <button
            onClick={onRemove}
            className="p-1.5 rounded-full hover:bg-red-50 text-kampmax-text-secondary hover:text-kampmax-error transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-xl border border-kampmax-border p-4 space-y-3">
      <h3 className="text-sm font-semibold text-kampmax-text flex items-center gap-2">
        <Tag className="h-4 w-4 text-kampmax-blue" />
        Promo Code
      </h3>

      <div className="flex gap-2">
        <input
          type="text"
          value={promoCode}
          onChange={(e) => onPromoCodeChange(e.target.value.toUpperCase())}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={(e) => e.key === "Enter" && onApply()}
          placeholder="Enter code"
          className={cn(
            "flex-1 h-10 px-3 text-sm font-mono uppercase border rounded-lg focus:outline-none focus:ring-1 transition-colors",
            promoError
              ? "border-kampmax-error focus:border-kampmax-error focus:ring-kampmax-error"
              : "border-kampmax-border focus:border-kampmax-blue focus:ring-kampmax-blue"
          )}
        />
        <button
          onClick={onApply}
          disabled={!promoCode.trim()}
          className="h-10 px-4 text-sm font-medium bg-kampmax-navy text-white rounded-lg hover:bg-kampmax-navy-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Apply
        </button>
      </div>

      {promoError && (
        <p className="text-xs text-kampmax-error flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {promoError}
        </p>
      )}

      {!promoError && !appliedPromo && isFocused && (
        <p className="text-[10px] text-kampmax-text-secondary">
          Try: CAMPUS10, WELCOME500, RUGIPO20
        </p>
      )}
    </section>
  );
}
