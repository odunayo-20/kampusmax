"use client";

import { cn } from "@/lib/utils";
import { PersonalizationField } from "./types";

interface PersonalizationFormProps {
  fields: PersonalizationField[] | null;
  values: Record<string, string>;
  onChange: (fieldId: string, value: string) => void;
}

export function PersonalizationForm({ fields, values, onChange }: PersonalizationFormProps) {
  if (!fields) return null;

  return (
    <div className="rounded-[10px] border border-neutral-200 bg-white p-4 space-y-3">
      <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-1.5">
        <svg className="h-4 w-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 01-1 1H9a1 1 0 01-1-1V4a2 2 0 012-2zm0 0v1a1 1 0 01-1 1H9a1 1 0 01-1-1V4a2 2 0 012-2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 20a2 2 0 002 2h10a2 2 0 002-2V8a2 2 0 00-2-2H7a2 2 0 00-2 2v12z" /></svg>
        Personalization
      </h3>
      <p className="text-xs text-neutral-500">Add your custom details — separate from variations above.</p>
      {fields.map((field) => (
        <div key={field.id}>
          <label className="block text-xs font-medium text-neutral-700 mb-1">
            {field.label} {field.required && <span className="text-error-600">*</span>}
          </label>
          {field.type === "text" && (
            <input
              value={values[field.id] || ""}
              onChange={(e) => onChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              className="w-full h-10 px-3 rounded-md border border-neutral-200 bg-white text-sm placeholder:text-neutral-400 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20"
            />
          )}
          {field.type === "textarea" && (
            <textarea
              value={values[field.id] || ""}
              onChange={(e) => onChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              rows={3}
              className="w-full px-3 py-2 rounded-md border border-neutral-200 bg-white text-sm placeholder:text-neutral-400 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 resize-none"
            />
          )}
          {field.type === "select" && (
            <select
              value={values[field.id] || ""}
              onChange={(e) => onChange(field.id, e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-neutral-200 bg-white text-sm focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20"
            >
              <option value="">Choose {field.label.toLowerCase()}</option>
              {field.options?.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          )}
          {field.type === "file" && (
            <label className="flex h-10 items-center justify-center rounded-md border border-dashed border-neutral-300 bg-neutral-50 text-xs font-medium text-neutral-600 hover:bg-neutral-100 cursor-pointer">
              <input type="file" className="hidden" onChange={(e) => onChange(field.id, e.target.files?.[0]?.name || "")} />
              {values[field.id] ? values[field.id] : "Upload File"}
            </label>
          )}
        </div>
      ))}
    </div>
  );
}