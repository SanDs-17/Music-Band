from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime
from typing import Any, Optional, List, Tuple
from loguru import logger
from app.features.bookings.crud import booking_crud
from app.features.bookings.models import Booking
from app.features.artists.models import ArtistProfile
from app.features.artists.crud import ArtistProfileCRUD
from app.features.artists.service import ArtistService
from app.core.exceptions import NotFoundException, BadRequestException

class BookingService:
    def __init__(self):
        self.artist_crud = ArtistProfileCRUD()
        self.artist_service = ArtistService()

    def get_artist_profile(self, db: Session, user_id: str):
        artist = self.artist_crud.get_by_user_id(db, user_id)
        if not artist:
            raise NotFoundException("Artist profile not found.")
        return artist

    def create_booking(self, db: Session, client_id: UUID, data: Any) -> Booking:
        artist_profile = db.query(ArtistProfile).filter(ArtistProfile.id == data.artist_profile_id).first()
        if not artist_profile:
            raise NotFoundException("Artist profile not found.")

        # Event conflict check connection
        has_conflict, reason = self.artist_service.check_availability_conflict(
            db, str(artist_profile.user_id), data.event_date, data.start_time, data.end_time
        )
        if has_conflict:
            raise BadRequestException(f"Booking slot conflict: {reason or 'Performer is unavailable.'}")

        booking = booking_crud.create(db, client_id, data.artist_profile_id, data.model_dump())
        logger.info(f"Booking {booking.id} created successfully by client {client_id} for artist {data.artist_profile_id}")
        return booking

    def get_artist_bookings(
        self,
        db: Session,
        user_id: str,
        status: Optional[str] = None,
        search: Optional[str] = None,
        page: int = 1,
        limit: int = 10
    ) -> Tuple[List[Booking], int]:
        artist = self.get_artist_profile(db, user_id)
        offset = (page - 1) * limit
        return booking_crud.get_by_artist(db, artist.id, status, search, offset, limit)

    def get_booking_details(self, db: Session, user_id: str, booking_id: UUID) -> Booking:
        booking = booking_crud.get(db, booking_id)
        if not booking:
            raise NotFoundException("Booking request not found.")
            
        artist = self.artist_crud.get_by_user_id(db, user_id)
        # Verify access: user is client or target performer
        if str(booking.client_id) != user_id and (not artist or booking.artist_profile_id != artist.id):
            raise BadRequestException("Access denied to view this booking request.")
            
        return booking

    def accept_booking(self, db: Session, user_id: str, booking_id: UUID) -> Booking:
        artist = self.get_artist_profile(db, user_id)
        booking = booking_crud.get(db, booking_id)
        if not booking or booking.artist_profile_id != artist.id:
            raise NotFoundException("Booking request not found.")
            
        if booking.status in ["accepted", "rejected", "cancelled"]:
            raise BadRequestException(f"Cannot accept booking: Already marked as {booking.status}.")

        now_str = datetime.utcnow().isoformat()
        timeline = list(booking.timeline or [])
        timeline.append({
            "status": "accepted",
            "timestamp": now_str,
            "by": "artist",
            "message": "Booking request approved by performer! Get ready for the gig."
        })

        booking.status = "accepted"
        booking.timeline = timeline
        db.add(booking)
        db.commit()
        db.refresh(booking)
        logger.info(f"Booking request {booking.id} accepted by artist user {user_id}")
        return booking

    def reject_booking(self, db: Session, user_id: str, booking_id: UUID) -> Booking:
        artist = self.get_artist_profile(db, user_id)
        booking = booking_crud.get(db, booking_id)
        if not booking or booking.artist_profile_id != artist.id:
            raise NotFoundException("Booking request not found.")

        if booking.status in ["accepted", "rejected", "cancelled"]:
            raise BadRequestException(f"Cannot reject booking: Already marked as {booking.status}.")

        now_str = datetime.utcnow().isoformat()
        timeline = list(booking.timeline or [])
        timeline.append({
            "status": "rejected",
            "timestamp": now_str,
            "by": "artist",
            "message": "Booking request rejected by performer."
        })

        booking.status = "rejected"
        booking.timeline = timeline
        db.add(booking)
        db.commit()
        db.refresh(booking)
        logger.info(f"Booking request {booking.id} rejected by artist user {user_id}")
        return booking

    def counter_offer(self, db: Session, user_id: str, booking_id: UUID, counter_price: float, message: Optional[str]) -> Booking:
        artist = self.get_artist_profile(db, user_id)
        booking = booking_crud.get(db, booking_id)
        if not booking or booking.artist_profile_id != artist.id:
            raise NotFoundException("Booking request not found.")

        if booking.status in ["accepted", "rejected", "cancelled"]:
            raise BadRequestException(f"Cannot place counter offer: Already marked as {booking.status}.")

        now_str = datetime.utcnow().isoformat()
        timeline = list(booking.timeline or [])
        timeline.append({
            "status": "counter_offered",
            "timestamp": now_str,
            "by": "artist",
            "message": f"Counter offer placed by performer: {counter_price}. Note: {message or 'No message'}"
        })

        booking.status = "counter_offered"
        booking.counter_price = counter_price
        booking.timeline = timeline
        db.add(booking)
        db.commit()
        db.refresh(booking)
        logger.info(f"Booking request {booking.id} counter offered by artist user {user_id} with price {counter_price}")
        return booking

    def cancel_booking(self, db: Session, user_id: str, booking_id: UUID) -> Booking:
        booking = booking_crud.get(db, booking_id)
        if not booking:
            raise NotFoundException("Booking request not found.")

        artist = self.artist_crud.get_by_user_id(db, user_id)
        # Verify access: user is client or target performer
        is_client = str(booking.client_id) == user_id
        is_artist = artist and booking.artist_profile_id == artist.id
        if not is_client and not is_artist:
            raise BadRequestException("Access denied to cancel this booking request.")

        now_str = datetime.utcnow().isoformat()
        timeline = list(booking.timeline or [])
        timeline.append({
            "status": "cancelled",
            "timestamp": now_str,
            "by": "client" if is_client else "artist",
            "message": "Booking request cancelled."
        })

        booking.status = "cancelled"
        booking.timeline = timeline
        db.add(booking)
        db.commit()
        db.refresh(booking)
        logger.info(f"Booking request {booking.id} cancelled by user {user_id}")
        return booking

booking_service = BookingService()
