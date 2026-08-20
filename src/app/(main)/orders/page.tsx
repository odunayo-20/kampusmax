"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { OrderCard } from "@/components/shared";
import { getOrdersByUser } from "@/services/orders";
import { getCurrentUser } from "@/services/users";

export default function OrdersPage() {
  const router = useRouter();
  const orders = getOrdersByUser(getCurrentUser().id);

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-kampmax-muted transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold text-kampmax-text">My Orders</h1>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📦</p>
          <p className="text-sm font-medium text-kampmax-text">No orders yet</p>
          <p className="text-xs text-kampmax-text-secondary">
            Your order history will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} onClick={() => router.push(`/orders/${order.id}`)}>
              <OrderCard order={order} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
