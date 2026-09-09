// ============================================================
// LEGACY ROUTE (retired in Module 44)
//
// /admin/payments was a fabricated ledger (seeded PRNG data). It has
// been replaced by /admin/transactions, which derives every row from
// the real order and wallet stores. Any bookmark/link lands on the
// replacement console. Old pay-* detail ids are intentionally dropped —
// they never existed in real data.
// ============================================================

import { redirect } from "next/navigation";

export default function PaymentsLegacyPage() {
  redirect("/admin/transactions");
}