import {
  VendorStore,
  VendorNotifications,
  ActionRequiredItem,
  StoreHealth,
  DashboardOverview,
  STORE_STATUS,
  VENDOR_ORDER_STATUS,
} from "@/types/vendor-dashboard";
import { STORE_STATUS as _S } from "@/types/vendor-dashboard";

// ============================================================
// VENDOR DASHBOARD MOCK DATA  (Module 10)
// ============================================================
//
// This models the backend contract for the authenticated vendor's dashboard:
//   GET /vendor/me                 → access + profile summary
//   GET /vendor/store              → full store (manage)
//   PATCH /vendor/store            → update store
//   GET /vendor/dashboard          → overview metrics
//   GET /vendor/notifications      → notifications
//   GET /vendor/action-required    → backend-supplied action items
//   GET /vendor/store/health       → store health
//
// Ownership is resolved from the authenticated identity, never from a
// client-supplied vendorId.

const DAY_LABELS = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
];

// Seed store model for the authenticated demo vendor (v8 / u1).
export const initialStore: VendorStore = {
  vendorId: "v8",
  identity: {
    storeName: "Adebayo's Gadgets",
    tagline: "Gadgets & essentials for campus life.",
    description:
      "Gadgets, electronics and campus essentials from a fellow student. Affordable, tested, and delivered with a smile.",
    categoryId: "cat2", // Electronics
  },
  branding: {
    logoRef: null,
    coverRef: null,
    logoPreviewColor: "#1769E0",
  },
  contact: {
    businessEmail: "adebayo@rugipo.edu.ng",
    businessPhone: "+234 812 345 6789",
    messagingAvailable: true,
  },
  location: {
    primaryCampusId: "rugipo",
    supportedCampusIds: ["rugipo"],
    pickupLocation: "Engineering Block, RUGIPO",
    deliveryArea: "RUGIPO campus and surrounding hostels",
  },
  hours: [
    { dayIndex: 0, label: "Monday", mode: "custom", openTime: "08:00", closeTime: "20:00" },
    { dayIndex: 1, label: "Tuesday", mode: "custom", openTime: "08:00", closeTime: "20:00" },
    { dayIndex: 2, label: "Wednesday", mode: "custom", openTime: "08:00", closeTime: "20:00" },
    { dayIndex: 3, label: "Thursday", mode: "custom", openTime: "08:00", closeTime: "20:00" },
    { dayIndex: 4, label: "Friday", mode: "custom", openTime: "08:00", closeTime: "20:00" },
    { dayIndex: 5, label: "Saturday", mode: "open_24", openTime: "00:00", closeTime: "23:59" },
    { dayIndex: 6, label: "Sunday", mode: "closed", openTime: "00:00", closeTime: "00:00" },
  ],
  delivery: {
    deliveryAvailable: true,
    pickupAvailable: true,
    prepTimeMinutes: 30,
    supportedCampusIds: ["rugipo"],
    deliveryFee: 500,
  },
  policies: {
    returnPolicy:
      "Items may be returned within 7 days if defective or not as described. Must be in original packaging.",
    cancellationPolicy:
      "Orders may be cancelled before preparation begins. Contact support if you need to cancel after that.",
    deliveryPolicy:
      "We deliver on-campus within the RUGIPO area. A delivery fee applies to off-body locations.",
    pickupPolicy:
      "Free pickup at the Engineering Block. Please wait for the READY notification before coming.",
  },
  status: STORE_STATUS.OPEN,
  platformSuspended: false,
  updatedAt: "2026-08-27T10:00:00.000Z",
};

void _S;

export const storeMock = { store: { ...initialStore } };

// ── Dashboard overview (non-financial; backend-provided) ─────

export const dashboardOverview: DashboardOverview = {
  summary: "Here's what's happening with your store today.",
  metrics: [
    {
      key: "orders",
      label: "Orders",
      valueLabel: "8",
      sublabel: "3 pending action",
      tone: "neutral",
    },
    {
      key: "pending_orders",
      label: "Pending Orders",
      valueLabel: "3",
      sublabel: "Need confirmation or preparation",
      tone: "positive",
    },
    {
      key: "products",
      label: "Products",
      valueLabel: "9",
      sublabel: "8 active",
      tone: "neutral",
    },
    {
      key: "store_rating",
      label: "Store Rating",
      valueLabel: "4.8",
      sublabel: "Backend-authoritative",
      tone: "positive",
    },
  ],
};

