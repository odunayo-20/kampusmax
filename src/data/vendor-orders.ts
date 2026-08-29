import type {
  VendorOrder,
  VendorOrderTimelineEvent,
  VendorOrderEventKind,
  VendorParentOrder,
  VendorOrderItem,
  VendorFulfillmentStatus,
  VendorPaymentStatus,
  VendorDeliveryMethod,
  VendorEscrowState,
} from "@/types/vendor-orders";

// ============================================================
// VENDOR ORDERS SEED  (Module 12)
// ============================================================
//
// This file is a STAND-IN for a backend queryset. Slices below are scoped to a
// vendor; the service ALWAYS filters by the authenticated vendor (v8). One
// multi-vendor PARENT order (KMP-4125) contains slices for two sellers so the
// prototype can prove that a vendor never sees another seller's rows.
//
// Conventions:
//   - totals: customerTotal = itemsSubtotal + deliveryFee
//             platformFee = 5% of itemsSubtotal
//             vendorSubtotal = itemsSubtotal - platformFee (escrow-held)
//   - timeline events are backend records; the UI never fabricates them.

let eventSeq = 0;
function event(
  kind: VendorOrderEventKind,
  title: string,
  at: string,
  detail?: string,
  actor?: string
): VendorOrderTimelineEvent {
  eventSeq += 1;
  return { id: `vo-ev-${eventSeq}`, kind, title, at, detail, actor };
}

function subtotals(items: VendorOrderItem[]): number {
  return items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);
}

function totalsFor(itemList: VendorOrderItem[], deliveryFee: number) {
  const itemsSubtotal = subtotals(itemList);
  const platformFee = Math.round(itemsSubtotal * 0.05);
  return {
    itemsSubtotal,
    deliveryFee,
    platformFee,
    vendorSubtotal: itemsSubtotal - platformFee,
    customerTotal: itemsSubtotal + deliveryFee,
  };
}

const PICKUP_LOCATION = "Engineering Block, RUGIPO";
const PICKUP_POLICY =
  "Free pickup at the Engineering Block. Please wait for the READY notification before coming.";

// ── v8 (Adebayo's Gadgets) vendor order slices ───────────────

