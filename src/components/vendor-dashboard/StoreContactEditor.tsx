"use client";

import type { StoreContact } from "@/types/vendor-dashboard";

interface StoreContactEditorProps {
  contact: StoreContact;
  onChange: (c: StoreContact) => void;
}

export function StoreContactEditor({ contact, onChange }: StoreContactEditorProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-kampmax-text">
          Business Email
        </label>
        <input
          type="email"
          value={contact.businessEmail}
          onChange={(e) => onChange({ ...contact, businessEmail: e.target.value })}
          className="w-full rounded-lg border border-kampmax-border bg-white px-3 py-2 text-sm text-kampmax-text placeholder:text-kampmax-text-secondary/60 focus:border-primary-600 focus:outline-none"
          placeholder="store@example.com"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-kampmax-text">
          Business Phone
        </label>
        <input
          type="tel"
          value={contact.businessPhone}
          onChange={(e) => onChange({ ...contact, businessPhone: e.target.value })}
          className="w-full rounded-lg border border-kampmax-border bg-white px-3 py-2 text-sm text-kampmax-text placeholder:text-kampmax-text-secondary/60 focus:border-primary-600 focus:outline-none"
          placeholder="+234 800 000 0000"
        />
      </div>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={contact.messagingAvailable}
          onChange={(e) =>
            onChange({ ...contact, messagingAvailable: e.target.checked })
          }
          className="h-4 w-4 rounded border-neutral-300 accent-primary-600"
        />
        <span className="text-sm text-kampmax-text">Allow customer messaging</span>
      </label>

      <p className="text-xs text-kampmax-text-secondary">
        Your personal contact info is never shown automatically.
      </p>
    </div>
  );
}
