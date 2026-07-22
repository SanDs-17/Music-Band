"""
Repository layer for Marketplace Search & Discovery queries.
Reads data from ArtistProfile, Venue, Category, and Review models without owning those domains.
"""

from typing import Any, Dict, List, Tuple, Optional, Set
from uuid import UUID
from datetime import date, timedelta
from sqlalchemy import or_, func
from sqlalchemy.orm import Session, joinedload, selectinload

from app.features.artists.models import ArtistProfile
from app.features.venues.models import Venue
from app.features.categories.models import Category
from app.features.reviews.models import Review
from app.features.locations.models import City
from app.features.bookings.models import Booking
from app.features.marketplace.constants import SORT_OPTIONS


class MarketplaceRepository:
    """Read-optimized repository routines for public marketplace search & discovery."""

    def search_artists(
        self,
        db: Session,
        query: Optional[str] = None,
        category: Optional[str] = None,
        location: Optional[str] = None,
        offset: int = 0,
        limit: int = 20,
        sort_by: str = "created_at",
        sort_order: str = "desc",
    ) -> Tuple[List[ArtistProfile], int]:
        stmt = db.query(ArtistProfile).filter(
            ArtistProfile.verification_status == "approved",
            ArtistProfile.deleted_at.is_(None),
        )

        if query:
            q_term = f"%{query}%"
            stmt = stmt.filter(
                or_(
                    ArtistProfile.display_name.ilike(q_term),
                    ArtistProfile.username.ilike(q_term),
                    ArtistProfile.bio.ilike(q_term),
                    ArtistProfile.city.ilike(q_term),
                    ArtistProfile.state.ilike(q_term),
                )
            )

        if location:
            loc_term = f"%{location}%"
            stmt = stmt.filter(
                or_(
                    ArtistProfile.city.ilike(loc_term),
                    ArtistProfile.state.ilike(loc_term),
                )
            )

        if category:
            cat_term = f"%{category}%"
            stmt = stmt.filter(ArtistProfile.genres.any(Category.name.ilike(cat_term)))

        total = stmt.count()

        # Sorting logic
        if sort_by == "rating":
            order_col = (
                ArtistProfile.rating.desc()
                if sort_order == "desc"
                else ArtistProfile.rating.asc()
            )
        elif sort_by == "price" or sort_by == "base_rate":
            order_col = (
                ArtistProfile.base_rate.asc()
                if sort_order == "asc"
                else ArtistProfile.base_rate.desc()
            )
        else:
            order_col = (
                ArtistProfile.created_at.desc()
                if sort_order == "desc"
                else ArtistProfile.created_at.asc()
            )

        items = (
            stmt.options(selectinload(ArtistProfile.genres))
            .order_by(order_col)
            .offset(offset)
            .limit(limit)
            .all()
        )

        return items, total

    def search_venues(
        self,
        db: Session,
        query: Optional[str] = None,
        category: Optional[str] = None,
        location: Optional[str] = None,
        venue_type: Optional[str] = None,
        city: Optional[str] = None,
        state: Optional[str] = None,
        min_capacity: Optional[int] = None,
        offset: int = 0,
        limit: int = 20,
        sort_by: str = "created_at",
        sort_order: str = "desc",
    ) -> Tuple[List[Venue], int]:
        stmt = db.query(Venue).filter(
            Venue.verification_status == "approved", Venue.deleted_at.is_(None)
        )

        if query:
            q_term = f"%{query}%"
            stmt = stmt.filter(
                or_(
                    Venue.name.ilike(q_term),
                    Venue.description.ilike(q_term),
                    Venue.address.ilike(q_term),
                    Venue.state.ilike(q_term),
                    Venue.venue_type.ilike(q_term),
                )
            )

        if venue_type:
            stmt = stmt.filter(Venue.venue_type.ilike(f"%{venue_type}%"))

        if location or city or state:
            loc = location or city or state
            loc_term = f"%{loc}%"
            stmt = stmt.outerjoin(City, Venue.city_id == City.id).filter(
                or_(
                    Venue.state.ilike(loc_term),
                    Venue.address.ilike(loc_term),
                    City.name.ilike(loc_term),
                )
            )

        if min_capacity and min_capacity > 0:
            stmt = stmt.filter(Venue.capacity >= min_capacity)

        if category:
            cat_term = f"%{category}%"
            stmt = stmt.filter(
                or_(
                    Venue.categories.any(Category.name.ilike(cat_term)),
                    Venue.venue_type.ilike(cat_term),
                )
            )

        total = stmt.count()

        # Sorting logic
        if sort_by == "capacity":
            order_col = (
                Venue.capacity.desc() if sort_order == "desc" else Venue.capacity.asc()
            )
        elif sort_by == "price" or sort_by == "base_price":
            order_col = (
                Venue.base_price.asc()
                if sort_order == "asc"
                else Venue.base_price.desc()
            )
        elif sort_by == "name":
            order_col = Venue.name.asc() if sort_order == "asc" else Venue.name.desc()
        else:
            order_col = (
                Venue.created_at.desc()
                if sort_order == "desc"
                else Venue.created_at.asc()
            )

        items = (
            stmt.options(selectinload(Venue.categories), joinedload(Venue.city))
            .order_by(order_col)
            .offset(offset)
            .limit(limit)
            .all()
        )

        return items, total

    def get_featured_artists(self, db: Session, limit: int = 6) -> List[ArtistProfile]:
        return (
            db.query(ArtistProfile)
            .filter(
                ArtistProfile.verification_status == "approved",
                ArtistProfile.deleted_at.is_(None),
            )
            .options(selectinload(ArtistProfile.genres))
            .order_by(ArtistProfile.rating.desc(), ArtistProfile.created_at.desc())
            .limit(limit)
            .all()
        )

    def get_featured_venues(self, db: Session, limit: int = 6) -> List[Venue]:
        return (
            db.query(Venue)
            .filter(Venue.verification_status == "approved", Venue.deleted_at.is_(None))
            .options(selectinload(Venue.categories), joinedload(Venue.city))
            .order_by(Venue.capacity.desc(), Venue.created_at.desc())
            .limit(limit)
            .all()
        )

    def get_latest_artists(self, db: Session, limit: int = 6) -> List[ArtistProfile]:
        return (
            db.query(ArtistProfile)
            .filter(
                ArtistProfile.verification_status == "approved",
                ArtistProfile.deleted_at.is_(None),
            )
            .options(selectinload(ArtistProfile.genres))
            .order_by(ArtistProfile.created_at.desc())
            .limit(limit)
            .all()
        )

    def get_latest_venues(self, db: Session, limit: int = 6) -> List[Venue]:
        return (
            db.query(Venue)
            .filter(Venue.verification_status == "approved", Venue.deleted_at.is_(None))
            .options(selectinload(Venue.categories), joinedload(Venue.city))
            .order_by(Venue.created_at.desc())
            .limit(limit)
            .all()
        )

    def get_review_counts_for_entities(
        self, db: Session, target_ids: List[UUID]
    ) -> dict:
        if not target_ids:
            return {}

        results = (
            db.query(Review.artist_profile_id, Review.venue_id, func.count(Review.id))
            .filter(
                Review.deleted_at.is_(None),
                Review.moderation_status == "public",
                or_(
                    Review.artist_profile_id.in_(target_ids),
                    Review.venue_id.in_(target_ids),
                ),
            )
            .group_by(Review.artist_profile_id, Review.venue_id)
            .all()
        )

        counts = {}
        for art_id, ven_id, cnt in results:
            if art_id:
                counts[art_id] = counts.get(art_id, 0) + cnt
            if ven_id:
                counts[ven_id] = counts.get(ven_id, 0) + cnt

        return counts

    def get_artist_preview(
        self, db: Session, artist_id: UUID
    ) -> Optional[ArtistProfile]:
        return (
            db.query(ArtistProfile)
            .filter(
                ArtistProfile.id == artist_id,
                ArtistProfile.verification_status == "approved",
                ArtistProfile.deleted_at.is_(None),
            )
            .options(
                selectinload(ArtistProfile.genres),
                selectinload(ArtistProfile.languages),
                joinedload(ArtistProfile.user),
            )
            .first()
        )

    def get_popular_artists(self, db: Session, limit: int = 6) -> List[ArtistProfile]:
        return (
            db.query(ArtistProfile)
            .filter(
                ArtistProfile.verification_status == "approved",
                ArtistProfile.deleted_at.is_(None),
            )
            .options(
                joinedload(ArtistProfile.genres), joinedload(ArtistProfile.languages)
            )
            .order_by(ArtistProfile.rating.desc(), ArtistProfile.base_rate.desc())
            .limit(limit)
            .all()
        )

    def get_artist_filter_options(self, db: Session) -> dict:
        # Fetch active genres & languages
        genres = (
            db.query(Category.name)
            .filter(
                Category.is_active.is_(True),
                Category.type == "music_genre",
                Category.deleted_at.is_(None),
            )
            .distinct()
            .order_by(Category.name.asc())
            .all()
        )

        cities = (
            db.query(ArtistProfile.city)
            .filter(
                ArtistProfile.verification_status == "approved",
                ArtistProfile.city.isnot(None),
                ArtistProfile.deleted_at.is_(None),
            )
            .distinct()
            .order_by(ArtistProfile.city.asc())
            .all()
        )

        states = (
            db.query(ArtistProfile.state)
            .filter(
                ArtistProfile.verification_status == "approved",
                ArtistProfile.state.isnot(None),
                ArtistProfile.deleted_at.is_(None),
            )
            .distinct()
            .order_by(ArtistProfile.state.asc())
            .all()
        )

        band_types = ["Solo", "Duo", "Trio", "4 Members", "5+ Members"]

        sort_options = SORT_OPTIONS

        return {
            "genres": [g[0] for g in genres if g[0]],
            "categories": [
                "Pop",
                "Rock",
                "Classical",
                "Jazz",
                "Folk",
                "EDM",
                "Hip-Hop",
                "Indie",
            ],
            "cities": [c[0] for c in cities if c[0]],
            "states": [s[0] for s in states if s[0]],
            "band_types": band_types,
            "sort_options": sort_options,
        }

    def get_venue_preview(self, db: Session, venue_id: UUID) -> Optional[Venue]:
        return (
            db.query(Venue)
            .filter(
                Venue.id == venue_id,
                Venue.verification_status == "approved",
                Venue.deleted_at.is_(None),
            )
            .options(
                selectinload(Venue.categories),
                joinedload(Venue.city),
                joinedload(Venue.user),
            )
            .first()
        )

    def get_popular_venues(self, db: Session, limit: int = 6) -> List[Venue]:
        return (
            db.query(Venue)
            .filter(
                Venue.verification_status == "approved",
                Venue.deleted_at.is_(None),
            )
            .options(joinedload(Venue.categories), joinedload(Venue.city))
            .order_by(Venue.capacity.desc(), Venue.base_price.desc())
            .limit(limit)
            .all()
        )

    def get_venue_filter_options(self, db: Session) -> dict:
        v_types = (
            db.query(Venue.venue_type)
            .filter(
                Venue.verification_status == "approved",
                Venue.venue_type.isnot(None),
                Venue.deleted_at.is_(None),
            )
            .distinct()
            .order_by(Venue.venue_type.asc())
            .all()
        )

        cities = (
            db.query(City.name)
            .join(Venue, Venue.city_id == City.id)
            .filter(Venue.verification_status == "approved", Venue.deleted_at.is_(None))
            .distinct()
            .order_by(City.name.asc())
            .all()
        )

        states = (
            db.query(Venue.state)
            .filter(
                Venue.verification_status == "approved",
                Venue.state.isnot(None),
                Venue.deleted_at.is_(None),
            )
            .distinct()
            .order_by(Venue.state.asc())
            .all()
        )

        capacity_ranges = [
            {"label": "50+ Guests", "value": 50},
            {"label": "100+ Guests", "value": 100},
            {"label": "250+ Guests", "value": 250},
            {"label": "500+ Guests", "value": 500},
            {"label": "1000+ Guests", "value": 1000},
        ]

        sort_options = SORT_OPTIONS

        return {
            "venue_types": [vt[0] for vt in v_types if vt[0]],
            "cities": [c[0] for c in cities if c[0]],
            "states": [s[0] for s in states if s[0]],
            "capacity_ranges": capacity_ranges,
            "sort_options": sort_options,
        }

    # ─── Phase 4: Advanced Search & Discovery ────────────────────────────────

    def search_suggestions(
        self,
        db: Session,
        query: str,
        limit: int = 8,
    ) -> List[Dict[str, Any]]:
        """Return autocomplete suggestions for artists, venues, genres, and cities.
        Uses simple ILIKE matching; no N+1 queries.
        """
        results: List[Dict[str, Any]] = []
        q = f"%{query}%"

        # Artist display names
        artists = (
            db.query(
                ArtistProfile.id,
                ArtistProfile.display_name,
                ArtistProfile.band_type,
                ArtistProfile.city,
            )
            .filter(
                ArtistProfile.verification_status == "approved",
                ArtistProfile.deleted_at.is_(None),
                ArtistProfile.display_name.ilike(q),
            )
            .limit(3)
            .all()
        )
        for a in artists:
            results.append(
                {
                    "type": "artist",
                    "value": a.display_name,
                    "display": a.display_name,
                    "subtitle": f"{a.band_type} · {a.city}" if a.city else a.band_type,
                }
            )

        # Venue names
        venues = (
            db.query(
                Venue.id,
                Venue.name,
                Venue.venue_type,
                Venue.state,
            )
            .filter(
                Venue.verification_status == "approved",
                Venue.deleted_at.is_(None),
                Venue.name.ilike(q),
            )
            .limit(3)
            .all()
        )
        for v in venues:
            results.append(
                {
                    "type": "venue",
                    "value": v.name,
                    "display": v.name,
                    "subtitle": f"{v.venue_type} · {v.state}"
                    if v.state
                    else v.venue_type,
                }
            )

        # Genre / category names
        genres = (
            db.query(Category.name)
            .filter(
                Category.is_active.is_(True),
                Category.deleted_at.is_(None),
                Category.name.ilike(q),
            )
            .limit(3)
            .all()
        )
        for (name,) in genres:
            results.append(
                {
                    "type": "genre",
                    "value": name,
                    "display": name,
                    "subtitle": "Genre / Category",
                }
            )

        # City names from approved artist profiles
        cities = (
            db.query(ArtistProfile.city)
            .filter(
                ArtistProfile.verification_status == "approved",
                ArtistProfile.deleted_at.is_(None),
                ArtistProfile.city.ilike(q),
                ArtistProfile.city.isnot(None),
            )
            .distinct()
            .limit(3)
            .all()
        )
        seen_cities: set = set()
        for (city,) in cities:
            if city and city not in seen_cities:
                seen_cities.add(city)
                results.append(
                    {
                        "type": "city",
                        "value": city,
                        "display": city,
                        "subtitle": "City",
                    }
                )

        return results[:limit]

    def search_all(
        self,
        db: Session,
        query: Optional[str] = None,
        location: Optional[str] = None,
        category: Optional[str] = None,
        offset: int = 0,
        limit: int = 12,
    ) -> Tuple[List[ArtistProfile], List[Venue]]:
        """Unified cross-entity search returning matching artists and venues.
        Reuses existing filter patterns with .any() to avoid JSON distinct errors.
        """
        # ── Artists ──
        a_stmt = db.query(ArtistProfile).filter(
            ArtistProfile.verification_status == "approved",
            ArtistProfile.deleted_at.is_(None),
        )
        if query:
            q_term = f"%{query}%"
            a_stmt = a_stmt.filter(
                or_(
                    ArtistProfile.display_name.ilike(q_term),
                    ArtistProfile.username.ilike(q_term),
                    ArtistProfile.bio.ilike(q_term),
                    ArtistProfile.city.ilike(q_term),
                    ArtistProfile.state.ilike(q_term),
                )
            )
        if location:
            loc_term = f"%{location}%"
            a_stmt = a_stmt.filter(
                or_(
                    ArtistProfile.city.ilike(loc_term),
                    ArtistProfile.state.ilike(loc_term),
                )
            )
        if category:
            cat_term = f"%{category}%"
            a_stmt = a_stmt.filter(
                ArtistProfile.genres.any(Category.name.ilike(cat_term))
            )
        artists = (
            a_stmt.options(joinedload(ArtistProfile.genres))
            .order_by(ArtistProfile.rating.desc())
            .offset(offset)
            .limit(limit)
            .all()
        )

        # ── Venues ──
        v_stmt = db.query(Venue).filter(
            Venue.verification_status == "approved",
            Venue.deleted_at.is_(None),
        )
        if query:
            q_term = f"%{query}%"
            v_stmt = v_stmt.filter(
                or_(
                    Venue.name.ilike(q_term),
                    Venue.description.ilike(q_term),
                    Venue.address.ilike(q_term),
                    Venue.state.ilike(q_term),
                    Venue.venue_type.ilike(q_term),
                )
            )
        if location:
            loc_term = f"%{location}%"
            v_stmt = v_stmt.outerjoin(City, Venue.city_id == City.id).filter(
                or_(
                    Venue.state.ilike(loc_term),
                    Venue.address.ilike(loc_term),
                    City.name.ilike(loc_term),
                )
            )
        if category:
            cat_term = f"%{category}%"
            v_stmt = v_stmt.filter(
                or_(
                    Venue.categories.any(Category.name.ilike(cat_term)),
                    Venue.venue_type.ilike(cat_term),
                )
            )
        venues = (
            v_stmt.options(joinedload(Venue.categories))
            .order_by(Venue.capacity.desc())
            .offset(offset)
            .limit(limit)
            .all()
        )

        return artists, venues

    # ─── Phase 5: Smart Ranking & Availability Routines ─────────────────────

    def get_confirmed_booking_dates(
        self,
        db: Session,
        entity_type: str,
        entity_id: UUID,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
    ) -> Set[date]:
        """Return set of event dates for confirmed ("accepted") bookings."""
        stmt = db.query(Booking.event_date).filter(
            Booking.status == "accepted", Booking.deleted_at.is_(None)
        )
        if entity_type == "artist":
            stmt = stmt.filter(Booking.artist_profile_id == entity_id)
        elif entity_type == "venue":
            stmt = stmt.filter(Booking.venue_id == entity_id)

        if start_date:
            stmt = stmt.filter(Booking.event_date >= start_date)
        if end_date:
            stmt = stmt.filter(Booking.event_date <= end_date)

        rows = stmt.all()
        return {row[0] for row in rows if row[0]}

    def get_confirmed_booking_dates_for_entities(
        self,
        db: Session,
        entity_type: str,
        entity_ids: List[UUID],
        start_date: date,
        end_date: date,
    ) -> Dict[UUID, Set[date]]:
        if not entity_ids:
            return {}

        stmt = db.query(
            Booking.artist_profile_id,
            Booking.venue_id,
            Booking.event_date,
        ).filter(
            Booking.status == "accepted",
            Booking.deleted_at.is_(None),
            Booking.event_date >= start_date,
            Booking.event_date <= end_date,
        )

        if entity_type == "artist":
            stmt = stmt.filter(Booking.artist_profile_id.in_(entity_ids))
        else:
            stmt = stmt.filter(Booking.venue_id.in_(entity_ids))

        rows = stmt.all()
        dates_by_entity: Dict[UUID, Set[date]] = {eid: set() for eid in entity_ids}
        for artist_id, venue_id, event_date in rows:
            if entity_type == "artist" and artist_id:
                dates_by_entity[artist_id].add(event_date)
            if entity_type == "venue" and venue_id:
                dates_by_entity[venue_id].add(event_date)

        return dates_by_entity

    def get_popularity_stats(
        self, db: Session, entity_type: str, entity_id: UUID
    ) -> Dict[str, Any]:
        """Aggregate total confirmed bookings, review count, and average rating."""
        # Booking count
        b_stmt = db.query(func.count(Booking.id)).filter(
            Booking.status == "accepted", Booking.deleted_at.is_(None)
        )
        if entity_type == "artist":
            b_stmt = b_stmt.filter(Booking.artist_profile_id == entity_id)
        else:
            b_stmt = b_stmt.filter(Booking.venue_id == entity_id)
        total_bookings = b_stmt.scalar() or 0

        # Review stats
        r_stmt = db.query(
            func.count(Review.id), func.coalesce(func.avg(Review.rating), 5.0)
        ).filter(Review.moderation_status == "public", Review.deleted_at.is_(None))
        if entity_type == "artist":
            r_stmt = r_stmt.filter(Review.artist_profile_id == entity_id)
        else:
            r_stmt = r_stmt.filter(Review.venue_id == entity_id)
        r_row = r_stmt.first()
        total_reviews = r_row[0] if r_row else 0
        avg_rating = float(r_row[1]) if r_row and r_row[1] is not None else 5.0

        return {
            "total_bookings": total_bookings,
            "total_reviews": total_reviews,
            "average_rating": avg_rating,
        }

    def get_popularity_stats_for_entities(
        self, db: Session, entity_type: str, entity_ids: List[UUID]
    ) -> Dict[UUID, Dict[str, Any]]:
        if not entity_ids:
            return {}

        if entity_type == "artist":
            booking_col = Booking.artist_profile_id
            review_col = Review.artist_profile_id
            booking_filter = Booking.artist_profile_id.in_(entity_ids)
            review_filter = Review.artist_profile_id.in_(entity_ids)
        else:
            booking_col = Booking.venue_id
            review_col = Review.venue_id
            booking_filter = Booking.venue_id.in_(entity_ids)
            review_filter = Review.venue_id.in_(entity_ids)

        booking_rows = (
            db.query(booking_col, func.count(Booking.id))
            .select_from(Booking)
            .filter(booking_filter, Booking.deleted_at.is_(None), Booking.status == "accepted")
            .group_by(booking_col)
            .all()
        )

        review_rows = (
            db.query(review_col, func.count(Review.id), func.coalesce(func.avg(Review.rating), 5.0))
            .select_from(Review)
            .filter(review_filter, Review.deleted_at.is_(None), Review.moderation_status == "public")
            .group_by(review_col)
            .all()
        )

        results: Dict[UUID, Dict[str, Any]] = {
            eid: {"total_bookings": 0, "total_reviews": 0, "average_rating": 5.0}
            for eid in entity_ids
        }
        for entity_id, count in booking_rows:
            if entity_id:
                results[entity_id]["total_bookings"] = count or 0

        for entity_id, count, avg_rating in review_rows:
            if entity_id:
                results[entity_id]["total_reviews"] = count or 0
                results[entity_id]["average_rating"] = float(avg_rating or 5.0)

        return results

    def calculate_artist_profile_completion(
        self, artist: ArtistProfile
    ) -> Dict[str, Any]:
        """Calculate 8-criteria artist profile completeness (0-100%)."""
        criteria = [
            ("profile_image", bool(artist.profile_image)),
            ("cover_image", bool(artist.cover_image)),
            ("bio", bool(artist.bio and len(artist.bio.strip()) >= 10)),
            ("genres", bool(artist.genres and len(artist.genres) > 0)),
            ("pricing", bool(artist.base_rate and artist.base_rate > 0)),
            ("gallery", bool(artist.gallery and len(artist.gallery) > 0)),
            (
                "availability",
                bool(artist.availability and isinstance(artist.availability, dict)),
            ),
            ("social_links", bool(artist.social_links)),
        ]
        completed = sum(1 for _, met in criteria if met)
        percentage = int(round((completed / len(criteria)) * 100))
        missing = [key for key, met in criteria if not met]
        return {
            "percentage": percentage,
            "missing_fields": missing,
            "is_complete": percentage >= 100,
        }

    def calculate_venue_profile_completion(self, venue: Venue) -> Dict[str, Any]:
        """Calculate 8-criteria venue profile completeness (0-100%)."""
        criteria = [
            ("image", bool(venue.image)),
            ("gallery", bool(venue.gallery and len(venue.gallery) > 0)),
            (
                "description",
                bool(venue.description and len(venue.description.strip()) >= 10),
            ),
            ("facilities", bool(venue.facilities and len(venue.facilities) > 0)),
            ("capacity", bool(venue.capacity and venue.capacity > 0)),
            ("pricing", bool(venue.base_price and venue.base_price > 0)),
            ("address", bool(venue.address and len(venue.address.strip()) > 0)),
            (
                "categories",
                bool(
                    (venue.categories and len(venue.categories) > 0) or venue.venue_type
                ),
            ),
        ]
        completed = sum(1 for _, met in criteria if met)
        percentage = int(round((completed / len(criteria)) * 100))
        missing = [key for key, met in criteria if not met]
        return {
            "percentage": percentage,
            "missing_fields": missing,
            "is_complete": percentage >= 100,
        }

    def get_entity_availability(
        self,
        db: Session,
        entity_type: str,
        entity_id: UUID,
        target_date: Optional[date] = None,
    ) -> Set[date]:
        """Return confirmed booking dates for availability checks."""
        start = target_date or date.today()
        return self.get_confirmed_booking_dates(
            db,
            entity_type,
            entity_id,
            start_date=start,
            end_date=start + timedelta(days=30),
        )

    def search_artists_ranked(
        self,
        db: Session,
        query: Optional[str] = None,
        category: Optional[str] = None,
        location: Optional[str] = None,
        max_results: int = 500,
    ) -> Tuple[List[ArtistProfile], int]:
        """Fetch artist candidates for in-memory ranking (no DB-level pagination)."""
        return self.search_artists(
            db,
            query=query,
            category=category,
            location=location,
            offset=0,
            limit=max_results,
            sort_by="created_at",
            sort_order="desc",
        )

    def search_venues_ranked(
        self,
        db: Session,
        query: Optional[str] = None,
        category: Optional[str] = None,
        location: Optional[str] = None,
        venue_type: Optional[str] = None,
        city: Optional[str] = None,
        state: Optional[str] = None,
        min_capacity: Optional[int] = None,
        max_results: int = 500,
    ) -> Tuple[List[Venue], int]:
        """Fetch venue candidates for in-memory ranking (no DB-level pagination)."""
        return self.search_venues(
            db,
            query=query,
            category=category,
            location=location,
            venue_type=venue_type,
            city=city,
            state=state,
            min_capacity=min_capacity,
            offset=0,
            limit=max_results,
            sort_by="created_at",
            sort_order="desc",
        )

    def search_all_ranked(
        self,
        db: Session,
        query: Optional[str] = None,
        location: Optional[str] = None,
        category: Optional[str] = None,
        max_results: int = 500,
    ) -> Tuple[List[ArtistProfile], List[Venue]]:
        """Unified cross-entity fetch for ranking engine."""
        per_type = max(1, max_results // 2)
        artists, _ = self.search_artists_ranked(
            db, query=query, location=location, category=category, max_results=per_type
        )
        venues, _ = self.search_venues_ranked(
            db, query=query, location=location, category=category, max_results=per_type
        )
        return artists, venues


marketplace_repository = MarketplaceRepository()
