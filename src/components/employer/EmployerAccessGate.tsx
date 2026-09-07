"use client";

import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  FileWarning,
  XCircle,
  Ban,
  Building2,
  ArrowRight,
  Info,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { EmployerAccess } from "@/services/employer";
import { EMPLOYER_DASHBOARD_GATE } from "@/services/employer";

/**
 * Full-screen state screens for every employer dashboard access gate. Gating
 * reflects backend-authoritative status — the frontend only renders what the
 * backend reports and never grants dashboard access on its own.
 */
export function EmployerAccessGate({
  access,
  children,
}: {
  access: EmployerAccess;
  children: React.ReactNode;
}) {
  switch (access.kind) {
    case EMPLOYER_DASHBOARD_GATE.NO_EMPLOYER:
      return <NoEmployer />;
    case EMPLOYER_DASHBOARD_GATE.PENDING_REVIEW:
      return (
        <Gate
          icon={Clock}
          title="Profile under review"
          body={
            access.message ??
            "Kampmax is reviewing your employer profile. You'll be able to post jobs once it's approved."
          }
          actionLabel="View profile status"
          actionHref="/onboarding/employer"
          tone="info"
        />
      );
    case EMPLOYER_DASHBOARD_GATE.IN_PROGRESS:
      return (
        <Gate
          icon={FileWarning}
          title="Complete your employer profile"
          body={
            access.message ??
            "Finish your employer profile to start posting jobs on Kampmax."
          }
          actionLabel="Continue onboarding"
          actionHref="/onboarding/employer"
          tone="warning"
        />
      );
    case EMPLOYER_DASHBOARD_GATE.REJECTED:
      return (
        <Gate
          icon={XCircle}
          title="Profile not approved"
          body={
            access.message ??
            "Your employer profile was not approved. You can update and re-submit it."
          }
          actionLabel="Update profile"
          actionHref="/onboarding/employer"
          tone="error"
        />
      );
    case EMPLOYER_DASHBOARD_GATE.SUSPENDED:
      return (
        <Gate
          icon={Ban}
          title="Profile suspended"
          body={
            access.message ??
            "Your employer profile has been suspended. Contact support if you believe this is in error."
          }
          actionLabel="Contact support"
          actionHref="/home"
          tone="error"
        />
      );
    case EMPLOYER_DASHBOARD_GATE.APPROVED:
    default:
      return <>{children}</>;
  }
}

function NoEmployer() {
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-kampmax-bg p-4">
      <div className="w-full max-w-sm rounded-2xl border border-kampmax-border bg-white p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100">
          <Building2 className="h-8 w-8 text-primary-600" />
        </div>
        <h2 className="mb-2 text-lg font-bold text-kampmax-text">Hire on Kampmax</h2>
        <p className="mb-6 text-sm text-kampmax-text-secondary">
          Set up your employer profile to post jobs and find campus talent. No second
          signup needed.
        </p>
        <div className="space-y-2">
          <button
            onClick={() => router.push("/onboarding/employer")}
            className="w-full rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white hover:bg-primary-700"
          >
            Become an Employer
          </button>
          <button
            onClick={() => router.push("/home")}
            className="w-full rounded-xl border border-kampmax-border px-4 py-3 text-sm font-medium text-kampmax-text hover:bg-neutral-50"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

function Gate({
  icon: Icon,
  title,
  body,
  actionLabel,
  actionHref,
  tone,
}: {
  icon: typeof Clock;
  title: string;
  body: string;
  actionLabel: string;
  actionHref: string;
  tone: "info" | "warning" | "error";
}) {
  const ring =
    tone === "info"
      ? "bg-info-50 text-info-700 ring-info-200"
      : tone === "warning"
      ? "bg-warning-50 text-warning-700 ring-warning-200"
      : "bg-error-50 text-error-700 ring-error-200";
  return (
    <div className="flex min-h-screen items-center justify-center bg-kampmax-bg p-4">
      <div className="w-full max-w-sm rounded-2xl border border-kampmax-border bg-white p-8 text-center">
        <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ring-1 ${ring}`}>
          <Icon className="h-8 w-8" aria-hidden />
        </div>
        <h2 className="mb-2 text-lg font-bold text-kampmax-text">{title}</h2>
        <p className="mb-6 text-sm text-kampmax-text-secondary">{body}</p>
        <Link
          href={actionHref}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white hover:bg-primary-700"
        >
          {actionLabel} <ArrowRight className="h-4 w-4" />
        </Link>
        <p className="mt-4 flex items-start gap-1.5 text-left text-xs text-kampmax-text-muted">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          Status is set by Kampmax. The dashboard never changes approval or verification state.
        </p>
      </div>
    </div>
  );
}