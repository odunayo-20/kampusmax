"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { OpportunityInput } from "@/types/opportunity";
import { useAuth } from "@/lib/auth-context";
import {
  getEmployerDashboardAccess,
  getEmployerOnboardingDraftForUser,
  getEmployerPublicPreview,
} from "@/services/employer";
import { useCreateJob, usePublishJob } from "@/hooks/use-jobs";
import { JobForm, emptyJobFormValues } from "@/components/employer/jobs/JobForm";
import { getFriendlyErrorMessage } from "@/lib/error-messages";

export default function CreateJobPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const access = user ? getEmployerDashboardAccess() : null;

  const employerName = useMemo(() => {
    if (!user) return undefined;
    const draft = getEmployerOnboardingDraftForUser();
    return draft ? getEmployerPublicPreview(draft)?.name : undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const createMutation = useCreateJob();
  const publishMutation = usePublishJob();

  const handleSave = (values: OpportunityInput) => {
    createMutation.mutate(values, {
      onSuccess: (job) => router.push(`/employer/jobs/${job.id}`),
      onError: (err) => setSubmissionError(getFriendlyErrorMessage(err)),
    });
  };

  const handlePublish = async (values: OpportunityInput) => {
    setSubmissionError(null);
    try {
      const job = await createMutation.mutateAsync(values);
      await publishMutation.mutateAsync(job.id);
      router.push(`/employer/jobs/${job.id}`);
    } catch (err) {
      setSubmissionError(getFriendlyErrorMessage(err));
    }
  };

  if (!access?.canUseDashboard) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-10 text-center text-sm text-neutral-500">
        Only approved employers can create jobs.
      </div>
    );
  }

  return (
    <JobForm
      mode="create"
      initialValues={emptyJobFormValues()}
      employerName={employerName}
      isSaving={createMutation.isPending}
      isPublishing={publishMutation.isPending || createMutation.isPending}
      error={submissionError}
      onSaveDraft={handleSave}
      onPublish={handlePublish}
    />
  );
}