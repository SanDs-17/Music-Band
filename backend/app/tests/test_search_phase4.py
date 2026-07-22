"""
Pytest test suite for Marketplace Phase 4: Advanced Search & Discovery.
Tests global search, live suggestions, and popular searches endpoints.
"""

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session


def test_search_suggestions_with_query(client: TestClient, db_session: Session):
    """Suggestions endpoint returns correct schema for a valid query."""
    resp = client.get("/api/v1/marketplace/search/suggestions?q=band")
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert "query" in data
    assert "suggestions" in data
    assert isinstance(data["suggestions"], list)
    assert "total" in data
    assert data["query"] == "band"


def test_search_suggestions_short_query(client: TestClient, db_session: Session):
    """Suggestions endpoint returns empty list for queries shorter than 2 chars."""
    resp = client.get("/api/v1/marketplace/search/suggestions?q=a")
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert data["suggestions"] == []
    assert data["total"] == 0


def test_search_suggestions_empty_query(client: TestClient, db_session: Session):
    """Suggestions endpoint handles empty query gracefully."""
    resp = client.get("/api/v1/marketplace/search/suggestions?q=")
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert data["suggestions"] == []


def test_global_search_endpoint(client: TestClient, db_session: Session):
    """Global search endpoint returns artists and venues in unified response."""
    resp = client.get("/api/v1/marketplace/search?q=music&location=Mumbai")
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert "query" in data
    assert "artists" in data
    assert "venues" in data
    assert "total" in data
    assert isinstance(data["artists"], list)
    assert isinstance(data["venues"], list)
    assert data["query"] == "music"


def test_global_search_no_query(client: TestClient, db_session: Session):
    """Global search with no query returns results (browse all)."""
    resp = client.get("/api/v1/marketplace/search")
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert "artists" in data
    assert "venues" in data


def test_popular_searches_endpoint(client: TestClient):
    """Popular searches endpoint returns curated list with correct schema."""
    resp = client.get("/api/v1/marketplace/search/popular")
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert "items" in data
    items = data["items"]
    assert isinstance(items, list)
    assert len(items) > 0
    # Validate structure of first item
    first = items[0]
    assert "label" in first
    assert "query" in first
    assert "category" in first


def test_global_search_pagination(client: TestClient, db_session: Session):
    """Global search respects page and limit parameters."""
    resp = client.get("/api/v1/marketplace/search?q=&page=1&limit=6")
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert "pagination" in data
    pagination = data["pagination"]
    assert pagination["page"] == 1
    assert pagination["limit"] == 6
