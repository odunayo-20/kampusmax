"use client";

import { useState } from "react";
import { Camera, X, Building2 } from "lucide-react";
import { Input, Select } from "@/components/ui";
import { cn } from "@/lib/utils";
import {
  EMPLOYER_BUSINESS_TYPES,
  EMPLOYER_ORG_SIZES,
  isOrganizationLikeClientType,
} from "@/config/employer";
import type { EmployerOnboardingDraft } from "@/types/employer";

interface StepOrganizationProps {
  draft: EmployerOnboardingDraft | null;
  onUpdate: (data: Partial<EmployerOnboardingDraft>) => void;
}

const MAX_LOGO_BYTES = 5 * 1024 * 1024;

export function StepOrganization({ draft, onUpdate }: StepOrganizationProps) {
  const [logoError, setLogoError] = useState<string | null>(null);
  const isOrgLike = isOrganizationLikeClientType(draft?.clientType ?? "");

  const handleLogo = (file: File) => {
    setLogoError(null);
    if (!file.type.startsWith("image/")) {
      setLogoError("Please select an image file.");
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      setLogoError("Image must be less than 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      onUpdate({ profile: { ...draft?.profile, logoUrl: dataUrl } });
    };
    reader.readAsDataURL(file);
  };

  if (!isOrgLike) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-kampmax-text">Organization</h2>
          <p className="mt-1 text-sm text-kampmax-text-secondary">
            You&apos;re hiring as an individual, so no organization details are needed.
          </p>
        </div>
        <div className="flex items-start gap-3 p-4 rounded-xl bg-neutral-50 border border-neutral-200">
          <Building2 className="h-5 w-5 text-neutral-400 mt-0.5" aria-hidden />
          <p className="text-sm text-kampmax-text-secondary">
            You can add business or organization details later by editing your profile after your
            employer account is active.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-kampmax-text">Organization Information</h2>
        <p className="mt-1 text-sm text-kampmax-text-secondary">
          This appears on your public employer profile.
        </p>
      </div>

      {/* Logo */}
      <div>
        <label className="block text-sm font-medium text-kampmax-text mb-3">
          Organization Logo
        </label>
        <div className="relative max-w-[140px]">
          <div
            className={cn(
              "aspect-square rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden",
              draft?.profile.logoUrl ? "border-transparent" : "border-neutral-300"
            )}
          >
            {draft?.profile.logoUrl ? (
              <>
                <img
                  src={draft.profile.logoUrl}
                  alt="Organization logo preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => onUpdate({ profile: { ...draft?.profile, logoUrl: null } })}
                  className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                  aria-label="Remove logo"
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 text-center p-4">
                <Camera className="h-8 w-8 text-neutral-300" />
                <p className="text-xs text-kampmax-text-secondary">Add a logo</p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleLogo(file);
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label="Upload organization logo"
            />
          </div>
        </div>
        {logoError && <p className="mt-1 text-xs text-kampmax-error">{logoError}</p>}
        <p className="mt-1 text-xs text-kampmax-text-secondary">
          PNG or JPG, max 5MB. Square recommended.
        </p>
      </div>

      {/* Organization name */}
      <div>
        <label htmlFor="orgName" className="block text-sm font-medium text-kampmax-text mb-1.5">
          Organization Name <span className="text-kampmax-error">*</span>
        </label>
        <Input
          id="orgName"
          value={draft?.organization.name ?? ""}
          onChange={(e) =>
            onUpdate({ organization: { ...draft?.organization, name: e.target.value } })
          }
          placeholder="e.g., Oluwaseun Labs"
          maxLength={100}
          required
        />
        <p className="mt-1 text-xs text-kampmax-text-secondary">
          2–100 characters. Entering a name does not prove ownership — that is verified by Kampmax.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Select
          id="businessType"
          label="Business Type"
          value={draft?.organization.businessType ?? ""}
          onChange={(e) =>
            onUpdate({
              organization: { ...draft?.organization, businessType: e.target.value },
            })
          }
          placeholder="Select a type"
        >
          {EMPLOYER_BUSINESS_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </Select>

        <Select
          id="orgSize"
          label="Organization Size"
          value={draft?.organization.size ?? ""}
          onChange={(e) =>
            onUpdate({
              organization: { ...draft?.organization, size: e.target.value },
            })
          }
          placeholder="Select a size"
        >
          {EMPLOYER_ORG_SIZES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label htmlFor="orgIndustry" className="block text-sm font-medium text-kampmax-text mb-1.5">
          Industry
        </label>
        <Input
          id="orgIndustry"
          value={draft?.organization.industry ?? ""}
          onChange={(e) =>
            onUpdate({ organization: { ...draft?.organization, industry: e.target.value } })
          }
          placeholder="e.g., Technology, Education"
          maxLength={60}
        />
      </div>

      <div>
        <label htmlFor="orgWebsite" className="block text-sm font-medium text-kampmax-text mb-1.5">
          Website
        </label>
        <Input
          id="orgWebsite"
          type="url"
          value={draft?.organization.website ?? ""}
          onChange={(e) =>
            onUpdate({ organization: { ...draft?.organization, website: e.target.value } })
          }
          placeholder="https://example.com"
          maxLength={200}
        />
      </div>

      <div>
        <label htmlFor="orgDescription" className="block text-sm font-medium text-kampmax-text mb-1.5">
          Description
        </label>
        <textarea
          id="orgDescription"
          value={draft?.organization.description ?? ""}
          onChange={(e) =>
            onUpdate({
              organization: { ...draft?.organization, description: e.target.value },
            })
          }
          placeholder="Describe your organization and what freelancers should know..."
          rows={4}
          maxLength={800}
          className="w-full px-3 py-2 text-sm bg-white border border-neutral-200 rounded-lg placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 resize-y"
        />
        <p className="mt-1 text-xs text-kampmax-text-secondary">Max 800 characters.</p>
      </div>
    </div>
  );
}
