"use client";

import { useMemo } from "react";
import { getSavedJobsForUser } from "@/services/opportunity";
import {
  SavedJobsHeader,
  OpportunityList,
  OpportunityEmptyState,
} from "@/components/freelancer/opportunities";

export default function SavedJobsPage() {
  const jobs = useMemo(() => getSavedJobsForUser(), []);

  return (
    <div className="space-y-6">
      <SavedJobsHeader count={jobs.length} />

      {jobs.length === 0 ? (
        <OpportunityEmptyState hasFilters={false} saved />
      ) : (
        <>
          <OpportunityList
            opportunities={jobs}
            savedIds={new Set(jobs.map((job) => job.id))}
          />
          <p className="text-xs text-neutral-400">
            Remove a job from this list by opening it and un-saving it.
          </p>
        </>
      )}
    </div>
  );
}