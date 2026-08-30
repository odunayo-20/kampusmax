"use client";

import { DollarSign, Truck, AlertTriangle, Calendar, HelpCircle } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { cn } from "@/lib/utils";
import { formatNaira } from "@/lib/utils";
import type { ServiceProviderOnboardingDraft } from "@/types/service-provider";

interface StepPricingProps {
  draft: ServiceProviderOnboardingDraft | null;
  onUpdate: (data: Partial<ServiceProviderOnboardingDraft>) => void;
}

export function StepPricing({ draft, onUpdate }: StepPricingProps) {
  const pricing = draft?.pricing;

  const handleTravelFeeChange = (value: number) => {
    onUpdate({ pricing: { ...pricing, travelFee: value } });
  };

  const handleEmergencyFeeChange = (value: number) => {
    onUpdate({ pricing: { ...pricing, emergencyFee: value } });
  };

  const handleWeekendFeeChange = (value: number) => {
    onUpdate({ pricing: { ...pricing, weekendFee: value } });
  };

  const handleMinBookingChange = (value: number) => {
    onUpdate({ pricing: { ...pricing, minimumBookingQuantity: value } });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-kampmax-text">Additional Pricing</h2>
        <p className="mt-1 text-sm text-kampmax-text-secondary">
          Configure extra fees and pricing rules. These are added to your service prices automatically.
        </p>
      </div>

      <div className="space-y-6">
        {/* Travel Fee */}
        <div className="rounded-xl border border-kampmax-border bg-white p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary-100">
              <Truck className="h-6 w-6 text-primary-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-kampmax-text">Travel Fee</h3>
                  <p className="mt-1 text-sm text-kampmax-text-secondary">
                    Added when you travel to the customer's location.
                  </p>
                </div>
                <span className="font-semibold text-kampmax-text">{formatNaira(pricing?.travelFee ?? 0)}</span>
              </div>
              <div className="mt-4">
                <Input
                  type="number"
                  min="0"
                  max="50000"
                  step="500"
                  value={pricing?.travelFee ?? 0}
                  onChange={(e) => handleTravelFeeChange(parseInt(e.target.value) || 0)}
                  className="w-40"
                  inputMode="numeric"
                />
                <span className="ml-2 text-sm text-kampmax-text-secondary">per booking</span>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Fee */}
        <div className="rounded-xl border border-kampmax-border bg-white p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-warning-100">
              <AlertTriangle className="h-6 w-6 text-warning-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-kampmax-text">Emergency / Urgent Fee</h3>
                  <p className="mt-1 text-sm text-kampmax-text-secondary">
                    Added for same-day or urgent bookings (within 2 hours).
                  </p>
                </div>
                <span className="font-semibold text-kampmax-text">{formatNaira(pricing?.emergencyFee ?? 0)}</span>
              </div>
              <div className="mt-4">
                <Input
                  type="number"
                  min="0"
                  max="50000"
                  step="500"
                  value={pricing?.emergencyFee ?? 0}
                  onChange={(e) => handleEmergencyFeeChange(parseInt(e.target.value) || 0)}
                  className="w-40"
                  inputMode="numeric"
                />
                <span className="ml-2 text-sm text-kampmax-text-secondary">per booking</span>
              </div>
            </div>
          </div>
        </div>

        {/* Weekend Fee */}
        <div className="rounded-xl border border-kampmax-border bg-white p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-info-100">
              <Calendar className="h-6 w-6 text-info-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-kampmax-text">Weekend / Holiday Fee</h3>
                  <p className="mt-1 text-sm text-kampmax-text-secondary">
                    Added for bookings on Saturdays, Sundays, or public holidays.
                  </p>
                </div>
                <span className="font-semibold text-kampmax-text">{formatNaira(pricing?.weekendFee ?? 0)}</span>
              </div>
              <div className="mt-4">
                <Input
                  type="number"
                  min="0"
                  max="50000"
                  step="500"
                  value={pricing?.weekendFee ?? 0}
                  onChange={(e) => handleWeekendFeeChange(parseInt(e.target.value) || 0)}
                  className="w-40"
                  inputMode="numeric"
                />
                <span className="ml-2 text-sm text-kampmax-text-secondary">per booking</span>
              </div>
            </div>
          </div>
        </div>

        {/* Minimum Booking Quantity */}
        <div className="rounded-xl border border-kampmax-border bg-white p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-success-100">
              <HelpCircle className="h-6 w-6 text-success-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-kampmax-text">Minimum Booking Quantity</h3>
                  <p className="mt-1 text-sm text-kampmax-text-secondary">
                    Minimum number of units/hours per booking. E.g., 2-hour minimum.
                  </p>
                </div>
                <span className="font-semibold text-kampmax-text">{pricing?.minimumBookingQuantity ?? 1}</span>
              </div>
              <div className="mt-4">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={pricing?.minimumBookingQuantity ?? 1}
                  onChange={(e) => handleMinBookingChange(parseInt(e.target.value) || 1)}
                  className="w-24 h-11 px-3 text-sm bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600/20"
                  inputMode="numeric"
                />
                <span className="ml-2 text-sm text-kampmax-text-secondary">unit(s)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Preview */}
        <div className="rounded-xl border border-kampmax-border bg-neutral-50 p-6">
          <h3 className="font-semibold text-kampmax-text mb-4">How It Works</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-kampmax-text-secondary">
              <span>Base Service Price</span>
              <span className="font-medium text-kampmax-text">Set per service</span>
            </div>
            <div className="flex justify-between text-kampmax-text-secondary">
              <span>+ Travel Fee (if applicable)</span>
              <span className="font-medium text-kampmax-text">{formatNaira(pricing?.travelFee ?? 0)}</span>
            </div>
            <div className="flex justify-between text-kampmax-text-secondary">
              <span>+ Emergency Fee (if applicable)</span>
              <span className="font-medium text-kampmax-text">{formatNaira(pricing?.emergencyFee ?? 0)}</span>
            </div>
            <div className="flex justify-between text-kampmax-text-secondary">
              <span>+ Weekend Fee (if applicable)</span>
              <span className="font-medium text-kampmax-text">{formatNaira(pricing?.weekendFee ?? 0)}</span>
            </div>
            <div className="border-t border-neutral-200 pt-2 flex justify-between font-semibold text-kampmax-text">
              <span>Total (Example)</span>
              <span>Varies by service</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}