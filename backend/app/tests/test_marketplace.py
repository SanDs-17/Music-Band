"""
Pytest unit and integration test suite for Marketplace Search & Discovery.
Tests homepage aggregation, search endpoints, location dropdown payload, and category filtering.
"""

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.features.marketplace.constants import (
    POPULAR_CITIES,
    INDIAN_STATES,
    UNION_TERRITORIES,
)


def test_get_marketplace_locations_endpoint(client: TestClient):
    resp = client.get("/api/v1/marketplace/locations")
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert data["country"] == "India"
    assert len(data["popular_cities"]) == len(POPULAR_CITIES)
    assert len(data["states"]) == len(INDIAN_STATES)
    assert len(data["union_territories"]) == len(UNION_TERRITORIES)


def test_get_marketplace_home_endpoint(client: TestClient, db_session: Session):
    resp = client.get("/api/v1/marketplace/home")
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert "featured_artists" in data
    assert "featured_venues" in data
    assert "categories" in data
    assert "locations" in data


def test_get_marketplace_featured_endpoint(client: TestClient):
    resp = client.get("/api/v1/marketplace/featured")
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert "top_artists" in data
    assert "top_venues" in data
    assert "latest_artists" in data
    assert "latest_venues" in data


def test_search_artists_and_venues_endpoints(client: TestClient, db_session: Session):
    # Test artist search
    art_resp = client.get("/api/v1/marketplace/artists?query=Rock&location=Mumbai")
    assert art_resp.status_code == 200
    art_data = art_resp.json()["data"]
    assert "items" in art_data
    assert "pagination" in art_data

    # Test venue search
    ven_resp = client.get("/api/v1/marketplace/venues?query=Hall&location=Delhi")
    assert ven_resp.status_code == 200
    ven_data = ven_resp.json()["data"]
    assert "items" in ven_data
    assert "pagination" in ven_data


def test_get_marketplace_categories(client: TestClient):
    resp = client.get("/api/v1/marketplace/categories")
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert isinstance(data, list)
