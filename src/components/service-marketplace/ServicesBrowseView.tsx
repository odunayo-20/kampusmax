"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, ShieldCheck, Star, MapPin, Sparkles } from "lucide-react";
import { useApp } from "@/lib/app-context";
import { useDebounce } from "@/hooks/use-debounce";
import { useServiceMarketplace } from "@/hooks/useServiceMarketplace";
import { SearchBar } from "@/components/molecules/SearchBar";
import { ServiceCategoryChips } from "./ServiceCategoryChips";
import { ServiceFilterSidebar } from "./ServiceFilterSidebar";
import { ServiceFilterDrawer } from "./ServiceFilterDrawer";
import { ServiceSortDropdown } from "./ServiceSortDropdown";
import { ServiceCard } from "./ServiceCard";
import { ServiceCardSkeleton } from "./ServiceSkeletons";
import { ServiceEmptyState } from "./ServiceEmptyState";
import { ServicePagination } from "./ServicePagination";
import { serviceSortLabel } from "./constants";

function FilteredSearchField({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
}) {
  const [input, setInput] = useState(value);
  const debouncedInput = useDebounce(input, 400);

  useEffect(() => setInput(value), [value]);

  useEffect(() => {
    if (debouncedInput !== value) onValueChange(debouncedInput);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedInput]);

  return (
    <SearchBar
      placeholder="Search services, e.g. laptop repair, makeup..."
      value={input}
      onChange={setInput}
    />
  );
}

