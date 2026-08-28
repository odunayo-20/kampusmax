"use client";

import { cn } from "@/lib/utils";
import type { StoreDelivery } from "@/types/vendor-dashboard";
import { getCampuses } from "@/services/campus";

interface StoreDeliveryEditorProps {
  delivery: StoreDelivery;
  onChange: (d: StoreDelivery) => void;
}

export function StoreDeliveryEditor({ delivery, onChange }: StoreDeliveryEditorProps) {
  const campuses = getCampuses();

  function toggleCampus(id: string) {
    const included = delivery.supportedCampusIds.includes(id);
    const next = included
      ? delivery.supportedCampusIds.filter((c) => c !== id)
      : [...delivery.supportedCampusIds, id];
    onChange({ ...delivery, supportedCampusIds: next });
  }

  return (
    <div className="space-y-4">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={delivery.deliveryAvailable}
          onChange={(e) =>
            onChange({ ...delivery, deliveryAvailable: e.target.checked })
          }
          className="h-4 w-4 rounded border-neutral-300 accent-primary-600"
        />
        <span className="text-sm text-kampmax-text">Delivery available</span>
      </label>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={delivery.pickupAvailable}
          onChange={(e) =>
            onChange({ ...delivery, pickupAvailable: e.target.checked })
          }
          className="h-4 w-4 rounded border-neutral-300 accent-primary-600"
        />
        <span className="text-sm text-kampmax-text">Pickup available</span>
      </label>

      <div>
        <label className="mb-1 block text-sm font-medium text-kampmax-text">
          Estimated prep time (minutes)
        </label>
        <input
          type="number"
          min={0}
          value={delivery.prepTimeMinutes}
          onChange={(e) =>
            onChange({ ...delivery, prepTimeMinutes: Number(e.target.value) })
          }
          className="w-full rounded-lg border border-kampmax-border bg-white px-3 py-2 text-sm text-kampmax-text focus:border-primary-600 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-kampmax-text">
          Delivery fee (₦)
        </label>
        <input
          type="number"
          min={0}
          value={delivery.deliveryFee ?? 0}
          onChange={(e) =>
            onChange({ ...delivery, deliveryFee: Number(e.target.value) })
          }
          className="w-full rounded-lg border border-kampmax-border bg-white px-3 py-2 text-sm text-kampmax-text focus:border-primary-600 focus:outline-none"
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-kampmax-text">Supported campuses</p>
        <div className="flex flex-wrap gap-2">
          {campuses.map((campus) => {
            const checked = delivery.supportedCampusIds.includes(campus.id);
            return (
              <button
                key={campus.id}
                type="button"
                aria-pressed={checked}
                onClick={() => toggleCampus(campus.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600",
                  checked
                    ? "border-primary-600 bg-primary-50 text-primary-700"
                    : "border-kampmax-border bg-white text-kampmax-text-secondary hover:bg-neutral-50"
                )}
              >
                <input
                  type="checkbox"
                  readOnly
                  checked={checked}
                  className="pointer-events-none h-3.5 w-3.5 rounded accent-primary-600"
                />
                <span className="whitespace-nowrap">{campus.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-kampmax-text-secondary">
        Advanced logistics ship in a later module.
      </p>
    </div>
  );
}
