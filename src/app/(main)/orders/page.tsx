"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { OrderCard } from "@/components/shared";
import { PageContainer, SectionHeader } from "@/components/layout";
import { getOrdersByUser } from "@/services/orders";
import { getCurrentUser } from "@/services/users";

export default function OrdersPage() {
  const router = useRouter();
  const orders = getOrdersByUser(getCurrentUser().id);

  return (
    <PageContainer>
      <SectionHeader
        title="My Orders"
        subtitle={orders.length > 0 ? `${orders.length} order${orders.length === 1 ? "" : "s"}` : undefined}
        className="mb-4"
      />

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">No orders yet</p>
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
    </PageContainer>
  );
}