function HeroStats() {
  const { selectedCampus } = useApp();
  const items = [
    { icon: Star, label: "High-rated providers", detail: "Real student reviews" },
    { icon: ShieldCheck, label: "Verified only", detail: "Verification on offer" },
    {
      icon: MapPin,
      label: `${selectedCampus.abbreviation} availability`,
      detail: "Prices shown for your campus",
    },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3 backdrop-blur-sm"
        >
          <span className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
            <item.icon className="h-4.5 w-4.5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{item.label}</p>
            <p className="text-xs text-white/70">{item.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function FacilitiesRow() {
  const facilities = [
    {
      icon: MapPin,
      title: "Live campus availability",
      body: "Only providers that offer services at your campus are shown.",
    },
    {
      icon: ShieldCheck,
      title: "Verified providers",
      body: "Providers go through verification before their services go live.",
    },
    {
      icon: Sparkles,
      title: "Request a quote",
      body: "Get custom pricing for services that don't have a fixed price.",
    },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {facilities.map((f) => (
        <div
          key={f.title}
          className="flex items-start gap-3 bg-white rounded-[10px] border border-neutral-200 p-4"
        >
          <span className="w-10 h-10 rounded-lg bg-primary-50 text-primary-700 flex items-center justify-center shrink-0">
            <f.icon className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h3 className="text-sm font-bold text-neutral-900">{f.title}</h3>
            <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">{f.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function HowItWorks() {
  const steps = [
    { n: "1", title: "Find", body: "Search by keyword, category or campus filter." },
    { n: "2", title: "Choose", body: "Compare prices, ratings and availability." },
    {
      n: "3",
      title: "Book or request",
      body: "Book a fixed-price service or request a custom quote.",
    },
  ];
  return (
    <section className="mt-10">
      <h2 className="text-lg font-bold text-neutral-900 mb-4">How it works</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {steps.map((s) => (
          <div key={s.n} className="flex gap-3 items-start bg-white rounded-[10px] border border-neutral-200 p-4">
            <span className="w-8 h-8 rounded-full bg-primary-600 text-white text-sm font-bold flex items-center justify-center shrink-0">
              {s.n}
            </span>
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">{s.title}</h3>
              <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">{s.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ServicesBrowseView() {
  const {
    filters,
    setFilter,
    setPage,
    clearFilters,
    isLoading,
    services,
    providers,
    resultCount,
    totalPages,
    currentPage,
    categories,
    campusOptions,
    effectiveCampusId,
  } = useServiceMarketplace();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const campusAbbr =
    campusOptions.find((c) => c.id === effectiveCampusId)?.abbreviation ??
    effectiveCampusId.toUpperCase();

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-[#0B3B8F] text-white p-6 sm:p-8">
        <div className="max-w-2xl">
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight">
            Find trusted services around you
          </h1>
          <p className="mt-2 text-sm sm:text-[15px] text-white/85">
            Repairs, beauty, tutoring, printing, fitness and more — from verified
            providers on your campus. No hidden costs.
          </p>
          <div className="mt-5">
            <FilteredSearchField value={filters.q} onValueChange={(v) => setFilter("q", v)} />
          </div>
          <a
            href="#results"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-white hover:text-white/90"
          >
            <Search className="h-4 w-4" aria-hidden />
            Search all services
          </a>
          <HeroStats />
        </div>
      </section>

      {/* Category chips */}
      <section aria-label="Browse services by category">
        <ServiceCategoryChips categories={categories} />
      </section>

      {/* Facilities */}
      <FacilitiesRow />

      {/* How it works */}
      <HowItWorks />

      {/* Results */}
      <section id="results" className="scroll-mt-20 pt-2">
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">
              {isLoading ? "Loading services…" : `${resultCount} service${resultCount === 1 ? "" : "s"}`}
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              {campusAbbr} · Sorted by {serviceSortLabel(filters.sort)}
            </p>
          </div>
          <ServiceSortDropdown value={filters.sort} onChange={(s) => setFilter("sort", s)} />
        </div>

        <div className="flex gap-5 items-start">
          {/* Desktop sidebar */}
          <ServiceFilterSidebar
            filters={filters}
            onFilterChange={setFilter}
            onClear={clearFilters}
            onOpenDrawer={() => setDrawerOpen(true)}
            categories={categories}
            campuses={campusOptions}
          />

          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ServiceCardSkeleton key={i} />
                ))}
              </div>
            ) : services.length === 0 ? (
              <ServiceEmptyState
                hasFilters={Boolean(
                  filters.q || filters.campusId || filters.ratingMin || filters.priceBucket || filters.locationType
                )}
                onClearFilters={clearFilters}
                activeCampusLabel={campusOptions.find((c) => c.id === effectiveCampusId)?.name}
              />
            ) : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {services.map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      provider={providers[service.providerId]}
                    />
                  ))}
                </div>
                <div className="mt-6">
                  <ServicePagination
                    page={currentPage}
                    totalPages={totalPages}
                    onChange={setPage}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Become a provider */}
      <section className="bg-white rounded-2xl border border-neutral-200 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-neutral-900">
            Are you a talented service provider?
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            List your services on Kampmax and reach students on your campus.
          </p>
        </div>
        <Link
          href="/service-provider/onboarding"
          className="inline-flex items-center gap-1.5 shrink-0 px-4 py-2.5 rounded-lg bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-800"
        >
          Become a provider
        </Link>
      </section>

      <ServiceFilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onShowResults={() => {
          setDrawerOpen(false);
          document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
        }}
        filters={filters}
        onFilterChange={setFilter}
        categories={categories}
        campuses={campusOptions}
      />
    </div>
  );
}

interface ServiceCategoryViewProps {
  categoryId: string;
  categorySlug: string;
  categoryName: string;
  description?: string;
}

/** Category landing page — same browse machinery, locked to one category. */
export function ServicesCategoryView({
  categoryId,
  categorySlug,
  categoryName,
  description,
}: ServiceCategoryViewProps) {
  const {
    filters,
    setFilter,
    setPage,
    clearFilters,
    isLoading,
    services,
    providers,
    resultCount,
    totalPages,
    currentPage,
    categories,
    campusOptions,
  } = useServiceMarketplace({
    basePath: `/services/categories/${categorySlug}`,
    lockedCategoryId: categoryId,
  });

  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <section className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-[#0B3B8F] text-white p-6 sm:p-8">
        <div className="max-w-xl">
          <Link
            href="/services"
            className="inline-flex items-center gap-1 text-xs font-semibold text-white/80 hover:text-white mb-3"
          >
            ← All services
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{categoryName}</h1>
          {description && (
            <p className="mt-2 text-sm text-white/85">{description}</p>
          )}
        </div>
      </section>

      {/* Results */}
      <section id="results" className="scroll-mt-20">
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">
              {isLoading ? "Loading…" : `${resultCount} ${resultCount === 1 ? "service" : "services"}`}
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Sorted by {serviceSortLabel(filters.sort)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ServiceSortDropdown value={filters.sort} onChange={(s) => setFilter("sort", s)} />
          </div>
        </div>

        <div className="flex gap-5 items-start">
          <ServiceFilterSidebar
            filters={filters}
            onFilterChange={setFilter}
            onClear={clearFilters}
            onOpenDrawer={() => setDrawerOpen(true)}
            categories={categories}
            campuses={campusOptions}
          />

          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ServiceCardSkeleton key={i} />
                ))}
              </div>
            ) : services.length === 0 ? (
              <ServiceEmptyState
                hasFilters={Boolean(filters.q || filters.campusId || filters.ratingMin || filters.priceBucket || filters.locationType)}
                onClearFilters={clearFilters}
              />
            ) : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {services.map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      provider={providers[service.providerId]}
                    />
                  ))}
                </div>
                <div className="mt-6">
                  <ServicePagination page={currentPage} totalPages={totalPages} onChange={setPage} />
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <ServiceFilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onShowResults={() => {
          setDrawerOpen(false);
          document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
        }}
        filters={filters}
        onFilterChange={setFilter}
        categories={categories}
        campuses={campusOptions}
      />
    </div>
  );
}