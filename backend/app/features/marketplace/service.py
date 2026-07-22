"""
Service layer for Marketplace Search & Discovery.
Orchestrates discovery searches, home page aggregations, and schema transformations.
"""

from typing import Any, Dict, List, Optional, Set
from uuid import UUID
from datetime import date, datetime, timedelta
from sqlalchemy.orm import Session

from app.features.marketplace.constants import (
    POPULAR_CITIES,
    INDIAN_STATES,
    UNION_TERRITORIES,
    POPULAR_SEARCHES,
    RANKING_WEIGHTS,
)
from app.features.marketplace.schemas import (
    MarketplaceArtistCard,
    MarketplaceVenueCard,
    MarketplaceHomeResponse,
    FeaturedMarketplaceResponse,
    MarketplaceListResponse,
    MarketplacePaginationSchema,
    LocationGroupResponse,
    CategoryBriefSchema,
    ArtistFilterOptionsResponse,
    ArtistPreviewResponse,
    VenueFilterOptionsResponse,
    VenuePreviewResponse,
    # Phase 4
    SearchSuggestion,
    SearchSuggestionsResponse,
    GlobalSearchResultItem,
    GlobalSearchResponse,
    PopularSearchItem,
    PopularSearchesResponse,
    # Phase 5
    SearchScore,
    AvailabilityStatus,
    PopularityMetrics,
    ProfileCompletion,
    SmartBadge,
    MarketplaceRankingResponse,
)
from app.features.marketplace.repository import (
    marketplace_repository,
    MarketplaceRepository,
)
from app.features.categories.models import Category
from app.features.artists.models import ArtistProfile
from app.features.venues.models import Venue
from app.core.cache import cache_get, cache_set


