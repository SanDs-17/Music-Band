"""
Pytest unit and integration tests for Marketplace Phase 3 (Venue Discovery).
Tests venue filter options, popular venues, recent venues, venue preview, and search.
"""

from fastapi.testclient import TestClient


def test_get_venue_filters(client: TestClient):
    resp = client.get("/api/v1/marketplace/venues/filters")
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert "venue_types" in data
    assert "cities" in data
    assert "states" in data
    assert "capacity_ranges" in data
    assert "sort_options" in data


def test_get_featured_popular_recent_venues(client: TestClient):
    feat_resp = client.get("/api/v1/marketplace/venues/featured")
    assert feat_resp.status_code == 200
    assert isinstance(feat_resp.json()["data"], list)

    pop_resp = client.get("/api/v1/marketplace/venues/popular")
    assert pop_resp.status_code == 200
    assert isinstance(pop_resp.json()["data"], list)

    rec_resp = client.get("/api/v1/marketplace/venues/recent")
    assert rec_resp.status_code == 200
    assert isinstance(rec_resp.json()["data"], list)


def test_get_venue_preview_not_found(client: TestClient):
    fake_uuid = "00000000-0000-0000-0000-000000000000"
    resp = client.get(f"/api/v1/marketplace/venues/{fake_uuid}/preview")
    assert resp.status_code == 404
