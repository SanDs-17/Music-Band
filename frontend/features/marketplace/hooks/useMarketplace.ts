"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { marketplaceService } from "../services/marketplaceService";
import { useMarketplaceStore, type SortByOption } from "../stores/useMarketplaceStore";
import {
  MarketplaceHomeResponse,
  MarketplaceArtistCard,
  MarketplaceVenueCard,
  MarketplaceListResponse,
  CategoryBrief,
  LocationGroup,
  MarketplaceFilterParams,
  ArtistPreviewResponse,
  ArtistFilterOptions,
  VenuePreviewResponse,
  VenueFilterOptions,
  GlobalSearchParams,
  GlobalSearchResponse,
  SearchSuggestion,
  PopularSearchesResponse,
  PopularSearchItem,
  MarketplaceRankingResponse,
  MarketplaceAvailabilityResponse,
  PopularityMetrics,
  ProfileCompletion,
} from "../types";

export function useMarketplaceHome() {
  const [data, setData] = useState<MarketplaceHomeResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHome = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await marketplaceService.getHome();
      setData(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load marketplace home data.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHome();
  }, [fetchHome]);

  return { data, loading, error, refetch: fetchHome };
}

export function useMarketplaceArtists(params?: MarketplaceFilterParams) {
  const [data, setData] = useState<MarketplaceListResponse<MarketplaceArtistCard> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArtists = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await marketplaceService.searchArtists(params);
      setData(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to search marketplace artists.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchArtists();
  }, [fetchArtists]);

  return { data, loading, error, refetch: fetchArtists };
}

export function useFeaturedArtists() {
  const [artists, setArtists] = useState<MarketplaceArtistCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    marketplaceService
      .getFeaturedArtists()
      .then(setArtists)
      .catch(() => setArtists([]))
      .finally(() => setLoading(false));
  }, []);

  return { artists, loading };
}

export function useArtistPreview(artistId: string | null) {
  const [preview, setPreview] = useState<ArtistPreviewResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!artistId) {
      setPreview(null);
      return;
    }
    setLoading(true);
    setError(null);

    marketplaceService
      .getArtistPreview(artistId)
      .then(setPreview)
      .catch((err) => {
        const msg = err instanceof Error ? err.message : "Failed to fetch artist preview.";
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [artistId]);

  return { preview, loading, error };
}

export function useArtistFilterOptions() {
  const [options, setOptions] = useState<ArtistFilterOptions | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    marketplaceService
      .getArtistFilterOptions()
      .then(setOptions)
      .catch(() => setOptions(null))
      .finally(() => setLoading(false));
  }, []);

  return { options, loading };
}

export function useMarketplaceVenues(params?: MarketplaceFilterParams) {
  const [data, setData] = useState<MarketplaceListResponse<MarketplaceVenueCard> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVenues = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await marketplaceService.searchVenues(params);
      setData(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to search marketplace venues.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchVenues();
  }, [fetchVenues]);

  return { data, loading, error, refetch: fetchVenues };
}

export function useFeaturedVenues() {
  const [venues, setVenues] = useState<MarketplaceVenueCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    marketplaceService
      .getFeaturedVenues()
      .then(setVenues)
      .catch(() => setVenues([]))
      .finally(() => setLoading(false));
  }, []);

  return { venues, loading };
}

export function useVenuePreview(venueId: string | null) {
  const [preview, setPreview] = useState<VenuePreviewResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!venueId) {
      setPreview(null);
      return;
    }
    setLoading(true);
    setError(null);

    marketplaceService
      .getVenuePreview(venueId)
      .then(setPreview)
      .catch((err) => {
        const msg = err instanceof Error ? err.message : "Failed to fetch venue preview.";
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [venueId]);

  return { preview, loading, error };
}

export function useVenueFilterOptions() {
  const [options, setOptions] = useState<VenueFilterOptions | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    marketplaceService
      .getVenueFilterOptions()
      .then(setOptions)
      .catch(() => setOptions(null))
      .finally(() => setLoading(false));
  }, []);

  return { options, loading };
}

