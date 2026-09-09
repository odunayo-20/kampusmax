"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Boxes,
  Building2,
  Clock,
  ExternalLink,
  Eye,
  FileWarning,
  Image as ImageIcon,
  MapPin,
  Package,
  Save,
  ShieldAlert,
  ShoppingCart,
  Star,
  Store,
  Tag,
} from "lucide-react";
import { cn, formatDate, formatDateTime, formatNaira, formatNairaCompact, timeAgo } from "@/lib/utils";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ErrorState } from "@/components/admin/ErrorState";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { StatCard } from "@/components/admin/StatCard";
import { useAdminMarketplaceListing } from "@/hooks/admin/use-admin-marketplace";
import type { MarketplaceActivityEvent, MarketplaceListingDetail, MarketplaceListingRow, MarketplaceListingVendor } from "@/types/admin";
import {
  ListingStatusBadge,
  ListingThumb,
  PublicationBadge,
  VisibilityBadge,
} from "@/components/admin/marketplace/MarketplaceBadges";
import {
  CONDITION_LABELS,
  VISIBILITY_LABELS,
} from "@/components/admin/marketplace/marketplace-meta";

type DetailTab = "overview" | "media" | "moderation" | "activity";

const TABS: { key: DetailTab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "media", label: "Media" },
  { key: "moderation", label: "Moderation" },
  { key: "activity", label: "Activity" },
];

