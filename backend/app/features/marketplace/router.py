"""
REST API endpoints for Marketplace Search & Discovery.
Public endpoints for discovering artists, venues, home content, featured listings, and locations.
"""

from uuid import UUID
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.utils.response import success_response
from app.features.marketplace.service import marketplace_service
from app.features.marketplace.dependencies import get_marketplace_filter_params
from app.features.marketplace.schemas import MarketplaceFilterQuery

router = APIRouter(tags=["Marketplace Discovery"])


@router.get("/home", status_code=status.HTTP_200_OK)
def get_marketplace_home(db: Session = Depends(get_db)):
    """Public endpoint returning home page discovery payload (featured artists, venues, categories, location groups)."""
    res = marketplace_service.get_marketplace_home(db)
    return success_response(
        data=res.model_dump(mode="json"),
        message="Marketplace home payload retrieved successfully",
    )


@router.get("/artists", status_code=status.HTTP_200_OK)
def search_artists(
    filters: MarketplaceFilterQuery = Depends(get_marketplace_filter_params),
    db: Session = Depends(get_db),
):
    """Public endpoint searching approved artists by keyword, category, location, and sorting."""
    res = marketplace_service.search_artists(
        db,
        query=filters.query,
        category=filters.category,
        location=filters.location,
        page=filters.page,
        limit=filters.limit,
        sort_by=filters.sort_by,
        sort_order=filters.sort_order,
        availability_filter=filters.availability_filter or "all",
        event_date=filters.event_date,
    )
    return success_response(
        data=res.model_dump(mode="json"),
        message="Marketplace artists retrieved successfully",
    )


@router.get("/artists/featured", status_code=status.HTTP_200_OK)
def get_featured_artists(db: Session = Depends(get_db)):
    """Public endpoint returning featured artists."""
    artists = marketplace_service.repository.get_featured_artists(db, limit=6)
    counts = marketplace_service.repository.get_review_counts_for_entities(
        db, [a.id for a in artists]
    )
    mapped = [
        marketplace_service._map_artist_card(a, counts.get(a.id, 0)) for a in artists
    ]
    return success_response(
        data=[a.model_dump(mode="json") for a in mapped],
        message="Featured artists retrieved successfully",
    )


@router.get("/artists/popular", status_code=status.HTTP_200_OK)
def get_popular_artists(db: Session = Depends(get_db)):
    """Public endpoint returning popular high-rated artists."""
    res = marketplace_service.get_popular_artists(db, limit=6)
    return success_response(
        data=[a.model_dump(mode="json") for a in res],
        message="Popular artists retrieved successfully",
    )


@router.get("/artists/recent", status_code=status.HTTP_200_OK)
def get_recent_artists(db: Session = Depends(get_db)):
    """Public endpoint returning recent registered artists."""
    res = marketplace_service.get_recent_artists(db, limit=6)
    return success_response(
        data=[a.model_dump(mode="json") for a in res],
        message="Recent artists retrieved successfully",
    )


@router.get("/artists/filters", status_code=status.HTTP_200_OK)
def get_artist_filters(db: Session = Depends(get_db)):
    """Public endpoint returning filter facets for artist discovery (genres, categories, cities, states, band_types, sort_options)."""
    res = marketplace_service.get_artist_filters(db)
    return success_response(
        data=res.model_dump(mode="json"),
        message="Artist filter options retrieved successfully",
    )


@router.get("/artists/{artist_id}/preview", status_code=status.HTTP_200_OK)
def get_artist_preview(artist_id: UUID, db: Session = Depends(get_db)):
    """Public endpoint returning lightweight artist preview details for inspection modal."""
    preview = marketplace_service.get_artist_preview(db, artist_id)
    if not preview:
        raise HTTPException(
            status_code=404, detail="Artist profile not found or not approved."
        )
    return success_response(
        data=preview.model_dump(mode="json"),
        message="Artist preview details retrieved successfully",
    )


