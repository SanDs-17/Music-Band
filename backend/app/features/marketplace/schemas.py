"""
Pydantic schemas for Marketplace Search & Discovery payloads.
"""

from typing import List, Optional, Generic, TypeVar, Dict, Any
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field

T = TypeVar("T")


class CategoryBriefSchema(BaseModel):
    id: UUID
    name: str
    slug: Optional[str] = (
        None  # Category model has no slug column; kept for API compatibility
    )
    type: Optional[str] = None


class MarketplaceArtistCard(BaseModel):
    id: UUID
    user_id: UUID
    display_name: str
    username: Optional[str] = None
    bio: Optional[str] = None
    band_type: str = "Solo"
    total_members: int = 1
    years_of_experience: int = 0
    city: Optional[str] = None
    state: Optional[str] = None
    base_rate: float = 0.0
    currency: str = "INR"
    rating: float = 5.0
    total_reviews: int = 0
    profile_image: Optional[str] = None
    cover_image: Optional[str] = None
    genres: List[CategoryBriefSchema] = Field(default_factory=list)
    languages: List[CategoryBriefSchema] = Field(default_factory=list)
    verification_status: str = "approved"
    is_featured: bool = False
    availability_status: str = "Available"
    created_at: Optional[datetime] = None
    search_score: Optional["SearchScore"] = None
    availability_info: Optional["AvailabilityStatus"] = None
    popularity_info: Optional["PopularityMetrics"] = None
    profile_completion_info: Optional["ProfileCompletion"] = None
    smart_badges: List["SmartBadge"] = Field(default_factory=list)


class ArtistPreviewResponse(BaseModel):
    id: UUID
    user_id: UUID
    display_name: str
    username: Optional[str] = None
    bio: Optional[str] = None
    band_type: str = "Solo"
    total_members: int = 1
    years_of_experience: int = 0
    city: Optional[str] = None
    state: Optional[str] = None
    base_rate: float = 0.0
    currency: str = "INR"
    rating: float = 5.0
    total_reviews: int = 0
    profile_image: Optional[str] = None
    cover_image: Optional[str] = None
    gallery: List[str] = Field(default_factory=list)
    videos: List[str] = Field(default_factory=list)
    genres: List[CategoryBriefSchema] = Field(default_factory=list)
    languages: List[CategoryBriefSchema] = Field(default_factory=list)
    social_links: Dict[str, Any] = Field(default_factory=dict)
    achievements: List[str] = Field(default_factory=list)
    verification_status: str = "approved"
    is_featured: bool = False
    availability_indicator: str = "Available for booking"
    created_at: Optional[datetime] = None


class ArtistFilterOptionsResponse(BaseModel):
    genres: List[str] = Field(default_factory=list)
    categories: List[str] = Field(default_factory=list)
    cities: List[str] = Field(default_factory=list)
    states: List[str] = Field(default_factory=list)
    band_types: List[str] = Field(default_factory=list)
    sort_options: List[Dict[str, str]] = Field(default_factory=list)


