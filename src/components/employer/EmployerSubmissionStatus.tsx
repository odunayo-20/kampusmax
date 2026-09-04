"use client";

import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Loader2,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui";
import type { EmployerOnboardingStatus } from "@/types/employer";

interface EmployerSubmissionStatusProps {
  status: EmployerOnboardingStatus;
  completion: number;
  reviewReason?: string;
}

export function EmployerSubmissionStatus({
  status,
  completion,
  reviewReason,
}: EmployerSubmissionStatusProps) {
  const isBlocking =
    status === "PENDING_REVIEW" ||
    status === "APPROVED" ||
    status === "REJECTED" ||
    status === "SUSPENDED";

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-100 mb-5">
            <Building2 className="h-8 w-8 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-kampmax-text">Employer Setup</h1>
        </div>

        <div className="rounded-xl border border-kampmax-border overflow-hidden">
          {status === "APPROVED" && (
            <StatusPanel
              icon={<CheckCircle2 className="h-6 w-6 text-success-600" />}
              title="You're ready to hire"
              body="Your employer profile is active. You can now hire freelancers, manage applications and create contracts."
            >
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/profile">
                  <Button className="w-full sm:w-auto">Manage My Account</Button>
                </Link>
              </div>
            </StatusPanel>
          )}

          {status === "PENDING_REVIEW" && (
            <StatusPanel
              icon={<Clock className="h-6 w-6 text-warning-600" />}
              title="Submitted for review"
              body="Your employer profile has been submitted. Kampmax is reviewing it. You'll be notified once a decision is made."
            >
              <p className="text-sm text-kampmax-text-secondary">
                Your profile is under review. You can check back later for updates.
              </p>
            </StatusPanel>
          )}

          {status === "REJECTED" && (
            <StatusPanel
              icon={<XCircle className="h-6 w-6 text-error-600" />}
              title="Profile review needed"
              body="Your employer profile was not approved. Review the feedback and update your profile."
            >
              {reviewReason && (
                <p className="text-sm text-kampmax-text-secondary">
                  Reason: {reviewReason}
                </p>
              )}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/onboarding/employer/1">
                  <Button className="w-full sm:w-auto">Update Profile</Button>
                </Link>
              </div>
            </StatusPanel>
          )}

          {status === "SUSPENDED" && (
            <StatusPanel
              icon={<AlertTriangle className="h-6 w-6 text-error-600" />}
              title="Profile suspended"
              body="Your employer profile has been suspended. Please contact support."
            />
          )}

          {status === "DRAFT" || status === "IN_PROGRESS" || status === undefined ? (
            <StatusPanel
              icon={<Loader2 className="h-6 w-6 text-primary-600" />}
              title={completion > 0 ? "Your profile is incomplete" : "Set up your employer profile"}
              body={
                completion > 0
                  ? `You're ${completion}% done. Continue where you left off.`
                  : "Create an employer profile to hire freelancers and manage projects."
              }
            >
              {completion > 0 && (
                <div className="mx-auto max-w-sm mb-4">
                  <div className="h-2 w-full rounded-full bg-neutral-100 mb-3">
                    <div
                      className="h-full rounded-full bg-primary-600 transition-all"
                      style={{ width: `${completion}%` }}
                    />
                  </div>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/onboarding/employer/1">
                  <Button size="lg" className="w-full sm:w-auto">
                    {completion > 0 ? "Continue Setup" : "Become an Employer"}
                  </Button>
                </Link>
              </div>
            </StatusPanel>
          ) : null}
        </div>

        {!isBlocking && (
          <p className="mt-4 text-center text-sm text-kampmax-text-secondary">
            Your freelancer and vendor profiles (if any) will remain active. You're adding an
            employer profile to the same Kampmax account.
          </p>
        )}
      </div>
    </div>
  );
}

function StatusPanel({
  icon,
  title,
  body,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="p-8 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-50 border border-kampmax-border">
        {icon}
      </div>
      <h2 className="text-lg font-semibold text-kampmax-text mb-2">{title}</h2>
      <p className="text-kampmax-text-secondary mb-6 max-w-md mx-auto">{body}</p>
      {children}
    </div>
  );
}