@router.get("/venues", status_code=status.HTTP_200_OK)
def search_venues(
    filters: MarketplaceFilterQuery = Depends(get_marketplace_filter_params),
    db: Session = Depends(get_db),
):
    """Public endpoint searching approved venues by keyword, category, venue type, city, state, capacity, and sorting."""
    res = marketplace_service.search_venues(
        db,
        query=filters.query,
        category=filters.category,
        location=filters.location,
        page=filters.page,
        limit=filters.limit,
        sort_by=filters.sort_by,
        sort_order=filters.sort_order,
        availability_filter=filters.availability_filter or "all",
        event_date=filters.event_date,
    )
    return success_response(
        data=res.model_dump(mode="json"),
        message="Marketplace venues retrieved successfully",
    )


@router.get("/venues/featured", status_code=status.HTTP_200_OK)
def get_featured_venues(db: Session = Depends(get_db)):
    """Public endpoint returning featured venues."""
    venues = marketplace_service.repository.get_featured_venues(db, limit=6)
    counts = marketplace_service.repository.get_review_counts_for_entities(
        db, [v.id for v in venues]
    )
    mapped = [
        marketplace_service._map_venue_card(v, counts.get(v.id, 0)) for v in venues
    ]
    return success_response(
        data=[v.model_dump(mode="json") for v in mapped],
        message="Featured venues retrieved successfully",
    )


@router.get("/venues/popular", status_code=status.HTTP_200_OK)
def get_popular_venues(db: Session = Depends(get_db)):
    """Public endpoint returning popular capacity venues."""
    res = marketplace_service.get_popular_venues(db, limit=6)
    return success_response(
        data=[v.model_dump(mode="json") for v in res],
        message="Popular venues retrieved successfully",
    )


@router.get("/venues/recent", status_code=status.HTTP_200_OK)
def get_recent_venues(db: Session = Depends(get_db)):
    """Public endpoint returning recent registered venues."""
    res = marketplace_service.get_recent_venues(db, limit=6)
    return success_response(
        data=[v.model_dump(mode="json") for v in res],
        message="Recent venues retrieved successfully",
    )


@router.get("/venues/filters", status_code=status.HTTP_200_OK)
def get_venue_filters(db: Session = Depends(get_db)):
    """Public endpoint returning filter facets for venue discovery (venue_types, cities, states, capacity_ranges, sort_options)."""
    res = marketplace_service.get_venue_filters(db)
    return success_response(
        data=res.model_dump(mode="json"),
        message="Venue filter options retrieved successfully",
    )


@router.get("/venues/{venue_id}/preview", status_code=status.HTTP_200_OK)
def get_venue_preview(venue_id: UUID, db: Session = Depends(get_db)):
    """Public endpoint returning lightweight venue preview details for inspection modal."""
    preview = marketplace_service.get_venue_preview(db, venue_id)
    if not preview:
        raise HTTPException(
            status_code=404, detail="Venue profile not found or not approved."
        )
    return success_response(
        data=preview.model_dump(mode="json"),
        message="Venue preview details retrieved successfully",
    )


@router.get("/categories", status_code=status.HTTP_200_OK)
def get_categories(db: Session = Depends(get_db)):
    """Public endpoint listing active marketplace categories and genres."""
    categories = marketplace_service.get_categories(db)
    return success_response(
        data=[c.model_dump(mode="json") for c in categories],
        message="Marketplace categories retrieved successfully",
    )


@router.get("/featured", status_code=status.HTTP_200_OK)
def get_featured(db: Session = Depends(get_db)):
    """Public endpoint returning featured and latest artist & venue listings."""
    res = marketplace_service.get_featured(db)
    return success_response(
        data=res.model_dump(mode="json"),
        message="Featured marketplace items retrieved successfully",
    )


@router.get("/locations", status_code=status.HTTP_200_OK)
def get_locations():
    """Public endpoint returning structured location dropdown data (popular cities, 28 states, 8 UTs)."""
    res = marketplace_service.get_locations()
    return success_response(
        data=res.model_dump(mode="json"),
        message="Marketplace location options retrieved successfully",
    )


# ─── Phase 4: Advanced Search & Discovery ────────────────────────────────────


