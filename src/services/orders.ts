import { Order } from "@/types";
import {
  mockOrders,
  getOrderById as _getOrderById,
  getOrdersByUser as _getOrdersByUser,
} from "@/data/orders";

export function getOrders(): Order[] {
  return mockOrders;
}

export function getOrderById(id: string): Order | undefined {
  return _getOrderById(id);
}

export function getOrdersByUser(userId: string): Order[] {
  return _getOrdersByUser(userId);
}
