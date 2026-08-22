"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageContainer } from "@/components/layout";
import { SearchInput } from "@/components/search/SearchInput";
import { SearchResults } from "@/components/search/SearchResults";
import { SearchFilters } from "@/components/search/SearchFilters";
import { SearchEmptyState } from "@/components/search/SearchEmptyState";
import { RecentSearches } from "@/components/search/RecentSearches";
import { TrendingSearches } from "@/components/search/TrendingSearches";
import {
  search,
  getTrendingSearches,
  getRecentSearches,
  addRecentSearch,
  removeRecentSearch,
  clearRecentSearches,
} from "@/services/search";
import { SearchFilterType, SearchResultItem } from "@/types";

function SearchPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [typeFilter, setTypeFilter] = useState<SearchFilterType>("all");
  const [sortBy, setSortBy] = useState("relevance");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [trending] = useState(getTrendingSearches());

  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  const doSearch = useCallback(
    (q: string, type: SearchFilterType, sort: string) => {
      if (!q.trim()) {
        setResults([]);
        setTotalCount(0);
        setHasSearched(false);
        return;
      }
      const res = search(q, { type, sortBy: sort as never });
      setResults(res.results);
      setTotalCount(res.totalCount);
      setHasSearched(true);
      addRecentSearch(q);
      setRecentSearches(getRecentSearches());
    },
    []
  );

  useEffect(() => {
    if (initialQuery) {
      doSearch(initialQuery, typeFilter, sortBy);
    }
  }, [initialQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (hasSearched && query) {
      doSearch(query, typeFilter, sortBy);
    }
  }, [typeFilter, sortBy]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleQueryChange(q: string) {
    setQuery(q);
    if (!q.trim()) {
      setResults([]);
      setTotalCount(0);
      setHasSearched(false);
    }
  }

  function handleSearchSubmit(q?: string) {
    const searchQuery = (q || query).trim();
    if (!searchQuery) return;
    setQuery(searchQuery);
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
  }

  function handleRecentSelect(q: string) {
    setQuery(q);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  function handleRecentRemove(q: string) {
    removeRecentSearch(q);
    setRecentSearches(getRecentSearches());
  }

  function handleRecentClear() {
    clearRecentSearches();
    setRecentSearches([]);
  }

  const showInitial = !hasSearched && !query;

  return (
    <PageContainer className="space-y-4">
      <SearchInput
        defaultValue={initialQuery}
        showBackButton
        autoFocus={!initialQuery}
        onBlur={() => {}}
      />

      {showInitial ? (
        <div className="space-y-6">
          <RecentSearches
            searches={recentSearches}
            onSelect={handleRecentSelect}
            onRemove={handleRecentRemove}
            onClear={handleRecentClear}
          />
          <TrendingSearches trending={trending} onSelect={handleRecentSelect} />
        </div>
      ) : (
        <>
          <SearchFilters
            activeType={typeFilter}
            sortBy={sortBy}
            onTypeChange={setTypeFilter}
            onSortChange={setSortBy}
            resultCount={totalCount}
          />

          {results.length > 0 ? (
            <SearchResults results={results} query={query} />
          ) : (
            <SearchEmptyState
              query={query}
              trending={trending}
              onTrendingClick={(q) => {
                setQuery(q);
                router.push(`/search?q=${encodeURIComponent(q)}`);
              }}
            />
          )}
        </>
      )}
    </PageContainer>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <PageContainer className="py-16 text-center">
        <div className="h-8 w-8 border-3 border-kampmax-blue/20 border-t-kampmax-blue rounded-full animate-spin mx-auto" />
      </PageContainer>
    }>
      <SearchPageInner />
    </Suspense>
  );
}
