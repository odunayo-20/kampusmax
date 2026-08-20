import { Order } from "@/types";
import { products } from "./products";

export const mockOrders: Order[] = [
  // ── Delivered order ──
  {
    id: "KMP-3847",
    buyerId: "u1",
    vendorId: "v1",
    items: [
      { product: products[2], quantity: 1 },
      { product: products[9], quantity: 1 },
    ],
    subtotal: 21500,
    platformFee: 538,
    deliveryFee: 0,
    discountAmount: 0,
    total: 22038,
    status: "delivered",
    deliveryMethod: "campus_pickup",
    deliveryAddress: "Computer Lab Area, RUGIPO",
    paymentMethod: "paystack",
    paymentStatus: "paid",
    createdAt: "2025-01-10T09:15:00Z",
    updatedAt: "2025-01-11T14:30:00Z",
    estimatedDelivery: "2025-01-11",
    deliveredAt: "2025-01-11T14:30:00Z",
    timeline: [
      { status: "placed", timestamp: "2025-01-10T09:15:00Z", message: "Order placed successfully" },
      { status: "confirmed", timestamp: "2025-01-10T09:20:00Z", message: "Vendor confirmed your order" },
      { status: "preparing", timestamp: "2025-01-10T09:25:00Z", message: "Items are being prepared" },
      { status: "ready", timestamp: "2025-01-10T14:00:00Z", message: "Ready for pickup at Computer Lab Area" },
      { status: "delivered", timestamp: "2025-01-11T14:30:00Z", message: "Order completed" },
    ],
  },

  // ── Confirmed order ──
  {
    id: "KMP-4102",
    buyerId: "u1",
    vendorId: "v2",
    items: [{ product: products[4], quantity: 1 }],
    subtotal: 35000,
    platformFee: 875,
    deliveryFee: 0,
    discountAmount: 0,
    total: 35875,
    status: "confirmed",
    deliveryMethod: "meetup",
    deliveryAddress: "Student Union Building, RUGIPO",
    paymentMethod: "paystack",
    paymentStatus: "paid",
    createdAt: "2025-01-14T10:00:00Z",
    updatedAt: "2025-01-14T10:05:00Z",
    estimatedDelivery: "2025-01-15",
    timeline: [
      { status: "placed", timestamp: "2025-01-14T10:00:00Z", message: "Order placed successfully" },
      { status: "confirmed", timestamp: "2025-01-14T10:05:00Z", message: "Vendor confirmed your order" },
    ],
  },

  // ── Preparing order ──
  {
    id: "KMP-4215",
    buyerId: "u1",
    vendorId: "v3",
    items: [
      { product: products[10], quantity: 2 },
      { product: products[5], quantity: 1 },
    ],
    subtotal: 95000,
    platformFee: 2000,
    deliveryFee: 500,
    discountAmount: 5000,
    total: 92500,
    status: "preparing",
    deliveryMethod: "delivery",
    deliveryAddress: "Room 12, Block B, RUGIPO Hostel",
    paymentMethod: "wallet",
    paymentStatus: "paid",
    createdAt: "2025-01-15T08:30:00Z",
    updatedAt: "2025-01-15T08:35:00Z",
    estimatedDelivery: "2025-01-15",
    notes: "Please call when at the hostel gate",
    timeline: [
      { status: "placed", timestamp: "2025-01-15T08:30:00Z", message: "Order placed successfully" },
      { status: "confirmed", timestamp: "2025-01-15T08:32:00Z", message: "Vendor confirmed your order" },
      { status: "preparing", timestamp: "2025-01-15T08:35:00Z", message: "Items are being prepared for delivery" },
    ],
  },

  // ── Ready for pickup ──
  {
    id: "KMP-4298",
    buyerId: "u1",
    vendorId: "v1",
    items: [{ product: products[6], quantity: 1 }],
    subtotal: 5500,
    platformFee: 50,
    deliveryFee: 0,
    discountAmount: 0,
    total: 5550,
    status: "ready",
    deliveryMethod: "campus_pickup",
    pickupLocation: "main_gate",
    deliveryAddress: "Main Gate, RUGIPO",
    paymentMethod: "paystack",
    paymentStatus: "paid",
    createdAt: "2025-01-15T11:00:00Z",
    updatedAt: "2025-01-15T11:45:00Z",
    estimatedDelivery: "2025-01-15",
    timeline: [
      { status: "placed", timestamp: "2025-01-15T11:00:00Z", message: "Order placed successfully" },
      { status: "confirmed", timestamp: "2025-01-15T11:05:00Z", message: "Vendor confirmed your order" },
      { status: "preparing", timestamp: "2025-01-15T11:10:00Z", message: "Items are being prepared" },
      { status: "ready", timestamp: "2025-01-15T11:45:00Z", message: "Ready for pickup at Main Gate" },
    ],
  },

  // ── Out for delivery ──
  {
    id: "KMP-4310",
    buyerId: "u1",
    vendorId: "v3",
    items: [{ product: products[10], quantity: 3 }],
    subtotal: 7500,
    platformFee: 50,
    deliveryFee: 500,
    discountAmount: 0,
    total: 8050,
    status: "out_for_delivery",
    deliveryMethod: "delivery",
    deliveryAddress: "Room 12, Block B, RUGIPO Hostel",
    paymentMethod: "cod",
    paymentStatus: "pending",
    createdAt: "2025-01-15T12:00:00Z",
    updatedAt: "2025-01-15T12:30:00Z",
    estimatedDelivery: "2025-01-15",
    timeline: [
      { status: "placed", timestamp: "2025-01-15T12:00:00Z", message: "Order placed successfully" },
      { status: "confirmed", timestamp: "2025-01-15T12:05:00Z", message: "Vendor confirmed your order" },
      { status: "preparing", timestamp: "2025-01-15T12:10:00Z", message: "Items are being prepared" },
      { status: "ready", timestamp: "2025-01-15T12:20:00Z", message: "Order is on its way to you" },
      { status: "out_for_delivery", timestamp: "2025-01-15T12:30:00Z", message: "Rider is heading to your location" },
    ],
  },

  // ── Another delivered ──
  {
    id: "KMP-3920",
    buyerId: "u1",
    vendorId: "v2",
    items: [
      { product: products[7], quantity: 1 },
      { product: products[19], quantity: 2 },
    ],
    subtotal: 22500,
    platformFee: 563,
    deliveryFee: 0,
    discountAmount: 2250,
    total: 20813,
    status: "delivered",
    deliveryMethod: "campus_pickup",
    deliveryAddress: "Student Union Building, RUGIPO",
    paymentMethod: "paystack",
    paymentStatus: "paid",
    createdAt: "2025-01-12T14:00:00Z",
    updatedAt: "2025-01-13T10:00:00Z",
    estimatedDelivery: "2025-01-13",
    deliveredAt: "2025-01-13T10:00:00Z",
    timeline: [
      { status: "placed", timestamp: "2025-01-12T14:00:00Z", message: "Order placed successfully" },
      { status: "confirmed", timestamp: "2025-01-12T14:05:00Z", message: "Vendor confirmed your order" },
      { status: "preparing", timestamp: "2025-01-12T14:10:00Z", message: "Items are being prepared" },
      { status: "ready", timestamp: "2025-01-13T09:30:00Z", message: "Ready for pickup at Student Union" },
      { status: "delivered", timestamp: "2025-01-13T10:00:00Z", message: "Order completed" },
    ],
  },

  // ── Cancelled order ──
  {
    id: "KMP-4055",
    buyerId: "u1",
    vendorId: "v1",
    items: [{ product: products[1], quantity: 1 }],
    subtotal: 185000,
    platformFee: 2000,
    deliveryFee: 500,
    discountAmount: 0,
    total: 187500,
    status: "cancelled",
    deliveryMethod: "delivery",
    deliveryAddress: "Room 12, Block B, RUGIPO Hostel",
    paymentMethod: "paystack",
    paymentStatus: "refunded",
    createdAt: "2025-01-13T08:00:00Z",
    updatedAt: "2025-01-13T09:00:00Z",
    cancelledAt: "2025-01-13T09:00:00Z",
    cancelReason: "Item no longer available",
    timeline: [
      { status: "placed", timestamp: "2025-01-13T08:00:00Z", message: "Order placed successfully" },
      { status: "cancelled", timestamp: "2025-01-13T09:00:00Z", message: "Order cancelled — Item no longer available. Refund processed." },
    ],
  },

  // ── Another cancelled ──
  {
    id: "KMP-4180",
    buyerId: "u1",
    vendorId: "v3",
    items: [{ product: products[10], quantity: 5 }],
    subtotal: 12500,
    platformFee: 313,
    deliveryFee: 500,
    discountAmount: 0,
    total: 13313,
    status: "cancelled",
    deliveryMethod: "delivery",
    deliveryAddress: "Room 5, Block A, RUGIPO Hostel",
    paymentMethod: "wallet",
    paymentStatus: "refunded",
    createdAt: "2025-01-14T16:00:00Z",
    updatedAt: "2025-01-14T16:30:00Z",
    cancelledAt: "2025-01-14T16:30:00Z",
    cancelReason: "Changed my mind",
    timeline: [
      { status: "placed", timestamp: "2025-01-14T16:00:00Z", message: "Order placed successfully" },
      { status: "cancelled", timestamp: "2025-01-14T16:30:00Z", message: "Order cancelled by buyer. Refund processed." },
    ],
  },
];

export function getOrdersByUser(userId: string): Order[] {
  return mockOrders
    .filter((o) => o.buyerId === userId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export function getOrderById(orderId: string): Order | undefined {
  return mockOrders.find((o) => o.id === orderId);
}

export function getActiveOrders(userId: string): Order[] {
  return getOrdersByUser(userId).filter(
    (o) =>
      o.status !== "delivered" && o.status !== "cancelled"
  );
}

export function getCompletedOrders(userId: string): Order[] {
  return getOrdersByUser(userId).filter((o) => o.status === "delivered");
}

export function getCancelledOrders(userId: string): Order[] {
  return getOrdersByUser(userId).filter((o) => o.status === "cancelled");
}
