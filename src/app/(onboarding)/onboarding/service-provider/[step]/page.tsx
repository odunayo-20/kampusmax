"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { OnboardingLayout } from "@/components/service-provider/OnboardingLayout";
import { StepProviderType } from "@/components/service-provider/StepProviderType";
import { StepProfile } from "@/components/service-provider/StepProfile";
import { StepCategory } from "@/components/service-provider/StepCategory";
import { StepServices } from "@/components/service-provider/StepServices";
import { StepLocation } from "@/components/service-provider/StepLocation";
import { StepAvailability } from "@/components/service-provider/StepAvailability";
import { StepPricing } from "@/components/service-provider/StepPricing";
import { StepPortfolio } from "@/components/service-provider/StepPortfolio";
import { StepVerification } from "@/components/service-provider/StepVerification";
import { StepReview } from "@/components/service-provider/StepReview";
import { createSpApplication, getSpOnboardingDraft, getSpOnboardingStatus, saveSpDraft, submitSpApplication } from "@/services/service-provider";
import { SERVICE_PROVIDER_ONBOARDING_STATUS, SERVICE_PROVIDER_ONBOARDING_STEPS, SERVICE_PROVIDER_ONBOARDING_STEP } from "@/types/service-provider";
import type { ServiceProviderOnboardingDraft, ServiceProviderOnboardingStepId } from "@/types/service-provider";

const STEP_COMPONENTS: Record<number, React.ComponentType<any>> = {
  1: StepProviderType,
  2: StepProfile,
  3: StepCategory,
  4: StepServices,
  5: StepLocation,
  6: StepAvailability,
  7: StepPricing,
  8: StepPortfolio,
  9: StepVerification,
  10: StepReview,
};

const STEP_VALIDATION: Record<number, (draft: ServiceProviderOnboardingDraft | null) => boolean> = {
  1: (d) => !!d?.provider?.type,
  2: (d) => !!d?.provider?.displayName && !!d?.profile?.displayName,
  3: (d) => !!d?.category?.primaryCategoryId,
  4: (d) => (d?.services?.length ?? 0) > 0,
  5: (d) => !!d?.location?.primaryCampusId,
  6: (d) => d?.availability?.days?.some((day) => day.isAvailable) ?? false,
  7: (d) => true, // pricing is optional
  8: (d) => true, // portfolio is optional
  9: (d) => {
    if (!d) return false;
    const status = d.verification?.status;
    if (status === "pending" || status === "action_required") return false;
    const requiredMissing = d.documents?.some((doc) => doc.required && doc.status !== "uploaded" && doc.status !== "approved");
    return !requiredMissing;
  },
  10: (d) => true, // handled in review
};

export default function ServiceProviderOnboardingStepPage() {
  const router = useRouter();
  const params = useParams();
  const stepParam = params.step as string;
  const currentStep = parseInt(stepParam, 10) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  const [draft, setDraft] = useState<ServiceProviderOnboardingDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load draft on mount
  useEffect(() => {
    const loadDraft = async () => {
      setLoading(true);
      try {
        const res = createSpApplication();
        if (res.created) {
          // First time - redirect to step 1
          if (currentStep !== 1) {
            router.push("/onboarding/service-provider/1");
            return;
          }
        }
        const data = getSpOnboardingDraft();
        setDraft(data);
      } catch (e) {
        setError("Failed to load application");
      } finally {
        setLoading(false);
      }
    };
    loadDraft();
  }, [router]);

  // Redirect if invalid step
  useEffect(() => {
    if (!loading && currentStep > SERVICE_PROVIDER_ONBOARDING_STEPS) {
      router.push(`/onboarding/service-provider/${SERVICE_PROVIDER_ONBOARDING_STEPS}`);
    }
  }, [loading, currentStep, router]);

  const handleSaveDraft = useCallback(async () => {
    if (!draft) return;
    setSaving(true);
    setError(null);
    try {
      saveSpDraft({ ...draft, currentStep: currentStep as ServiceProviderOnboardingStepId });
      const updated = getSpOnboardingDraft();
      setDraft(updated);
    } catch (e) {
      setError("Failed to save draft");
    } finally {
      setSaving(false);
    }
  }, [draft, currentStep]);

  const handleNext = useCallback(() => {
    if (!draft) return;
    const isValid = STEP_VALIDATION[currentStep]?.(draft) ?? false;
    if (!isValid) {
      setError("Please complete all required fields before continuing");
      return;
    }
    setError(null);
    saveSpDraft({ ...draft, currentStep: Math.min(currentStep + 1, SERVICE_PROVIDER_ONBOARDING_STEPS) as ServiceProviderOnboardingStepId });
    if (currentStep < SERVICE_PROVIDER_ONBOARDING_STEPS) {
      router.push(`/onboarding/service-provider/${currentStep + 1}`);
    }
  }, [currentStep, draft, router]);

  const handleBack = useCallback(() => {
    if (!draft) return;
    saveSpDraft({ ...draft, currentStep: Math.max(currentStep - 1, 1) as ServiceProviderOnboardingStepId });
    if (currentStep > 1) {
      router.push(`/onboarding/service-provider/${currentStep - 1}`);
    }
  }, [currentStep, draft, router]);

  const handleSubmit = useCallback(async () => {
    if (!draft) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = submitSpApplication();
      if (res.success) {
        router.push("/account/profiles/service-provider");
      } else {
        setError(res.message);
      }
    } catch (e) {
      setError("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [draft, router]);

  const canSubmit = draft?.status === "DRAFT" || draft?.status === "IN_PROGRESS";

  const Component = STEP_COMPONENTS[currentStep];
  if (!Component && currentStep !== 10) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-kampmax-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-kampmax-bg flex items-center justify-center px-6">
        <div className="max-w-md mx-auto text-center p-8 bg-white rounded-xl border border-kampmax-border">
          <p className="text-kampmax-error mb-4">{error}</p>
          <button
            onClick={() => router.refresh()}
            className="text-primary-600 hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // Status-based redirect for blocking statuses
  if (draft && ["PENDING_REVIEW", "APPROVED", "REJECTED", "SUSPENDED"].includes(draft.status)) {
    router.push("/account/profiles/service-provider");
    return null;
  }

  const renderStepContent = () => {
    if (currentStep === 10) {
      return (
        <StepReview
          draft={draft}
          onEditStep={(step) => router.push(`/onboarding/service-provider/${step}`)}
          onSubmit={handleSubmit}
          canSubmit={canSubmit}
          isSubmitting={submitting}
        />
      );
    }
    if (currentStep === 9) {
      return (
        <StepVerification
          draft={draft}
          onUpdate={(data) => setDraft((prev) => prev ? { ...prev, ...data } : null)}
          onSubmitVerification={(type) => {
            // Handle verification submission
          }}
        />
      );
    }
    return (
      <Component
        draft={draft}
        onUpdate={(data: Partial<ServiceProviderOnboardingDraft>) => setDraft((prev) => prev ? { ...prev, ...data } : null)}
      />
    );
  };

  return (
    <OnboardingLayout
      draft={draft}
      onSaveDraft={handleSaveDraft}
      onNext={handleNext}
      onBack={handleBack}
      onSubmit={handleSubmit}
      canSubmit={canSubmit}
      isSaving={saving}
      isSubmitting={submitting}
      nextDisabled={!STEP_VALIDATION[currentStep]?.(draft ?? null)}
      showSaveDraft={currentStep < 10}
    >
      {renderStepContent()}
    </OnboardingLayout>
  );
}