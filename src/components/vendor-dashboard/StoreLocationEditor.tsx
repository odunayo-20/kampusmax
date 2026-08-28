"use client";

import { cn } from "@/lib/utils";
import type { StoreLocation } from "@/types/vendor-dashboard";
import { getCampuses } from "@/services/campus";

interface StoreLocationEditorProps {
  location: StoreLocation;
  onChange: (l: StoreLocation) => void;
}

export function StoreLocationEditor({ location, onChange }: StoreLocationEditorProps) {
  const campuses = getCampuses();

  function toggleCampus(id: string) {
    const included = location.supportedCampusIds.includes(id);
    const next = included
      ? location.supportedCampusIds.filter((c) => c !== id)
      : [...location.supportedCampusIds, id];
    onChange({ ...location, supportedCampusIds: next });
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-kampmax-text">
          Primary campus
        </label>
        <select
          value={location.primaryCampusId}
          onChange={(e) => onChange({ ...location, primaryCampusId: e.target.value })}
          className="w-full rounded-lg border border-kampmax-border bg-white px-3 py-2 text-sm text-kampmax-text focus:border-primary-600 focus:outline-none"
        >
          <option value="">Select a campus</option>
          {campuses.map((campus) => (
            <option key={campus.id} value={campus.id}>
              {campus.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-kampmax-text">Supported campuses</p>
        <div className="flex flex-wrap gap-2">
          {campuses.map((campus) => {
            const checked = location.supportedCampusIds.includes(campus.id);
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

      <div>
        <label className="mb-1 block text-sm font-medium text-kampmax-text">
          Pickup location
        </label>
        <input
          type="text"
          value={location.pickupLocation}
          onChange={(e) => onChange({ ...location, pickupLocation: e.target.value })}
          className="w-full rounded-lg border border-kampmax-border bg-white px-3 py-2 text-sm text-kampmax-text placeholder:text-kampmax-text-secondary/60 focus:border-primary-600 focus:outline-none"
          placeholder="e.g. In front of the library"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-kampmax-text">
          Delivery area
        </label>
        <input
          type="text"
          value={location.deliveryArea}
          onChange={(e) => onChange({ ...location, deliveryArea: e.target.value })}
          className="w-full rounded-lg border border-kampmax-border bg-white px-3 py-2 text-sm text-kampmax-text placeholder:text-kampmax-text-secondary/60 focus:border-primary-600 focus:outline-none"
          placeholder="e.g. Hostels within 2km of campus"
        />
      </div>

      <p className="text-xs text-kampmax-text-secondary">
        Campus coverage is validated by Kampmax — you can't claim campuses you don't serve.
      </p>
    </div>
  );
}
