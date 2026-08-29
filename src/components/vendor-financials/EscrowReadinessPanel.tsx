"use client";

import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatNaira } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { EscrowReadiness } from "@/types/vendor-financials";

interface EscrowReadinessPanelProps {
  data: EscrowReadiness;
}

export function EscrowReadinessPanel({ data }: EscrowReadinessPanelProps) {
  const totalPending = data.buckets.reduce((sum, b) => sum + b.total, 0);

  return (
    <section aria-labelledby="escrow-heading" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 id="escrow-heading" className="text-lg font-semibold text-kampmax-text">
          Escrow readiness
        </h2>
        <StatusBadge
          variant={data.frozenTotal > 0 || data.refundPendingTotal > 0 ? "warning" : "success"}
          label={
            `Total in escrow: ${formatNaira(totalPending)}`
          }
          dot={false}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {data.buckets.map((bucket) => (
          <article
            key={bucket.key}
            className="rounded-xl border border-kampmax-border bg-white p-4"
          >
            <div className="flex items-center justify-between">
              <StatusBadge variant={bucket.variant} label={bucket.label} />
              <span className="text-sm font-semibold text-kampmax-text">
                {formatNaira(bucket.total)}
              </span>
            </div>
            <p className="mt-1.5 text-sm text-kampmax-text-secondary">
              {bucket.count} order{bucket.count !== 1 ? "s" : ""}
            </p>
            {bucket.orders.length > 0 && (
              <details className="mt-2">
                <summary className="cursor-pointer text-xs text-kampmax-text-secondary hover:underline">
                  View orders
                </summary>
                <ul className="mt-2 space-y-1.5 border-t border-kampmax-border pt-2">
                  {bucket.orders.map((o) => (
                    <li key={o.id} className="flex items-center justify-between text-xs">
                      <span className="font-mono text-kampmax-text-secondary">{o.id}</span>
                      <span className="font-medium text-kampmax-text">{formatNaira(o.amount)}</span>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </article>
        ))}

        {data.frozenTotal > 0 && (
          <article className="rounded-xl border border-kampmax-error/20 bg-error-50 p-4">
            <div className="flex items-center justify-between">
              <StatusBadge variant="error" label="Frozen (dispute)" />
              <span className="text-sm font-semibold text-kampmax-error">
                {formatNaira(data.frozenTotal)}
              </span>
            </div>
            <p className="mt-1.5 text-sm text-kampmax-text-secondary">
              Funds held until dispute resolution
            </p>
          </article>
        )}

        {data.refundPendingTotal > 0 && (
          <article className="rounded-xl border border-kampmax-warning/20 bg-warning-50 p-4">
            <div className="flex items-center justify-between">
              <StatusBadge variant="warning" label="Refund pending" />
              <span className="text-sm font-semibold text-kampmax-warning">
                {formatNaira(data.refundPendingTotal)}
              </span>
            </div>
            <p className="mt-1.5 text-sm text-kampmax-text-secondary">
              Awaiting refund completion
            </p>
          </article>
        )}
      </div>

      <p className="text-xs text-kampmax-text-secondary">
        Escrow states are derived from order fulfilment. The platform releases funds
        automatically once delivery is confirmed and no disputes remain open.
      </p>
    </section>
  );
}