class MarketplaceService:
    """Service layer executing marketplace discovery orchestration."""

    def __init__(self, repo: MarketplaceRepository = marketplace_repository):
        self.repository = repo

    def _cache_key(self, name: str, suffix: str | None = None) -> str:
        return f"marketplace:{name}" if not suffix else f"marketplace:{name}:{suffix}"

    def _get_cached(self, name: str, suffix: str | None = None):
        return cache_get(self._cache_key(name, suffix))

    def _set_cached(self, name: str, value: Any, ttl: int = 30, suffix: str | None = None):
        cache_set(self._cache_key(name, suffix), value, ttl=ttl)

    def get_locations(self) -> LocationGroupResponse:
        """Returns structured India location options for marketplace discovery filters."""
        cached = self._get_cached("locations")
        if cached:
            return LocationGroupResponse(**cached)

        response = LocationGroupResponse(
            country="India",
            popular_cities=POPULAR_CITIES,
            states=INDIAN_STATES,
            union_territories=UNION_TERRITORIES,
        )
        self._set_cached("locations", response.model_dump(mode="json"), ttl=3600)
        return response

    def get_marketplace_home(self, db: Session) -> MarketplaceHomeResponse:
        """Aggregates homepage discovery payload: featured artists, featured venues, categories, location options."""
        cached = self._get_cached("home")
        if cached:
            return MarketplaceHomeResponse(**cached)

        featured_artists = self.repository.get_featured_artists(db, limit=6)
        featured_venues = self.repository.get_featured_venues(db, limit=6)

        # Retrieve public categories
        categories = (
            db.query(Category)
            .filter(Category.is_active.is_(True), Category.deleted_at.is_(None))
            .order_by(Category.name.asc())
            .limit(12)
            .all()
        )

        all_target_ids = [a.id for a in featured_artists] + [
            v.id for v in featured_venues
        ]
        review_counts = self.repository.get_review_counts_for_entities(
            db, all_target_ids
        )

        mapped_artists = [
            self._map_artist_card(a, review_counts.get(a.id, 0))
            for a in featured_artists
        ]
        mapped_venues = [
            self._map_venue_card(v, review_counts.get(v.id, 0)) for v in featured_venues
        ]
        mapped_categories = [
            CategoryBriefSchema(id=c.id, name=c.name, slug=None, type=c.type)
            for c in categories
        ]

        response = MarketplaceHomeResponse(
            featured_artists=mapped_artists,
            featured_venues=mapped_venues,
            categories=mapped_categories,
            locations=self.get_locations(),
        )
        self._set_cached("home", response.model_dump(mode="json"), ttl=30)
        return response

    def get_featured(self, db: Session) -> FeaturedMarketplaceResponse:
        """Returns top-rated and latest marketplace performers and venue listings."""
        top_artists = self.repository.get_featured_artists(db, limit=6)
        top_venues = self.repository.get_featured_venues(db, limit=6)
        latest_artists = self.repository.get_latest_artists(db, limit=6)
        latest_venues = self.repository.get_latest_venues(db, limit=6)

        all_target_ids = [a.id for a in (top_artists + latest_artists)] + [
            v.id for v in (top_venues + latest_venues)
        ]
        review_counts = self.repository.get_review_counts_for_entities(
            db, all_target_ids
        )

        return FeaturedMarketplaceResponse(
            top_artists=[
                self._map_artist_card(a, review_counts.get(a.id, 0))
                for a in top_artists
            ],
            top_venues=[
                self._map_venue_card(v, review_counts.get(v.id, 0)) for v in top_venues
            ],
            latest_artists=[
                self._map_artist_card(a, review_counts.get(a.id, 0))
                for a in latest_artists
            ],
            latest_venues=[
                self._map_venue_card(v, review_counts.get(v.id, 0))
                for v in latest_venues
            ],
        )

    def search_artists(
        self,
        db: Session,
        query: Optional[str] = None,
        category: Optional[str] = None,
        location: Optional[str] = None,
        page: int = 1,
        limit: int = 20,
        sort_by: str = "best_match",
        sort_order: str = "desc",
        availability_filter: str = "all",
        event_date: Optional[str] = None,
    ) -> MarketplaceListResponse[MarketplaceArtistCard]:
        use_ranked = (
            sort_by
            in (
                "best_match",
                "popularity",
                "booked",
                "reviews",
                "availability",
            )
            or availability_filter != "all"
        )

        if use_ranked:
            items, total = self.repository.search_artists_ranked(
                db, query=query, category=category, location=location
            )
        else:
            offset = (page - 1) * limit
            items, total = self.repository.search_artists(
                db,
                query=query,
                category=category,
                location=location,
                offset=offset,
                limit=limit,
                sort_by=sort_by,
                sort_order=sort_order,
            )

        entity_ids = [a.id for a in items]
        review_counts = self.repository.get_review_counts_for_entities(db, entity_ids)
        availability_map = self.get_batch_availability(db, "artist", entity_ids, target_date=event_date)
        popularity_map = self.get_popularity_metrics_for_entities(db, "artist", entity_ids)
        completion_map = {
            a.id: ProfileCompletion(**self.repository.calculate_artist_profile_completion(a))
            for a in items
        }

        mapped_items = [
            self.decorate_artist_card(
                db,
                a,
                query=query,
                category=category,
                location=location,
                target_date=event_date,
                review_count=review_counts.get(a.id, 0),
                availability=availability_map.get(a.id),
                popularity=popularity_map.get(a.id),
                completeness=completion_map.get(a.id),
            )
            for a in items
        ]

        mapped_items = self._apply_availability_filter(
            mapped_items, availability_filter, event_date
        )
        mapped_items = self._sort_artist_cards(mapped_items, sort_by, sort_order)

        if use_ranked:
            total = len(mapped_items)
            start = (page - 1) * limit
            mapped_items = mapped_items[start : start + limit]

        pages = (total + limit - 1) // limit if limit > 0 else 0
        pagination = MarketplacePaginationSchema(
            total=total, page=page, limit=limit, pages=pages
        )

        return MarketplaceListResponse(items=mapped_items, pagination=pagination)

    def search_venues(
        self,
        db: Session,
        query: Optional[str] = None,
        category: Optional[str] = None,
        location: Optional[str] = None,
        page: int = 1,
        limit: int = 20,
        sort_by: str = "best_match",
        sort_order: str = "desc",
        availability_filter: str = "all",
        event_date: Optional[str] = None,
        venue_type: Optional[str] = None,
        city: Optional[str] = None,
        state: Optional[str] = None,
        min_capacity: Optional[int] = None,
    ) -> MarketplaceListResponse[MarketplaceVenueCard]:
        use_ranked = (
            sort_by
            in (
                "best_match",
                "popularity",
                "booked",
                "reviews",
                "availability",
            )
            or availability_filter != "all"
        )

        if use_ranked:
            items, total = self.repository.search_venues_ranked(
                db,
                query=query,
                category=category,
                location=location,
                venue_type=venue_type,
                city=city,
                state=state,
                min_capacity=min_capacity,
            )
        else:
            offset = (page - 1) * limit
            items, total = self.repository.search_venues(
                db,
                query=query,
                category=category,
                location=location,
                venue_type=venue_type,
                city=city,
                state=state,
                min_capacity=min_capacity,
                offset=offset,
                limit=limit,
                sort_by=sort_by,
                sort_order=sort_order,
            )

        entity_ids = [v.id for v in items]
        review_counts = self.repository.get_review_counts_for_entities(db, entity_ids)
        availability_map = self.get_batch_availability(db, "venue", entity_ids, target_date=event_date)
        popularity_map = self.get_popularity_metrics_for_entities(db, "venue", entity_ids)
        completion_map = {
            v.id: ProfileCompletion(**self.repository.calculate_venue_profile_completion(v))
            for v in items
        }

        mapped_items = [
            self.decorate_venue_card(
                db,
                v,
                query=query,
                category=category,
                location=location,
                target_date=event_date,
                review_count=review_counts.get(v.id, 0),
                availability=availability_map.get(v.id),
                popularity=popularity_map.get(v.id),
                completeness=completion_map.get(v.id),
            )
            for v in items
        ]

        mapped_items = self._apply_availability_filter(
            mapped_items, availability_filter, event_date
        )
        mapped_items = self._sort_venue_cards(mapped_items, sort_by, sort_order)

        if use_ranked:
            total = len(mapped_items)
            start = (page - 1) * limit
            mapped_items = mapped_items[start : start + limit]

        pages = (total + limit - 1) // limit if limit > 0 else 0

        pagination = MarketplacePaginationSchema(
            total=total, page=page, limit=limit, pages=pages
        )

        return MarketplaceListResponse(items=mapped_items, pagination=pagination)

    def get_categories(self, db: Session) -> List[CategoryBriefSchema]:
        cached = self._get_cached("categories")
        if cached:
            return [CategoryBriefSchema(**c) for c in cached]

        categories = (
            db.query(Category)
            .filter(Category.is_active.is_(True), Category.deleted_at.is_(None))
            .order_by(Category.name.asc())
            .all()
        )
        result = [
            CategoryBriefSchema(id=c.id, name=c.name, slug=None, type=c.type)
            for c in categories
        ]
        self._set_cached("categories", [c.model_dump(mode="json") for c in result], ttl=120)
        return result

    def get_popular_artists(
        self, db: Session, limit: int = 6
    ) -> List[MarketplaceArtistCard]:
        artists = self.repository.get_popular_artists(db, limit=limit)
        review_counts = self.repository.get_review_counts_for_entities(
            db, [a.id for a in artists]
        )
        return [self._map_artist_card(a, review_counts.get(a.id, 0)) for a in artists]

    def get_recent_artists(
        self, db: Session, limit: int = 6
    ) -> List[MarketplaceArtistCard]:
        artists = self.repository.get_latest_artists(db, limit=limit)
        review_counts = self.repository.get_review_counts_for_entities(
            db, [a.id for a in artists]
        )
        return [self._map_artist_card(a, review_counts.get(a.id, 0)) for a in artists]

    def get_artist_filters(self, db: Session) -> ArtistFilterOptionsResponse:
        cached = self._get_cached("artist_filters")
        if cached:
            return ArtistFilterOptionsResponse(**cached)

        opts = self.repository.get_artist_filter_options(db)
        response = ArtistFilterOptionsResponse(**opts)
        self._set_cached("artist_filters", response.model_dump(mode="json"), ttl=120)
        return response

    def get_artist_preview(
        self, db: Session, artist_id: UUID
    ) -> Optional[ArtistPreviewResponse]:
        artist = self.repository.get_artist_preview(db, artist_id)
        if not artist:
            return None
        review_counts = self.repository.get_review_counts_for_entities(db, [artist.id])
        return self._map_artist_preview(artist, review_counts.get(artist.id, 0))

    # ─── HELPER MAPPER METHODS ───────────────────────────────────────────────

    def _map_artist_card(
        self, artist: ArtistProfile, total_reviews: int = 0
    ) -> MarketplaceArtistCard:
        genres = [
            CategoryBriefSchema(id=g.id, name=g.name, slug=None, type=g.type)
            for g in (artist.genres or [])
        ]
        languages = [
            CategoryBriefSchema(id=lang.id, name=lang.name, slug=None, type=lang.type)
            for lang in (artist.languages or [])
        ]
        return MarketplaceArtistCard(
            id=artist.id,
            user_id=artist.user_id,
            display_name=artist.display_name or artist.username or "Artist",
            username=artist.username,
            bio=artist.bio,
            band_type=artist.band_type or "Solo",
            total_members=artist.total_members or 1,
            years_of_experience=artist.years_of_experience or 0,
            city=artist.city,
            state=artist.state,
            base_rate=float(artist.base_rate or 0.0),
            currency=artist.currency or "INR",
            rating=float(artist.rating or 5.0),
            total_reviews=total_reviews,
            profile_image=artist.profile_image,
            cover_image=artist.cover_image,
            genres=genres,
            languages=languages,
            verification_status=artist.verification_status,
            is_featured=bool(artist.rating and float(artist.rating) >= 4.8),
            availability_status="Available",
            created_at=artist.created_at,
        )

    def _map_artist_preview(
        self, artist: ArtistProfile, total_reviews: int = 0
    ) -> ArtistPreviewResponse:
        genres = [
            CategoryBriefSchema(id=g.id, name=g.name, slug=None, type=g.type)
            for g in (artist.genres or [])
        ]
        languages = [
            CategoryBriefSchema(id=lang.id, name=lang.name, slug=None, type=lang.type)
            for lang in (artist.languages or [])
        ]
        gallery = artist.gallery if isinstance(artist.gallery, list) else []
        videos = artist.videos if isinstance(artist.videos, list) else []
        social = artist.social_links if isinstance(artist.social_links, dict) else {}
        achievements = (
            artist.achievements if isinstance(artist.achievements, list) else []
        )

        return ArtistPreviewResponse(
            id=artist.id,
            user_id=artist.user_id,
            display_name=artist.display_name or artist.username or "Artist",
            username=artist.username,
            bio=artist.bio,
            band_type=artist.band_type or "Solo",
            total_members=artist.total_members or 1,
            years_of_experience=artist.years_of_experience or 0,
            city=artist.city,
            state=artist.state,
            base_rate=float(artist.base_rate or 0.0),
            currency=artist.currency or "INR",
            rating=float(artist.rating or 5.0),
            total_reviews=total_reviews,
            profile_image=artist.profile_image,
            cover_image=artist.cover_image,
            gallery=gallery,
            videos=videos,
            genres=genres,
            languages=languages,
            social_links=social,
            achievements=achievements,
            verification_status=artist.verification_status,
            is_featured=bool(artist.rating and float(artist.rating) >= 4.8),
            availability_indicator="Available for booking",
            created_at=artist.created_at,
        )

    def get_popular_venues(
        self, db: Session, limit: int = 6
    ) -> List[MarketplaceVenueCard]:
        venues = self.repository.get_popular_venues(db, limit=limit)
        review_counts = self.repository.get_review_counts_for_entities(
            db, [v.id for v in venues]
        )
        return [self._map_venue_card(v, review_counts.get(v.id, 0)) for v in venues]

    def get_recent_venues(
        self, db: Session, limit: int = 6
    ) -> List[MarketplaceVenueCard]:
        venues = self.repository.get_latest_venues(db, limit=limit)
        review_counts = self.repository.get_review_counts_for_entities(
            db, [v.id for v in venues]
        )
        return [self._map_venue_card(v, review_counts.get(v.id, 0)) for v in venues]

    def get_venue_filters(self, db: Session) -> VenueFilterOptionsResponse:
        cached = self._get_cached("venue_filters")
        if cached:
            return VenueFilterOptionsResponse(**cached)

        opts = self.repository.get_venue_filter_options(db)
        response = VenueFilterOptionsResponse(**opts)
        self._set_cached("venue_filters", response.model_dump(mode="json"), ttl=120)
        return response

    def get_venue_preview(
        self, db: Session, venue_id: UUID
    ) -> Optional[VenuePreviewResponse]:
        venue = self.repository.get_venue_preview(db, venue_id)
        if not venue:
            return None
        review_counts = self.repository.get_review_counts_for_entities(db, [venue.id])
        return self._map_venue_preview(venue, review_counts.get(venue.id, 0))

    def _map_venue_card(
        self, venue: Venue, total_reviews: int = 0
    ) -> MarketplaceVenueCard:
        city_name = venue.city.name if venue.city else None
        categories = [
            CategoryBriefSchema(id=c.id, name=c.name, slug=None, type=c.type)
            for c in (venue.categories or [])
        ]
        gallery = venue.gallery if isinstance(venue.gallery, list) else []
        main_img = gallery[0] if gallery else None

        return MarketplaceVenueCard(
            id=venue.id,
            user_id=venue.user_id,
            name=venue.name,
            venue_number=venue.venue_number,
            venue_type=venue.venue_type,
            description=venue.description,
            address=venue.address,
            city=city_name,
            state=venue.state,
            country=venue.country or "India",
            base_price=float(venue.base_price or 0.0),
            capacity=venue.capacity or 0,
            min_capacity=venue.min_capacity or 0,
            rating=5.0,
            total_reviews=total_reviews,
            image=main_img,
            gallery=gallery,
            facilities=venue.facilities or [],
            categories=categories,
            verification_status=venue.verification_status,
            is_featured=bool(venue.capacity and venue.capacity >= 200),
            availability_status="Available",
            created_at=venue.created_at,
        )

    def _map_venue_preview(
        self, venue: Venue, total_reviews: int = 0
    ) -> VenuePreviewResponse:
        city_name = venue.city.name if venue.city else None
        categories = [
            CategoryBriefSchema(id=c.id, name=c.name, slug=None, type=c.type)
            for c in (venue.categories or [])
        ]
        gallery = venue.gallery if isinstance(venue.gallery, list) else []
        main_img = gallery[0] if gallery else None
        pricing = (
            venue.pricing_details if isinstance(venue.pricing_details, dict) else {}
        )
        availability = (
            venue.availability_rules
            if isinstance(venue.availability_rules, dict)
            else {}
        )

        return VenuePreviewResponse(
            id=venue.id,
            user_id=venue.user_id,
            name=venue.name,
            venue_number=venue.venue_number,
            venue_type=venue.venue_type,
            description=venue.description,
            address=venue.address,
            city=city_name,
            state=venue.state,
            country=venue.country or "India",
            base_price=float(venue.base_price or 0.0),
            capacity=venue.capacity or 0,
            min_capacity=venue.min_capacity or 0,
            rating=5.0,
            total_reviews=total_reviews,
            image=main_img,
            gallery=gallery,
            facilities=venue.facilities or [],
            categories=categories,
            pricing_details=pricing,
            availability_rules=availability,
            verification_status=venue.verification_status,
            is_featured=bool(venue.capacity and venue.capacity >= 200),
            availability_indicator="Open for booking",
            created_at=venue.created_at,
        )

    # ─── Phase 4: Advanced Search & Discovery ────────────────────────────────

    def get_search_suggestions(
        self,
        db: Session,
        query: str,
    ) -> SearchSuggestionsResponse:
        """Returns live autocomplete suggestions grouped by type."""
        if not query or len(query.strip()) < 2:
            return SearchSuggestionsResponse(query=query, suggestions=[], total=0)

        cache_key = self._cache_key("suggestions", query.strip().lower())
        cached = cache_get(cache_key)
        if cached is not None:
            return SearchSuggestionsResponse(**cached)

        raw = self.repository.search_suggestions(db, query.strip(), limit=10)
        suggestions = [
            SearchSuggestion(
                type=r["type"],
                value=r["value"],
                display=r["display"],
                subtitle=r.get("subtitle"),
            )
            for r in raw
        ]
        response = SearchSuggestionsResponse(
            query=query,
            suggestions=suggestions,
            total=len(suggestions),
        )
        cache_set(cache_key, response.model_dump(mode="json"), ttl=15)
        return response

    def global_search(
        self,
        db: Session,
        query: Optional[str] = None,
        location: Optional[str] = None,
        category: Optional[str] = None,
        page: int = 1,
        limit: int = 12,
    ) -> GlobalSearchResponse:
        """Unified cross-entity search returning both artists and venues."""
        offset = (page - 1) * limit
        raw_artists, raw_venues = self.repository.search_all(
            db,
            query=query,
            location=location,
            category=category,
            offset=offset,
            limit=limit,
        )

        mapped_artists: List[GlobalSearchResultItem] = []
        for a in raw_artists:
            card = self.decorate_artist_card(
                db, a, query=query, location=location, category=category
            )
            tags = [g.name for g in a.genres] if a.genres else []
            mapped_artists.append(
                GlobalSearchResultItem(
                    entity_type="artist",
                    id=a.id,
                    display_name=a.display_name or "Artist",
                    subtitle=a.band_type,
                    city=a.city,
                    state=a.state,
                    image=a.profile_image,
                    rating=float(a.rating) if a.rating else 5.0,
                    base_price=float(a.base_rate) if a.base_rate else 0.0,
                    currency=a.currency or "INR",
                    tags=tags,
                    verification_status=a.verification_status,
                    is_featured=card.is_featured,
                    created_at=a.created_at,
                    search_score=card.search_score,
                    availability_info=card.availability_info,
                    popularity_info=card.popularity_info,
                    profile_completion_info=card.profile_completion_info,
                    smart_badges=card.smart_badges,
                )
            )

        mapped_venues: List[GlobalSearchResultItem] = []
        for v in raw_venues:
            card = self.decorate_venue_card(
                db, v, query=query, location=location, category=category
            )
            tags = [c.name for c in v.categories] if v.categories else []
            mapped_venues.append(
                GlobalSearchResultItem(
                    entity_type="venue",
                    id=v.id,
                    display_name=v.name or "Venue",
                    subtitle=v.venue_type,
                    city=v.city.name if v.city else v.state,
                    state=v.state,
                    image=v.image,
                    rating=float(v.rating) if v.rating else 5.0,
                    base_price=float(v.base_price) if v.base_price else 0.0,
                    currency="INR",
                    tags=tags,
                    verification_status=v.verification_status,
                    is_featured=card.is_featured,
                    created_at=v.created_at,
                    search_score=card.search_score,
                    availability_info=card.availability_info,
                    popularity_info=card.popularity_info,
                    profile_completion_info=card.profile_completion_info,
                    smart_badges=card.smart_badges,
                )
            )

        total = len(mapped_artists) + len(mapped_venues)
        pages = max(1, -(-total // limit))  # ceiling division
        pagination = MarketplacePaginationSchema(
            total=total, page=page, limit=limit, pages=pages
        )

        return GlobalSearchResponse(
            query=query or "",
            location=location,
            total=total,
            artists=mapped_artists,
            venues=mapped_venues,
            pagination=pagination,
        )

    def get_popular_searches(self) -> PopularSearchesResponse:
        """Returns curated popular/trending search terms (static, zero DB hit)."""
        cached = self._get_cached("popular_searches")
        if cached:
            return PopularSearchesResponse(**cached)

        items = [
            PopularSearchItem(
                label=p["label"],
                query=p["query"],
                category=p["category"],
            )
            for p in POPULAR_SEARCHES
        ]
        response = PopularSearchesResponse(items=items)
        self._set_cached("popular_searches", response.model_dump(mode="json"), ttl=600)
        return response

    # ─── Phase 5: Smart Ranking & Availability Services ──────────────────────

    def get_entity_availability(
        self,
        db: Session,
        entity_type: str,
        entity_id: UUID,
        target_date: Optional[str] = None,
    ) -> AvailabilityStatus:
        """Determines real-time availability status from confirmed bookings."""
        today = date.today()
        booked_dates = self.repository.get_confirmed_booking_dates(
            db,
            entity_type,
            entity_id,
            start_date=today,
            end_date=today + timedelta(days=30),
        )

        if target_date:
            try:
                parsed_date = datetime.strptime(target_date, "%Y-%m-%d").date()
                is_booked = parsed_date in booked_dates
                if is_booked:
                    return AvailabilityStatus(
                        status="booked",
                        is_available=False,
                        indicator_label=f"Booked on {target_date}",
                    )
                else:
                    return AvailabilityStatus(
                        status="available_on_date",
                        is_available=True,
                        indicator_label=f"Available on {target_date}",
                    )
            except ValueError:
                pass

        if today not in booked_dates:
            return AvailabilityStatus(
                status="available_today",
                is_available=True,
                indicator_label="Available Today",
            )

        tomorrow = today + timedelta(days=1)
        if tomorrow not in booked_dates:
            return AvailabilityStatus(
                status="available_tomorrow",
                is_available=True,
                next_available_date=tomorrow.isoformat(),
                indicator_label="Available Tomorrow",
            )

        for i in range(2, 8):
            d = today + timedelta(days=i)
            if d not in booked_dates:
                return AvailabilityStatus(
                    status="available_this_week",
                    is_available=True,
                    next_available_date=d.isoformat(),
                    indicator_label=f"Available from {d.strftime('%b %d')}",
                )

        return AvailabilityStatus(
            status="booked",
            is_available=False,
            indicator_label="Currently Booked",
        )

    def get_popularity_metrics(
        self, db: Session, entity_type: str, entity_id: UUID
    ) -> PopularityMetrics:
        """Computes popularity metrics for an entity."""
        stats = self.repository.get_popularity_stats(db, entity_type, entity_id)
        return self._build_popularity_metrics(stats)

    def get_popularity_metrics_for_entities(
        self, db: Session, entity_type: str, entity_ids: List[UUID]
    ) -> Dict[UUID, PopularityMetrics]:
        stats_map = self.repository.get_popularity_stats_for_entities(
            db, entity_type, entity_ids
        )
        return {
            entity_id: self._build_popularity_metrics(stats or {})
            for entity_id, stats in stats_map.items()
        }

    def _build_popularity_metrics(
        self, stats: Dict[str, Any]
    ) -> PopularityMetrics:
        tb = stats.get("total_bookings", 0) or 0
        tr = stats.get("total_reviews", 0) or 0
        ar = float(stats.get("average_rating", 5.0) or 5.0)

        pop_score = min(100.0, float(tb * 15 + tr * 5 + ar * 10))
        if tb >= 10:
            level = "Highly Booked"
        elif ar >= 4.8 and tr >= 5:
            level = "Top Rated"
        elif pop_score >= 40:
            level = "Popular"
        else:
            level = "Normal"

        return PopularityMetrics(
            total_bookings=tb,
            total_reviews=tr,
            average_rating=ar,
            popularity_score=pop_score,
            popularity_level=level,
        )

    def get_profile_completion(
        self, db: Session, entity_type: str, entity_id: UUID
    ) -> ProfileCompletion:
        """Calculates profile completion percentage."""
        if entity_type == "artist":
            artist = (
                db.query(ArtistProfile).filter(ArtistProfile.id == entity_id).first()
            )
            if not artist:
                return ProfileCompletion()
            data = self.repository.calculate_artist_profile_completion(artist)
        else:
            venue = db.query(Venue).filter(Venue.id == entity_id).first()
            if not venue:
                return ProfileCompletion()
            data = self.repository.calculate_venue_profile_completion(venue)

        return ProfileCompletion(
            percentage=data["percentage"],
            missing_fields=data["missing_fields"],
            is_complete=data["is_complete"],
        )

    def get_batch_availability(
        self,
        db: Session,
        entity_type: str,
        entity_ids: List[UUID],
        target_date: Optional[str] = None,
    ) -> Dict[UUID, AvailabilityStatus]:
        if not entity_ids:
            return {}

        today = date.today()
        booking_ranges = self.repository.get_confirmed_booking_dates_for_entities(
            db,
            entity_type,
            entity_ids,
            start_date=today,
            end_date=today + timedelta(days=30),
        )

        results: Dict[UUID, AvailabilityStatus] = {}
        for entity_id, booked_dates in booking_ranges.items():
            results[entity_id] = self._build_availability_status(booked_dates, target_date)
        return results

    def _build_availability_status(
        self,
        booked_dates: Set[date],
        target_date: Optional[str] = None,
    ) -> AvailabilityStatus:
        today = date.today()
        if target_date:
            try:
                parsed_date = datetime.strptime(target_date, "%Y-%m-%d").date()
                if parsed_date in booked_dates:
                    return AvailabilityStatus(
                        status="booked",
                        is_available=False,
                        indicator_label=f"Booked on {target_date}",
                    )
                return AvailabilityStatus(
                    status="available_on_date",
                    is_available=True,
                    indicator_label=f"Available on {target_date}",
                )
            except ValueError:
                pass

        if today not in booked_dates:
            return AvailabilityStatus(
                status="available_today",
                is_available=True,
                indicator_label="Available Today",
            )

        tomorrow = today + timedelta(days=1)
        if tomorrow not in booked_dates:
            return AvailabilityStatus(
                status="available_tomorrow",
                is_available=True,
                next_available_date=tomorrow.isoformat(),
                indicator_label="Available Tomorrow",
            )

        for i in range(2, 8):
            d = today + timedelta(days=i)
            if d not in booked_dates:
                return AvailabilityStatus(
                    status="available_this_week",
                    is_available=True,
                    next_available_date=d.isoformat(),
                    indicator_label=f"Available from {d.strftime('%b %d')}",
                )

        return AvailabilityStatus(
            status="booked",
            is_available=False,
            indicator_label="Currently Booked",
        )

    def calculate_search_score(
        self,
        entity_name: str,
        entity_type: str,
        query: Optional[str],
        category: Optional[str],
        location: Optional[str],
        verification_status: str,
        is_featured: bool,
        rating: float,
        popularity: PopularityMetrics,
        availability: AvailabilityStatus,
        completeness: ProfileCompletion,
        created_at: Optional[datetime],
        city: Optional[str] = None,
        state: Optional[str] = None,
        tags: Optional[List[str]] = None,
    ) -> SearchScore:
        """Deterministic SearchScore Calculator using RANKING_WEIGHTS from constants.py."""
        weights = RANKING_WEIGHTS
        q_lower = query.lower().strip() if query else ""
        name_lower = entity_name.lower().strip() if entity_name else ""

        match_score = 0.0
        if q_lower:
            if q_lower == name_lower:
                match_score = float(weights["exact_match"])
            elif q_lower in name_lower or name_lower in q_lower:
                match_score = float(weights["exact_match"]) * 0.7
            elif city and q_lower in city.lower():
                match_score = float(weights["exact_match"]) * 0.4
            elif state and q_lower in state.lower():
                match_score = float(weights["exact_match"]) * 0.3
            else:
                match_score = float(weights["exact_match"]) * 0.1
        else:
            match_score = float(weights["exact_match"]) * 0.5

        category_score = 0.0
        if category:
            cat_lower = category.lower().strip()
            if tags and any(cat_lower in t.lower() for t in tags):
                category_score = float(weights["category_match"])
            else:
                category_score = float(weights["category_match"]) * 0.2
        else:
            category_score = float(weights["category_match"]) * 0.5

        location_score = 0.0
        if location:
            loc_lower = location.lower().strip()
            if (city and loc_lower in city.lower()) or (
                state and loc_lower in state.lower()
            ):
                location_score = float(weights["location_match"])
            else:
                location_score = float(weights["location_match"]) * 0.2
        else:
            location_score = float(weights["location_match"]) * 0.5

        verification_score = (
            float(weights["verified"]) if verification_status == "approved" else 0.0
        )
        featured_score = float(weights["featured"]) if is_featured else 0.0
        rating_score = (max(0.0, min(5.0, rating)) / 5.0) * float(
            weights["average_rating"]
        )
        popularity_score = (min(100.0, popularity.popularity_score) / 100.0) * float(
            weights["popularity"]
        )

        if availability.status == "available_today":
            availability_score = float(weights["availability"])
        elif availability.status == "available_tomorrow":
            availability_score = float(weights["availability"]) * 0.8
        elif availability.status in ["available_this_week", "available_on_date"]:
            availability_score = float(weights["availability"]) * 0.6
        else:
            availability_score = float(weights["availability"]) * 0.2

        completeness_score = (completeness.percentage / 100.0) * float(
            weights["profile_completeness"]
        )

        recency_score = 0.0
        if created_at:
            days_old = (datetime.utcnow() - created_at.replace(tzinfo=None)).days
            if days_old <= 30:
                recency_score = float(weights["recent_activity"])
            elif days_old <= 90:
                recency_score = float(weights["recent_activity"]) * 0.6
            else:
                recency_score = float(weights["recent_activity"]) * 0.2
        else:
            recency_score = float(weights["recent_activity"]) * 0.5

        total = (
            match_score
            + category_score
            + location_score
            + verification_score
            + featured_score
            + rating_score
            + popularity_score
            + availability_score
            + completeness_score
            + recency_score
        )

        return SearchScore(
            total_score=round(total, 2),
            match_score=round(match_score, 2),
            category_score=round(category_score, 2),
            location_score=round(location_score, 2),
            verification_score=round(verification_score, 2),
            featured_score=round(featured_score, 2),
            rating_score=round(rating_score, 2),
            popularity_score=round(popularity_score, 2),
            availability_score=round(availability_score, 2),
            completeness_score=round(completeness_score, 2),
            recency_score=round(recency_score, 2),
        )

    def generate_smart_badges(
        self,
        verification_status: str,
        is_featured: bool,
        rating: float,
        popularity: PopularityMetrics,
        availability: AvailabilityStatus,
        completeness: ProfileCompletion,
        created_at: Optional[datetime],
    ) -> List[SmartBadge]:
        """Generates smart badges for UI presentation."""
        badges: List[SmartBadge] = []
        if verification_status == "approved":
            badges.append(
                SmartBadge(key="verified", label="Verified", variant="success")
            )
        if is_featured:
            badges.append(
                SmartBadge(key="featured", label="Featured", variant="warning")
            )
        if availability.status == "available_today":
            badges.append(
                SmartBadge(
                    key="available_today", label="Available Today", variant="info"
                )
            )
        elif availability.status in ["available_tomorrow", "available_this_week"]:
            badges.append(
                SmartBadge(key="available_soon", label="Available Soon", variant="info")
            )

        if rating >= 4.8 and popularity.total_reviews >= 3:
            badges.append(
                SmartBadge(key="top_rated", label="Top Rated", variant="purple")
            )
        if popularity.total_bookings >= 5:
            badges.append(
                SmartBadge(
                    key="highly_booked", label="Highly Booked", variant="primary"
                )
            )
        elif popularity.popularity_level in ["Popular", "Highly Booked"]:
            badges.append(SmartBadge(key="popular", label="Popular", variant="primary"))

        if completeness.is_complete:
            badges.append(
                SmartBadge(
                    key="profile_complete", label="100% Profile", variant="success"
                )
            )

        if created_at:
            days_old = (datetime.utcnow() - created_at.replace(tzinfo=None)).days
            if days_old <= 30:
                badges.append(
                    SmartBadge(
                        key="new_listing", label="New Listing", variant="warning"
                    )
                )

        return badges

    def decorate_artist_card(
        self,
        db: Session,
        artist: ArtistProfile,
        query: Optional[str] = None,
        category: Optional[str] = None,
        location: Optional[str] = None,
        target_date: Optional[str] = None,
        review_count: int = 0,
        availability: Optional[AvailabilityStatus] = None,
        popularity: Optional[PopularityMetrics] = None,
        completeness: Optional[ProfileCompletion] = None,
    ) -> MarketplaceArtistCard:
        """Decorates an artist card with Phase 5 ranking scores, availability, popularity, completeness, and smart badges."""
        base_card = self._map_artist_card(artist, review_count)
        availability = availability or self.get_entity_availability(
            db, "artist", artist.id, target_date
        )
        popularity = popularity or self.get_popularity_metrics(db, "artist", artist.id)
        completeness = completeness or self.get_profile_completion(db, "artist", artist.id)

        genres_tags = [g.name for g in artist.genres] if artist.genres else []
        score = self.calculate_search_score(
            entity_name=artist.display_name,
            entity_type="artist",
            query=query,
            category=category,
            location=location,
            verification_status=artist.verification_status,
            is_featured=base_card.is_featured,
            rating=float(artist.rating) if artist.rating else 5.0,
            popularity=popularity,
            availability=availability,
            completeness=completeness,
            created_at=artist.created_at,
            city=artist.city,
            state=artist.state,
            tags=genres_tags,
        )
        badges = self.generate_smart_badges(
            verification_status=artist.verification_status,
            is_featured=base_card.is_featured,
            rating=float(artist.rating) if artist.rating else 5.0,
            popularity=popularity,
            availability=availability,
            completeness=completeness,
            created_at=artist.created_at,
        )

        base_card.search_score = score
        base_card.availability_info = availability
        base_card.availability_status = availability.indicator_label
        base_card.popularity_info = popularity
        base_card.profile_completion_info = completeness
        base_card.smart_badges = badges
        return base_card

    def decorate_venue_card(
        self,
        db: Session,
        venue: Venue,
        query: Optional[str] = None,
        category: Optional[str] = None,
        location: Optional[str] = None,
        target_date: Optional[str] = None,
        review_count: int = 0,
        availability: Optional[AvailabilityStatus] = None,
        popularity: Optional[PopularityMetrics] = None,
        completeness: Optional[ProfileCompletion] = None,
    ) -> MarketplaceVenueCard:
        """Decorates a venue card with Phase 5 ranking scores, availability, popularity, completeness, and smart badges."""
        base_card = self._map_venue_card(venue, review_count)
        availability = availability or self.get_entity_availability(db, "venue", venue.id, target_date)
        popularity = popularity or self.get_popularity_metrics(db, "venue", venue.id)
        completeness = completeness or self.get_profile_completion(db, "venue", venue.id)

        cat_tags = [c.name for c in venue.categories] if venue.categories else []
        score = self.calculate_search_score(
            entity_name=venue.name,
            entity_type="venue",
            query=query,
            category=category,
            location=location,
            verification_status=venue.verification_status,
            is_featured=base_card.is_featured,
            rating=float(venue.rating) if venue.rating else 5.0,
            popularity=popularity,
            availability=availability,
            completeness=completeness,
            created_at=venue.created_at,
            city=venue.city.name if venue.city else venue.state,
            state=venue.state,
            tags=cat_tags,
        )
        badges = self.generate_smart_badges(
            verification_status=venue.verification_status,
            is_featured=base_card.is_featured,
            rating=float(venue.rating) if venue.rating else 5.0,
            popularity=popularity,
            availability=availability,
            completeness=completeness,
            created_at=venue.created_at,
        )

        base_card.search_score = score
        base_card.availability_info = availability
        base_card.availability_status = availability.indicator_label
        base_card.popularity_info = popularity
        base_card.profile_completion_info = completeness
        base_card.smart_badges = badges
        return base_card

    def _matches_availability_filter(
        self,
        availability: Optional[AvailabilityStatus],
        availability_filter: str,
        event_date: Optional[str] = None,
    ) -> bool:
        if availability_filter == "all":
            return True
        if not availability:
            return False

        status = availability.status
        if availability_filter == "today":
            return status == "available_today"
        if availability_filter == "tomorrow":
            return status in ("available_today", "available_tomorrow")
        if availability_filter == "this_week":
            return status in (
                "available_today",
                "available_tomorrow",
                "available_this_week",
            )
        if availability_filter == "custom" and event_date:
            return status == "available_on_date" and availability.is_available
        return True

    def _apply_availability_filter(
        self,
        items: List[Any],
        availability_filter: str,
        event_date: Optional[str] = None,
    ) -> List[Any]:
        if availability_filter == "all":
            return items
        return [
            item
            for item in items
            if self._matches_availability_filter(
                getattr(item, "availability_info", None),
                availability_filter,
                event_date,
            )
        ]

    def _sort_artist_cards(
        self,
        items: List[MarketplaceArtistCard],
        sort_by: str,
        sort_order: str,
    ) -> List[MarketplaceArtistCard]:
        reverse = sort_order != "asc"

        def score_total(card: MarketplaceArtistCard) -> float:
            return card.search_score.total_score if card.search_score else 0.0

        if sort_by == "best_match":
            return sorted(items, key=score_total, reverse=True)
        if sort_by == "rating":
            return sorted(items, key=lambda c: c.rating, reverse=reverse)
        if sort_by == "popularity":
            return sorted(
                items,
                key=lambda c: c.popularity_info.popularity_score
                if c.popularity_info
                else 0.0,
                reverse=reverse,
            )
        if sort_by == "booked":
            return sorted(
                items,
                key=lambda c: c.popularity_info.total_bookings
                if c.popularity_info
                else 0,
                reverse=reverse,
            )
        if sort_by == "reviews":
            return sorted(items, key=lambda c: c.total_reviews, reverse=reverse)
        if sort_by == "availability":
            return sorted(
                items,
                key=lambda c: c.search_score.availability_score
                if c.search_score
                else 0.0,
                reverse=reverse,
            )
        if sort_by == "price":
            return sorted(items, key=lambda c: c.base_rate, reverse=reverse)
        if sort_by == "name":
            return sorted(items, key=lambda c: c.display_name.lower(), reverse=reverse)
        if sort_by == "created_at" and sort_order == "asc":
            return sorted(items, key=lambda c: c.created_at or datetime.min)
        return sorted(items, key=lambda c: c.created_at or datetime.min, reverse=True)

    def _sort_venue_cards(
        self,
        items: List[MarketplaceVenueCard],
        sort_by: str,
        sort_order: str,
    ) -> List[MarketplaceVenueCard]:
        reverse = sort_order != "asc"

        def score_total(card: MarketplaceVenueCard) -> float:
            return card.search_score.total_score if card.search_score else 0.0

        if sort_by == "best_match":
            return sorted(items, key=score_total, reverse=True)
        if sort_by == "rating":
            return sorted(items, key=lambda c: c.rating, reverse=reverse)
        if sort_by == "popularity":
            return sorted(
                items,
                key=lambda c: c.popularity_info.popularity_score
                if c.popularity_info
                else 0.0,
                reverse=reverse,
            )
        if sort_by == "booked":
            return sorted(
                items,
                key=lambda c: c.popularity_info.total_bookings
                if c.popularity_info
                else 0,
                reverse=reverse,
            )
        if sort_by == "reviews":
            return sorted(items, key=lambda c: c.total_reviews, reverse=reverse)
        if sort_by == "availability":
            return sorted(
                items,
                key=lambda c: c.search_score.availability_score
                if c.search_score
                else 0.0,
                reverse=reverse,
            )
        if sort_by == "price":
            return sorted(items, key=lambda c: c.base_price, reverse=reverse)
        if sort_by == "name":
            return sorted(items, key=lambda c: c.name.lower(), reverse=reverse)
        if sort_by == "capacity":
            return sorted(items, key=lambda c: c.capacity, reverse=reverse)
        if sort_by == "created_at" and sort_order == "asc":
            return sorted(items, key=lambda c: c.created_at or datetime.min)
        return sorted(items, key=lambda c: c.created_at or datetime.min, reverse=True)

    def get_ranking_results(
        self,
        db: Session,
        query: Optional[str] = None,
        location: Optional[str] = None,
        category: Optional[str] = None,
        page: int = 1,
        limit: int = 20,
    ) -> MarketplaceRankingResponse:
        """Executes cross-entity ranking and returns results sorted by best_match score."""
        global_res = self.global_search(
            db,
            query=query,
            location=location,
            category=category,
            page=page,
            limit=limit,
        )

        items_list: List[Dict[str, Any]] = []
        for art in global_res.artists:
            items_list.append(art.model_dump())
        for ven in global_res.venues:
            items_list.append(ven.model_dump())

        items_list.sort(
            key=lambda x: (x.get("search_score") or {}).get("total_score", 0.0),
            reverse=True,
        )

        return MarketplaceRankingResponse(
            query=query,
            total=len(items_list),
            items=items_list,
            pagination=global_res.pagination,
        )


marketplace_service = MarketplaceService()
