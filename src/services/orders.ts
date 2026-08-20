import { Order } from "@/types";
import {
  mockOrders,
  getOrderById as _getOrderById,
  getOrdersByUser as _getOrdersByUser,
  getActiveOrders as _getActiveOrders,
  getCompletedOrders as _getCompletedOrders,
  getCancelledOrders as _getCancelledOrders,
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

export function getActiveOrders(userId: string): Order[] {
  return _getActiveOrders(userId);
}

export function getCompletedOrders(userId: string): Order[] {
  return _getCompletedOrders(userId);
}

export function getCancelledOrders(userId: string): Order[] {
  return _getCancelledOrders(userId);
}
