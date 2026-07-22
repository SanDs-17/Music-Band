export interface CategoryBrief {
  id: string;
  name: string;
  slug: string;
  type?: string | null;
}

export interface MarketplaceArtistCard {
  id: string;
  user_id: string;
  display_name: string;
  username?: string | null;
  bio?: string | null;
  band_type: string;
  total_members: number;
  years_of_experience: number;
  city?: string | null;
  state?: string | null;
  base_rate: number;
  currency: string;
  rating: number;
  total_reviews: number;
  profile_image?: string | null;
  cover_image?: string | null;
  genres: CategoryBrief[];
  languages: CategoryBrief[];
  verification_status: string;
  is_featured: boolean;
  availability_status: string;
  created_at?: string | null;
  search_score?: SearchScore | null;
  availability_info?: AvailabilityStatus | null;
  popularity_info?: PopularityMetrics | null;
  profile_completion_info?: ProfileCompletion | null;
  smart_badges?: SmartBadge[];
}

export interface ArtistPreviewResponse {
  id: string;
  user_id: string;
  display_name: string;
  username?: string | null;
  bio?: string | null;
  band_type: string;
  total_members: number;
  years_of_experience: number;
  city?: string | null;
  state?: string | null;
  base_rate: number;
  currency: string;
  rating: number;
  total_reviews: number;
  profile_image?: string | null;
  cover_image?: string | null;
  gallery: string[];
  videos: string[];
  genres: CategoryBrief[];
  languages: CategoryBrief[];
  social_links: Record<string, string>;
  achievements: string[];
  verification_status: string;
  is_featured: boolean;
  availability_indicator: string;
  created_at?: string | null;
}

export interface ArtistFilterOptions {
  genres: string[];
  categories: string[];
  cities: string[];
  states: string[];
  band_types: string[];
  sort_options: Array<{ label: string; value: string; order: string }>;
}

export interface MarketplaceVenueCard {
  id: string;
  user_id: string;
  name: string;
  venue_number?: string | null;
  venue_type?: string | null;
  description?: string | null;
  address: string;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  base_price: number;
  capacity: number;
  min_capacity: number;
  rating: number;
  total_reviews: number;
  image?: string | null;
  gallery: string[];
  facilities: string[];
  categories: CategoryBrief[];
  verification_status: string;
  is_featured: boolean;
  availability_status: string;
  created_at?: string | null;
  search_score?: SearchScore | null;
  availability_info?: AvailabilityStatus | null;
  popularity_info?: PopularityMetrics | null;
  profile_completion_info?: ProfileCompletion | null;
  smart_badges?: SmartBadge[];
}

export interface VenuePreviewResponse {
  id: string;
  user_id: string;
  name: string;
  venue_number?: string | null;
  venue_type?: string | null;
  description?: string | null;
  address: string;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  base_price: number;
  capacity: number;
  min_capacity: number;
  rating: number;
  total_reviews: number;
  image?: string | null;
  gallery: string[];
  facilities: string[];
  categories: CategoryBrief[];
  pricing_details: Record<string, unknown>;
  availability_rules: Record<string, unknown>;
  verification_status: string;
  is_featured: boolean;
  availability_indicator: string;
  created_at?: string | null;
}

export interface VenueFilterOptions {
  venue_types: string[];
  cities: string[];
  states: string[];
  capacity_ranges: Array<{ label: string; value: number }>;
  sort_options: Array<{ label: string; value: string; order: string }>;
}

export interface LocationGroup {
  country: string;
  popular_cities: string[];
  states: string[];
  union_territories: string[];
}

export interface MarketplaceHomeResponse {
  featured_artists: MarketplaceArtistCard[];
  featured_venues: MarketplaceVenueCard[];
  categories: CategoryBrief[];
  locations: LocationGroup;
}

export interface FeaturedMarketplaceResponse {
  top_artists: MarketplaceArtistCard[];
  top_venues: MarketplaceVenueCard[];
  latest_artists: MarketplaceArtistCard[];
  latest_venues: MarketplaceVenueCard[];
}

export interface MarketplacePagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface MarketplaceListResponse<T> {
  items: T[];
  pagination: MarketplacePagination;
}

export interface MarketplaceFilterParams {
  query?: string;
  category?: string;
  location?: string;
  genre?: string;
  venue_type?: string;
  city?: string;
  state?: string;
  min_capacity?: number;
  min_rating?: number;
  verified_only?: boolean;
  featured_only?: boolean;
  availability_filter?: "all" | "today" | "tomorrow" | "this_week" | "custom";
  event_date?: string;
  page?: number;
  limit?: number;
  sort_by?:
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
  sort_order?: string;
}

// ─── Phase 4: Advanced Search & Discovery ────────────────────────────────────

export interface SearchSuggestion {
  type: "artist" | "venue" | "genre" | "city" | "state";
  value: string;
  display: string;
  subtitle?: string | null;
}

export interface SearchSuggestionsResponse {
  query: string;
  suggestions: SearchSuggestion[];
  total: number;
}

export interface GlobalSearchResultItem {
  entity_type: "artist" | "venue";
  id: string;
  display_name: string;
  subtitle?: string | null;
  city?: string | null;
  state?: string | null;
  image?: string | null;
  rating: number;
  base_price: number;
  currency: string;
  tags: string[];
  verification_status: string;
  is_featured?: boolean;
  created_at?: string | null;
  search_score?: SearchScore | null;
  availability_info?: AvailabilityStatus | null;
  popularity_info?: PopularityMetrics | null;
  profile_completion_info?: ProfileCompletion | null;
  smart_badges?: SmartBadge[];
}

export interface GlobalSearchResponse {
  query: string;
  location?: string | null;
  total: number;
  artists: GlobalSearchResultItem[];
  venues: GlobalSearchResultItem[];
  pagination?: MarketplacePagination | null;
}

export interface PopularSearchItem {
  label: string;
  query: string;
  category: string;
}

export interface PopularSearchesResponse {
  items: PopularSearchItem[];
}

export interface GlobalSearchParams {
  q?: string;
  location?: string;
  category?: string;
  page?: number;
  limit?: number;
}

// ─── Phase 5: Smart Ranking & Availability Types ────────────────────────────

export interface SearchScore {
  total_score: number;
  match_score: number;
  category_score: number;
  location_score: number;
  verification_score: number;
  featured_score: number;
  rating_score: number;
  popularity_score: number;
  availability_score: number;
  completeness_score: number;
  recency_score: number;
}

export interface AvailabilityStatus {
  status: "available_today" | "available_tomorrow" | "available_this_week" | "available_on_date" | "booked" | "unavailable";
  is_available: boolean;
  next_available_date?: string | null;
  indicator_label: string;
}

export interface PopularityMetrics {
  total_bookings: number;
  total_reviews: number;
  average_rating: number;
  popularity_score: number;
  popularity_level: "Normal" | "Popular" | "Highly Booked" | "Top Rated";
}

export interface ProfileCompletion {
  percentage: number;
  missing_fields: string[];
  is_complete: boolean;
}

export interface SmartBadge {
  key: "verified" | "featured" | "available_today" | "available_soon" | "top_rated" | "popular" | "highly_booked" | "profile_complete" | "new_listing";
  label: string;
  variant: "default" | "success" | "warning" | "info" | "purple" | "primary";
}

export interface MarketplaceRankingResponse {
  query?: string | null;
  total: number;
  items: GlobalSearchResultItem[];
  pagination?: MarketplacePagination | null;
}

export interface MarketplaceAvailabilityResponse {
  entity_type: "artist" | "venue";
  entity_id: string;
  availability: AvailabilityStatus;
}

