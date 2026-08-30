"use client";

import Link from "next/link";
import { BadgeCheck, Clock, MapPin, Wrench } from "lucide-react";
import type { MarketplaceProvider, MarketplaceService } from "@/types/service-marketplace";
import {
  getServicePriceDisplay,
  getServiceDurationLabel,
  getServiceLocationLabel,
} from "@/services/service-marketplace";
import { cn } from "@/lib/utils";
import { ServiceRatingStars } from "./ServiceRatingStars";
import { ServiceFavoriteButton } from "./ServiceFavoriteButton";

interface ServiceCardProps {
  service: MarketplaceService;
  provider?: MarketplaceProvider;
  className?: string;
}

/**
 * Service listing card. Shows backend-authoritative pricing (never a computed
 * final price), the provider name + verification, rating, location, and a
 * clear "View service" CTA. Favouriting routes guests through login first.
 */
export function ServiceCard({ service, provider, className }: ServiceCardProps) {
  const price = getServicePriceDisplay(service.pricingModel, service.price, service.priceMax);

  return (
    <article
      className={cn(
        "bg-white rounded-[10px] border border-neutral-200 overflow-hidden group flex flex-col",
        "hover:border-neutral-300 hover:shadow-[0_1px_2px_rgba(16,24,40,0.06)] transition-all duration-200",
        className
      )}
    >
      <Link
        href={`/services/${service.id}`}
        className="relative aspect-[4/3] bg-neutral-50 overflow-hidden block flex-shrink-0"
      >
        {service.imageUrl ? (
          <img
            src={service.imageUrl}
            alt={service.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400/40">
            <Wrench className="w-10 h-10" aria-hidden />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <ServiceFavoriteButton serviceId={service.id} />
        </div>
      </Link>

      <div className="p-3 flex flex-col flex-1">
        {provider && (
          <div className="flex items-center gap-1 mb-1">
            <Link
              href={`/services/providers/${provider.id}`}
              className="text-[11px] text-neutral-500 truncate hover:text-primary-600"
              onClick={(e) => e.stopPropagation()}
            >
              {provider.displayName}
            </Link>
            {provider.verified && (
              <BadgeCheck className="w-3.5 h-3.5 text-primary-600 shrink-0" aria-label="Verified provider" />
            )}
          </div>
        )}

        <Link
          href={`/services/${service.id}`}
          className="text-sm font-semibold text-neutral-900 line-clamp-2 leading-snug mb-1 group-hover:text-primary-600 transition-colors"
        >
          {service.name}
        </Link>

        <div className="flex items-center gap-2 mb-2">
          <ServiceRatingStars rating={provider?.rating} count={provider?.ratingCount} />
        </div>

        <div className="mt-auto">
          <div className="flex items-baseline gap-2">
            <span className="text-[15px] font-bold text-primary-900 tracking-tight">
              {price.label}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1.5 text-[11px] text-neutral-500">
            <span className="inline-flex items-center gap-0.5">
              <Clock className="w-3 h-3 text-neutral-400" aria-hidden />
              {getServiceDurationLabel(service.durationMinutes)}
            </span>
            <span className="inline-flex items-center gap-0.5 min-w-0">
              <MapPin className="w-3 h-3 text-neutral-400 shrink-0" aria-hidden />
              <span className="truncate">{getServiceLocationLabel(service.locationType)}</span>
            </span>
          </div>

          {provider && (
            <div className="flex items-center gap-1.5 mt-2">
              <span className="inline-flex items-center gap-0.5 text-[11px] text-neutral-600 font-medium">
                <MapPin className="w-3 h-3 text-neutral-400" aria-hidden />
                {provider.primaryCampusId.toUpperCase()}
              </span>
              <span className="text-[11px] text-neutral-400">·</span>
              <span className="text-[11px] text-neutral-500">
                {provider.totalBookings} bookings
              </span>
            </div>
          )}

          <div className="mt-2.5 border-t border-neutral-100 pt-2.5">
            <Link
              href={`/services/${service.id}`}
              className="inline-flex items-center justify-center w-full h-8 rounded-md bg-primary-600 text-white text-xs font-semibold hover:bg-[#1258C7] transition-colors"
            >
              View service
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}