export const vendorOrderSlices: VendorOrder[] = [
  // New order — paid, awaiting acceptance (pickup)
  {
    id: "KMP-4111",
    parentOrderId: "KMP-4111",
    vendorId: "v8",
    storeName: "Adebayo's Gadgets",
    customer: {
      buyerId: "u4",
      displayName: "Folashade Adeyemi",
      phone: "+234 815 678 9012",
      campusLabel: "RUGIPO",
    },
    items: [{ productId: "p25", title: "iPhone 13 Pro Max 256GB", quantity: 1, unitPrice: 420000, sku: "ADG-IP13PM-256-GRY" }],
    totals: totalsFor([{ productId: "p25", title: "iPhone 13 Pro Max 256GB", quantity: 1, unitPrice: 420000 }], 0),
    fulfillmentStatus: "pending",
    paymentStatus: "paid",
    paymentMethod: "paystack",
    deliveryMethod: "campus_pickup",
    pickup: { location: PICKUP_LOCATION, instructions: PICKUP_POLICY },
    escrow: { state: "funds_held", displayAmount: 399000, updatedAt: "2026-08-28T10:02:00.000Z", note: "Funds secured by escrow until the buyer collects." },
    dispute: { status: "none", timeline: [] },
    refund: { status: "none" },
    flags: [],
    notes: [],
    conversation: { channel: "kampmax_chat" },
    timeline: [
      event("placed", "Order placed", "2026-08-28T10:00:00.000Z", "Folashade Adeyemi placed this order.", "Customer"),
      event("payment_paid", "Payment captured", "2026-08-28T10:02:00.000Z", "Paystack charge succeeded; funds held in escrow.", "System"),
    ],
    createdAt: "2026-08-28T10:00:00.000Z",
    updatedAt: "2026-08-28T10:02:00.000Z",
  },

  // New order — paid, awaiting acceptance (delivery)
  {
    id: "KMP-4124",
    parentOrderId: "KMP-4124",
    vendorId: "v8",
    storeName: "Adebayo's Gadgets",
    customer: {
      buyerId: "u2",
      displayName: "Chioma Nwosu",
      phone: "+234 813 456 7890",
      campusLabel: "RUGIPO",
    },
    items: [{ productId: "p35", title: "Samsung T7 Shield 2TB SSD", quantity: 1, unitPrice: 95000, sku: "ADG-T7S-2TB-BEI" }],
    totals: totalsFor([{ productId: "p35", title: "Samsung T7 Shield 2TB SSD", quantity: 1, unitPrice: 95000 }], 500),
    fulfillmentStatus: "pending",
    paymentStatus: "paid",
    paymentMethod: "wallet",
    deliveryMethod: "delivery",
    deliveryAddress: "Block E, Room 4, RUGIPO Student Village",
    escrow: { state: "funds_held", displayAmount: 90250, updatedAt: "2026-08-28T14:20:00.000Z", note: "Funds held in escrow until delivery is confirmed." },
    dispute: { status: "none", timeline: [] },
    refund: { status: "none" },
    flags: [],
    notes: [],
    conversation: { channel: "kampmax_chat" },
    timeline: [
      event("placed", "Order placed", "2026-08-28T14:15:00.000Z", "Chioma Nwosu placed this order.", "Customer"),
      event("payment_paid", "Payment captured", "2026-08-28T14:20:00.000Z", "Wallet payment succeeded; funds held in escrow.", "System"),
    ],
    createdAt: "2026-08-28T14:15:00.000Z",
    updatedAt: "2026-08-28T14:20:00.000Z",
  },

  // New order — payment still processing (blocked until paid)
  {
    id: "KMP-4112",
    parentOrderId: "KMP-4112",
    vendorId: "v8",
    storeName: "Adebayo's Gadgets",
    customer: {
      buyerId: "u2",
      displayName: "Chioma Nwosu",
      phone: "+234 813 456 7890",
      campusLabel: "RUGIPO",
    },
    items: [{ productId: "p27", title: "MacBook Air M2 13\" 8GB/256GB", quantity: 1, unitPrice: 650000, sku: "ADG-MBA-M2-256-MID" }],
    totals: totalsFor([{ productId: "p27", title: "MacBook Air M2 13\" 8GB/256GB", quantity: 1, unitPrice: 650000 }], 500),
    fulfillmentStatus: "pending",
    paymentStatus: "processing",
    paymentMethod: "paystack",
    deliveryMethod: "delivery",
    deliveryAddress: "Block E, Room 4, RUGIPO Student Village",
    escrow: { state: "awaiting_fulfillment", updatedAt: "2026-08-29T08:40:00.000Z", note: "Payment provider still processing. Order unlocks once cleared." },
    dispute: { status: "none", timeline: [] },
    refund: { status: "none" },
    flags: [],
    notes: [],
    conversation: { channel: "kampmax_chat" },
    timeline: [
      event("placed", "Order placed", "2026-08-29T08:30:00.000Z", "Chioma Nwosu placed this order.", "Customer"),
      event("payment_processing", "Payment processing", "2026-08-29T08:40:00.000Z", "Paystack charge is being confirmed.", "System"),
    ],
    createdAt: "2026-08-29T08:30:00.000Z",
    updatedAt: "2026-08-29T08:40:00.000Z",
  },

  // Payment link expired (no action; accept is blocked by expiry)
  {
    id: "KMP-4109",
    parentOrderId: "KMP-4109",
    vendorId: "v8",
    storeName: "Adebayo's Gadgets",
    customer: {
      buyerId: "u5",
      displayName: "Emeka Obi",
      phone: "+234 816 789 0123",
      campusLabel: "RUGIPO",
    },
    items: [{ productId: "p32", title: "Mechanical Keyboard Keychron K8 Pro", quantity: 1, unitPrice: 65000, sku: "ADG-K8PRO-BRN" }],
    totals: totalsFor([{ productId: "p32", title: "Mechanical Keyboard Keychron K8 Pro", quantity: 1, unitPrice: 65000 }], 0),
    fulfillmentStatus: "pending",
    paymentStatus: "pending",
    paymentMethod: "paystack",
    deliveryMethod: "campus_pickup",
    pickup: { location: PICKUP_LOCATION, instructions: PICKUP_POLICY },
    escrow: { state: "none", note: "No funds were captured; order lapsed before payment." },
    dispute: { status: "none", timeline: [] },
    refund: { status: "none" },
    flags: [
      {
        id: "fl-pay-4109",
        type: "payment_issue",
        title: "Payment link expired",
        detail: "The buyer never completed payment and the payment link expired. No money is in escrow.",
        severity: "medium",
        status: "open",
        createdAt: "2026-08-25T12:00:00.000Z",
      },
    ],
    notes: [],
    conversation: { channel: "kampmax_chat" },
    timeline: [
      event("placed", "Order placed", "2026-08-22T09:00:00.000Z", "Emeka Obi placed this order.", "Customer"),
      event("expired", "Payment link expired", "2026-08-25T12:00:00.000Z", "No payment was received within 72 hours.", "System"),
    ],
    expiredAt: "2026-08-25T12:00:00.000Z",
    createdAt: "2026-08-22T09:00:00.000Z",
    updatedAt: "2026-08-25T12:00:00.000Z",
  },

  // Accepted — awaiting processing (delivery)
  {
    id: "KMP-4113",
    parentOrderId: "KMP-4113",
    vendorId: "v8",
    storeName: "Adebayo's Gadgets",
    customer: {
      buyerId: "u5",
      displayName: "Emeka Obi",
      phone: "+234 816 789 0123",
      campusLabel: "RUGIPO",
    },
    items: [{ productId: "p26", title: "Samsung Galaxy S23 Ultra 512GB", quantity: 1, unitPrice: 580000, sku: "ADG-S23U-512-BLK" }],
    totals: totalsFor([{ productId: "p26", title: "Samsung Galaxy S23 Ultra 512GB", quantity: 1, unitPrice: 580000 }], 500),
    fulfillmentStatus: "accepted",
    paymentStatus: "paid",
    paymentMethod: "paystack",
    deliveryMethod: "delivery",
    deliveryAddress: "Block B, Room 8, RUGIPO Student Village",
    escrow: { state: "funds_held", displayAmount: 551000, updatedAt: "2026-08-27T11:00:00.000Z", note: "Funds held in escrow until delivery." },
    dispute: { status: "none", timeline: [] },
    refund: { status: "none" },
    flags: [],
    notes: [],
    conversation: { channel: "kampmax_chat" },
    timeline: [
      event("placed", "Order placed", "2026-08-27T10:00:00.000Z", "Emeka Obi placed this order.", "Customer"),
      event("payment_paid", "Payment captured", "2026-08-27T10:04:00.000Z", "Paystack charge succeeded; funds held in escrow.", "System"),
      event("accepted", "Order accepted", "2026-08-27T11:00:00.000Z", "Adebayo's Gadgets accepted this order.", "Store owner"),
    ],
    createdAt: "2026-08-27T10:00:00.000Z",
    updatedAt: "2026-08-27T11:00:00.000Z",
  },

  // Accepted — flagged stock shortage for the ordered item
  {
    id: "KMP-4122",
    parentOrderId: "KMP-4122",
    vendorId: "v8",
    storeName: "Adebayo's Gadgets",
    customer: {
      buyerId: "u4",
      displayName: "Folashade Adeyemi",
      phone: "+234 815 678 9012",
      campusLabel: "RUGIPO",
    },
    items: [{ productId: "p33", title: "Apple Watch Series 9 45mm GPS", quantity: 1, unitPrice: 265000, sku: "ADG-AWS9-45-MID" }],
    totals: totalsFor([{ productId: "p33", title: "Apple Watch Series 9 45mm GPS", quantity: 1, unitPrice: 265000 }], 0),
    fulfillmentStatus: "accepted",
    paymentStatus: "paid",
    paymentMethod: "wallet",
    deliveryMethod: "campus_pickup",
    pickup: { location: PICKUP_LOCATION, instructions: PICKUP_POLICY },
    escrow: { state: "funds_held", displayAmount: 251750, updatedAt: "2026-08-27T16:30:00.000Z", note: "Funds held in escrow until the buyer collects." },
    dispute: { status: "none", timeline: [] },
    refund: { status: "none" },
    flags: [
      {
        id: "fl-stock-4122",
        type: "stock_shortage",
        title: "Low stock on Apple Watch Series 9",
        detail: "Only 2 units in inventory. Confirm the sealed unit is available before preparing.",
        severity: "high",
        status: "open",
        createdAt: "2026-08-27T16:32:00.000Z",
      },
    ],
    notes: [
      {
        id: "nt-4122-1",
        scope: "internal",
        authorRole: "staff",
        body: "Check the box in the back shelf — the sealed Apple Watch should be there.",
        createdAt: "2026-08-27T16:50:00.000Z",
      },
    ],
    conversation: { channel: "kampmax_chat" },
    timeline: [
      event("placed", "Order placed", "2026-08-27T16:00:00.000Z", "Folashade Adeyemi placed this order.", "Customer"),
      event("payment_paid", "Payment captured", "2026-08-27T16:04:00.000Z", "Wallet payment succeeded; funds held in escrow.", "System"),
      event("accepted", "Order accepted", "2026-08-27T16:30:00.000Z", "Adebayo's Gadgets accepted this order.", "Store owner"),
    ],
    createdAt: "2026-08-27T16:00:00.000Z",
    updatedAt: "2026-08-27T16:32:00.000Z",
  },

  // Processing (delivery) — dashboard-linked order
  {
    id: "KMP-4102",
    parentOrderId: "KMP-4102",
    vendorId: "v8",
    storeName: "Adebayo's Gadgets",
    customer: {
      buyerId: "u4",
      displayName: "Folashade Adeyemi",
      phone: "+234 815 678 9012",
      campusLabel: "RUGIPO",
    },
    items: [{ productId: "p27", title: "MacBook Air M2 13\" 8GB/256GB", quantity: 1, unitPrice: 650000, sku: "ADG-MBA-M2-256-MID" }],
    totals: totalsFor([{ productId: "p27", title: "MacBook Air M2 13\" 8GB/256GB", quantity: 1, unitPrice: 650000 }], 500),
    fulfillmentStatus: "processing",
    paymentStatus: "paid",
    paymentMethod: "paystack",
    deliveryMethod: "delivery",
    deliveryAddress: "Block C, Room 12, RUGIPO Student Village",
    escrow: { state: "funds_held", displayAmount: 617500, updatedAt: "2026-08-27T09:20:00.000Z", note: "Funds held in escrow until delivery." },
    dispute: { status: "none", timeline: [] },
    refund: { status: "none" },
    flags: [],
    notes: [
      {
        id: "nt-4102-1",
        scope: "internal",
        authorRole: "vendor",
        body: "Customer asked for evening delivery (after 5pm). Pack the charger and box.",
        createdAt: "2026-08-27T09:25:00.000Z",
      },
    ],
    conversation: { channel: "kampmax_chat" },
    timeline: [
      event("placed", "Order placed", "2026-08-27T09:00:00.000Z", "Folashade Adeyemi placed this order.", "Customer"),
      event("payment_paid", "Payment captured", "2026-08-27T09:05:00.000Z", "Paystack charge succeeded; funds held in escrow.", "System"),
      event("accepted", "Order accepted", "2026-08-27T09:12:00.000Z", "Adebayo's Gadgets accepted this order.", "Store owner"),
      event("processing", "Preparing order", "2026-08-27T09:20:00.000Z", "The MacBook Air M2 is being inspected and packed.", "Store owner"),
    ],
    createdAt: "2026-08-27T09:00:00.000Z",
    updatedAt: "2026-08-27T09:25:00.000Z",
  },

  // Processing (pickup)
  {
    id: "KMP-4115",
    parentOrderId: "KMP-4115",
    vendorId: "v8",
    storeName: "Adebayo's Gadgets",
    customer: {
      buyerId: "u2",
      displayName: "Chioma Nwosu",
      phone: "+234 813 456 7890",
      campusLabel: "RUGIPO",
    },
    items: [{ productId: "p29", title: "iPad Air 5th Gen 64GB WiFi", quantity: 1, unitPrice: 280000, sku: "ADG-IPAD5-64-SG" }],
    totals: totalsFor([{ productId: "p29", title: "iPad Air 5th Gen 64GB WiFi", quantity: 1, unitPrice: 280000 }], 0),
    fulfillmentStatus: "processing",
    paymentStatus: "paid",
    paymentMethod: "wallet",
    deliveryMethod: "campus_pickup",
    pickup: { location: PICKUP_LOCATION, instructions: PICKUP_POLICY },
    escrow: { state: "funds_held", displayAmount: 266000, updatedAt: "2026-08-28T09:10:00.000Z", note: "Funds held in escrow until pickup." },
    dispute: { status: "none", timeline: [] },
    refund: { status: "none" },
    flags: [],
    notes: [
      {
        id: "nt-4115-1",
        scope: "internal",
        authorRole: "vendor",
        body: "Buyer prefers pickup after 4pm — she has lectures till then.",
        createdAt: "2026-08-28T09:30:00.000Z",
      },
    ],
    conversation: { channel: "kampmax_chat" },
    timeline: [
      event("placed", "Order placed", "2026-08-28T08:45:00.000Z", "Chioma Nwosu placed this order.", "Customer"),
      event("payment_paid", "Payment captured", "2026-08-28T08:50:00.000Z", "Wallet payment succeeded; funds held in escrow.", "System"),
      event("accepted", "Order accepted", "2026-08-28T08:58:00.000Z", "Adebayo's Gadgets accepted this order.", "Store owner"),
      event("processing", "Preparing order", "2026-08-28T09:10:00.000Z", "iPad Air is being wiped and tested.", "Store owner"),
    ],
    createdAt: "2026-08-28T08:45:00.000Z",
    updatedAt: "2026-08-28T09:30:00.000Z",
  },

  // Processing — multi-item (delivery)
  {
    id: "KMP-4114",
    parentOrderId: "KMP-4114",
    vendorId: "v8",
    storeName: "Adebayo's Gadgets",
    customer: {
      buyerId: "u4",
      displayName: "Folashade Adeyemi",
      phone: "+234 815 678 9012",
      campusLabel: "RUGIPO",
    },
    items: [
      { productId: "p28", title: "Sony WH-1000XM5 Headphones", quantity: 1, unitPrice: 185000, sku: "ADG-WH1000XM5-SLV" },
      { productId: "p34", title: "Anker 737 Power Bank 24000mAh", quantity: 2, unitPrice: 75000, sku: "ADG-ANK737-24K" },
    ],
    totals: totalsFor([
      { productId: "p28", title: "Sony WH-1000XM5 Headphones", quantity: 1, unitPrice: 185000 },
      { productId: "p34", title: "Anker 737 Power Bank 24000mAh", quantity: 2, unitPrice: 75000 },
    ], 500),
    fulfillmentStatus: "processing",
    paymentStatus: "paid",
    paymentMethod: "paystack",
    deliveryMethod: "delivery",
    deliveryAddress: "Block C, Room 12, RUGIPO Student Village",
    escrow: { state: "funds_held", displayAmount: 318250, updatedAt: "2026-08-26T15:20:00.000Z", note: "Funds held in escrow until delivery." },
    dispute: { status: "none", timeline: [] },
    refund: { status: "none" },
    flags: [],
    notes: [],
    conversation: { channel: "kampmax_chat" },
    timeline: [
      event("placed", "Order placed", "2026-08-26T15:00:00.000Z", "Folashade Adeyemi placed this order.", "Customer"),
      event("payment_paid", "Payment captured", "2026-08-26T15:06:00.000Z", "Paystack charge succeeded; funds held in escrow.", "System"),
      event("accepted", "Order accepted", "2026-08-26T15:12:00.000Z", "Adebayo's Gadgets accepted this order.", "Store owner"),
      event("processing", "Preparing order", "2026-08-26T15:20:00.000Z", "Packing both items with bubble wrap.", "Store owner"),
    ],
    createdAt: "2026-08-26T15:00:00.000Z",
    updatedAt: "2026-08-26T15:20:00.000Z",
  },

  // Ready for pickup — dashboard-linked order
  {
    id: "KMP-4098",
    parentOrderId: "KMP-4098",
    vendorId: "v8",
    storeName: "Adebayo's Gadgets",
    customer: {
      buyerId: "u2",
      displayName: "Chioma Nwosu",
      phone: "+234 813 456 7890",
      campusLabel: "RUGIPO",
    },
    items: [{ productId: "p25", title: "iPhone 13 Pro Max 256GB", quantity: 1, unitPrice: 420000, sku: "ADG-IP13PM-256-GRY" }],
    totals: totalsFor([{ productId: "p25", title: "iPhone 13 Pro Max 256GB", quantity: 1, unitPrice: 420000 }], 0),
    fulfillmentStatus: "ready_for_pickup",
    paymentStatus: "paid",
    paymentMethod: "wallet",
    deliveryMethod: "campus_pickup",
    pickup: {
      location: PICKUP_LOCATION,
      instructions: PICKUP_POLICY,
      pickupCode: "PK-9482",
      readyForPickupAt: "2026-08-26T14:40:00.000Z",
    },
    escrow: { state: "release_eligible", displayAmount: 399000, updatedAt: "2026-08-26T14:40:00.000Z", note: "Ready for pickup. Release will be triggered once collection is verified." },
    dispute: { status: "none", timeline: [] },
    refund: { status: "none" },
    flags: [],
    notes: [],
    conversation: { channel: "kampmax_chat" },
    timeline: [
      event("placed", "Order placed", "2026-08-26T13:30:00.000Z", "Chioma Nwosu placed this order.", "Customer"),
      event("payment_paid", "Payment captured", "2026-08-26T13:35:00.000Z", "Wallet payment succeeded; funds held in escrow.", "System"),
      event("accepted", "Order accepted", "2026-08-26T13:42:00.000Z", "Adebayo's Gadgets accepted this order.", "Store owner"),
      event("processing", "Preparing order", "2026-08-26T13:50:00.000Z", "Resetting and re-sealing the iPhone.", "Store owner"),
      event("ready_for_pickup", "Ready for pickup", "2026-08-26T14:40:00.000Z", "Pickup code PK-9482 issued. Engineering Block, RUGIPO.", "Store owner"),
    ],
    createdAt: "2026-08-26T13:30:00.000Z",
    updatedAt: "2026-08-26T14:40:00.000Z",
  },

  // Shipped (delivery)
  {
    id: "KMP-4116",
    parentOrderId: "KMP-4116",
    vendorId: "v8",
    storeName: "Adebayo's Gadgets",
    customer: {
      buyerId: "u5",
      displayName: "Emeka Obi",
      phone: "+234 816 789 0123",
      campusLabel: "RUGIPO",
    },
    items: [{ productId: "p36", title: "Google Pixel 8 Pro 128GB", quantity: 1, unitPrice: 380000, sku: "ADG-PXL8P-128-OBS" }],
    totals: totalsFor([{ productId: "p36", title: "Google Pixel 8 Pro 128GB", quantity: 1, unitPrice: 380000 }], 500),
    fulfillmentStatus: "shipped",
    paymentStatus: "paid",
    paymentMethod: "paystack",
    deliveryMethod: "delivery",
    deliveryAddress: "Block B, Room 8, RUGIPO Student Village",
    shipment: { carrier: "GIG Logistics", trackingNumber: "GIG-882-1044-71", shippedAt: "2026-08-28T11:30:00.000Z" },
    escrow: { state: "awaiting_fulfillment", displayAmount: 361000, updatedAt: "2026-08-28T11:30:00.000Z", note: "In transit — escrow releases once delivery is confirmed." },
    dispute: { status: "none", timeline: [] },
    refund: { status: "none" },
    flags: [],
    notes: [],
    conversation: { channel: "kampmax_chat" },
    timeline: [
      event("placed", "Order placed", "2026-08-28T10:00:00.000Z", "Emeka Obi placed this order.", "Customer"),
      event("payment_paid", "Payment captured", "2026-08-28T10:05:00.000Z", "Paystack charge succeeded; funds held in escrow.", "System"),
      event("accepted", "Order accepted", "2026-08-28T10:12:00.000Z", "Adebayo's Gadgets accepted this order.", "Store owner"),
      event("processing", "Preparing order", "2026-08-28T10:30:00.000Z", "Full diagnostics and secure packaging.", "Store owner"),
      event("shipped", "Order shipped", "2026-08-28T11:30:00.000Z", "Picked up by GIG Logistics — GIG-882-1044-71.", "Store owner"),
    ],
    createdAt: "2026-08-28T10:00:00.000Z",
    updatedAt: "2026-08-28T11:30:00.000Z",
  },

  // Out for delivery
  {
    id: "KMP-4118",
    parentOrderId: "KMP-4118",
    vendorId: "v8",
    storeName: "Adebayo's Gadgets",
    customer: {
      buyerId: "u3",
      displayName: "Ibrahim Musa",
      phone: "+234 814 567 8901",
      campusLabel: "RUGIPO",
    },
    items: [{ productId: "p34", title: "Anker 737 Power Bank 24000mAh", quantity: 1, unitPrice: 75000, sku: "ADG-ANK737-24K" }],
    totals: totalsFor([{ productId: "p34", title: "Anker 737 Power Bank 24000mAh", quantity: 1, unitPrice: 75000 }], 500),
    fulfillmentStatus: "out_for_delivery",
    paymentStatus: "paid",
    paymentMethod: "wallet",
    deliveryMethod: "delivery",
    deliveryAddress: "Block D, Room 2, RUGIPO Student Village",
    shipment: { carrier: "GIG Logistics", trackingNumber: "GIG-880-0902-18", shippedAt: "2026-08-28T16:00:00.000Z" },
    escrow: { state: "awaiting_fulfillment", displayAmount: 71250, updatedAt: "2026-08-29T09:05:00.000Z", note: "Rider confirmed on the way — release on delivery confirmation." },
    dispute: { status: "none", timeline: [] },
    refund: { status: "none" },
    flags: [],
    notes: [],
    conversation: { channel: "kampmax_chat" },
    timeline: [
      event("placed", "Order placed", "2026-08-28T15:20:00.000Z", "Ibrahim Musa placed this order.", "Customer"),
      event("payment_paid", "Payment captured", "2026-08-28T15:25:00.000Z", "Wallet payment succeeded; funds held in escrow.", "System"),
      event("accepted", "Order accepted", "2026-08-28T15:30:00.000Z", "Adebayo's Gadgets accepted this order.", "Store owner"),
      event("processing", "Preparing order", "2026-08-28T15:40:00.000Z", "Packing Anker 737 with charging cable.", "Store owner"),
      event("shipped", "Order shipped", "2026-08-28T16:00:00.000Z", "Handed to GIG Logistics — GIG-880-0902-18.", "Store owner"),
      event("out_for_delivery", "Out for delivery", "2026-08-29T09:05:00.000Z", "Rider is delivering to Block D, RUGIPO Student Village.", "GIG Logistics"),
    ],
    createdAt: "2026-08-28T15:20:00.000Z",
    updatedAt: "2026-08-29T09:05:00.000Z",
  },

  // Delivered (pickup) — dashboard-linked order
  {
    id: "KMP-4095",
    parentOrderId: "KMP-4095",
    vendorId: "v8",
    storeName: "Adebayo's Gadgets",
    customer: {
      buyerId: "u2",
      displayName: "Chioma Nwosu",
      phone: "+234 813 456 7890",
      campusLabel: "RUGIPO",
    },
    items: [{ productId: "p30", title: "DJI Mini 3 Pro Drone", quantity: 1, unitPrice: 420000, sku: "ADG-DJI-M3P-RC" }],
    totals: totalsFor([{ productId: "p30", title: "DJI Mini 3 Pro Drone", quantity: 1, unitPrice: 420000 }], 0),
    fulfillmentStatus: "delivered",
    paymentStatus: "paid",
    paymentMethod: "paystack",
    deliveryMethod: "campus_pickup",
    pickup: {
      location: PICKUP_LOCATION,
      instructions: PICKUP_POLICY,
      pickupCode: "PK-9104",
      readyForPickupAt: "2026-08-25T10:00:00.000Z",
      collectedAt: "2026-08-25T14:20:00.000Z",
    },
    escrow: { state: "release_eligible", displayAmount: 399000, updatedAt: "2026-08-25T14:20:00.000Z", note: "Collected and verified. Funds can be released once the order is completed." },
    dispute: { status: "none", timeline: [] },
    refund: { status: "none" },
    flags: [],
    notes: [],
    conversation: { channel: "kampmax_chat" },
    timeline: [
      event("placed", "Order placed", "2026-08-25T09:00:00.000Z", "Chioma Nwosu placed this order.", "Customer"),
      event("payment_paid", "Payment captured", "2026-08-25T09:04:00.000Z", "Paystack charge succeeded; funds held in escrow.", "System"),
      event("accepted", "Order accepted", "2026-08-25T09:10:00.000Z", "Adebayo's Gadgets accepted this order.", "Store owner"),
      event("processing", "Preparing order", "2026-08-25T09:30:00.000Z", "Calibrating gimbal and charging both batteries.", "Store owner"),
      event("ready_for_pickup", "Ready for pickup", "2026-08-25T10:00:00.000Z", "Pickup code PK-9104 issued.", "Store owner"),
      event("delivered", "Picked up by buyer", "2026-08-25T14:20:00.000Z", "Buyer collected at Engineering Block. Code verified.", "Store owner"),
    ],
    createdAt: "2026-08-25T09:00:00.000Z",
    updatedAt: "2026-08-25T14:20:00.000Z",
  },

  // Delivered (delivery) — dashboard-linked order
  {
    id: "KMP-4090",
    parentOrderId: "KMP-4090",
    vendorId: "v8",
    storeName: "Adebayo's Gadgets",
    customer: {
      buyerId: "u4",
      displayName: "Folashade Adeyemi",
      phone: "+234 815 678 9012",
      campusLabel: "RUGIPO",
    },
    items: [{ productId: "p31", title: "Logitech MX Master 3S Mouse", quantity: 1, unitPrice: 55000, sku: "ADG-MXM3S-GRP" }],
    totals: totalsFor([{ productId: "p31", title: "Logitech MX Master 3S Mouse", quantity: 1, unitPrice: 55000 }], 500),
    fulfillmentStatus: "delivered",
    paymentStatus: "paid",
    paymentMethod: "paystack",
    deliveryMethod: "delivery",
    deliveryAddress: "Block C, Room 12, RUGIPO Student Village",
    shipment: { carrier: "GIG Logistics", trackingNumber: "GIG-879-0401-09", shippedAt: "2026-08-24T12:00:00.000Z", deliveredAt: "2026-08-24T15:10:00.000Z" },
    escrow: { state: "release_eligible", displayAmount: 52250, updatedAt: "2026-08-24T15:10:00.000Z", note: "Delivered and confirmed. Funds ready for release on completion." },
    dispute: { status: "none", timeline: [] },
    refund: { status: "none" },
    flags: [],
    notes: [],
    conversation: { channel: "kampmax_chat" },
    timeline: [
      event("placed", "Order placed", "2026-08-24T11:00:00.000Z", "Folashade Adeyemi placed this order.", "Customer"),
      event("payment_paid", "Payment captured", "2026-08-24T11:05:00.000Z", "Paystack charge succeeded; funds held in escrow.", "System"),
      event("accepted", "Order accepted", "2026-08-24T11:12:00.000Z", "Adebayo's Gadgets accepted this order.", "Store owner"),
      event("processing", "Preparing order", "2026-08-24T11:30:00.000Z", "Batteries checked, mouse sealed.", "Store owner"),
      event("shipped", "Order shipped", "2026-08-24T12:00:00.000Z", "Handed to GIG Logistics — GIG-879-0401-09.", "Store owner"),
      event("out_for_delivery", "Out for delivery", "2026-08-24T12:40:00.000Z", "Rider en route to Block C.", "GIG Logistics"),
      event("delivered", "Delivered", "2026-08-24T15:10:00.000Z", "Buyer confirmed delivery.", "Buyer"),
    ],
    createdAt: "2026-08-24T11:00:00.000Z",
    updatedAt: "2026-08-24T15:10:00.000Z",
  },

  // Delivered, then COMPLETED (escrow released)
  {
    id: "KMP-4119",
    parentOrderId: "KMP-4119",
    vendorId: "v8",
    storeName: "Adebayo's Gadgets",
    customer: {
      buyerId: "u2",
      displayName: "Chioma Nwosu",
      phone: "+234 813 456 7890",
      campusLabel: "RUGIPO",
    },
    items: [
      { productId: "p31", title: "Logitech MX Master 3S Mouse", quantity: 1, unitPrice: 55000, sku: "ADG-MXM3S-GRP" },
      { productId: "p32", title: "Mechanical Keyboard Keychron K8 Pro", quantity: 1, unitPrice: 65000, sku: "ADG-K8PRO-BRN" },
    ],
    totals: totalsFor([
      { productId: "p31", title: "Logitech MX Master 3S Mouse", quantity: 1, unitPrice: 55000 },
      { productId: "p32", title: "Mechanical Keyboard Keychron K8 Pro", quantity: 1, unitPrice: 65000 },
    ], 500),
    fulfillmentStatus: "completed",
    paymentStatus: "paid",
    paymentMethod: "wallet",
    deliveryMethod: "delivery",
    deliveryAddress: "Block E, Room 4, RUGIPO Student Village",
    shipment: { carrier: "GIG Logistics", trackingNumber: "GIG-876-0112-30", shippedAt: "2026-08-21T13:00:00.000Z", deliveredAt: "2026-08-21T16:40:00.000Z" },
    escrow: { state: "released", updatedAt: "2026-08-23T09:00:00.000Z", note: "Funds released to your payout balance. Withdrawals are available in financials." },
    dispute: { status: "none", timeline: [] },
    refund: { status: "none" },
    flags: [],
    notes: [],
    conversation: { channel: "kampmax_chat" },
    timeline: [
      event("placed", "Order placed", "2026-08-21T12:30:00.000Z", "Chioma Nwosu placed this order.", "Customer"),
      event("payment_paid", "Payment captured", "2026-08-21T12:36:00.000Z", "Wallet payment succeeded; funds held in escrow.", "System"),
      event("accepted", "Order accepted", "2026-08-21T12:42:00.000Z", "Adebayo's Gadgets accepted this order.", "Store owner"),
      event("processing", "Preparing order", "2026-08-21T12:50:00.000Z", "Packing keyboard and mouse together.", "Store owner"),
      event("shipped", "Order shipped", "2026-08-21T13:00:00.000Z", "Handed to GIG Logistics — GIG-876-0112-30.", "Store owner"),
      event("out_for_delivery", "Out for delivery", "2026-08-21T13:30:00.000Z", "Rider en route.", "GIG Logistics"),
      event("delivered", "Delivered", "2026-08-21T16:40:00.000Z", "Buyer confirmed delivery.", "Buyer"),
      event("completed", "Order completed", "2026-08-23T09:00:00.000Z", "No issues reported; escrow released.", "System"),
    ],
    createdAt: "2026-08-21T12:30:00.000Z",
    updatedAt: "2026-08-23T09:00:00.000Z",
  },

  // Delivered with an OPEN DISPUTE (funds frozen; vendor can respond)
  {
    id: "KMP-4121",
    parentOrderId: "KMP-4121",
    vendorId: "v8",
    storeName: "Adebayo's Gadgets",
    customer: {
      buyerId: "u4",
      displayName: "Folashade Adeyemi",
      phone: "+234 815 678 9012",
      campusLabel: "RUGIPO",
    },
    items: [{ productId: "p33", title: "Apple Watch Series 9 45mm GPS", quantity: 1, unitPrice: 265000, sku: "ADG-AWS9-45-MID" }],
    totals: totalsFor([{ productId: "p33", title: "Apple Watch Series 9 45mm GPS", quantity: 1, unitPrice: 265000 }], 0),
    fulfillmentStatus: "delivered",
    paymentStatus: "paid",
    paymentMethod: "paystack",
    deliveryMethod: "campus_pickup",
    pickup: {
      location: PICKUP_LOCATION,
      instructions: PICKUP_POLICY,
      pickupCode: "PK-9610",
      readyForPickupAt: "2026-08-26T16:00:00.000Z",
      collectedAt: "2026-08-27T09:10:00.000Z",
    },
    escrow: { state: "funds_held", displayAmount: 251750, updatedAt: "2026-08-27T11:00:00.000Z", note: "Delivered, but a dispute is open — funds frozen until resolution." },
    dispute: {
      status: "under_review",
      openedAt: "2026-08-27T11:00:00.000Z",
      reason: "Buyer says the screen was scratched on collection.",
      customerClaim: "I picked it up yesterday and the display has a visible scratch near the top right.",
      timeline: [
        { id: "dp-4121-1", role: "customer", title: "Dispute opened", detail: "Buyer reported damage on collection.", at: "2026-08-27T11:00:00.000Z" },
        { id: "dp-4121-2", role: "support", title: "Under review", detail: "Support is reviewing photos submitted by the buyer.", at: "2026-08-27T12:30:00.000Z" },
      ],
    },
    refund: { status: "none" },
    flags: [
      {
        id: "fl-disp-4121",
        type: "dispute_opened",
        title: "Open dispute — frozen escrow",
        detail: "Respond with your side of the story to help resolve quickly.",
        severity: "high",
        status: "escalated",
        createdAt: "2026-08-27T11:00:00.000Z",
      },
    ],
    notes: [],
    conversation: { channel: "kampmax_chat" },
    timeline: [
      event("placed", "Order placed", "2026-08-26T15:00:00.000Z", "Folashade Adeyemi placed this order.", "Customer"),
      event("payment_paid", "Payment captured", "2026-08-26T15:06:00.000Z", "Paystack charge succeeded; funds held in escrow.", "System"),
      event("accepted", "Order accepted", "2026-08-26T15:12:00.000Z", "Adebayo's Gadgets accepted this order.", "Store owner"),
      event("processing", "Preparing order", "2026-08-26T15:30:00.000Z", "Unit sealed after final inspection.", "Store owner"),
      event("ready_for_pickup", "Ready for pickup", "2026-08-26T16:00:00.000Z", "Pickup code PK-9610 issued.", "Store owner"),
      event("delivered", "Picked up by buyer", "2026-08-27T09:10:00.000Z", "Buyer collected at Engineering Block.", "Store owner"),
      event("dispute_opened", "Dispute opened", "2026-08-27T11:00:00.000Z", "Buyer reported a scratch; escrow frozen.", "Customer"),
    ],
    createdAt: "2026-08-26T15:00:00.000Z",
    updatedAt: "2026-08-27T11:00:00.000Z",
  },

  // CANCELLED by vendor — refund pending (escrow held awaiting return)
  {
    id: "KMP-4120",
    parentOrderId: "KMP-4120",
    vendorId: "v8",
    storeName: "Adebayo's Gadgets",
    customer: {
      buyerId: "u4",
      displayName: "Folashade Adeyemi",
      phone: "+234 815 678 9012",
      campusLabel: "RUGIPO",
    },
    items: [{ productId: "p33", title: "Apple Watch Series 9 45mm GPS", quantity: 1, unitPrice: 265000, sku: "ADG-AWS9-45-MID" }],
    totals: totalsFor([{ productId: "p33", title: "Apple Watch Series 9 45mm GPS", quantity: 1, unitPrice: 265000 }], 0),
    fulfillmentStatus: "cancelled",
    paymentStatus: "refund_pending",
    paymentMethod: "wallet",
    deliveryMethod: "campus_pickup",
    pickup: { location: PICKUP_LOCATION, instructions: PICKUP_POLICY },
    escrow: { state: "funds_held", displayAmount: 251750, updatedAt: "2026-08-26T10:30:00.000Z", note: "Funds held while the refund is being returned to the buyer." },
    dispute: { status: "none", timeline: [] },
    refund: {
      status: "pending",
      amount: 251750,
      reason: "Out of stock — cancelled by seller.",
      requestedAt: "2026-08-26T10:30:00.000Z",
    },
    flags: [
      {
        id: "fl-ref-4120",
        type: "stock_shortage",
        title: "Cancelled — refund pending",
        detail: "The sealed unit was already sold. Refund is being processed back to the buyer.",
        severity: "medium",
        status: "open",
        createdAt: "2026-08-26T10:30:00.000Z",
      },
    ],
    notes: [],
    conversation: { channel: "kampmax_chat" },
    timeline: [
      event("placed", "Order placed", "2026-08-26T09:10:00.000Z", "Folashade Adeyemi placed this order.", "Customer"),
      event("payment_paid", "Payment captured", "2026-08-26T09:14:00.000Z", "Wallet payment succeeded; funds held in escrow.", "System"),
      event("accepted", "Order accepted", "2026-08-26T09:20:00.000Z", "Adebayo's Gadgets accepted this order.", "Store owner"),
      event("cancelled", "Cancelled — out of stock", "2026-08-26T10:30:00.000Z", "Vendor cancelled; refund initiated.", "Store owner"),
      event("refund_requested", "Refund requested", "2026-08-26T10:30:00.000Z", "Escrow will return 251,750 to the buyer's wallet.", "System"),
    ],
    createdAt: "2026-08-26T09:10:00.000Z",
    updatedAt: "2026-08-26T10:30:00.000Z",
  },

  // CANCELLED + REFUNDED (money returned)
  {
    id: "KMP-4107",
    parentOrderId: "KMP-4107",
    vendorId: "v8",
    storeName: "Adebayo's Gadgets",
    customer: {
      buyerId: "u2",
      displayName: "Chioma Nwosu",
      phone: "+234 813 456 7890",
      campusLabel: "RUGIPO",
    },
    items: [{ productId: "p28", title: "Sony WH-1000XM5 Headphones", quantity: 1, unitPrice: 185000, sku: "ADG-WH1000XM5-SLV" }],
    totals: totalsFor([{ productId: "p28", title: "Sony WH-1000XM5 Headphones", quantity: 1, unitPrice: 185000 }], 0),
    fulfillmentStatus: "cancelled",
    paymentStatus: "refunded",
    paymentMethod: "paystack",
    deliveryMethod: "campus_pickup",
    pickup: { location: PICKUP_LOCATION, instructions: PICKUP_POLICY },
    escrow: { state: "refunded", updatedAt: "2026-08-20T16:00:00.000Z", note: "Refund completed; nothing owed." },
    dispute: { status: "none", timeline: [] },
    refund: {
      status: "refunded",
      amount: 175750,
      reason: "Buyer requested cancellation before preparation.",
      requestedAt: "2026-08-19T14:00:00.000Z",
      updatedAt: "2026-08-20T16:00:00.000Z",
    },
    flags: [],
    notes: [],
    conversation: { channel: "kampmax_chat" },
    timeline: [
      event("placed", "Order placed", "2026-08-19T13:40:00.000Z", "Chioma Nwosu placed this order.", "Customer"),
      event("payment_paid", "Payment captured", "2026-08-19T13:46:00.000Z", "Paystack charge succeeded; funds held in escrow.", "System"),
      event("accepted", "Order accepted", "2026-08-19T13:55:00.000Z", "Adebayo's Gadgets accepted this order.", "Store owner"),
      event("cancelled", "Cancelled by buyer request", "2026-08-19T14:00:00.000Z", "Buyer cancelled before preparation.", "Store owner"),
      event("refund_requested", "Refund approved", "2026-08-20T16:00:00.000Z", "175,750 returned to the buyer.", "System"),
    ],
    createdAt: "2026-08-19T13:40:00.000Z",
    updatedAt: "2026-08-20T16:00:00.000Z",
  },

  // MULTI-VENDOR PARENT: v8 slice (only this slice is visible to v8)
  {
    id: "KMP-4125-A",
    parentOrderId: "KMP-4125",
    vendorId: "v8",
    storeName: "Adebayo's Gadgets",
    customer: {
      buyerId: "u5",
      displayName: "Emeka Obi",
      phone: "+234 816 789 0123",
      campusLabel: "RUGIPO",
    },
    items: [{ productId: "p29", title: "iPad Air 5th Gen 64GB WiFi", quantity: 1, unitPrice: 280000, sku: "ADG-IPAD5-64-SG" }],
    totals: totalsFor([{ productId: "p29", title: "iPad Air 5th Gen 64GB WiFi", quantity: 1, unitPrice: 280000 }], 0),
    fulfillmentStatus: "pending",
    paymentStatus: "paid",
    paymentMethod: "paystack",
    deliveryMethod: "campus_pickup",
    pickup: { location: PICKUP_LOCATION, instructions: PICKUP_POLICY },
    escrow: { state: "funds_held", displayAmount: 266000, updatedAt: "2026-08-29T08:10:00.000Z", note: "Funds for this slice are held in escrow until pickup." },
    dispute: { status: "none", timeline: [] },
    refund: { status: "none" },
    flags: [],
    notes: [],
    conversation: { channel: "kampmax_chat" },
    timeline: [
      event("placed", "Order placed", "2026-08-29T08:00:00.000Z", "Emeka Obi placed a combined order (2 sellers).", "Customer"),
      event("payment_paid", "Payment captured", "2026-08-29T08:10:00.000Z", "Checkout payment split across sellers; this slice is funded.", "System"),
    ],
    createdAt: "2026-08-29T08:00:00.000Z",
    updatedAt: "2026-08-29T08:10:00.000Z",
  },

  // MULTI-VENDOR PARENT: StyleByChi slice — MUST NOT surface to v8.
  // Present in the shared queryset so the service can prove isolation.
  {
    id: "KMP-4125-B",
    parentOrderId: "KMP-4125",
    vendorId: "v2",
    storeName: "StyleByChi",
    customer: {
      buyerId: "u5",
      displayName: "Emeka Obi",
      phone: "+234 816 789 0123",
      campusLabel: "RUGIPO",
    },
    items: [{ productId: "p8", title: "RUGIPO Campus Hoodie", quantity: 1, unitPrice: 7500, sku: "SBC-HOODIE-NAVY-L" }],
    totals: totalsFor([{ productId: "p8", title: "RUGIPO Campus Hoodie", quantity: 1, unitPrice: 7500 }], 0),
    fulfillmentStatus: "pending",
    paymentStatus: "paid",
    paymentMethod: "paystack",
    deliveryMethod: "campus_pickup",
    pickup: { location: "Student Union Building, RUGIPO", instructions: "Bring a valid ID." },
    escrow: { state: "funds_held", displayAmount: 7125, updatedAt: "2026-08-29T08:10:00.000Z", note: "Slice funds held in escrow." },
    dispute: { status: "none", timeline: [] },
    refund: { status: "none" },
    flags: [],
    notes: [],
    conversation: { channel: "kampmax_chat" },
    timeline: [
      event("placed", "Order placed", "2026-08-29T08:00:00.000Z", "Emeka Obi placed a combined order (2 sellers).", "Customer"),
      event("payment_paid", "Payment captured", "2026-08-29T08:10:00.000Z", "Checkout payment split across sellers; this slice is funded.", "System"),
    ],
    createdAt: "2026-08-29T08:00:00.000Z",
    updatedAt: "2026-08-29T08:10:00.000Z",
  },
];

