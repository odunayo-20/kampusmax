"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { dashboardKeys } from "@/lib/query-keys";
import {
  getEmployerContracts,
  getEmployerDashboardSummary,
} from "@/services/employer-dashboard";
import type { EmployerDashboardContract, EmployerDashboardSummary } from "@/services/employer-dashboard";

function delay(ms = 250): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Backend-style summary for the employer command center (owner-scoped). */
export function useEmployerDashboardSummary() {
  const { status, user } = useAuth();
  const userId = user?.id ?? null;
  const enabled = status === "authenticated" && !!userId;

  return useQuery({
    queryKey: dashboardKeys.summary(userId ?? ""),
    enabled,
    queryFn: async (): Promise<EmployerDashboardSummary | null> => {
      await delay();
      return getEmployerDashboardSummary();
    },
  });
}

/** Full employer contract list for /employer/contracts (owner-scoped). */
export function useEmployerContracts() {
  const { status, user } = useAuth();
  const userId = user?.id ?? null;
  const enabled = status === "authenticated" && !!userId;

  return useQuery({
    queryKey: dashboardKeys.contracts(userId ?? ""),
    enabled,
    queryFn: async (): Promise<EmployerDashboardContract[]> => {
      await delay(0);
      return getEmployerContracts();
    },
  });
}