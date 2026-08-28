"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { getCampuses } from "@/services/campus";
import type { SavedAddress } from "@/types";
import { Button } from "@/components/atoms/Button";

export interface AddressFormValues {
  label: string;
  address: string;
  campusId: string;
  contactName: string;
  contactPhone: string;
  notes?: string;
  isDefault: boolean;
}

interface AddressFormProps {
  campuses: ReturnType<typeof getCampuses>;
  initial?: AddressFormValues;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (values: AddressFormValues) => void;
}

const EMPTY: AddressFormValues = {
  label: "",
  address: "",
  campusId: "",
  contactName: "",
  contactPhone: "",
  notes: "",
  isDefault: false,
};

export function AddressForm({
  campuses,
  initial,
  submitLabel,
  onCancel,
  onSubmit,
}: AddressFormProps) {
  const [values, setValues] = useState<AddressFormValues>(initial || EMPTY);

  function set<K extends keyof AddressFormValues>(key: K, value: AddressFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!values.label.trim() || !values.address.trim() || !values.campusId) return;
    onSubmit(values);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 bg-kampmax-muted/40 border border-kampmax-border rounded-lg p-4"
    >
      <div className="flex items-center gap-2 text-xs font-semibold text-kampmax-text">
        <MapPin className="h-4 w-4 text-kampmax-blue" />
        {initial ? "Edit address" : "Add a new address"}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Label"
          placeholder="e.g. Hostel"
          value={values.label}
          onChange={(e) => set("label", e.target.value)}
          required
        />
        <label className="block text-sm">
          <span className="block text-sm font-medium text-kampmax-text mb-1.5">
            Campus
          </span>
          <select
            value={values.campusId}
            onChange={(e) => set("campusId", e.target.value)}
            className="w-full h-11 px-3 text-sm bg-white border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 shadow-sm"
            required
          >
            <option value="" disabled>
              Select campus
            </option>
            {campuses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-kampmax-text mb-1.5">
          Delivery details
        </label>
        <textarea
          value={values.address}
          onChange={(e) => set("address", e.target.value)}
          rows={2}
          placeholder="e.g. Room 12, Block C, RUGIPO Student Village, Owo (hostel, block and room or pickup point)"
          className="w-full px-3 py-2.5 text-sm bg-white border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600"
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Contact name"
          value={values.contactName}
          onChange={(e) => set("contactName", e.target.value)}
          required
        />
        <Input
          type="tel"
          label="Contact phone"
          value={values.contactPhone}
          onChange={(e) => set("contactPhone", e.target.value)}
          required
        />
      </div>

      <div>
        <Input
          label="Delivery instructions (optional)"
          placeholder="Ask security to call you on arrival"
          value={values.notes || ""}
          onChange={(e) => set("notes", e.target.value)}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-kampmax-text cursor-pointer">
        <input
          type="checkbox"
          checked={values.isDefault}
          onChange={(e) => set("isDefault", e.target.checked)}
          className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-600/20"
        />
        Set as default address
      </label>

      <div className="flex items-center gap-3 pt-1">
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={
            !values.label.trim() || !values.address.trim() || !values.campusId
          }
        >
          {submitLabel}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