// ── Notifications (backend-supplied, no admin/internal data) ─

export const initialNotifications: VendorNotifications = {
  unreadCount: 3,
  items: [
    {
      id: "n1",
      kind: "new_order",
      title: "New order KMP-4102",
      body: "A customer placed an order for HP Laptop i5 8GB RAM.",
      href: "/vendor/orders/KMP-4102",
      read: false,
      createdAt: "2026-08-27T09:00:00.000Z",
    },
    {
      id: "n2",
      kind: "order_update",
      title: "Order KMP-4098 ready for pickup",
      body: "The pickup order is ready. Contact the customer to collect.",
      href: "/vendor/orders/KMP-4098",
      read: false,
      createdAt: "2026-08-27T08:30:00.000Z",
    },
    {
      id: "n3",
      kind: "review_received",
      title: "New 5-star review",
      body: "A customer left a 5-star review for Casio Scientific Calculator.",
      href: "/vendor/reviews",
      read: false,
      createdAt: "2026-08-26T18:00:00.000Z",
    },
    {
      id: "n4",
      kind: "verification_update",
      title: "Business verification approved",
      body: "Your business identity has been verified. Nice work!",
      href: "/vendor/store",
      read: true,
      createdAt: "2026-08-20T11:00:00.000Z",
    },
    {
      id: "n5",
      kind: "platform_announcement",
      title: "New seller resources",
      body: "Check the Seller Center for guides on growing your store.",
      href: undefined,
      read: true,
      createdAt: "2026-08-18T10:00:00.000Z",
    },
  ],
};

export const notificationsMock = {
  notifications: {
    ...initialNotifications,
    items: [...initialNotifications.items],
  },
};

// ── Action required (backend-supplied only) ──────────────────

export const initialActionRequired: ActionRequiredItem[] = [
  {
    id: "ar1",
    title: "Add store cover image",
    description: "A cover image makes your storefront look complete.",
    actionLabel: "Add cover",
    href: "/vendor/store#branding",
    priority: "medium",
  },
  {
    id: "ar2",
    title: "Confirm pending order KMP-4102",
    description: "You have an order waiting for confirmation.",
    actionLabel: "Review order",
    href: "/vendor/orders/KMP-4102",
    priority: "high",
  },
  {
    id: "ar3",
    title: "Update return policy preview",
    description: "Customers will see this policy at checkout.",
    actionLabel: "Update policy",
    href: "/vendor/store#policies",
    priority: "low",
  },
];

// ── Store health (backend-authoritative score + items) ───────

export const initialStoreHealth: StoreHealth = {
  score: 82,
  items: [
    { id: "h1", label: "Store identity", complete: true, detail: "Name and tagline set." },
    { id: "h2", label: "Store branding", complete: false, detail: "Add a logo and cover image." },
    { id: "h3", label: "Verification", complete: true, detail: "Business verified." },
    { id: "h4", label: "Product listings", complete: true, detail: "8 active listings." },
    { id: "h5", label: "Store policies", complete: false, detail: "Update your delivery policy." },
    { id: "h6", label: "Customer rating", complete: true, detail: "4.8★ from customers." },
  ],
};

// ── Recent orders (subset of existing operational mock data) ─

export const recentOrders = [
  {
    id: "KMP-4102",
    customerName: "Adebayo Oluwaseun",
    createdAt: "2026-08-27T09:00:00.000Z",
    amount: 185000,
    status: VENDOR_ORDER_STATUS.PROCESSING,
    href: "/vendor/orders/KMP-4102",
  },
  {
    id: "KMP-4098",
    customerName: "Folashade Adeyemi",
    createdAt: "2026-08-26T14:30:00.000Z",
    amount: 26500,
    status: VENDOR_ORDER_STATUS.READY_FOR_PICKUP,
    href: "/vendor/orders/KMP-4098",
  },
  {
    id: "KMP-4095",
    customerName: "Adebayo Oluwaseun",
    createdAt: "2026-08-25T09:00:00.000Z",
    amount: 9500,
    status: VENDOR_ORDER_STATUS.DELIVERED,
    href: "/vendor/orders/KMP-4095",
  },
  {
    id: "KMP-4090",
    customerName: "Folashade Adeyemi",
    createdAt: "2026-08-24T16:00:00.000Z",
    amount: 8500,
    status: VENDOR_ORDER_STATUS.DELIVERED,
    href: "/vendor/orders/KMP-4090",
  },
];

export const DAY_LABELS_LOOKUP = DAY_LABELS;
