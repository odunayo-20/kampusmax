"use client";

import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  FileWarning,
  XCircle,
  Ban,
  Wrench,
  ArrowRight,
  Info,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { ServiceProviderAccess } from "@/services/service-provider-dashboard";
import { SERVICE_PROVIDER_DASHBOARD_GATE } from "@/services/service-provider-dashboard";

/**
 * Full-screen state screens for every service-provider access gate. Gating
 * reflects backend-authoritative status — the frontend only renders what the
 * backend reports and never grants management access on its own.
 */
export function ServiceProviderAccessGate({
  access,
  children,
}: {
  access: ServiceProviderAccess;
  children: React.ReactNode;
}) {
  switch (access.kind) {
    case SERVICE_PROVIDER_DASHBOARD_GATE.NO_PROVIDER:
      return <NoProvider />;
    case SERVICE_PROVIDER_DASHBOARD_GATE.PENDING_REVIEW:
      return (
        <Gate
          icon={Clock}
          title="Application under review"
          body={
            access.message ??
            "Kampmax is reviewing your service provider application. You'll get full access once approved."
          }
          actionLabel="View application status"
          actionHref="/onboarding/service-provider/1"
          tone="info"
        />
      );
    case SERVICE_PROVIDER_DASHBOARD_GATE.MORE_INFORMATION:
    case SERVICE_PROVIDER_DASHBOARD_GATE.APPROVED:
    default:
      // DRAFT / IN_PROGRESS resumes onboarding; approved renders normally.
      if (access.kind === SERVICE_PROVIDER_DASHBOARD_GATE.APPROVED) {
        return <>{children}</>;
      }
      return (
        <Gate
          icon={FileWarning}
          title={access.status === "IN_PROGRESS" ? "Application in progress" : "Continue your application"}
          body={
            access.message ??
            "Complete your application to activate your service provider profile."
          }
          actionLabel="Continue onboarding"
          actionHref="/onboarding/service-provider/1"
          tone="warning"
        />
      );
    case SERVICE_PROVIDER_DASHBOARD_GATE.REJECTED:
      return (
        <Gate
          icon={XCircle}
          title="Application not approved"
          body={
            access.message ??
            "Your service provider application was not approved. You can update and re-apply."
          }
          actionLabel="Update application"
          actionHref="/onboarding/service-provider/1"
          tone="error"
        />
      );
    case SERVICE_PROVIDER_DASHBOARD_GATE.SUSPENDED:
      return (
        <Gate
          icon={Ban}
          title="Account restricted"
          body={
            access.message ??
            "Your service provider profile has been suspended. Contact support if you believe this is in error."
          }
          actionLabel="Contact support"
          actionHref="/home"
          tone="error"
        />
      );
  }
}

function NoProvider() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-kampmax-bg flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-kampmax-border p-8 max-w-sm w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center mx-auto mb-4">
          <Wrench className="h-8 w-8 text-primary-600" />
        </div>
        <h2 className="text-lg font-bold text-kampmax-text mb-2">Offer Services on Kampmax</h2>
        <p className="text-sm text-kampmax-text-secondary mb-6">
          Activate your Service Provider profile from your existing Kampmax account — no second
          signup needed.
        </p>
        <div className="space-y-2">
          <button
            onClick={() => router.push("/onboarding/service-provider/1")}
            className="w-full py-3 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700"
          >
            Start your application
          </button>
          <button
            onClick={() => router.push("/home")}
            className="w-full py-3 rounded-xl border border-kampmax-border text-kampmax-text text-sm font-medium hover:bg-neutral-50"
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
    <div className="min-h-screen bg-kampmax-bg flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-kampmax-border p-8 max-w-sm w-full text-center">
        <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ring-1 ${ring}`}>
          <Icon className="h-8 w-8" aria-hidden />
        </div>
        <h2 className="text-lg font-bold text-kampmax-text mb-2">{title}</h2>
        <p className="text-sm text-kampmax-text-secondary mb-6">{body}</p>
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