// ── Parent orders ─────────────────────────────────────────────
// Derived from the slices; the multi-vendor parent is assembled explicitly.

function parentFromSlice(slice: VendorOrder): VendorParentOrder {
  return {
    id: slice.parentOrderId,
    buyerId: slice.customer.buyerId,
    buyerDisplayName: slice.customer.displayName,
    createdAt: slice.createdAt,
    vendorSellers: [{ vendorId: slice.vendorId, storeName: slice.storeName }],
    vendorOrderIds: [slice.id],
    status: slice.fulfillmentStatus,
    customerTotal: slice.totals.customerTotal,
  };
}

export const vendorParentOrders: VendorParentOrder[] = [
  ...vendorOrderSlices
    .filter((s) => s.parentOrderId === s.id)
    .map(parentFromSlice),
  {
    id: "KMP-4125",
    buyerId: "u5",
    buyerDisplayName: "Emeka Obi",
    createdAt: "2026-08-29T08:00:00.000Z",
    vendorSellers: [
      { vendorId: "v8", storeName: "Adebayo's Gadgets" },
      { vendorId: "v2", storeName: "StyleByChi" },
    ],
    vendorOrderIds: ["KMP-4125-A", "KMP-4125-B"],
    status: "pending",
    customerTotal: subtotals(sliceById("KMP-4125-A").items) + subtotals(sliceById("KMP-4125-B").items),
  },
];

function sliceById(id: string): VendorOrder {
  const found = vendorOrderSlices.find((s) => s.id === id);
  if (!found) throw new Error(`vendorOrderSlices missing entry: ${id}`);
  return found;
}

// ── Lookups ───────────────────────────────────────────────────

export function getVendorOrderSlice(id: string): VendorOrder | undefined {
  return vendorOrderSlices.find((o) => o.id === id);
}

export function getVendorParentOrder(id: string): VendorParentOrder | undefined {
  return vendorParentOrders.find((p) => p.id === id);
}

export function getCampusLabelFor(campusId: string): string {
  const labels: Record<string, string> = {
    rugipo: "RUGIPO",
    oau: "OAU",
    ui: "UI",
    unilag: "UNILAG",
  };
  return labels[campusId] ?? campusId.toUpperCase();
}

if (vendorOrderSlices.length !== new Set(vendorOrderSlices.map((o) => o.id)).size) {
  throw new Error("Duplicate vendor order slice ids");
}