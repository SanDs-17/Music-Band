"""
Business logic service layers for Venue listing management.
"""

from sqlalchemy.orm import Session
from loguru import logger
from app.features.venues.crud import VenueCRUD
from app.features.venues.models import Venue
from app.features.venues.schemas import VenueVerificationUpdate, VenueRegisterRequest
from app.features.auth.crud import UserCRUD, RoleCRUD
from app.core.exceptions import NotFoundException, ConflictException
from app.core.security import get_password_hash


class VenueService:
    """Service class for managing platform event space profiles verification pipelines."""

    def __init__(self):
        self.crud = VenueCRUD()
        self.user_crud = UserCRUD()
        self.role_crud = RoleCRUD()

    def register_venue(self, db: Session, data: VenueRegisterRequest) -> Venue:
        """Atomically registers a new venue owner user and builds their space profile."""
        # 1. Check if email user already exists
        existing_user = self.user_crud.get_by_email(db, data.email)
        if existing_user:
            raise ConflictException(f"User with email {data.email} already exists.")

        # 2. Get or create venue_owner role
        role = self.role_crud.get_by_name(db, "venue_owner")
        if not role:
            role = self.role_crud.create(db, obj_in={"name": "venue_owner", "description": "Venue Owner role"})

        # 3. Create User account
        hashed_password = get_password_hash(data.password)
        user = self.user_crud.create(
            db,
            obj_in={
                "email": data.email,
                "password_hash": hashed_password,
                "name": data.owner_name,
                "is_active": True,
                "is_verified": False
            }
        )
        user.roles.append(role)
        db.flush()  # Generate user.id

        # 4. Create Venue Profile
        pricing_details = {
            "hourly_price": data.hourly_price,
            "extra_charges": data.extra_charges,
            "security_deposit": data.security_deposit
        }
        availability_rules = {
            "weekly_schedule": data.weekly_schedule,
            "holidays": data.holidays,
            "blocked_dates": data.blocked_dates
        }
        gallery_data = data.images + data.videos
        if data.virtual_tour:
            gallery_data.append(data.virtual_tour)

        venue = self.crud.create(
            db,
            obj_in={
                "user_id": user.id,
                "name": data.venue_name,
                "venue_type": data.venue_type,
                "description": data.description,
                "address": data.address,
                "city_id": data.city_id,
                "pincode": data.pincode,
                "state": data.state,
                "country": data.country,
                "google_map_location": data.google_map_location,
                "min_capacity": data.min_capacity,
                "capacity": data.max_capacity,  # capacity is max capacity
                "base_price": data.base_price,
                "facilities": data.facilities,
                "gallery": gallery_data,
                "pricing_details": pricing_details,
                "availability_rules": availability_rules,
                "verification_status": "pending"
            }
        )
        db.commit()
        db.refresh(venue)
        logger.info(f"Successfully registered venue '{venue.name}' for user {user.email}")
        return venue

    def update_verification_status(
        self,
        db: Session,
        venue_id: str,
        data: VenueVerificationUpdate
    ) -> Venue:
        """Approves, rejects, or flags an event space's profile details verification request."""
        venue = self.crud.get(db, venue_id)
        if not venue or venue.deleted_at is not None:
            raise NotFoundException("Venue listing not found.")

        # Update verify status
        venue.verification_status = data.verification_status
        venue.verification_notes = data.verification_notes
        
        # If approved, flag user verification flag to True
        if data.verification_status == "approved":
            user = self.user_crud.get(db, venue.user_id)
            if user:
                user.is_verified = True
                db.add(user)

        db.add(venue)
        db.commit()
        db.refresh(venue)
        logger.info(f"Venue listing {venue_id} verification updated to: {data.verification_status}")
        return venue

    def suspend_venue(self, db: Session, venue_id: str) -> Venue:
        """Suspends the underlying user login credentials linked to the venue profile."""
        venue = self.crud.get(db, venue_id)
        if not venue or venue.deleted_at is not None:
            raise NotFoundException("Venue listing not found.")
            
        user = self.user_crud.get(db, venue.user_id)
        if not user:
            raise NotFoundException("Linked user account not found.")

        user.is_active = False
        db.add(user)
        db.commit()
        db.refresh(venue)
        logger.info(f"Suspended venue owner credentials session access: User ID {user.id}")
        return venue

    def activate_venue(self, db: Session, venue_id: str) -> Venue:
        """Activates the underlying user login credentials linked to the venue profile."""
        venue = self.crud.get(db, venue_id)
        if not venue or venue.deleted_at is not None:
            raise NotFoundException("Venue listing not found.")
            
        user = self.user_crud.get(db, venue.user_id)
        if not user:
            raise NotFoundException("Linked user account not found.")

        user.is_active = True
        db.add(user)
        db.commit()
        db.refresh(venue)
        logger.info(f"Activated venue owner credentials session access: User ID {user.id}")
        return venue
