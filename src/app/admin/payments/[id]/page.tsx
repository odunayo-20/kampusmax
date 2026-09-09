// ============================================================
// LEGACY ROUTE (retired in Module 44)
//
// Old /admin/payments/pay-* detail links are resolved against real
// transaction ids on /admin/transactions. The fabricated pay-* ids
// never existed in real data, so all detail routes land on the
// replacement console's list.
// ============================================================

import { redirect } from "next/navigation";

export default function PaymentsLegacyDetailPage() {
  redirect("/admin/transactions");
}