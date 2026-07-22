import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SearchSuggestion } from "../types";

type SortByOption =
  | "best_match"
  | "rating"
  | "price"
  | "popularity"
  | "booked"
  | "reviews"
  | "created_at"
  | "availability"
  | "name"
  | "capacity";

export type { SortByOption };

interface MarketplaceState {
  searchQuery: string;
  selectedCategory: string;
  selectedLocation: string;
  recentLocations: string[];
  sortBy: SortByOption;
  sortOrder: "asc" | "desc";
  page: number;

  // Phase 2 Artist Discovery Filters
  viewMode: "grid" | "list";
  artistGenreFilter: string;
  artistCityFilter: string;
  artistStateFilter: string;
  minRatingFilter: number | null;
  verifiedOnlyFilter: boolean;
  featuredOnlyFilter: boolean;
  selectedArtistPreviewId: string | null;

  // Phase 3 Venue Discovery Filters
  venueViewMode: "grid" | "list";
  venueTypeFilter: string;
  venueCityFilter: string;
  venueStateFilter: string;
  minCapacityFilter: number | null;
  venueMinRatingFilter: number | null;
  venueVerifiedOnlyFilter: boolean;
  venueFeaturedOnlyFilter: boolean;
  selectedVenuePreviewId: string | null;

  // Phase 4 Advanced Search
  recentSearches: string[];
  suggestions: SearchSuggestion[];
  isSuggestionsLoading: boolean;

  // Phase 5 Smart Ranking & Availability
  availabilityFilter: "all" | "today" | "tomorrow" | "this_week" | "custom";
  selectedDate: string | null;
  rankingMode: boolean;
  popularityMode: boolean;

  // ── Actions ──
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  setSelectedLocation: (location: string) => void;
  addRecentLocation: (location: string) => void;
  setSort: (sortBy: SortByOption, sortOrder?: "asc" | "desc") => void;
  setPage: (page: number) => void;
  setViewMode: (mode: "grid" | "list") => void;
  setArtistGenreFilter: (genre: string) => void;
  setArtistCityFilter: (city: string) => void;
  setArtistStateFilter: (state: string) => void;
  setMinRatingFilter: (rating: number | null) => void;
  setVerifiedOnlyFilter: (val: boolean) => void;
  setFeaturedOnlyFilter: (val: boolean) => void;
  openPreviewModal: (artistId: string) => void;
  closePreviewModal: () => void;

  // Venue actions
  setVenueViewMode: (mode: "grid" | "list") => void;
  setVenueTypeFilter: (vt: string) => void;
  setVenueCityFilter: (city: string) => void;
  setVenueStateFilter: (state: string) => void;
  setMinCapacityFilter: (cap: number | null) => void;
  setVenueMinRatingFilter: (rating: number | null) => void;
  setVenueVerifiedOnlyFilter: (val: boolean) => void;
  setVenueFeaturedOnlyFilter: (val: boolean) => void;
  openVenuePreviewModal: (venueId: string) => void;
  closeVenuePreviewModal: () => void;

  // Phase 4 search actions
  addRecentSearch: (query: string) => void;
  removeRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  setSuggestions: (suggestions: SearchSuggestion[]) => void;
  setIsSuggestionsLoading: (loading: boolean) => void;
  clearSuggestions: () => void;
  /** Returns count of currently active non-default filters */
  getActiveFilterCount: () => number;

  // Phase 5 actions
  setSortOption: (sortBy: SortByOption, sortOrder?: "asc" | "desc") => void;
  setAvailabilityFilter: (filter: "all" | "today" | "tomorrow" | "this_week" | "custom") => void;
  setSelectedDate: (date: string | null) => void;
  resetPhase5Filters: () => void;

  resetFilters: () => void;
}

