"use client";

import { MapPin, Store, AlertCircle } from "lucide-react";
import { CheckoutFormData, CheckoutValidation, PickupLocation, PICKUP_LOCATION_LABELS } from "@/types";
import { cn } from "@/lib/utils";
import { campuses } from "@/data/campus";

interface DeliverySectionProps {
  form: CheckoutFormData;
  errors: CheckoutValidation;
  onFieldChange: <K extends keyof CheckoutFormData>(key: K, value: CheckoutFormData[K]) => void;
}

const PICKUP_LOCATIONS: PickupLocation[] = [
  "main_gate",
  "library",
  "student_union",
  "engineering_block",
  "science_block",
];

export function DeliverySection({ form, errors, onFieldChange }: DeliverySectionProps) {
  return (
    <section className="bg-white rounded-xl border border-kampmax-border p-4 space-y-4">
      <h3 className="text-sm font-semibold text-kampmax-text flex items-center gap-2">
        <MapPin className="h-4 w-4 text-kampmax-blue" />
        Delivery Details
      </h3>

      {/* Campus */}
      <div>
        <label className="text-xs font-medium text-kampmax-text-secondary mb-1.5 block">
          Campus
        </label>
        <select
          value={form.campusId}
          onChange={(e) => onFieldChange("campusId", e.target.value)}
          className="w-full h-10 px-3 text-sm border border-kampmax-border rounded-lg bg-white focus:outline-none focus:border-kampmax-blue focus:ring-1 focus:ring-kampmax-blue"
        >
          {campuses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.abbreviation})
            </option>
          ))}
        </select>
      </div>

      {/* Pickup location (only for campus_pickup) */}
      {form.deliveryMethod === "campus_pickup" && (
        <div>
          <label className="text-xs font-medium text-kampmax-text-secondary mb-1.5 block">
            Pickup Location
          </label>
          <div className="grid grid-cols-1 gap-2">
            {PICKUP_LOCATIONS.map((loc) => (
              <button
                key={loc}
                onClick={() => onFieldChange("pickupLocation", loc)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border text-left transition-all",
                  form.pickupLocation === loc
                    ? "border-kampmax-blue bg-kampmax-blue/10 ring-1 ring-kampmax-blue"
                    : "border-kampmax-border hover:border-kampmax-blue/50"
                )}
              >
                <Store className="h-4 w-4 text-kampmax-blue shrink-0" />
                <span className="text-sm text-kampmax-text">
                  {PICKUP_LOCATION_LABELS[loc]}
                </span>
              </button>
            ))}
          </div>
          {errors.pickupLocation && (
            <p className="text-xs text-kampmax-error mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.pickupLocation}
            </p>
          )}
        </div>
      )}

      {/* Delivery address (only for delivery) */}
      {form.deliveryMethod === "delivery" && (
        <div>
          <label className="text-xs font-medium text-kampmax-text-secondary mb-1.5 block">
            Delivery Address
          </label>
          <textarea
            value={form.deliveryAddress}
            onChange={(e) => onFieldChange("deliveryAddress", e.target.value)}
            placeholder="e.g. Room 12, Block B, RUGIPO Hostel"
            rows={2}
            className={cn(
              "w-full px-3 py-2.5 text-sm border rounded-lg resize-none focus:outline-none focus:ring-1",
              errors.deliveryAddress
                ? "border-kampmax-error focus:border-kampmax-error focus:ring-kampmax-error"
                : "border-kampmax-border focus:border-kampmax-blue focus:ring-kampmax-blue"
            )}
          />
          {errors.deliveryAddress && (
            <p className="text-xs text-kampmax-error mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.deliveryAddress}
            </p>
          )}
        </div>
      )}

      {/* Order notes */}
      <div>
        <label className="text-xs font-medium text-kampmax-text-secondary mb-1.5 block">
          Order Notes <span className="text-kampmax-text-secondary/60">(optional)</span>
        </label>
        <input
          type="text"
          value={form.notes}
          onChange={(e) => onFieldChange("notes", e.target.value)}
          placeholder="Any special instructions for the seller..."
          className="w-full h-10 px-3 text-sm border border-kampmax-border rounded-lg focus:outline-none focus:border-kampmax-blue focus:ring-1 focus:ring-kampmax-blue"
        />
      </div>
    </section>
  );
}
