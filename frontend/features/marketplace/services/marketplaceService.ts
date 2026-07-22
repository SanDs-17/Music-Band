import { api } from "@/services/api";
import {
  MarketplaceArtistCard,
  MarketplaceVenueCard,
  MarketplaceHomeResponse,
  FeaturedMarketplaceResponse,
  MarketplaceListResponse,
  CategoryBrief,
  LocationGroup,
  MarketplaceFilterParams,
  ArtistPreviewResponse,
  ArtistFilterOptions,
  VenuePreviewResponse,
  VenueFilterOptions,
  // Phase 4
  SearchSuggestionsResponse,
  GlobalSearchResponse,
  GlobalSearchParams,
  PopularSearchesResponse,
  // Phase 5
  MarketplaceRankingResponse,
  MarketplaceAvailabilityResponse,
  PopularityMetrics,
  ProfileCompletion,
} from "../types";

export const marketplaceService = {
  getHome: async (): Promise<MarketplaceHomeResponse> => {
    const response = await api.get("/marketplace/home");
    return response.data.data;
  },

  searchArtists: async (
    params?: MarketplaceFilterParams,
  ): Promise<MarketplaceListResponse<MarketplaceArtistCard>> => {
    const response = await api.get("/marketplace/artists", { params });
    return response.data.data;
  },

  getFeaturedArtists: async (): Promise<MarketplaceArtistCard[]> => {
    const response = await api.get("/marketplace/artists/featured");
    return response.data.data;
  },

  getPopularArtists: async (): Promise<MarketplaceArtistCard[]> => {
    const response = await api.get("/marketplace/artists/popular");
    return response.data.data;
  },

  getRecentArtists: async (): Promise<MarketplaceArtistCard[]> => {
    const response = await api.get("/marketplace/artists/recent");
    return response.data.data;
  },

  getArtistPreview: async (artistId: string): Promise<ArtistPreviewResponse> => {
    const response = await api.get(`/marketplace/artists/${artistId}/preview`);
    return response.data.data;
  },

  getArtistFilterOptions: async (): Promise<ArtistFilterOptions> => {
    const response = await api.get("/marketplace/artists/filters");
    return response.data.data;
  },

  searchVenues: async (
    params?: MarketplaceFilterParams,
  ): Promise<MarketplaceListResponse<MarketplaceVenueCard>> => {
    const response = await api.get("/marketplace/venues", { params });
    return response.data.data;
  },

  getFeaturedVenues: async (): Promise<MarketplaceVenueCard[]> => {
    const response = await api.get("/marketplace/venues/featured");
    return response.data.data;
  },

  getPopularVenues: async (): Promise<MarketplaceVenueCard[]> => {
    const response = await api.get("/marketplace/venues/popular");
    return response.data.data;
  },

  getRecentVenues: async (): Promise<MarketplaceVenueCard[]> => {
    const response = await api.get("/marketplace/venues/recent");
    return response.data.data;
  },

  getVenuePreview: async (venueId: string): Promise<VenuePreviewResponse> => {
    const response = await api.get(`/marketplace/venues/${venueId}/preview`);
    return response.data.data;
  },

  getVenueFilterOptions: async (): Promise<VenueFilterOptions> => {
    const response = await api.get("/marketplace/venues/filters");
    return response.data.data;
  },

  getCategories: async (): Promise<CategoryBrief[]> => {
    const response = await api.get("/marketplace/categories");
    return response.data.data;
  },

  getFeatured: async (): Promise<FeaturedMarketplaceResponse> => {
    const response = await api.get("/marketplace/featured");
    return response.data.data;
  },

  getLocations: async (): Promise<LocationGroup> => {
    const response = await api.get("/marketplace/locations");
    return response.data.data;
  },

  // ─── Phase 4: Advanced Search & Discovery ────────────────────────────────
  getSearchSuggestions: async (
    query: string,
    signal?: AbortSignal,
  ): Promise<SearchSuggestionsResponse> => {
    const response = await api.get("/marketplace/search/suggestions", {
      params: { q: query },
      signal,
    });
    return response.data.data;
  },

  getPopularSearches: async (): Promise<PopularSearchesResponse> => {
    const response = await api.get("/marketplace/search/popular");
    return response.data.data;
  },

  globalSearch: async (params: GlobalSearchParams): Promise<GlobalSearchResponse> => {
    const response = await api.get("/marketplace/search", { params });
    return response.data.data;
  },

  // ─── Phase 5: Smart Ranking & Availability ───────────────────────────────
  getRanking: async (params?: GlobalSearchParams): Promise<MarketplaceRankingResponse> => {
    const response = await api.get("/marketplace/ranking", { params });
    return response.data.data;
  },

  getAvailability: async (
    entityType: "artist" | "venue",
    entityId: string,
    targetDate?: string,
  ): Promise<MarketplaceAvailabilityResponse> => {
    const response = await api.get("/marketplace/availability", {
      params: {
        entity_type: entityType,
        entity_id: entityId,
        target_date: targetDate,
      },
    });
    return response.data.data;
  },

  getPopularity: async (
    entityType: "artist" | "venue",
    entityId: string,
  ): Promise<PopularityMetrics> => {
    const response = await api.get("/marketplace/popularity", {
      params: { entity_type: entityType, entity_id: entityId },
    });
    return response.data.data;
  },

  getProfileCompletion: async (
    entityType: "artist" | "venue",
    entityId: string,
  ): Promise<ProfileCompletion> => {
    const response = await api.get("/marketplace/profile-completion", {
      params: { entity_type: entityType, entity_id: entityId },
    });
    return response.data.data;
  },
};
