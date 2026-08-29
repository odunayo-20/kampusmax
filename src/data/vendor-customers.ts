import type { VendorCustomerNote } from "@/types/vendor-customers";

// ============================================================
// VENDOR CUSTOMERS SEED  (Module 13)
// ============================================================
//
// Customer ROWS are never seeded here: the service derives every customer from
// the authenticated vendor's own order slices (single source of truth). This
// file holds the only vendor-owned mutable data — internal notes — scoped by
// buyerId and private to the vendor. Nothing customer-visible lives here.

export const vendorCustomerNotes: VendorCustomerNote[] = [
  {
    id: "vcn1",
    buyerId: "u2",
    body: "Prefers hostel delivery over pickup; usually orders electronics on weekends. Responds fast on chat.",
    createdAt: "2026-07-20T10:00:00Z",
    updatedAt: "2026-07-20T10:00:00Z",
  },
  {
    id: "vcn2",
    buyerId: "u4",
    body: "Repeat buyer for Apple accessories — message first when restocking iPhone cases and watch bands.",
    createdAt: "2026-07-23T09:30:00Z",
    updatedAt: "2026-07-23T09:30:00Z",
  },
];

export const customerNotesMock = {
  items: [...vendorCustomerNotes],
};