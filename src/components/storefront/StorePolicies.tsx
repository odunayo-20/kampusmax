"use client";

import { FileText } from "lucide-react";
import type { Storefront } from "@/types/storefront";
import { StoreEmptyState } from "./StoreEmptyState";

interface StorePoliciesProps {
  store: Storefront;
}

const POLICY_ICON: Record<string, string> = {
  returns: "↩",
  refunds: "₹",
  cancellation: "✕",
  delivery: "🚚",
  pickup: "📦",
};

/** Store policies (only policies the vendor configured are shown). */
export function StorePolicies({ store }: StorePoliciesProps) {
  const enabled = store.policies.filter((p) => p.enabled);

  if (enabled.length === 0) {
    return (
      <StoreEmptyState
        icon={<FileText />}
        title="Store policies have not been provided"
        description="This store hasn't configured its policies yet."
      />
    );
  }

  return (
    <div className="bg-white rounded-xl border border-kampmax-border">
      <div className="px-5 pt-5">
        <h2 className="text-base font-bold text-kampmax-text">Store policies</h2>
      </div>
      <div className="p-5 space-y-3">
        {enabled.map((policy) => (
          <details
            key={policy.type}
            className="group rounded-lg border border-kampmax-border"
            open
          >
            <summary className="cursor-pointer px-4 py-3 flex items-center justify-between text-sm font-semibold text-kampmax-text list-none">
              <span className="flex items-center gap-2">
                <span aria-hidden>{POLICY_ICON[policy.type] || "•"}</span>
                {policy.title}
              </span>
              <span className="text-kampmax-text-muted text-xs group-open:rotate-180 transition-transform">
                ⌄
              </span>
            </summary>
            <p className="px-4 pb-4 text-sm text-kampmax-text-secondary leading-relaxed">
              {policy.body}
            </p>
          </details>
        ))}
      </div>
    </div>
  );
}
