"use client";

import { User } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { CheckoutCustomer } from "@/types/checkout";

interface CustomerInformationProps {
  customer: CheckoutCustomer;
  isGuest: boolean;
  onChange: (field: keyof CheckoutCustomer, value: string) => void;
  errors?: Record<string, string | undefined>;
}

export function CustomerInformation({
  customer,
  isGuest,
  onChange,
  errors,
}: CustomerInformationProps) {
  return (
    <section
      aria-labelledby="customer-info-title"
      className="bg-white rounded-xl border border-kampmax-border p-4 sm:p-5 space-y-4"
    >
      <h2
        id="customer-info-title"
        className="text-sm font-semibold text-kampmax-text flex items-center gap-2"
      >
        <User className="h-4 w-4 text-kampmax-blue" />
        Contact Information
      </h2>

      {isGuest && (
        <p className="text-xs text-kampmax-text-secondary bg-kampmax-blue/10 border border-kampmax-blue/20 rounded-lg p-2.5">
          Your cart is saved securely. Sign in at checkout for a faster
          experience, or continue as a guest — your items and details are kept
          until you complete the order.
        </p>
      )}

      <div className="space-y-3">
        <Input
          id="checkout-full-name"
          label="Full name"
          value={customer.fullName}
          onChange={(e) => onChange("fullName", e.target.value)}
          error={errors?.fullName}
          autoComplete="name"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            id="checkout-email"
            type="email"
            label="Email"
            value={customer.email}
            onChange={(e) => onChange("email", e.target.value)}
            error={errors?.email}
            autoComplete="email"
          />
          <Input
            id="checkout-phone"
            type="tel"
            label="Phone number"
            value={customer.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            error={errors?.phone}
            autoComplete="tel"
          />
        </div>
      </div>
    </section>
  );
}
