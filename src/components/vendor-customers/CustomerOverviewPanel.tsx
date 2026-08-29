"use client";

import { Package, Quote } from "lucide-react";
import { StarRating } from "@/components/reviews/StarRating";
import { formatNaira, timeAgo } from "@/lib/utils";
import type { VendorCustomerDetails } from "@/types/vendor-customers";

interface CustomerOverviewPanelProps {
  details: VendorCustomerDetails;
}

export function CustomerOverviewPanel({ details }: CustomerOverviewPanelProps) {
  const { customer, reviews } = details;
  const topProducts = customer.topProducts.slice(0, 5);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-xl border border-kampmax-border bg-white p-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-kampmax-text">
          <Package className="h-4 w-4 text-kampmax-blue" aria-hidden />
          Top products bought from you
        </h2>
        {topProducts.length === 0 ? (
          <p className="mt-3 text-sm text-kampmax-text-secondary">No product history yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {topProducts.map((product) => (
              <li key={product.productId} className="flex items-center justify-between gap-2 rounded-lg bg-kampmax-muted/40 px-3 py-2">
                <span className="truncate text-sm text-kampmax-text">{product.title}</span>
                <span className="shrink-0 text-xs font-semibold text-kampmax-text-secondary">
                  {product.quantity} × bought
                </span>
              </li>
            ))}
          </ul>
        )}
        <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <Fact label="Average order value" value={formatNaira(customer.averageOrderValue)} />
          <Fact label="Reward points" value="—" />
        </dl>
      </section>

      <section className="rounded-xl border border-kampmax-border bg-white p-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-kampmax-text">
          <Quote className="h-4 w-4 text-kampmax-blue" aria-hidden />
          Recent reviews
        </h2>
        {reviews.length === 0 ? (
          <p className="mt-3 text-sm text-kampmax-text-secondary">No reviews from this customer yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {reviews.slice(0, 3).map((review) => (
              <li key={review.id} className="rounded-lg border border-kampmax-border p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-kampmax-text">
                    {review.target === "vendor" ? "Store review" : "Product review"}
                  </span>
                  <span className="text-[10px] text-kampmax-text-secondary">{timeAgo(review.createdAt)}</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <StarRating rating={review.rating} size="sm" />
                  {review.verifiedPurchase && (
                    <span className="text-[10px] font-medium text-kampmax-blue">Verified</span>
                  )}
                </div>
                {review.comment && (
                  <p className="mt-1 line-clamp-2 text-xs text-kampmax-text-secondary">{review.comment}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-kampmax-muted/40 px-3 py-2">
      <dt className="text-[10px] text-kampmax-text-secondary">{label}</dt>
      <dd className="mt-0.5 truncate font-semibold text-kampmax-text">{value}</dd>
    </div>
  );
}