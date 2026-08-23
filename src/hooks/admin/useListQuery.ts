"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ListQuery, Paginated, SortDir } from "@/types/admin";

/**
 * Standard list-page data hook for the admin panel.
 *
 * Owns: pagination, debounced search, arbitrary filters, sorting,
 * loading/error state and manual refresh. Every admin table page is
 * a thin composition over this hook plus its service - so when the
 * services switch from mock to NestJS HTTP, pages keep working.
 */
export function useListQuery<T, Q extends ListQuery = ListQuery>(
  fetcher: (query: Q) => Promise<Paginated<T>>,
  initialFilters?: Partial<Omit<Q, "page" | "pageSize" | "search">>,
  options?: { pageSize?: number; debounceMs?: number }
) {
  const { pageSize = 10, debounceMs = 300 } = options ?? {};

  const [filters, setFilters] = useState<Partial<Omit<Q, "page" | "pageSize" | "search">>>(
    initialFilters ?? {}
  );
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, debounceMs);
  const [page, setPage] = useState(1);
  const [pageSize_, setPageSize] = useState(pageSize);
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [nonce, setNonce] = useState(0);

  const [data, setData] = useState<Paginated<T> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  // Reset to first page whenever filters/search/pageSize change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, pageSize_]);
  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  const query = useMemo(() => {
    const q = {
      ...(filters as object),
      page,
      pageSize: pageSize_,
      sortBy,
      sortDir,
    };
    if (debouncedSearch.trim()) {
      (q as Record<string, unknown>).search = debouncedSearch.trim();
    }
    return q as Q;
  }, [filters, page, pageSize_, sortBy, sortDir, debouncedSearch]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetcherRef
      .current(query)
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [query, nonce]);

  const updateFilters = useCallback(
    (patch: Partial<Omit<Q, "page" | "pageSize" | "search">>) => {
      setFilters((prev) => ({ ...prev, ...patch }));
    },
    []
  );

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchInput("");
  }, []);

  const requestSort = useCallback(
    (field: string) => {
      setSortBy((prevField) => {
        if (prevField === field) {
          setSortDir((d) => (d === "asc" ? "desc" : "asc"));
          return prevField;
        }
        setSortDir("desc");
        return field;
      });
    },
    []
  );

  const refresh = useCallback(() => setNonce((n) => n + 1), []);

  return {
    // data state
    data,
    loading,
    error,
    rows: data?.items ?? [],
    total: data?.total ?? 0,
    totalPages: data?.totalPages ?? 1,
    // query state
    page,
    setPage,
    pageSize: pageSize_,
    setPageSize,
    sortBy,
    sortDir,
    requestSort,
    // search + filters
    searchInput,
    setSearchInput,
    filters,
    updateFilters,
    clearFilters,
    refresh,
  };
}

/** Returns a copy of `value` updated only after `ms` of stability. */
export function useDebouncedValue<T>(value: T, ms = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);

  return debounced;
}
