import uuid
import pytest
from app.features.auth.models import User
from app.features.locations.models import Country, State, City
from app.features.venues.models import Venue
from app.features.reviews.models import Review

@pytest.fixture
def mock_venue(db_session):
    owner = User(
        id=uuid.uuid4(),
        email="venue_owner@example.com",
        password_hash="test",
        name="Venue Owner",
        is_active=True,
        is_verified=True
    )
    db_session.add(owner)
    db_session.commit()
    
    country = Country(id=uuid.uuid4(), name="Test Country", code="TC")
    db_session.add(country)
    state = State(id=uuid.uuid4(), name="Test State", country_id=country.id)
    db_session.add(state)
    city = City(id=uuid.uuid4(), name="Test City", state_id=state.id)
    db_session.add(city)
    db_session.commit()

    venue = Venue(
        id=uuid.uuid4(),
        user_id=owner.id,
        name="Plaza Hall",
        description="A beautiful event hall.",
        address="789 Avenue Road",
        city_id=city.id,
        base_price=1200.0,
        capacity=300,
        facilities=["av_system", "parking", "green_room"],
        pricing_details={"hourly_price": 150.0},
        availability_rules={"weekly_schedule": {}},
        verification_status="approved"
    )
    db_session.add(venue)
    db_session.commit()

    # Add a mock review
    client_user = User(
        id=uuid.uuid4(),
        email="client@example.com",
        password_hash="test",
        name="Client User",
        is_active=True,
        is_verified=True
    )
    db_session.add(client_user)
    db_session.commit()

    review = Review(
        id=uuid.uuid4(),
        venue_id=venue.id,
        client_id=client_user.id,
        rating=5,
        comment="Absolutely fantastic space, highly recommended!"
    )
    db_session.add(review)
    db_session.commit()

    return {
        "venue": venue,
        "review": review
    }

def test_get_public_venue_detail(client, mock_venue):
    response = client.get(f"/api/v1/venues/{mock_venue['venue'].id}")
    assert response.status_code == 200
    res_data = response.json()["data"]
    assert res_data["name"] == "Plaza Hall"
    assert res_data["address"] == "789 Avenue Road"
    assert "av_system" in res_data["facilities"]

def test_get_public_venue_reviews(client, mock_venue):
    response = client.get(f"/api/v1/reviews/public/venue/{mock_venue['venue'].id}")
    assert response.status_code == 200
    res_data = response.json()["data"]
    assert res_data["average_rating"] == 5.0
    assert res_data["total_reviews"] == 1
    assert len(res_data["reviews"]) == 1
    assert res_data["reviews"][0]["comment"] == "Absolutely fantastic space, highly recommended!"
