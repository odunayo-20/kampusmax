import { getCurrentUser } from "@/services/users";
import { getSpProfileByUserId } from "@/data/service-provider";
import type { ServiceProviderOnboardingStatus } from "@/types/service-provider";

// ============================================================
// SERVICE PROVIDER DASHBOARD ACCESS
// ============================================================
//
// Mirrors vendor dashboard access pattern. Ownership is derived from
// the authenticated identity, never from client-supplied IDs.

export const SERVICE_PROVIDER_DASHBOARD_GATE = {
  APPROVED: "approved",
  PENDING_REVIEW: "pending_review",
  MORE_INFORMATION: "more_information",
  REJECTED: "rejected",
  SUSPENDED: "suspended",
  NO_PROVIDER: "no_provider",
} as const;

export type ServiceProviderDashboardGateKind = 
  (typeof SERVICE_PROVIDER_DASHBOARD_GATE)[keyof typeof SERVICE_PROVIDER_DASHBOARD_GATE];

export interface ServiceProviderAccess {
  kind: ServiceProviderDashboardGateKind;
  status: ServiceProviderOnboardingStatus | null;
  canUseDashboard: boolean;
  message: string | null;
  displayName?: string;
  slug?: string;
}

import { getSpOnboardingStatus } from "@/services/service-provider";

export function getServiceProviderAccess(): ServiceProviderAccess {
  const user = getCurrentUser();
  const profile = getSpProfileByUserId(user.id);
  const status = getSpOnboardingStatus();

  if (!profile) {
    return {
      kind: SERVICE_PROVIDER_DASHBOARD_GATE.NO_PROVIDER,
      status: null,
      canUseDashboard: false,
      message: "You don't have a service provider profile yet.",
    };
  }

  if (status === "APPROVED") {
    return {
      kind: SERVICE_PROVIDER_DASHBOARD_GATE.APPROVED,
      status,
      canUseDashboard: true,
      message: null,
      displayName: profile.displayName,
      slug: profile.slug,
    };
  }

  if (status === "PENDING_REVIEW") {
    return {
      kind: SERVICE_PROVIDER_DASHBOARD_GATE.PENDING_REVIEW,
      status,
      canUseDashboard: false,
      message: "Your application is under review.",
    };
  }

  if (status === "REJECTED") {
    return {
      kind: SERVICE_PROVIDER_DASHBOARD_GATE.REJECTED,
      status,
      canUseDashboard: false,
      message: "Your application was rejected. You can re-apply.",
    };
  }

  if (status === "SUSPENDED") {
    return {
      kind: SERVICE_PROVIDER_DASHBOARD_GATE.SUSPENDED,
      status,
      canUseDashboard: false,
      message: "Your service provider profile has been suspended.",
    };
  }

  return {
    kind: SERVICE_PROVIDER_DASHBOARD_GATE.MORE_INFORMATION,
    status,
    canUseDashboard: false,
    message: "Complete your application to activate your service provider profile.",
  };
}