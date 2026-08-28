"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { Storefront } from "@/types/storefront";
import { getStoreNavigationSections } from "@/services/storefront";

interface StoreNavigationProps {
  store: Storefront;
  activeSection: string | null;
  onNavigate: (id: string) => void;
}

const SECTION_IDS = ["products", "reviews", "about", "delivery", "policies"] as const;

/**
 * Storefront section navigation (tabs). Only shows sections the vendor
 * actually supports — never empty placeholders. Scrolls to the target section
 * and highlights the active one (works with the page-level scroll-spy).
 */
export function StoreNavigation({ store, activeSection, onNavigate }: StoreNavigationProps) {
  const sections = getStoreNavigationSections(store);
  const ref = useRef<HTMLDivElement>(null);

  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    const headerOffset = 90;
    const y = el.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top: y, behavior: "smooth" });
    onNavigate(id);
  }

  const tabs: { id: string; label: string; enabled: boolean }[] = [
    { id: "products", label: "Products", enabled: sections.products },
    { id: "services", label: "Services", enabled: sections.services },
    { id: "reviews", label: "Reviews", enabled: sections.reviews },
    { id: "about", label: "About", enabled: sections.about },
    { id: "delivery", label: "Delivery", enabled: sections.delivery },
    { id: "policies", label: "Policies", enabled: sections.policies },
    { id: "contact", label: "Contact", enabled: sections.contact },
  ].filter((t) => t.enabled);

  return (
    <div
      ref={ref}
      className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-kampmax-border"
      role="tablist"
      aria-label="Store sections"
    >
      <div className="max-w-[1280px] mx-auto px-4 overflow-x-auto">
        <div className="flex gap-1 whitespace-nowrap">
          {tabs.map((tab) => {
            const active = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => scrollTo(tab.id)}
                // additional focus ring for keyboard users
                className={cn(
                  "px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors rounded-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2",
                  active
                    ? "border-kampmax-blue text-kampmax-blue"
                    : "border-transparent text-kampmax-text-secondary hover:text-kampmax-text"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
