"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MapPin, Users, MessageCircle, Flag } from "lucide-react";
import { Storefront } from "@/types/storefront";
import { useAuth } from "@/lib/auth-context";
import { Avatar } from "@/components/atoms/Avatar";
import { StarRatingDisplay } from "@/components/reviews/StarRating";
import { StoreVerificationBadge, StoreAvailabilityBadge } from "./StoreBadges";
import { FollowButton } from "./FollowButton";
import { ShareStoreButton } from "./ShareStoreButton";
import { ContactStoreModal } from "./ContactStoreModal";
import { ReportStoreModal } from "./ReportStoreModal";

interface StoreHeaderProps {
  store: Storefront;
}

/** Cover + vendor identity + primary customer actions. */
export function StoreHeader({ store }: StoreHeaderProps) {
  const { status, user } = useAuth();
  const router = useRouter();
  const [contactOpen, setContactOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const hasNewRating = store.rating > 0;

  function requireAuth(action: () => void) {
    if (status !== "authenticated") {
      router.push(`/login?returnTo=${encodeURIComponent(`/store/${store.slug}`)}`);
      return;
    }
    action();
  }

  return (
    <div className="bg-white rounded-2xl border border-kampmax-border overflow-hidden">
      {/* Cover */}
      <div className="relative h-36 sm:h-52 lg:h-60 bg-gradient-to-r from-kampmax-navy via-kampmax-blue to-kampmax-blue-light">
        {store.coverImage ? (
          <Image
            src={store.coverImage}
            alt={`${store.storeName} cover`}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-kampmax-navy via-kampmax-blue to-kampmax-blue-light" />
        )}
        {store.availabilityStatus !== "active" && (
          <div className="absolute top-3 right-3">
            <StoreAvailabilityBadge status={store.availabilityStatus} />
          </div>
        )}
      </div>

      <div className="px-4 sm:px-6 pb-5 -mt-10">
        <div className="flex flex-wrap items-end gap-3">
          {/* Logo */}
          {store.logo ? (
            <Image
              src={store.logo}
              alt={`${store.storeName} logo`}
              width={80}
              height={80}
              className="h-20 w-20 rounded-2xl ring-4 ring-white object-cover bg-white"
            />
          ) : (
            <Avatar
              name={store.storeName}
              size="lg"
              className="h-20 w-20 rounded-2xl text-2xl ring-4 ring-white"
            />
          )}

          <div className="flex-1 min-w-0 pt-8 sm:pt-6">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-kampmax-text truncate">
                {store.storeName}
              </h1>
              {store.availabilityStatus === "active" && (
                <StoreVerificationBadge status={store.verificationStatus} />
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-sm text-kampmax-text-secondary">
              {hasNewRating ? (
                <span className="flex items-center gap-1.5">
                  <StarRatingDisplay rating={store.rating} size="sm" />
                  <span className="text-xs text-kampmax-text-secondary">
                    {store.reviewCount} review{store.reviewCount !== 1 ? "s" : ""}
                  </span>
                </span>
              ) : (
                <span className="text-xs font-medium text-kampmax-text">New on Kampmax</span>
              )}

              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {store.campusName}
              </span>

              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {store.attestation.followers.toLocaleString()}{" "}
                {store.attestation.followers === 1 ? "follower" : "followers"}
              </span>
            </div>

            <p className="text-sm text-kampmax-text-secondary mt-2 line-clamp-2">
              {store.tagline || store.description}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <FollowButton vendorId={store.vendorId} storeSlug={store.slug} />
          <ShareStoreButton storeSlug={store.slug} storeName={store.storeName} />
          {store.contactSupported && (
            <button
              type="button"
              onClick={() => requireAuth(() => setContactOpen(true))}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold bg-kampmax-muted text-kampmax-text hover:bg-kampmax-muted/70 border border-kampmax-border"
            >
              <MessageCircle className="h-4 w-4" />
              Contact
            </button>
          )}
          <button
            type="button"
            onClick={() => requireAuth(() => setReportOpen(true))}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium text-kampmax-text-muted hover:text-kampmax-error hover:bg-kampmax-muted"
          >
            <Flag className="h-3.5 w-3.5" />
            Report Store
          </button>
        </div>
      </div>

      {contactOpen && (
        <ContactStoreModal
          isOpen
          onClose={() => setContactOpen(false)}
          vendorId={store.vendorId}
          storeName={store.storeName}
        />
      )}
      <ReportStoreModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        vendorId={store.vendorId}
        userId={user?.id || ""}
        storeName={store.storeName}
      />
    </div>
  );
}
