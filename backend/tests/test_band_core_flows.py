import os
from datetime import date

os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base
from app.api.band_auth import crud as auth_crud
from app.api.band_bookings import service as booking_service
from app.models.band_models import BandArtistProfile, BandBooking, BandVenue


@pytest.fixture()
def session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    return Session()


def test_register_artist_creates_profile_and_allows_login(session):
    account = auth_crud.create_account(
        session,
        email="artist@example.com",
        password="secret123",
        name="Asha",
        role="artist",
        phone="9999999999",
    )

    profile = (
        session.query(BandArtistProfile)
        .filter(BandArtistProfile.account_id == account.id)
        .first()
    )

    assert account.role == "artist"
    assert profile is not None
    assert auth_crud.authenticate(session, "artist@example.com", "secret123") is not None


def test_verify_email_marks_account_verified(session):
    account = auth_crud.create_account(
        session,
        email="verify@example.com",
        password="secret123",
        name="Veer",
        role="client",
    )

    verified = auth_crud.verify_account(session, account.id)

    assert verified.is_verified is True


def test_verify_email_token_marks_account_verified(session):
    account = auth_crud.create_account(
        session,
        email="verify-token@example.com",
        password="secret123",
        name="Verifier",
        role="client",
    )

    token = auth_crud.make_verify_token(account)
    verified = auth_crud.verify_email_token(session, token)

    assert verified is not None
    assert verified.is_verified is True


def test_resend_verification_sends_email_for_unverified_account(monkeypatch, session):
    sent = {}

    def fake_send_verification_email(to_email: str, token: str) -> bool:
        sent["email"] = to_email
        sent["token"] = token
        return True

    monkeypatch.setattr("app.services.email.send_verification_email", fake_send_verification_email)

    account = auth_crud.create_account(
        session,
        email="resend@example.com",
        password="secret123",
        name="Resend",
        role="client",
    )

    assert auth_crud.resend_verification(session, account.email) is True
    assert sent["email"] == account.email
    assert sent["token"]

    assert auth_crud.resend_verification(session, "missing@example.com") is False
    auth_crud.verify_account(session, account.id)
    assert auth_crud.resend_verification(session, account.email) is False


def test_admin_booking_status_change_updates_booking(session):
    account = auth_crud.create_account(
        session,
        email="client@example.com",
        password="secret123",
        name="Client",
        role="client",
    )
    admin_account = auth_crud.create_account(
        session,
        email="admin@example.com",
        password="secret123",
        name="Admin",
        role="admin",
    )

    artist = BandArtistProfile(account_id=account.id, display_name="Test Artist")
    session.add(artist)
    session.flush()

    booking = BandBooking(
        artist_profile_id=artist.id,
        client_id=account.id,
        event_name="Gig",
        event_date=date.fromisoformat("2026-07-30"),
        start_time="18:00",
        end_time="22:00",
        location="A",
        proposed_price=1200,
        status="pending",
        timeline=[],
    )
    session.add(booking)
    session.commit()
    session.refresh(booking)

    updated = booking_service.admin_update_status(session, admin_account.id, booking.id, "accepted")

    assert updated["status"] == "accepted"
    assert updated["timeline"][-1]["status"] == "accepted"
