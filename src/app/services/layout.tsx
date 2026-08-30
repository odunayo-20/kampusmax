import type { Metadata } from "next";
import { ServiceMarketplaceHeader } from "@/components/service-marketplace/ServiceMarketplaceHeader";
import { ServiceMarketplaceFooter } from "@/components/service-marketplace/ServiceMarketplaceFooter";

export const metadata: Metadata = {
  title: "Services | Kampmax",
  description:
    "Browse trusted services from verified providers around campus — repairs, beauty, tutoring, printing, fitness and more. Book or request a quote with one tap.",
};

/**
 * Public, guest-accessible layout for the customer-facing service marketplace.
 * Deliberately separate from the (main) group so anyone can browse without
 * signing up or logging in.
 */
export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-kampmax-bg flex flex-col">
      <ServiceMarketplaceHeader />
      <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 py-4">
        {children}
      </main>
      <ServiceMarketplaceFooter />
    </div>
  );
}