export const useMarketplaceStore = create<MarketplaceState>()(
  persist(
    (set, get) => ({
      searchQuery: "",
      selectedCategory: "",
      selectedLocation: "",
      recentLocations: ["Mumbai", "Bengaluru", "Delhi NCR", "Goa"],
      sortBy: "best_match",
      sortOrder: "desc",
      page: 1,

      viewMode: "grid",
      artistGenreFilter: "",
      artistCityFilter: "",
      artistStateFilter: "",
      minRatingFilter: null,
      verifiedOnlyFilter: false,
      featuredOnlyFilter: false,
      selectedArtistPreviewId: null,

      venueViewMode: "grid",
      venueTypeFilter: "",
      venueCityFilter: "",
      venueStateFilter: "",
      minCapacityFilter: null,
      venueMinRatingFilter: null,
      venueVerifiedOnlyFilter: false,
      venueFeaturedOnlyFilter: false,
      selectedVenuePreviewId: null,

      // Phase 4
      recentSearches: [],
      suggestions: [],
      isSuggestionsLoading: false,

      // Phase 5
      availabilityFilter: "all",
      selectedDate: null,
      rankingMode: true,
      popularityMode: false,

      // ── Core actions ──
      setSearchQuery: (query: string) => set({ searchQuery: query, page: 1 }),
      setSelectedCategory: (category: string) => set({ selectedCategory: category, page: 1 }),
      setSelectedLocation: (location: string) => {
        set({ selectedLocation: location, page: 1 });
        if (location) {
          get().addRecentLocation(location);
        }
      },
      addRecentLocation: (location: string) => {
        const current = get().recentLocations;
        if (!location || current.includes(location)) return;
        set({ recentLocations: [location, ...current].slice(0, 5) });
      },
      setSort: (sortBy: SortByOption, sortOrder: "asc" | "desc" = "desc") => set({ sortBy, sortOrder, page: 1 }),
      setPage: (page: number) => set({ page }),
      setViewMode: (mode: "grid" | "list") => set({ viewMode: mode }),
      setArtistGenreFilter: (genre: string) => set({ artistGenreFilter: genre, page: 1 }),
      setArtistCityFilter: (city: string) => set({ artistCityFilter: city, page: 1 }),
      setArtistStateFilter: (state: string) => set({ artistStateFilter: state, page: 1 }),
      setMinRatingFilter: (rating: number | null) => set({ minRatingFilter: rating, page: 1 }),
      setVerifiedOnlyFilter: (val: boolean) => set({ verifiedOnlyFilter: val, page: 1 }),
      setFeaturedOnlyFilter: (val: boolean) => set({ featuredOnlyFilter: val, page: 1 }),
      openPreviewModal: (artistId: string) => set({ selectedArtistPreviewId: artistId }),
      closePreviewModal: () => set({ selectedArtistPreviewId: null }),

      setVenueViewMode: (mode: "grid" | "list") => set({ venueViewMode: mode }),
      setVenueTypeFilter: (vt: string) => set({ venueTypeFilter: vt, page: 1 }),
      setVenueCityFilter: (city: string) => set({ venueCityFilter: city, page: 1 }),
      setVenueStateFilter: (state: string) => set({ venueStateFilter: state, page: 1 }),
      setMinCapacityFilter: (cap: number | null) => set({ minCapacityFilter: cap, page: 1 }),
      setVenueMinRatingFilter: (rating: number | null) => set({ venueMinRatingFilter: rating, page: 1 }),
      setVenueVerifiedOnlyFilter: (val: boolean) => set({ venueVerifiedOnlyFilter: val, page: 1 }),
      setVenueFeaturedOnlyFilter: (val: boolean) => set({ venueFeaturedOnlyFilter: val, page: 1 }),
      openVenuePreviewModal: (venueId: string) => set({ selectedVenuePreviewId: venueId }),
      closeVenuePreviewModal: () => set({ selectedVenuePreviewId: null }),

      // Phase 4 search actions
      addRecentSearch: (query: string) => {
        if (!query.trim()) return;
        const current = get().recentSearches;
        const deduplicated = [query.trim(), ...current.filter((q) => q !== query.trim())];
        set({ recentSearches: deduplicated.slice(0, 10) });
      },
      removeRecentSearch: (query: string) => {
        set({ recentSearches: get().recentSearches.filter((q) => q !== query) });
      },
      clearRecentSearches: () => set({ recentSearches: [] }),
      setSuggestions: (suggestions: SearchSuggestion[]) => set({ suggestions }),
      setIsSuggestionsLoading: (loading: boolean) => set({ isSuggestionsLoading: loading }),
      clearSuggestions: () => set({ suggestions: [] }),

      getActiveFilterCount: () => {
        const s = get();
        let count = 0;
        if (s.searchQuery) count++;
        if (s.selectedCategory) count++;
        if (s.selectedLocation) count++;
        if (s.artistGenreFilter) count++;
        if (s.minRatingFilter) count++;
        if (s.verifiedOnlyFilter) count++;
        if (s.featuredOnlyFilter) count++;
        if (s.venueTypeFilter) count++;
        if (s.minCapacityFilter) count++;
        if (s.venueMinRatingFilter) count++;
        if (s.venueVerifiedOnlyFilter) count++;
        if (s.venueFeaturedOnlyFilter) count++;
        if (s.availabilityFilter !== "all") count++;
        return count;
      },

      setSortOption: (sortBy: SortByOption, sortOrder: "asc" | "desc" = "desc") =>
        set({ sortBy, sortOrder, page: 1 }),
      setAvailabilityFilter: (filter) =>
        set({ availabilityFilter: filter, page: 1 }),
      setSelectedDate: (date) => set({ selectedDate: date, page: 1 }),
      resetPhase5Filters: () =>
        set({
          availabilityFilter: "all",
          selectedDate: null,
          sortBy: "best_match",
          sortOrder: "desc",
          page: 1,
        }),

      resetFilters: () =>
        set({
          searchQuery: "",
          selectedCategory: "",
          selectedLocation: "",
          artistGenreFilter: "",
          artistCityFilter: "",
          artistStateFilter: "",
          minRatingFilter: null,
          verifiedOnlyFilter: false,
          featuredOnlyFilter: false,
          venueTypeFilter: "",
          venueCityFilter: "",
          venueStateFilter: "",
          minCapacityFilter: null,
          venueMinRatingFilter: null,
          venueVerifiedOnlyFilter: false,
          venueFeaturedOnlyFilter: false,
          availabilityFilter: "all",
          selectedDate: null,
          sortBy: "best_match",
          sortOrder: "desc",
          page: 1,
          suggestions: [],
        }),
    }),
    {
      name: "marketplace-storage",
      partialize: (state) => ({
        recentLocations: state.recentLocations,
        recentSearches: state.recentSearches,
        viewMode: state.viewMode,
        venueViewMode: state.venueViewMode,
      }),
    }
  )
);