export default function AdminMarketplaceListingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const listingId = typeof params.id === "string" ? params.id : "";

  const [tab, setTab] = useState<DetailTab>("overview");

  const { data: detail, isPending, isError, refetch } = useAdminMarketplaceListing(listingId);

  if (!listingId) {
    return <ListingNotFound />;
  }

  if (isPending) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-72 animate-pulse rounded bg-kampmax-muted" />
        <LoadingSkeleton variant="cards" rows={6} />
        <div className="h-64 animate-pulse rounded-lg bg-white ring-1 ring-kampmax-border" />
      </div>
    );
  }

  if (isError) {
    return <ErrorState onRetry={() => void refetch()} />;
  }

  if (!detail) {
    return <ListingNotFound />;
  }

  const { listing, vendor } = detail;

  return (
    <>
      <Link
        href="/admin/marketplace"
        className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-kampmax-text-secondary transition-colors hover:text-kampmax-text"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All listings
      </Link>

      <AdminPageHeader
        title={listing.title}
        description={`${listing.categoryName} · ${listing.campusName} · listed ${formatDate(listing.createdAt)}`}
        actions={
          <>
            <ListingStatusBadge status={listing.status} />
            <VisibilityBadge visibility={listing.visibility} />
            <PublicationBadge publication={listing.publishedStatus} />
            <a
              href={`/marketplace/${listing.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-kampmax-border bg-white px-3 text-sm font-medium text-kampmax-text transition-colors hover:bg-kampmax-muted/60"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View public listing
            </a>
          </>
        }
      />

      {/* ---------- Overview stats ---------- */}
      <section aria-label="Listing metrics" className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Price" value={formatNaira(listing.price)} icon={ShoppingCart} tone="blue" hint={listing.originalPrice !== null ? `Was ${formatNairaCompact(listing.originalPrice)}` : "No promo era"} />
        <StatCard
          label="Stock"
          value={listing.stock === null ? "Not tracked" : listing.stock === 0 ? "Out of stock" : `${listing.stock.toLocaleString("en-NG")} units`}
          icon={Package}
          tone={listing.stock === 0 ? "error" : "default"}
          hint={listing.stock !== null ? "Live inventory" : "Stock not recorded"}
        />
        <StatCard label="Views" value={listing.viewCount?.toLocaleString("en-NG") ?? "—"} icon={Eye} tone="blue" hint="Lifetime" />
        <StatCard label="Saves" value={listing.saveCount?.toLocaleString("en-NG") ?? "—"} icon={Save} tone="blue" hint="Lifetime" />
        <StatCard label="Rating" value={listing.rating !== null ? `${listing.rating.toFixed(1)} / 5` : "—"} icon={Star} tone="gold" hint={listing.ratingCount !== null ? `${listing.ratingCount.toLocaleString("en-NG")} ratings` : "No ratings"} />
        <StatCard
          label="Seller"
          value={vendor?.storeName ?? "Unknown"}
          icon={Store}
          tone="success"
          hint={vendor ? `${vendor.productsCount.toLocaleString("en-NG")} listings` : "Vendor record missing"}
        />
      </section>

      {/* ---------- Tabs ---------- */}
      <div
        role="tablist"
        aria-label="Listing profile sections"
        className="mt-5 flex gap-1 overflow-x-auto border-b border-kampmax-border no-scrollbar"
      >
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "-mb-px inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2 text-[13px] font-medium transition-colors",
              tab === t.key
                ? "border-kampmax-blue text-kampmax-blue"
                : "border-transparent text-kampmax-text-secondary hover:text-kampmax-text"
            )}
          >
            {t.label}
            {t.key === "media" && listing.images.length > 0 && (
              <span className="rounded-full bg-kampmax-muted px-1.5 py-px text-[10px] font-semibold tabular-nums text-kampmax-text-secondary">
                {listing.images.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-4" role="tabpanel">
        {tab === "overview" && (
          <OverviewTab detail={detail} onOpenCampus={(id) => router.push(`/admin/campuses/${id}`)} />
        )}
        {tab === "media" && <MediaTab listing={listing} />}
        {tab === "moderation" && <ModerationTab listing={listing} />}
        {tab === "activity" && <ActivityTab events={detail.activity} />}
      </div>
    </>
  );
}

// ------------------------------------------------------------
// Overview tab
// ------------------------------------------------------------

function OverviewTab({
  detail,
  onOpenCampus,
}: {
  detail: MarketplaceListingDetail;
  onOpenCampus: (campusId: string) => void;
}) {
  const { listing, vendor } = detail;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* Left column */}
      <div className="space-y-4 lg:col-span-2">
        {/* Listing information */}
        <section aria-label="Listing information" className="rounded-lg border border-kampmax-border bg-white">
          <div className="flex items-center justify-between border-b border-kampmax-border px-4 py-3">
            <h2 className="text-sm font-semibold text-kampmax-text">Listing information</h2>
            <span className="font-mono text-xs text-kampmax-text-secondary">{listing.id}</span>
          </div>
          <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row">
            <span className="shrink-0">
              <ListingThumb src={listing.images[0]} alt={listing.title} className="h-20 w-20 rounded-xl" />
            </span>
            <dl className="grid flex-1 grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              <InfoRow icon={Tag} label="Category" value={listing.categoryName} />
              <InfoRow icon={Boxes} label="Condition" value={CONDITION_LABELS[listing.condition] ?? listing.condition} />
              <InfoRow
                icon={Building2}
                label="Campus"
                value={listing.campusName}
                onClick={() => onOpenCampus(listing.campusId)}
              />
              <InfoRow icon={MapPin} label="Location" value={listing.location ?? "—"} />
              <InfoRow label="Listed" value={`${timeAgo(listing.createdAt)} · ${formatDate(listing.createdAt)}`} />
              <InfoRow label="Last updated" value={listing.updatedAt ? `${timeAgo(listing.updatedAt)} · ${formatDate(listing.updatedAt)}` : "—"} />
              <InfoRow label="SKU" value={listing.sku ?? "—"} mono />
              <InfoRow label="Listing ID" value={listing.id} mono />
            </dl>
          </div>
          <div className="border-t border-kampmax-border px-4 py-3">
            <dt className="text-xs font-medium text-kampmax-text-secondary">Description</dt>
            <dd className="mt-1 text-sm leading-relaxed text-kampmax-text">
              {listing.description || "—"}
            </dd>
            {listing.tags.length > 0 && (
              <ul className="mt-2.5 flex flex-wrap gap-1.5">
                {listing.tags.map((tag) => (
                  <li key={tag} className="rounded-full bg-kampmax-muted px-2 py-0.5 text-[11px] font-medium text-kampmax-text-secondary">
                    #{tag}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Publication state */}
        <section aria-label="Publication state" className="rounded-lg border border-kampmax-border bg-white">
          <div className="flex items-center justify-between border-b border-kampmax-border px-4 py-3">
            <h2 className="text-sm font-semibold text-kampmax-text">Publication state</h2>
            <PublicationBadge publication={listing.publishedStatus} />
          </div>
          <div className="space-y-3 px-4 py-3">
            <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              <InfoRow label="Trading status" value={listing.status} />
              <InfoRow label="Visibility" value={VISIBILITY_LABELS[listing.visibility]} />
              <InfoRow
                label="Publication record"
                value={listing.publishedStatus ?? "Not recorded on product"}
              />
              <InfoRow label="Archived at" value={listing.archivedAt ? formatDateTime(listing.archivedAt) : "—"} />
            </dl>
            <p className="text-[11px] leading-relaxed text-kampmax-text-secondary">
              Visibility is derived from the trading status, publication record and the seller's
              storefront availability - it is never fabricated. Listings without an explicit
              publication record read as <span className="font-medium text-kampmax-text">“Not recorded on product”</span>.
            </p>
          </div>
        </section>

        {/* Inventory */}
        <section aria-label="Inventory" className="rounded-lg border border-kampmax-border bg-white">
          <div className="border-b border-kampmax-border px-4 py-3">
            <h2 className="text-sm font-semibold text-kampmax-text">Inventory</h2>
          </div>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 px-4 py-4 sm:grid-cols-2">
            <InfoRow
              label="Stock"
              value={listing.stock === null ? "Not tracked" : listing.stock === 0 ? "Out of stock" : `${listing.stock.toLocaleString("en-NG")} units`}
            />
            <InfoRow label="Variants" value={listing.hasVariants ? "Stock-keeping variants configured" : "No variants"} />
          </dl>
        </section>
      </div>

      {/* Right column */}
      <div className="space-y-4">
        {/* Seller */}
        <SellerCard vendor={vendor} />

        {/* Pricing */}
        <section aria-label="Pricing" className="rounded-lg border border-kampmax-border bg-white">
          <div className="border-b border-kampmax-border px-4 py-3">
            <h2 className="text-sm font-semibold text-kampmax-text">Pricing</h2>
          </div>
          <dl className="divide-y divide-kampmax-border/70 px-4 py-1">
            <MoneyRow label="Sale price" value={formatNaira(listing.price)} />
            <MoneyRow
              label="Original price"
              value={listing.originalPrice !== null ? formatNaira(listing.originalPrice) : "—"}
              muted
            />
            <MoneyRow
              label="Discount"
              value={
                listing.originalPrice !== null && listing.originalPrice > listing.price
                  ? `${formatNairaCompact(listing.originalPrice - listing.price)} off`
                  : "No discount"
              }
            />
          </dl>
          <p className="border-t border-kampmax-border px-4 py-2 text-[11px] text-kampmax-text-secondary">
            Internal vendor cost and payout data is never shown in this console.
          </p>
        </section>

        {/* Engagement */}
        <section aria-label="Engagement" className="rounded-lg border border-kampmax-border bg-white">
          <div className="border-b border-kampmax-border px-4 py-3">
            <h2 className="text-sm font-semibold text-kampmax-text">Engagement</h2>
          </div>
          <dl className="divide-y divide-kampmax-border/70 px-4 py-1">
            <MoneyRow label="Views" value={listing.viewCount?.toLocaleString("en-NG") ?? "—"} />
            <MoneyRow label="Saves" value={listing.saveCount?.toLocaleString("en-NG") ?? "—"} />
            <MoneyRow
              label="Rating"
              value={listing.rating !== null ? `${listing.rating.toFixed(1)} / 5 (${listing.ratingCount ?? 0})` : "—"}
            />
          </dl>
        </section>
      </div>
    </div>
  );
}

function SellerCard({ vendor }: { vendor: MarketplaceListingVendor | null }) {
  if (!vendor) {
    return (
      <section aria-label="Seller" className="rounded-lg border border-dashed border-kampmax-border bg-white px-4 py-6 text-center">
        <Store className="mx-auto h-6 w-6 text-kampmax-text-secondary/50" />
        <p className="mt-2 text-sm font-medium text-kampmax-text">Seller record missing</p>
      </section>
    );
  }

  return (
    <section aria-label="Seller" className="rounded-lg border border-kampmax-border bg-white">
      <div className="flex items-center justify-between border-b border-kampmax-border px-4 py-3">
        <h2 className="text-sm font-semibold text-kampmax-text">Seller</h2>
        {vendor.verified && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-kampmax-success">
            <BadgeCheck className="h-3.5 w-3.5" />
            Verified
          </span>
        )}
      </div>
      <div className="space-y-2.5 px-4 py-3.5">
        <p className="font-medium text-kampmax-text">
          {vendor.storeName}
          <span className="ml-1.5 font-mono text-[11px] font-normal text-kampmax-text-secondary">
            {vendor.id}
          </span>
        </p>
        <p className="text-xs leading-relaxed text-kampmax-text-secondary">“{vendor.description}”</p>

        <dl className="grid grid-cols-1 gap-x-5 gap-y-2 border-t border-kampmax-border/70 pt-2.5 text-xs">
          <InfoRow label="Verification" value={vendor.verification} />
          <InfoRow label="Storefront" value={vendor.storefrontAvailability ?? "No storefront profile"} />
          <InfoRow label="Listings" value={vendor.productsCount.toLocaleString("en-NG")} />
          <InfoRow label="Rating" value={`${vendor.rating.toFixed(1)} / 5`} />
          <InfoRow label="Last activity" value={vendor.lastActiveAt ? timeAgo(vendor.lastActiveAt) : "—"} />
        </dl>

        <Link
          href={`/admin/vendors/${vendor.id}`}
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-kampmax-border bg-white px-3 text-sm font-medium text-kampmax-text transition-colors hover:bg-kampmax-muted/60"
        >
          <Store className="h-3.5 w-3.5" />
          Open vendor profile
        </Link>
      </div>
    </section>
  );
}

// ------------------------------------------------------------
// Media tab
// ------------------------------------------------------------

function MediaTab({ listing }: { listing: MarketplaceListingRow }) {
  if (listing.images.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-kampmax-border bg-white px-4 py-10 text-center">
        <ImageIcon className="mx-auto h-6 w-6 text-kampmax-text-secondary/50" />
        <p className="mt-2 text-sm font-medium text-kampmax-text">No images attached</p>
      </div>
    );
  }

  return (
    <section aria-label="Listing media" className="rounded-lg border border-kampmax-border bg-white">
      <div className="border-b border-kampmax-border px-4 py-3">
        <h2 className="text-sm font-semibold text-kampmax-text">
          Media ({listing.images.length})
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-4">
        {listing.images.map((src, i) => (
          <figure key={`${listing.id}-${i}`} className="overflow-hidden rounded-lg border border-kampmax-border">
            <span className="block aspect-square">
              <ListingThumb src={src} alt={`${listing.title} image ${i + 1}`} className="h-full w-full rounded-none" />
            </span>
            <figcaption className="border-t border-kampmax-border px-2.5 py-1.5 text-[11px] text-kampmax-text-secondary">
              Image {i + 1}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

// ------------------------------------------------------------
// Moderation tab
// ------------------------------------------------------------

function ModerationTab({ listing }: { listing: MarketplaceListingRow }) {
  return (
    <div className="space-y-4">
      {/* Read-only notice */}
      <div className="flex items-start gap-2.5 rounded-lg border border-kampmax-info/30 bg-kampmax-info/5 px-4 py-3 text-xs leading-relaxed text-kampmax-text-secondary">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-kampmax-info" />
        <p>
          This listing console is <span className="font-semibold text-kampmax-text">read-only</span>.
          The prototype backend has no moderation endpoints, so publish, hide, restrict and feature
          actions are not available here. See <span className="font-mono">MODULE-39-REPORT.md</span>{" "}
          for the API capabilities these controls will ride on.
        </p>
      </div>

      {/* Moderation state */}
      <section aria-label="Moderation state" className="rounded-lg border border-kampmax-border bg-white">
        <div className="border-b border-kampmax-border px-4 py-3">
          <h2 className="text-sm font-semibold text-kampmax-text">Moderation state</h2>
        </div>
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-kampmax-text">No moderation flags</p>
            <p className="mt-0.5 text-xs text-kampmax-text-secondary">
              No platform flags are recorded against this listing in the real dataset.
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-kampmax-success/10 px-2 py-0.5 text-xs font-medium text-kampmax-success">
            <span className="h-1.5 w-1.5 rounded-full bg-kampmax-success" />
            Clear
          </span>
        </div>
      </section>

      {/* Reports / flags */}
      <section aria-label="Reports and flags" className="rounded-lg border border-kampmax-border bg-white">
        <div className="flex items-center justify-between border-b border-kampmax-border px-4 py-3">
          <h2 className="text-sm font-semibold text-kampmax-text">Reports &amp; flags</h2>
          <span className="inline-flex items-center gap-1 text-xs text-kampmax-text-secondary">
            <FileWarning className="h-3.5 w-3.5" />
            Buyer reports
          </span>
        </div>
        <div className="px-4 py-6 text-center">
          <FileWarning className="mx-auto h-6 w-6 text-kampmax-text-secondary/50" />
          <p className="mt-2 text-sm font-medium text-kampmax-text">No reports available.</p>
          <p className="mx-auto mt-0.5 max-w-sm text-xs text-kampmax-text-secondary">
            Buyers have not reported this listing. Report triage will surface here once the
            reporting API lands.
          </p>
        </div>
      </section>
    </div>
  );
}

// ------------------------------------------------------------
// Activity tab
// ------------------------------------------------------------

function ActivityTab({ events }: { events: MarketplaceActivityEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-kampmax-border bg-white px-4 py-10 text-center">
        <Clock className="mx-auto h-6 w-6 text-kampmax-text-secondary/50" />
        <p className="mt-2 text-sm font-medium text-kampmax-text">No activity recorded</p>
      </div>
    );
  }

  return (
    <section aria-label="Listing activity" className="rounded-lg border border-kampmax-border bg-white px-4 py-4">
      <ol className="relative space-y-4 before:absolute before:bottom-1.5 before:left-[13px] before:top-1.5 before:w-px before:bg-kampmax-border">
        {events.map((event) => (
          <li key={event.id} className="relative flex gap-3 pl-0">
            <span
              aria-hidden
              className={cn(
                "z-10 mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ring-2 ring-white",
                event.kind === "publication"
                  ? "bg-kampmax-info/10 text-kampmax-info"
                  : event.kind === "admin"
                    ? "bg-kampmax-blue/10 text-kampmax-blue"
                    : "bg-kampmax-success/10 text-kampmax-success"
              )}
            >
              <Boxes className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-[13px] font-medium leading-snug text-kampmax-text">{event.message}</p>
              <p className="mt-0.5 text-xs text-kampmax-text-secondary">
                <span title={formatDateTime(event.at)}>{timeAgo(event.at)}</span>
                {" · "}
                {event.meta}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

// ------------------------------------------------------------
// Shared pieces
// ------------------------------------------------------------

function InfoRow({
  icon: Icon,
  label,
  value,
  mono,
  onClick,
}: {
  icon?: typeof Tag;
  label: string;
  value: string;
  mono?: boolean;
  onClick?: () => void;
}) {
  return (
    <div>
      <dt className="text-xs font-medium text-kampmax-text-secondary">
        <span className="inline-flex items-center gap-1">
          {Icon && <Icon className="h-3 w-3 opacity-60" />}
          {label}
        </span>
      </dt>
      <dd className={cn("mt-0.5 break-all text-sm text-kampmax-text capitalize", mono && "font-mono text-xs normal-case")}>
        {onClick ? (
          <button
            type="button"
            onClick={onClick}
            className="inline-flex items-center gap-1 text-left underline decoration-kampmax-border decoration-dotted underline-offset-2 transition-colors hover:text-kampmax-blue"
          >
            {value}
            <MapPin className="h-3 w-3 opacity-60" />
          </button>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

function MoneyRow({
  label,
  value,
  strong,
  muted,
}: {
  label: string;
  value: string;
  strong?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 text-sm">
      <dt className="text-kampmax-text-secondary">{label}</dt>
      <dd
        className={cn(
          "tabular-nums",
          strong ? "font-semibold text-kampmax-text" : muted ? "text-kampmax-text-secondary" : "font-medium text-kampmax-text"
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function ListingNotFound() {
  return (
    <div className="rounded-lg border border-kampmax-border bg-white p-4">
      <ErrorState
        title="Listing not found"
        message="This listing may have been removed or the link is incorrect."
      />
      <div className="mt-3 text-center">
        <Link
          href="/admin/marketplace"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-kampmax-blue hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to marketplace
        </Link>
      </div>
    </div>
  );
}