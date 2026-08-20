import { Order } from "@/types";
import { products } from "./products";

export const mockOrders: Order[] = [
  {
    id: "KMP-3847",
    buyerId: "u1",
    vendorId: "v1",
    items: [
      { product: products[2], quantity: 1 },
      { product: products[9], quantity: 1 },
    ],
    total: 21500,
    status: "delivered",
    deliveryMethod: "campus_pickup",
    deliveryAddress: "Computer Lab Area, RUGIPO",
    paymentMethod: "paystack",
    paymentStatus: "paid",
    createdAt: "2025-01-10",
    estimatedDelivery: "2025-01-11",
  },
  {
    id: "KMP-4102",
    buyerId: "u1",
    vendorId: "v2",
    items: [{ product: products[4], quantity: 1 }],
    total: 35000,
    status: "confirmed",
    deliveryMethod: "meetup",
    deliveryAddress: "Student Union Building, RUGIPO",
    paymentMethod: "paystack",
    paymentStatus: "paid",
    createdAt: "2025-01-14",
    estimatedDelivery: "2025-01-15",
  },
];

export function getOrdersByUser(userId: string): Order[] {
  return mockOrders.filter((o) => o.buyerId === userId);
}

export function getOrderById(orderId: string): Order | undefined {
  return mockOrders.find((o) => o.id === orderId);
}
