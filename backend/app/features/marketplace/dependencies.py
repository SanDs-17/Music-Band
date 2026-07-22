"""
FastAPI dependency functions for Marketplace Search & Discovery.
"""

from typing import Optional
from fastapi import Query
from app.features.marketplace.constants import (
    DEFAULT_PAGE_SIZE,
    MAX_PAGE_SIZE,
    DEFAULT_SORT_BY,
    DEFAULT_SORT_ORDER,
)
from app.features.marketplace.schemas import MarketplaceFilterQuery


def get_marketplace_filter_params(
    query: Optional[str] = Query(
        None, description="Search keyword for name, bio, venue type, or city"
    ),
    category: Optional[str] = Query(
        None, description="Filter by genre, venue category, or category slug"
    ),
    location: Optional[str] = Query(None, description="Filter by city name or state"),
    availability_filter: Optional[str] = Query(
        "all",
        description="Availability window: all, today, tomorrow, this_week, custom",
    ),
    event_date: Optional[str] = Query(
        None,
        description="Custom date filter (YYYY-MM-DD) when availability_filter=custom",
    ),
    page: int = Query(1, ge=1, description="Page index (1-based)"),
    limit: int = Query(
        DEFAULT_PAGE_SIZE,
        ge=1,
        le=MAX_PAGE_SIZE,
        description="Number of items per page",
    ),
    sort_by: str = Query(
        DEFAULT_SORT_BY,
        description="Sort field (best_match, rating, price, popularity, etc.)",
    ),
    sort_order: str = Query(DEFAULT_SORT_ORDER, description="Sort order (asc, desc)"),
) -> MarketplaceFilterQuery:
    return MarketplaceFilterQuery(
        query=query,
        category=category,
        location=location,
        availability_filter=availability_filter or "all",
        event_date=event_date,
        page=page,
        limit=limit,
        sort_by=sort_by,
        sort_order=sort_order,
    )
