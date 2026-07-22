"""
Pytest unit and integration tests for Marketplace Phase 2 (Artist Discovery).
Tests artist filter options, popular artists, recent artists, artist preview, and search.
"""

from fastapi.testclient import TestClient


def test_get_artist_filters(client: TestClient):
    resp = client.get("/api/v1/marketplace/artists/filters")
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert "genres" in data
    assert "categories" in data
    assert "cities" in data
    assert "states" in data
    assert "band_types" in data
    assert "sort_options" in data


def test_get_featured_popular_recent_artists(client: TestClient):
    feat_resp = client.get("/api/v1/marketplace/artists/featured")
    assert feat_resp.status_code == 200
    assert isinstance(feat_resp.json()["data"], list)

    pop_resp = client.get("/api/v1/marketplace/artists/popular")
    assert pop_resp.status_code == 200
    assert isinstance(pop_resp.json()["data"], list)

    rec_resp = client.get("/api/v1/marketplace/artists/recent")
    assert rec_resp.status_code == 200
    assert isinstance(rec_resp.json()["data"], list)


def test_get_artist_preview_not_found(client: TestClient):
    fake_uuid = "00000000-0000-0000-0000-000000000000"
    resp = client.get(f"/api/v1/marketplace/artists/{fake_uuid}/preview")
    assert resp.status_code == 404
