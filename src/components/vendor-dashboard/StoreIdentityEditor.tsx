"use client";

import type { VendorStore } from "@/types/vendor-dashboard";
import { getCategories } from "@/services/categories";

interface StoreIdentityEditorProps {
  identity: VendorStore["identity"];
  onChange: (i: VendorStore["identity"]) => void;
}

export function StoreIdentityEditor({ identity, onChange }: StoreIdentityEditorProps) {
  const categories = getCategories();

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-kampmax-text">
          Store Name
        </label>
        <input
          type="text"
          value={identity.storeName}
          onChange={(e) => onChange({ ...identity, storeName: e.target.value })}
          className="w-full rounded-lg border border-kampmax-border bg-white px-3 py-2 text-sm text-kampmax-text placeholder:text-kampmax-text-secondary/60 focus:border-primary-600 focus:outline-none"
          placeholder="Your store name"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-kampmax-text">
          Tagline
        </label>
        <input
          type="text"
          value={identity.tagline}
          onChange={(e) => onChange({ ...identity, tagline: e.target.value })}
          className="w-full rounded-lg border border-kampmax-border bg-white px-3 py-2 text-sm text-kampmax-text placeholder:text-kampmax-text-secondary/60 focus:border-primary-600 focus:outline-none"
          placeholder="A short line that describes your store"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-kampmax-text">
          Description
        </label>
        <textarea
          rows={4}
          value={identity.description}
          onChange={(e) => onChange({ ...identity, description: e.target.value })}
          className="w-full rounded-lg border border-kampmax-border bg-white px-3 py-2 text-sm text-kampmax-text placeholder:text-kampmax-text-secondary/60 focus:border-primary-600 focus:outline-none"
          placeholder="Tell customers what your store is about"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-kampmax-text">
          Business category
        </label>
        <select
          value={identity.categoryId}
          onChange={(e) => onChange({ ...identity, categoryId: e.target.value })}
          className="w-full rounded-lg border border-kampmax-border bg-white px-3 py-2 text-sm text-kampmax-text focus:border-primary-600 focus:outline-none"
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <p className="text-xs text-kampmax-text-secondary">
        Backend validates all changes; protected identity fields can't be edited without permission.
      </p>
    </div>
  );
}
