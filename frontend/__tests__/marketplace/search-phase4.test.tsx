import {
  SearchSuggestion,
  GlobalSearchResultItem,
  GlobalSearchResponse,
  PopularSearchItem
} from "@/features/marketplace/types";

export function testSearchSuggestionsContractValidation() {
  const mockSuggestion: SearchSuggestion = {
    type: "artist",
    value: "Rock Band",
    display: "The Rockers (Rock Band)",
    subtitle: "Mumbai"
  };

  console.assert(mockSuggestion.type === "artist", "Suggestion type mismatch");
  console.assert(mockSuggestion.value === "Rock Band", "Suggestion value mismatch");
  console.assert(mockSuggestion.subtitle === "Mumbai", "Suggestion subtitle mismatch");
}

export function testGlobalSearchResultItemContractValidation() {
  const mockArtistResult: GlobalSearchResultItem = {
    entity_type: "artist",
    id: "art-12345",
    display_name: "A.R. Rahman Live Ensemble",
    subtitle: "Solo Artist",
    city: "Chennai",
    state: "Tamil Nadu",
    image: "/uploads/rahman.jpg",
    rating: 4.9,
    base_price: 1500000,
    currency: "INR",
    tags: ["Bollywood", "Classical", "Sufi"],
    verification_status: "approved",
    created_at: "2026-07-21T12:00:00Z"
  };

  console.assert(mockArtistResult.entity_type === "artist", "Entity type mismatch");
  console.assert(mockArtistResult.display_name === "A.R. Rahman Live Ensemble", "Display name mismatch");
  console.assert(mockArtistResult.rating === 4.9, "Rating mismatch");
  console.assert(mockArtistResult.tags.includes("Bollywood"), "Tags mismatch");
}

export function testGlobalSearchResponseContractValidation() {
  const mockResponse: GlobalSearchResponse = {
    query: "Rock",
    location: "Mumbai",
    total: 2,
    artists: [
      {
        entity_type: "artist",
        id: "art-1",
        display_name: "Rock On Band",
        subtitle: "Band",
        city: "Mumbai",
        state: "Maharashtra",
        rating: 4.7,
        base_price: 80000,
        currency: "INR",
        tags: ["Rock"],
        verification_status: "approved"
      }
    ],
    venues: [
      {
        entity_type: "venue",
        id: "ven-1",
        display_name: "Hard Rock Cafe",
        subtitle: "Pub/Concert Hall",
        city: "Mumbai",
        state: "Maharashtra",
        rating: 4.5,
        base_price: 120000,
        currency: "INR",
        tags: ["Rock"],
        verification_status: "approved"
      }
    ],
    pagination: {
      total: 2,
      page: 1,
      limit: 12,
      pages: 1
    }
  };

  console.assert(mockResponse.query === "Rock", "Query mismatch");
  console.assert(mockResponse.location === "Mumbai", "Location mismatch");
  console.assert(mockResponse.artists.length === 1, "Artists array count mismatch");
  console.assert(mockResponse.venues.length === 1, "Venues array count mismatch");
  console.assert(mockResponse.pagination?.total === 2, "Pagination total mismatch");
}

export function testPopularSearchItemContractValidation() {
  const mockPopularItem: PopularSearchItem = {
    label: "Wedding Bands",
    query: "wedding bands",
    category: "event_type"
  };

  console.assert(mockPopularItem.label === "Wedding Bands", "Popular item label mismatch");
  console.assert(mockPopularItem.query === "wedding bands", "Popular item query mismatch");
  console.assert(mockPopularItem.category === "event_type", "Popular item category mismatch");
}
