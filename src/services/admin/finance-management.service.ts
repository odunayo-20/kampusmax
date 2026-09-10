import type {
  FinanceManagementService,
  ManagedFinanceReportId,
} from "@/types/admin";
import { apiDelay } from "@/lib/admin/api";
import {
  buildFinanceOverview,
  buildFinanceReconciliation,
  buildFinanceReport,
} from "@/data/admin/finance-reconciliation";

export type { FinanceManagementService };

// ------------------------------------------------------------
// CONTRACT (future NestJS resource: /admin/finance)
// ------------------------------------------------------------

// FinanceManagementService is declared in @/types/admin so the
// container and hooks share one interface. This module only wires
// the mock implementation over the read-only data layer.

// ------------------------------------------------------------
// MOCK IMPLEMENTATION
//
// Read-only reconciliation + reporting console. There is no actor/ctx
// because finance data is platform-scoped: only ADMIN/SUPER_ADMIN roles
// reach the "finance" section (nav-permission gate), mirroring the
// backend boundary. There is no mutation surface — the prototype
// backend exposes no fee/settlement/invoice ledger and no payout or
// refund actions, so the console compares the owning stores and
// quantifies variances instead of writing money movement.
//
// NOTE: named "createFinanceConsoleService" (not
// createFinanceManagementService) because the wallet/withdrawals
// console already claims that factory + export name; this module is
// the finance RECONCILIATION & REPORTS console, a separate surface.
// ------------------------------------------------------------

export function createFinanceConsoleService(): FinanceManagementService {
  return {
    async getOverview() {
      await apiDelay(160);
      return buildFinanceOverview();
    },

    async getReconciliation() {
      await apiDelay(180);
      return buildFinanceReconciliation();
    },

    async getReport(id: ManagedFinanceReportId) {
      await apiDelay(160);
      return buildFinanceReport(id);
    },
  };
}