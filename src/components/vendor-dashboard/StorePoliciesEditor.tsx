"use client";

import type { StorePolicies } from "@/types/vendor-dashboard";

interface StorePoliciesEditorProps {
  policies: StorePolicies;
  onChange: (p: StorePolicies) => void;
}

const POLICIES: { key: keyof StorePolicies; label: string }[] = [
  { key: "returnPolicy", label: "Return Policy" },
  { key: "cancellationPolicy", label: "Cancellation Policy" },
  { key: "deliveryPolicy", label: "Delivery Policy" },
  { key: "pickupPolicy", label: "Pickup Policy" },
];

export function StorePoliciesEditor({ policies, onChange }: StorePoliciesEditorProps) {
  return (
    <div className="space-y-4">
      {POLICIES.map(({ key, label }) => {
        const value = policies[key];
        return (
          <div key={key}>
            <label className="mb-1 block text-sm font-medium text-kampmax-text">
              {label}
            </label>
            <textarea
              rows={3}
              value={value}
              onChange={(e) => onChange({ ...policies, [key]: e.target.value })}
              className="w-full rounded-lg border border-kampmax-border bg-white px-3 py-2 text-sm text-kampmax-text placeholder:text-kampmax-text-secondary/60 focus:border-primary-600 focus:outline-none"
              placeholder={`Describe your ${label.toLowerCase()}`}
            />
            <p className="mt-1 text-xs italic text-kampmax-text-muted">
              Preview: {value.trim() ? value.trim() : "Not set"}
            </p>
          </div>
        );
      })}
    </div>
  );
}
