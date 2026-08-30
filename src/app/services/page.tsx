import type { Metadata } from "next";
import { Suspense } from "react";
import { ServicesBrowseView } from "@/components/service-marketplace/ServicesBrowseView";
import { ServiceCardSkeleton } from "@/components/service-marketplace/ServiceSkeletons";
import { getSiteBaseUrl } from "@/lib/utils";

const baseUrl = getSiteBaseUrl();

export const metadata: Metadata = {
  title: "Find trusted services around you | Kampmax",
  description:
    "Browse trusted services from verified providers on your campus — repairs, beauty, tutoring, printing, fitness and more. Filter by campus, price and rating, then book or request a quote.",
  alternates: { canonical: `${baseUrl}/services` },
  openGraph: {
    title: "Find trusted services around you | Kampmax",
    description:
      "Repairs, beauty, tutoring, printing and more from verified providers on your campus.",
    url: `${baseUrl}/services`,
    type: "website",
    siteName: "Kampmax",
  },
};

export default function ServicesPage() {
  return (
    <Suspense
      fallback={
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <ServiceCardSkeleton key={i} />
          ))}
        </div>
      }
    >
      <ServicesBrowseView />
    </Suspense>
  );
}