class MarketplaceVenueCard(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    venue_number: Optional[str] = None
    venue_type: Optional[str] = None
    description: Optional[str] = None
    address: str
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    base_price: float = 0.0
    capacity: int = 0
    min_capacity: int = 0
    rating: float = 5.0
    total_reviews: int = 0
    image: Optional[str] = None
    gallery: List[str] = Field(default_factory=list)
    facilities: List[str] = Field(default_factory=list)
    categories: List[CategoryBriefSchema] = Field(default_factory=list)
    verification_status: str = "approved"
    is_featured: bool = False
    availability_status: str = "Available"
    created_at: Optional[datetime] = None
    search_score: Optional["SearchScore"] = None
    availability_info: Optional["AvailabilityStatus"] = None
    popularity_info: Optional["PopularityMetrics"] = None
    profile_completion_info: Optional["ProfileCompletion"] = None
    smart_badges: List["SmartBadge"] = Field(default_factory=list)


class VenuePreviewResponse(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    venue_number: Optional[str] = None
    venue_type: Optional[str] = None
    description: Optional[str] = None
    address: str
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    base_price: float = 0.0
    capacity: int = 0
    min_capacity: int = 0
    rating: float = 5.0
    total_reviews: int = 0
    image: Optional[str] = None
    gallery: List[str] = Field(default_factory=list)
    facilities: List[str] = Field(default_factory=list)
    categories: List[CategoryBriefSchema] = Field(default_factory=list)
    pricing_details: Dict[str, Any] = Field(default_factory=dict)
    availability_rules: Dict[str, Any] = Field(default_factory=dict)
    verification_status: str = "approved"
    is_featured: bool = False
    availability_indicator: str = "Open for booking"
    created_at: Optional[datetime] = None


class VenueFilterOptionsResponse(BaseModel):
    venue_types: List[str] = Field(default_factory=list)
    cities: List[str] = Field(default_factory=list)
    states: List[str] = Field(default_factory=list)
    capacity_ranges: List[Dict[str, Any]] = Field(default_factory=list)
    sort_options: List[Dict[str, str]] = Field(default_factory=list)


class LocationGroupResponse(BaseModel):
    country: str = "India"
    popular_cities: List[str] = Field(default_factory=list)
    states: List[str] = Field(default_factory=list)
    union_territories: List[str] = Field(default_factory=list)


class MarketplaceHomeResponse(BaseModel):
    featured_artists: List[MarketplaceArtistCard] = Field(default_factory=list)
    featured_venues: List[MarketplaceVenueCard] = Field(default_factory=list)
    categories: List[CategoryBriefSchema] = Field(default_factory=list)
    locations: LocationGroupResponse


class FeaturedMarketplaceResponse(BaseModel):
    top_artists: List[MarketplaceArtistCard] = Field(default_factory=list)
    top_venues: List[MarketplaceVenueCard] = Field(default_factory=list)
    latest_artists: List[MarketplaceArtistCard] = Field(default_factory=list)
    latest_venues: List[MarketplaceVenueCard] = Field(default_factory=list)


class MarketplacePaginationSchema(BaseModel):
    total: int
    page: int
    limit: int
    pages: int


class MarketplaceListResponse(BaseModel, Generic[T]):
    items: List[T]
    pagination: MarketplacePaginationSchema


class MarketplaceFilterQuery(BaseModel):
    query: Optional[str] = None
    category: Optional[str] = None
    location: Optional[str] = None
    genre: Optional[str] = None
    venue_type: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    min_capacity: Optional[int] = None
    min_rating: Optional[float] = None
    verified_only: bool = False
    featured_only: bool = False
    availability_filter: Optional[str] = (
        "all"  # "all" | "today" | "tomorrow" | "this_week" | "custom"
    )
    event_date: Optional[str] = None  # YYYY-MM-DD for custom date search
    page: int = 1
    limit: int = 20
    sort_by: str = "best_match"
    sort_order: str = "desc"


# ─── Phase 5: Smart Ranking & Availability (defined before card schemas) ───


class SearchScore(BaseModel):
    """Detailed score breakdown calculated by the Ranking Engine."""

    total_score: float = 0.0
    match_score: float = 0.0
    category_score: float = 0.0
    location_score: float = 0.0
    verification_score: float = 0.0
    featured_score: float = 0.0
    rating_score: float = 0.0
    popularity_score: float = 0.0
    availability_score: float = 0.0
    completeness_score: float = 0.0
    recency_score: float = 0.0


class AvailabilityStatus(BaseModel):
    """Real-time availability status derived from Booking module."""

    status: str = "available"
    is_available: bool = True
    next_available_date: Optional[str] = None
    indicator_label: str = "Available for booking"


class PopularityMetrics(BaseModel):
    """Aggregated popularity statistics."""

    total_bookings: int = 0
    total_reviews: int = 0
    average_rating: float = 5.0
    popularity_score: float = 0.0
    popularity_level: str = "Popular"


class ProfileCompletion(BaseModel):
    """Profile completeness score and field status."""

    percentage: int = 100
    missing_fields: List[str] = Field(default_factory=list)
    is_complete: bool = True


class SmartBadge(BaseModel):
    """Smart badge metadata for display on card & preview components."""

    key: str
    label: str
    variant: str = "default"


class MarketplaceRankingResponse(BaseModel):
    query: Optional[str] = None
    total: int = 0
    items: List[Dict[str, Any]] = Field(default_factory=list)
    pagination: Optional["MarketplacePaginationSchema"] = None


class MarketplaceAvailabilityResponse(BaseModel):
    entity_type: str
    entity_id: UUID
    availability: AvailabilityStatus


# ─── Phase 4: Advanced Search & Discovery ────────────────────────────────────


class SearchSuggestion(BaseModel):
    """Single autocomplete suggestion item."""

    type: str  # "artist" | "venue" | "genre" | "city" | "state"
    value: str  # The raw value to use as search query
    display: str  # Human-readable label shown in dropdown
    subtitle: Optional[str] = None  # e.g. city name for artist suggestions


class SearchSuggestionsResponse(BaseModel):
    query: str
    suggestions: List[SearchSuggestion] = Field(default_factory=list)
    total: int = 0


class GlobalSearchResultItem(BaseModel):
    """Unified result item representing either an artist or a venue."""

    entity_type: str  # "artist" | "venue"
    id: UUID
    display_name: str  # artist display_name or venue name
    subtitle: Optional[str] = None  # band_type / venue_type
    city: Optional[str] = None
    state: Optional[str] = None
    image: Optional[str] = None
    rating: float = 5.0
    total_reviews: int = 0
    base_price: float = 0.0
    currency: str = "INR"
    tags: List[str] = Field(default_factory=list)  # genres or categories
    verification_status: str = "approved"
    is_featured: bool = False
    created_at: Optional[datetime] = None
    # Phase 5 Smart Ranking & Badges
    search_score: Optional[SearchScore] = None
    availability_info: Optional[AvailabilityStatus] = None
    popularity_info: Optional[PopularityMetrics] = None
    profile_completion_info: Optional[ProfileCompletion] = None
    smart_badges: List[SmartBadge] = Field(default_factory=list)


class GlobalSearchResponse(BaseModel):
    query: str
    location: Optional[str] = None
    total: int = 0
    artists: List[GlobalSearchResultItem] = Field(default_factory=list)
    venues: List[GlobalSearchResultItem] = Field(default_factory=list)
    pagination: Optional[MarketplacePaginationSchema] = None


class PopularSearchItem(BaseModel):
    label: str
    query: str
    category: str = "general"  # "genre" | "city" | "event_type" | "general"


class PopularSearchesResponse(BaseModel):
    items: List[PopularSearchItem] = Field(default_factory=list)
