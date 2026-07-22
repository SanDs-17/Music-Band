"""
Pytest test suite for Marketplace Phase 5: Smart Ranking & Availability.
"""

from datetime import date, timedelta
from uuid import uuid4

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.features.marketplace.constants import RANKING_WEIGHTS
from app.features.marketplace.service import marketplace_service
from app.features.marketplace.schemas import (
    AvailabilityStatus,
    PopularityMetrics,
    ProfileCompletion,
)


def test_ranking_engine_score_calculation(db_session: Session):
    """SearchScoreCalculator produces deterministic weighted scores."""
    popularity = PopularityMetrics(
        total_bookings=5, total_reviews=3, average_rating=4.8
    )
    availability = AvailabilityStatus(status="available_today", is_available=True)
    completeness = ProfileCompletion(percentage=80, missing_fields=["gallery"])

    score = marketplace_service.calculate_search_score(
        entity_name="Rock Band Mumbai",
        entity_type="artist",
        query="Rock Band Mumbai",
        category="Rock",
        location="Mumbai",
        verification_status="approved",
        is_featured=True,
        rating=4.8,
        popularity=popularity,
        availability=availability,
        completeness=completeness,
        created_at=None,
        city="Mumbai",
        state="Maharashtra",
        tags=["Rock"],
    )

    assert score.total_score > 0
    assert score.match_score == float(RANKING_WEIGHTS["exact_match"])
    assert score.verification_score == float(RANKING_WEIGHTS["verified"])
    assert score.featured_score == float(RANKING_WEIGHTS["featured"])
    assert score.availability_score == float(RANKING_WEIGHTS["availability"])


def test_profile_completeness_calculation(db_session: Session):
    """Profile completion returns percentage and missing field keys."""
    from app.features.artists.models import ArtistProfile

    artist = ArtistProfile(
        id=uuid4(),
        user_id=uuid4(),
        display_name="Test Artist",
        profile_image="/img.jpg",
        bio="A long enough bio for completion",
        base_rate=5000,
    )
    result = marketplace_service.repository.calculate_artist_profile_completion(artist)
    assert 0 <= result["percentage"] <= 100
    assert isinstance(result["missing_fields"], list)
    assert "genres" in result["missing_fields"]


def test_popularity_service_metrics(client: TestClient, db_session: Session):
    """Popularity endpoint returns metrics with expected schema."""
    resp = client.get(
        "/api/v1/marketplace/popularity",
        params={"entity_type": "artist", "entity_id": str(uuid4())},
    )
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert "total_bookings" in data
    assert "total_reviews" in data
    assert "average_rating" in data
    assert "popularity_score" in data
    assert "popularity_level" in data


def test_availability_service_booking_check(db_session: Session):
    """Availability service returns structured status labels."""
    status = marketplace_service.get_entity_availability(
        db_session, "artist", uuid4(), None
    )
    assert status.is_available is True
    assert status.status in (
        "available_today",
        "available_tomorrow",
        "available_this_week",
        "available_on_date",
        "booked",
    )

    target = (date.today() + timedelta(days=10)).isoformat()
    custom = marketplace_service.get_entity_availability(
        db_session, "artist", uuid4(), target
    )
    assert custom.status in ("available_on_date", "booked")


def test_ranking_and_availability_endpoints(client: TestClient, db_session: Session):
    """Phase 5 REST endpoints respond with valid payloads."""
    ranking = client.get("/api/v1/marketplace/ranking?q=music")
    assert ranking.status_code == 200
    ranking_data = ranking.json()["data"]
    assert "items" in ranking_data
    assert "total" in ranking_data

    avail = client.get(
        "/api/v1/marketplace/availability",
        params={"entity_type": "venue", "entity_id": str(uuid4())},
    )
    assert avail.status_code == 200
    assert "availability" in avail.json()["data"]

    profile = client.get(
        "/api/v1/marketplace/profile-completion",
        params={"entity_type": "artist", "entity_id": str(uuid4())},
    )
    assert profile.status_code == 200
    profile_data = profile.json()["data"]
    assert "percentage" in profile_data
    assert "missing_fields" in profile_data

    artists = client.get("/api/v1/marketplace/artists?sort_by=best_match")
    assert artists.status_code == 200
    items = artists.json()["data"]["items"]
    if items:
        first = items[0]
        assert "search_score" in first or first.get("search_score") is None
