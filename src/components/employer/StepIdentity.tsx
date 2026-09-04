"use client";

import { useEffect, useState } from "react";
import { Building2, Globe, User } from "lucide-react";
import { Input } from "@/components/ui";
import { cn } from "@/lib/utils";
import { EMPLOYER_CLIENT_TYPES } from "@/config/employer";
import { isSafeUrlCandidate } from "@/services/employer";
import type { EmployerOnboardingDraft } from "@/types/employer";

interface StepIdentityProps {
  draft: EmployerOnboardingDraft | null;
  onUpdate: (data: Partial<EmployerOnboardingDraft>) => void;
}

export function StepIdentity({ draft, onUpdate }: StepIdentityProps) {
  const [websiteError, setWebsiteError] = useState<string | undefined>(undefined);
  const [aboutError, setAboutError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (draft?.profile.website && !isSafeUrlCandidate(draft.profile.website)) {
      setWebsiteError("Only http(s), mailto or tel links are allowed.");
    }
  }, [draft?.profile.website]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-kampmax-text">Who Are You Hiring As?</h2>
        <p className="mt-1 text-sm text-kampmax-text-secondary">
          Choose the client type that best describes you. This shapes the rest of your profile.
        </p>
      </div>

      {/* Client type selection */}
      <div role="radiogroup" aria-label="Client type" className="space-y-3">
        {EMPLOYER_CLIENT_TYPES.map((option) => {
          const selected = draft?.clientType === option.value;
          const Icon = option.value === "individual" ? User : Building2;
          return (
            <label
              key={option.value}
              className={cn(
                "flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all",
                selected
                  ? "border-primary-600 ring-1 ring-primary-600 bg-primary-50"
                  : "border-kampmax-border hover:border-primary-200"
              )}
            >
              <input
                type="radio"
                name="clientType"
                value={option.value}
                checked={selected}
                onChange={() => onUpdate({ clientType: option.value })}
                className="mt-1 h-4 w-4 accent-primary-600"
              />
              <span className="flex-1">
                <span className="flex items-center gap-2 font-medium text-kampmax-text">
                  <Icon className="h-4 w-4 text-primary-600" aria-hidden />
                  {option.label}
                </span>
                <span className="block text-sm text-kampmax-text-secondary mt-0.5">
                  {option.description}
                </span>
              </span>
            </label>
          );
        })}
      </div>

      {draft?.clientType && (
        <div className="border-t border-kampmax-border pt-6 space-y-6">
          <div>
            <h3 className="font-semibold text-kampmax-text">Your Professional Profile</h3>
            <p className="text-sm text-kampmax-text-secondary mt-0.5">
              This is what freelancers will see.
            </p>
          </div>

          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-kampmax-text mb-1.5">
              Display Name <span className="text-kampmax-error">*</span>
            </label>
            <Input
              id="displayName"
              value={draft?.profile.displayName ?? ""}
              onChange={(e) => onUpdate({ profile: { ...draft?.profile, displayName: e.target.value } })}
              placeholder={draft?.clientType === "individual" ? "e.g., Adebayo Oluwaseun" : "e.g., Adebayo Oluwaseun"}
              maxLength={80}
              required
            />
            <p className="mt-1 text-xs text-kampmax-text-secondary">2–80 characters.</p>
          </div>

          <div>
            <label htmlFor="headline" className="block text-sm font-medium text-kampmax-text mb-1.5">
              Professional Headline <span className="text-kampmax-error">*</span>
            </label>
            <Input
              id="headline"
              value={draft?.profile.headline ?? ""}
              onChange={(e) => onUpdate({ profile: { ...draft?.profile, headline: e.target.value } })}
              placeholder="e.g., Founder & Product Manager"
              maxLength={100}
              required
            />
            <p className="mt-1 text-xs text-kampmax-text-secondary">A short title that describes you.</p>
          </div>

          <div>
            <label htmlFor="about" className="block text-sm font-medium text-kampmax-text mb-1.5">
              About
            </label>
            <textarea
              id="about"
              value={draft?.profile.about ?? ""}
              onChange={(e) => {
                if (e.target.value.length > 800) {
                  setAboutError("About is limited to 800 characters.");
                  return;
                }
                setAboutError(undefined);
                onUpdate({ profile: { ...draft?.profile, about: e.target.value } });
              }}
              placeholder={
                draft?.clientType === "individual"
                  ? "Tell freelancers about yourself and what you're working on..."
                  : "Tell freelancers about your business or what you're building..."
              }
              rows={4}
              maxLength={800}
              className="w-full px-3 py-2 text-sm bg-white border border-neutral-200 rounded-lg placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 resize-y"
            />
            {aboutError ? (
              <p className="mt-1 text-xs text-kampmax-error">{aboutError}</p>
            ) : (
              <p className="mt-1 text-xs text-kampmax-text-secondary">Max 800 characters.</p>
            )}
          </div>

          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-kampmax-text mb-1.5">
              Industry
            </label>
            <Input
              id="industry"
              value={draft?.profile.industry ?? ""}
              onChange={(e) =>
                onUpdate({ profile: { ...draft?.profile, industry: e.target.value } })
              }
              placeholder="e.g., Technology, Education, Fashion"
              maxLength={60}
              leftIcon={<Globe className="h-4 w-4" aria-hidden />}
            />
          </div>

          <div>
            <label htmlFor="website" className="block text-sm font-medium text-kampmax-text mb-1.5">
              Website
            </label>
            <Input
              id="website"
              type="url"
              value={draft?.profile.website ?? ""}
              onChange={(e) => onUpdate({ profile: { ...draft?.profile, website: e.target.value } })}
              placeholder="https://example.com"
              maxLength={200}
              error={websiteError}
              hint="Optional. Only http(s), mailto or tel links are allowed."
            />
          </div>
        </div>
      )}
    </div>
  );
}
