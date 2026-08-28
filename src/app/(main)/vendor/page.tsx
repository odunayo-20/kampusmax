"use client";

import { VendorOverview } from "@/components/vendor-dashboard/VendorOverview";
import { getVendorAccess } from "@/services/vendor-dashboard";
import { VENDOR_DASHBOARD_GATE } from "@/types/vendor-dashboard";
import { VendorAccessGate } from "@/components/vendor-dashboard/VendorAccessGate";

export default function VendorDashboardPage() {
  const access = getVendorAccess();

  if (access.kind !== VENDOR_DASHBOARD_GATE.APPROVED || !access.canUseDashboard) {
    return <VendorAccessGate access={access} />;
  }

  return <VendorOverview storeSlug={access.storeSlug} />;
}