"use client";

import { useCallback, useEffect, useMemo, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { getMyServicesPage } from "@/services/freelancer-services";
import type { FreelancerServiceStatus } from "@/types/freelancer-services";
import {
  ServiceHeader,
  ServiceFilters,
  ServiceList,
  ServicesGridSkeleton,
  ServicesEmptyState,
} from "@/components/freelancer/services";
import { useDebounce } from "@/hooks";

type StatusFilter = FreelancerServiceStatus | "all";

function ServicesContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  const statusParam = (searchParams.get("status") ?? "all") as StatusFilter;
  const searchParam = searchParams.get("q") ?? "";

  const status: StatusFilter = ["all", "draft", "submitted", "under_review", "published", "paused", "rejected", "archived"].includes(statusParam)
    ? (statusParam as StatusFilter)
    : "all";

  const [searchInput, setSearchInput] = useState(searchParam);
  const debouncedSearch = useDebounce(searchInput, 300);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 200);
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearch) params.set("q", debouncedSearch);
    else params.delete("q");
    if (status !== "all") params.set("status", status);
    else params.delete("status");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, status]);

  const { items, total } = useMemo(
    () => getMyServicesPage({ status, search: debouncedSearch }),
    [status, debouncedSearch]
  );

  const counts = useMemo(() => {
    const all = getMyServicesPage({});
    const c: Record<StatusFilter, number> = {
      all: all.total,
      draft: 0,
      submitted: 0,
      under_review: 0,
      published: 0,
      paused: 0,
      rejected: 0,
      archived: 0,
    };
    for (const s of ["draft", "submitted", "under_review", "published", "paused", "rejected", "archived"] as FreelancerServiceStatus[]) {
      c[s] = all.items.filter((x) => x.status === s).length;
    }
    return c;
  }, []);

  const handleStatusChange = useCallback(
    (value: StatusFilter) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value !== "all") params.set("status", value);
      else params.delete("status");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const hasFilters = status !== "all" || debouncedSearch.length > 0;

  return (
    <div className="space-y-6">
      <ServiceHeader count={total} />
      <ServiceFilters
        status={status}
        search={searchInput}
        onStatusChange={handleStatusChange}
        onSearchChange={setSearchInput}
        counts={counts}
      />
      {loading && items.length === 0 ? (
        <ServicesGridSkeleton />
      ) : items.length === 0 ? (
        <ServicesEmptyState
          hasFilters={hasFilters}
          onCreate={() => router.push("/freelancer/services/create")}
        />
      ) : (
        <ServiceList services={items} />
      )}
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<ServicesGridSkeleton />}>
      <ServicesContent />
    </Suspense>
  );
}
