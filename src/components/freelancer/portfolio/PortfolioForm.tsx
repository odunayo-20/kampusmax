"use client";

import { useState } from "react";
import { Input, Select, Button } from "@/components/ui";
import { FREELANCER_CATEGORIES } from "@/config/freelancer";
import type { FreelancerPortfolioItem } from "@/types/freelancer";
import { skillsForCategory } from "../services/serviceHelpers";

export interface PortfolioFormValues {
  title: string;
  description: string;
  categoryId?: string;
  skills: string[];
  completionDate?: string;
  imageUrl?: string;
  externalUrl?: string;
  visible: boolean;
}

interface PortfolioFormProps {
  initial?: FreelancerPortfolioItem | null;
  onSubmit: (values: PortfolioFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

function emptyValues(): PortfolioFormValues {
  return { title: "", description: "", categoryId: "", skills: [], visible: true };
}

export function PortfolioForm({ initial, onSubmit, onCancel, isSubmitting }: PortfolioFormProps) {
  const [values, setValues] = useState<PortfolioFormValues>(() =>
    initial
      ? {
          title: initial.title,
          description: initial.description,
          categoryId: initial.categoryId,
          skills: initial.skills,
          completionDate: initial.completionDate,
          imageUrl: initial.imageUrl,
          externalUrl: initial.externalUrl,
          visible: initial.visible,
        }
      : emptyValues()
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof PortfolioFormValues>(key: K, value: PortfolioFormValues[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
  };

  const categorySkills = values.categoryId ? skillsForCategory(values.categoryId) : [];

  function toggleSkill(skill: string) {
    setValues((v) => ({
      ...v,
      skills: v.skills.includes(skill)
        ? v.skills.filter((s) => s !== skill)
        : [...v.skills, skill],
    }));
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!values.title.trim()) e.title = "Title is required.";
    if (!values.description.trim()) e.description = "Description is required.";
    if (values.imageUrl && values.imageUrl.trim() && !/^https?:\/\//i.test(values.imageUrl.trim())) {
      e.imageUrl = "Image must be a valid http(s) URL.";
    }
    if (values.externalUrl && values.externalUrl.trim() && !/^https?:\/\//i.test(values.externalUrl.trim())) {
      e.externalUrl = "Link must be a valid http(s) URL.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...values,
      imageUrl: values.imageUrl?.trim() || undefined,
      externalUrl: values.externalUrl?.trim() || undefined,
      completionDate: values.completionDate?.trim() || undefined,
      categoryId: values.categoryId || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-neutral-900">Project information</h2>
        <div className="mt-4 space-y-4">
          <Input
            label="Project title"
            placeholder="e.g. E-commerce Website Redesign"
            value={values.title}
            onChange={(e) => set("title", e.target.value)}
            error={errors.title}
            required
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-900">Category</label>
            <Select
              value={values.categoryId ?? ""}
              onChange={(e) => {
                set("categoryId", e.target.value || undefined);
                set("skills", []);
              }}
              placeholder="Select a category (optional)"
            >
              {FREELANCER_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-900">Description</label>
            <textarea
              value={values.description}
              onChange={(e) => set("description", e.target.value)}
              rows={4}
              placeholder="What was the project about? What did you deliver?"
              className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/20"
              required
            />
            {errors.description && (
              <p className="mt-1 text-xs text-kampmax-error">{errors.description}</p>
            )}
          </div>
          <Input
            label="Completion date (optional)"
            type="month"
            value={values.completionDate ?? ""}
            onChange={(e) => set("completionDate", e.target.value || undefined)}
          />
        </div>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-neutral-900">Skills</h2>
        <p className="mt-1 text-xs text-neutral-500">
          {values.categoryId
            ? "Select the skills used on this project."
            : "Choose a category to see relevant skills (optional)."}
        </p>
        {values.categoryId && (
          <div className="mt-3 flex flex-wrap gap-2">
            {categorySkills.map((skill) => {
              const selected = values.skills.includes(skill);
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  aria-pressed={selected}
                  className={
                    selected
                      ? "rounded-full bg-primary-600 px-3 py-1 text-xs font-medium text-white"
                      : "rounded-full border border-neutral-300 px-3 py-1 text-xs font-medium text-neutral-600 hover:border-primary-400"
                  }
                >
                  {skill}
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-neutral-900">Media & links</h2>
        <div className="mt-4 space-y-4">
          <Input
            label="Cover image URL (optional)"
            placeholder="https://…"
            value={values.imageUrl ?? ""}
            onChange={(e) => set("imageUrl", e.target.value)}
            error={errors.imageUrl}
          />
          <Input
            label="External project URL (optional)"
            placeholder="https://github.com/… or https://behance.net/…"
            value={values.externalUrl ?? ""}
            onChange={(e) => set("externalUrl", e.target.value)}
            error={errors.externalUrl}
            hint="Only http(s) links are allowed. Opens in a new tab."
          />
        </div>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-5">
        <label className="flex items-center justify-between gap-3">
          <div>
            <span className="text-sm font-medium text-neutral-900">Visible on public profile</span>
            <p className="text-xs text-neutral-500">
              Public projects are shown to clients on your profile. Private is hidden.
            </p>
          </div>
          <input
            type="checkbox"
            checked={values.visible}
            onChange={(e) => set("visible", e.target.checked)}
            className="h-5 w-5 rounded border-neutral-300 text-primary-600 focus:ring-primary-600"
          />
        </label>
      </section>

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : initial ? "Save project" : "Add project"}
        </Button>
      </div>
    </form>
  );
}
