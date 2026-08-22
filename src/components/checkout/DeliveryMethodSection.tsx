"use client";

import { Truck, Store, MapPin } from "lucide-react";
import { DeliveryMethod, CheckoutFormData, CheckoutValidation } from "@/types";
import { cn } from "@/lib/utils";
import { DELIVERY_FEE } from "@/lib/utils";

interface DeliveryMethodProps {
  form: CheckoutFormData;
  errors: CheckoutValidation;
  onFieldChange: <K extends keyof CheckoutFormData>(key: K, value: CheckoutFormData[K]) => void;
}

const OPTIONS: { id: DeliveryMethod; label: string; desc: string; icon: typeof Truck; priceLabel: string }[] = [
  {
    id: "campus_pickup",
    label: "Campus Pickup",
    desc: "Pick up at a designated campus spot",
    icon: Store,
    priceLabel: "Free",
  },
  {
    id: "delivery",
    label: "Hostel Delivery",
    desc: "Delivered straight to your hostel room",
    icon: Truck,
    priceLabel: "₦500",
  },
  {
    id: "meetup",
    label: "Campus Meetup",
    desc: "Meet the seller on campus",
    icon: MapPin,
    priceLabel: "Free",
  },
];

export function DeliveryMethodSection({ form, errors, onFieldChange }: DeliveryMethodProps) {
  return (
    <section className="bg-white rounded-xl border border-kampmax-border p-4 space-y-3">
      <h3 className="text-sm font-semibold text-kampmax-text flex items-center gap-2">
        <Truck className="h-4 w-4 text-kampmax-blue" />
        How to Get Your Order
      </h3>
      <div className="space-y-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onFieldChange("deliveryMethod", opt.id)}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all",
              form.deliveryMethod === opt.id
                ? "border-kampmax-blue bg-kampmax-blue/10 ring-1 ring-kampmax-blue"
                : "border-kampmax-border hover:border-kampmax-blue/50"
            )}
          >
            <opt.icon className="h-5 w-5 text-kampmax-blue shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-kampmax-text">{opt.label}</p>
              <p className="text-xs text-kampmax-text-secondary">{opt.desc}</p>
            </div>
            <span
              className={cn(
                "text-sm font-medium shrink-0",
                opt.id === "campus_pickup" || opt.id === "meetup"
                  ? "text-kampmax-success"
                  : "text-kampmax-navy"
              )}
            >
              {opt.priceLabel}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
