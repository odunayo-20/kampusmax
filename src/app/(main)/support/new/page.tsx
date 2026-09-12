"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import {
  NewSupportRequestForm,
  RelatedOption,
} from "@/components/support/NewSupportRequestForm";
import { SUPPORT_CATEGORY_OPTIONS } from "@/config/support";
import { useAuth } from "@/lib/auth-context";
import { getOrdersByUser } from "@/services/orders";
import { getWallet, getWalletTransactions } from "@/services/wallet";
import type { SupportTicketCategory } from "@/types/admin";

/**
 * New support request. `order`, `transaction`, `category` and `subject` may
 * come from deep links ("Need help with this order?"). Ownership is verified
 * here so only the caller's resources are offered; the store re-verifies
 * anything attached before a ticket exists.
 */
export default function NewSupportRequestPage() {
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const { relatedOptions, prefill, initialCategory, initialSubject } =
    useMemo(() => {
      if (!user) {
        return {
          relatedOptions: [] as RelatedOption[],
          prefill: null as {
            kind: "order" | "transaction";
            id: string;
          } | null,
          initialCategory: null as SupportTicketCategory | null,
          initialSubject: null as string | null,
        };
      }

      const orderId = searchParams.get("order");
      const transactionId = searchParams.get("transaction");

      const orders = getOrdersByUser(user.id).map((order) => ({
        kind: "order" as const,
        id: order.id,
        label: `Order ${order.id}`,
      }));

      const wallet = getWallet(user.id);
      const transactions = wallet
        ? getWalletTransactions(wallet.id).map((tx) => ({
            kind: "transaction" as const,
            id: tx.id,
            label: `${tx.description} — ${tx.reference ?? tx.id}`,
          }))
        : ([] as RelatedOption[]);

      const orderOwned = orderId
        ? orders.some((o) => o.id === orderId)
        : false;
      const txOwned = transactionId
        ? transactions.some((t) => t.id === transactionId)
        : false;

      const rawCategory = searchParams.get("category");
      const category = (
        SUPPORT_CATEGORY_OPTIONS.some(
          (c) => c.value === rawCategory
        ) && rawCategory
          ? rawCategory
          : null
      ) as SupportTicketCategory | null;

      return {
        relatedOptions: [...orders, ...transactions],
        prefill: orderOwned
          ? { kind: "order" as const, id: orderId! }
          : txOwned
            ? { kind: "transaction" as const, id: transactionId! }
            : null,
        initialCategory: category,
        initialSubject: searchParams.get("subject"),
      };
    }, [user, searchParams]);

  return (
    <PageContainer className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Support", href: "/support" },
          { label: "New request" },
        ]}
      />

      <div className="flex items-center gap-3">
        <Link
          href="/support"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-kampmax-muted"
          aria-label="Back to support"
        >
          <ArrowLeft className="h-5 w-5 text-kampmax-text" />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-kampmax-text">
            Open a Support Request
          </h1>
          <p className="text-xs text-kampmax-text-secondary">
            Describe the problem and we&apos;ll follow up on the thread
          </p>
        </div>
      </div>

      {!user ? (
        <div className="rounded-xl border border-kampmax-border bg-white p-10 text-center text-sm text-kampmax-text-secondary">
          Sign in to open a support request.
        </div>
      ) : (
        <NewSupportRequestForm
          user={user}
          relatedOptions={relatedOptions}
          initialCategory={initialCategory}
          initialSubject={initialSubject}
          prefill={prefill}
        />
      )}
    </PageContainer>
  );
}