export function useMarketplaceCategories() {
  const [categories, setCategories] = useState<CategoryBrief[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    marketplaceService
      .getCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  return { categories, loading };
}

export function useMarketplaceLocations() {
  const [locations, setLocations] = useState<LocationGroup | null>(null);

  useEffect(() => {
    marketplaceService
      .getLocations()
      .then(setLocations)
      .catch(() => setLocations(null));
  }, []);

  return { locations };
}

// ─── Phase 4: Advanced Search & Discovery Hooks ──────────────────────────────

export function useMarketplaceSearch(params: GlobalSearchParams) {
  const [data, setData] = useState<GlobalSearchResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSearch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await marketplaceService.globalSearch(params);
      setData(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load global search results.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchSearch();
  }, [fetchSearch]);

  return { data, loading, error, refetch: fetchSearch };
}

export function useSearchSuggestions(query: string, debounceMs = 300) {
  const store = useMarketplaceStore();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = null;
    }

    if (!query || query.trim().length < 2) {
      store.clearSuggestions();
      store.setIsSuggestionsLoading(false);
      return;
    }

    store.setIsSuggestionsLoading(true);

    timerRef.current = setTimeout(async () => {
      const controller = new AbortController();
      controllerRef.current = controller;

      try {
        const res = await marketplaceService.getSearchSuggestions(query, controller.signal);
        store.setSuggestions(res.suggestions);
      } catch (error: unknown) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          store.clearSuggestions();
        }
      } finally {
        if (controllerRef.current === controller) {
          store.setIsSuggestionsLoading(false);
        }
      }
    }, debounceMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (controllerRef.current) {
        controllerRef.current.abort();
        controllerRef.current = null;
      }
    };
  }, [query, debounceMs]);

  return {
    suggestions: store.suggestions,
    loading: store.isSuggestionsLoading,
  };
}

export function useRecentSearches() {
  const store = useMarketplaceStore();
  return {
    recentSearches: store.recentSearches,
    addRecentSearch: store.addRecentSearch,
    removeRecentSearch: store.removeRecentSearch,
    clearRecentSearches: store.clearRecentSearches,
  };
}

export function usePopularSearches() {
  const [items, setItems] = useState<PopularSearchItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    marketplaceService
      .getPopularSearches()
      .then((res) => setItems(res.items))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return { items, loading };
}

export function useMarketplaceFilters() {
  const store = useMarketplaceStore();
  return {
    activeFilterCount: store.getActiveFilterCount(),
    resetFilters: store.resetFilters,
  };
}

