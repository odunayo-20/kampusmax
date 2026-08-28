"use client";

import { useEffect, useRef, useState } from "react";
import type { Storefront } from "@/types/storefront";
import { getStoreNavigationSections } from "@/services/storefront";
import { StoreHeader } from "./StoreHeader";
import { StoreNavigation } from "./StoreNavigation";
import { StoreProducts } from "./StoreProducts";
import { StoreReviews } from "./StoreReviews";
import { StoreAbout } from "./StoreAbout";
import { StoreDelivery } from "./StoreDelivery";
import { StorePolicies } from "./StorePolicies";

interface StorefrontViewProps {
  store: Storefront;
}

const SECTION_ORDER = ["products", "services", "reviews", "about", "delivery", "policies", "contact"] as const;

/**
 * Compose the public storefront page. Holds the active section (scroll-spy and
 * navigation highlight) and renders only the sections the vendor supports.
 */
export function StorefrontView({ store }: StorefrontViewProps) {
  const sections = getStoreNavigationSections(store);
  const [activeSection, setActiveSection] = useState<string>("products");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const els = SECTION_ORDER.map((id) => document.getElementById(id)).filter(
      Boolean
    ) as HTMLElement[];
    if (els.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );
    els.forEach((el) => observerRef.current?.observe(el));
    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <div>
      <StoreHeader store={store} />
      <StoreNavigation
        store={store}
        activeSection={activeSection}
        onNavigate={setActiveSection}
      />

      <div className="max-w-[1280px] mx-auto px-4 py-6 space-y-8 mt-2">
        {sections.products && (
          <section id="products" aria-labelledby="products-heading" className="scroll-mt-24">
            <h2 id="products-heading" className="text-lg font-bold text-kampmax-text mb-4">
              Products
            </h2>
            <StoreProducts store={store} />
          </section>
        )}

        {sections.services && (
          <section id="services" aria-labelledby="services-heading" className="scroll-mt-24">
            <h2 id="services-heading" className="text-lg font-bold text-kampmax-text">
              Services
            </h2>
            <p className="text-sm text-kampmax-text-secondary mt-2">
              {store.storeName} also offers services. Service listings are coming soon.
            </p>
          </section>
        )}

        {sections.reviews && (
          <section id="reviews" aria-labelledby="reviews-heading" className="scroll-mt-24">
            <h2 id="reviews-heading" className="text-lg font-bold text-kampmax-text mb-4">
              Customer reviews
            </h2>
            <StoreReviews store={store} />
          </section>
        )}

        {sections.about && (
          <section id="about" aria-labelledby="about-heading" className="scroll-mt-24">
            <StoreAbout store={store} />
          </section>
        )}

        {sections.delivery && (
          <section id="delivery" aria-labelledby="delivery-heading" className="scroll-mt-24">
            <StoreDelivery store={store} />
          </section>
        )}

        {sections.policies && (
          <section id="policies" aria-labelledby="policies-heading" className="scroll-mt-24">
            <StorePolicies store={store} />
          </section>
        )}
      </div>
    </div>
  );
}