@router.get("/search/suggestions", status_code=status.HTTP_200_OK)
def get_search_suggestions(
    q: str = "",
    db: Session = Depends(get_db),
):
    """Public endpoint returning live autocomplete suggestions for artists, venues, genres, and cities.
    Requires a minimum of 2 characters. Intended to be called debounced from the frontend.
    """
    res = marketplace_service.get_search_suggestions(db, query=q)
    return success_response(
        data=res.model_dump(mode="json"),
        message="Search suggestions retrieved successfully",
    )


@router.get("/search/popular", status_code=status.HTTP_200_OK)
def get_popular_searches():
    """Public endpoint returning curated popular/trending search terms."""
    res = marketplace_service.get_popular_searches()
    return success_response(
        data=res.model_dump(mode="json"),
        message="Popular searches retrieved successfully",
    )


@router.get("/search", status_code=status.HTTP_200_OK)
def global_search(
    q: str = "",
    location: str = "",
    category: str = "",
    page: int = 1,
    limit: int = 12,
    db: Session = Depends(get_db),
):
    """Public endpoint for unified global search returning both artists and venues.
    Supports keyword, location, and category filtering with pagination.
    """
    res = marketplace_service.global_search(
        db,
        query=q or None,
        location=location or None,
        category=category or None,
        page=max(1, page),
        limit=min(limit, 24),
    )
    return success_response(
        data=res.model_dump(mode="json"),
        message="Global search results retrieved successfully",
    )


# ─── Phase 5: Smart Ranking & Availability Endpoints ─────────────────────────


@router.get("/ranking", status_code=status.HTTP_200_OK)
def get_marketplace_ranking(
    q: str = "",
    location: str = "",
    category: str = "",
    page: int = 1,
    limit: int = 12,
    db: Session = Depends(get_db),
):
    """Public endpoint returning unified search results with detailed Ranking Engine search scores."""
    res = marketplace_service.get_ranking_results(
        db,
        query=q or None,
        location=location or None,
        category=category or None,
        page=max(1, page),
        limit=min(limit, 24),
    )
    return success_response(
        data=res.model_dump(mode="json"),
        message="Marketplace ranking search scores retrieved successfully",
    )


@router.get("/availability", status_code=status.HTTP_200_OK)
def get_marketplace_availability(
    entity_type: str,
    entity_id: UUID,
    target_date: str = "",
    db: Session = Depends(get_db),
):
    """Public endpoint returning real-time availability status for an artist or venue."""
    if entity_type not in ["artist", "venue"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="entity_type must be either 'artist' or 'venue'",
        )

    avail = marketplace_service.get_entity_availability(
        db,
        entity_type=entity_type,
        entity_id=entity_id,
        target_date=target_date or None,
    )
    return success_response(
        data={
            "entity_type": entity_type,
            "entity_id": str(entity_id),
            "availability": avail.model_dump(mode="json"),
        },
        message="Entity availability retrieved successfully",
    )


@router.get("/popularity", status_code=status.HTTP_200_OK)
def get_marketplace_popularity(
    entity_type: str,
    entity_id: UUID,
    db: Session = Depends(get_db),
):
    """Public endpoint returning popularity metrics and statistics for an artist or venue."""
    if entity_type not in ["artist", "venue"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="entity_type must be either 'artist' or 'venue'",
        )

    pop = marketplace_service.get_popularity_metrics(
        db, entity_type=entity_type, entity_id=entity_id
    )
    return success_response(
        data=pop.model_dump(mode="json"),
        message="Popularity metrics retrieved successfully",
    )


@router.get("/profile-completion", status_code=status.HTTP_200_OK)
def get_marketplace_profile_completion(
    entity_type: str,
    entity_id: UUID,
    db: Session = Depends(get_db),
):
    """Public endpoint returning profile completeness breakdown for an artist or venue."""
    if entity_type not in ["artist", "venue"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="entity_type must be either 'artist' or 'venue'",
        )

    comp = marketplace_service.get_profile_completion(
        db, entity_type=entity_type, entity_id=entity_id
    )
    return success_response(
        data=comp.model_dump(mode="json"),
        message="Profile completion retrieved successfully",
    )