export function useURLSync(pageType: "artist" | "venue") {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const store = useMarketplaceStore();
  const isMounted = useRef(false);

  // 1. Sync from URL to Store on Mount
  useEffect(() => {
    if (isMounted.current) return;

    const q = searchParams.get("q") || "";
    const category = searchParams.get("category") || "";
    const location = searchParams.get("location") || "";
    const sort = searchParams.get("sort") || "best_match";
    const order = (searchParams.get("order") as "asc" | "desc") || "desc";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const availability =
      (searchParams.get("availability") as "all" | "today" | "tomorrow" | "this_week" | "custom") ||
      "all";
    const eventDate = searchParams.get("date");

    store.setSearchQuery(q);
    store.setSelectedCategory(category);
    store.setSelectedLocation(location);
    store.setSort(sort as SortByOption, order);
    store.setPage(page);
    store.setAvailabilityFilter(availability);
    store.setSelectedDate(eventDate);

    if (pageType === "artist") {
      const genre = searchParams.get("genre") || "";
      const rating = searchParams.get("rating");
      const verified = searchParams.get("verified") === "true";
      const featured = searchParams.get("featured") === "true";

      store.setArtistGenreFilter(genre);
      store.setMinRatingFilter(rating ? parseFloat(rating) : null);
      store.setVerifiedOnlyFilter(verified);
      store.setFeaturedOnlyFilter(featured);
    } else {
      const vtype = searchParams.get("venue_type") || "";
      const capacity = searchParams.get("capacity");
      const rating = searchParams.get("rating");
      const verified = searchParams.get("verified") === "true";
      const featured = searchParams.get("featured") === "true";

      store.setVenueTypeFilter(vtype);
      store.setMinCapacityFilter(capacity ? parseInt(capacity, 10) : null);
      store.setVenueMinRatingFilter(rating ? parseFloat(rating) : null);
      store.setVenueVerifiedOnlyFilter(verified);
      store.setVenueFeaturedOnlyFilter(featured);
    }

    isMounted.current = true;
  }, [searchParams, pageType]);

  // 2. Sync from Store to URL on State Change
  useEffect(() => {
    if (!isMounted.current) return;

    const params = new URLSearchParams();

    if (store.searchQuery) params.set("q", store.searchQuery);
    if (store.selectedCategory) params.set("category", store.selectedCategory);
    if (store.selectedLocation) params.set("location", store.selectedLocation);
    if (store.sortBy !== "best_match") params.set("sort", store.sortBy);
    if (store.sortOrder !== "desc") params.set("order", store.sortOrder);
    if (store.page > 1) params.set("page", store.page.toString());
    if (store.availabilityFilter !== "all") {
      params.set("availability", store.availabilityFilter);
    }
    if (store.selectedDate) params.set("date", store.selectedDate);

    if (pageType === "artist") {
      if (store.artistGenreFilter) params.set("genre", store.artistGenreFilter);
      if (store.minRatingFilter !== null) params.set("rating", store.minRatingFilter.toString());
      if (store.verifiedOnlyFilter) params.set("verified", "true");
      if (store.featuredOnlyFilter) params.set("featured", "true");
    } else {
      if (store.venueTypeFilter) params.set("venue_type", store.venueTypeFilter);
      if (store.minCapacityFilter !== null)
        params.set("capacity", store.minCapacityFilter.toString());
      if (store.venueMinRatingFilter !== null)
        params.set("rating", store.venueMinRatingFilter.toString());
      if (store.venueVerifiedOnlyFilter) params.set("verified", "true");
      if (store.venueFeaturedOnlyFilter) params.set("featured", "true");
    }

    const search = params.toString();
    const queryStr = search ? `?${search}` : "";
    router.replace(`${pathname}${queryStr}`);
  }, [
    store.searchQuery,
    store.selectedCategory,
    store.selectedLocation,
    store.sortBy,
    store.sortOrder,
    store.page,
    // Artist states
    store.artistGenreFilter,
    store.minRatingFilter,
    store.verifiedOnlyFilter,
    store.featuredOnlyFilter,
    // Venue states
    store.venueTypeFilter,
    store.minCapacityFilter,
    store.venueMinRatingFilter,
    store.venueVerifiedOnlyFilter,
    store.venueFeaturedOnlyFilter,
    store.availabilityFilter,
    store.selectedDate,
    pageType,
    pathname,
    router,
  ]);
}

// ─── Phase 5: Smart Ranking & Availability Hooks ─────────────────────────────

export function useMarketplaceRanking(params: GlobalSearchParams) {
  const [data, setData] = useState<MarketplaceRankingResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRanking = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await marketplaceService.getRanking(params);
      setData(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load ranking results.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchRanking();
  }, [fetchRanking]);

  return { data, loading, error, refetch: fetchRanking };
}

export function useMarketplaceAvailability(
  entityType: "artist" | "venue" | null,
  entityId: string | null,
  targetDate?: string,
) {
  const [data, setData] = useState<MarketplaceAvailabilityResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!entityType || !entityId) {
      setData(null);
      return;
    }
    setLoading(true);
    marketplaceService
      .getAvailability(entityType, entityId, targetDate)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [entityType, entityId, targetDate]);

  return { data, loading };
}

export function useMarketplacePopularity(
  entityType: "artist" | "venue" | null,
  entityId: string | null,
) {
  const [data, setData] = useState<PopularityMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!entityType || !entityId) {
      setData(null);
      return;
    }
    setLoading(true);
    marketplaceService
      .getPopularity(entityType, entityId)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [entityType, entityId]);

  return { data, loading };
}

export function useProfileCompletion(
  entityType: "artist" | "venue" | null,
  entityId: string | null,
) {
  const [data, setData] = useState<ProfileCompletion | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!entityType || !entityId) {
      setData(null);
      return;
    }
    setLoading(true);
    marketplaceService
      .getProfileCompletion(entityType, entityId)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [entityType, entityId]);

  return { data, loading };
}
