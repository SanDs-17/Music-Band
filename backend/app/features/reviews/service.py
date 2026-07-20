from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime
from typing import Optional, List, Tuple
from loguru import logger

from app.features.reviews.repository import review_repository
from app.features.reviews.crud import review_crud
from app.features.reviews.models import Review
from app.features.reviews.schemas import (
    CreateReviewRequest,
    UpdateReviewRequest,
    ReviewFilters,
    ReviewEligibilityResponse
)
from app.features.artists.crud import ArtistProfileCRUD
from app.features.bookings.crud import BookingCRUD
from app.core.exceptions import (
    NotFoundException,
    ForbiddenException,
    BadRequestException,
    ConflictException
)


class ReviewService:
    """
    Service layer for managing Reviews & Ratings workflow and foundation.
    Encapsulates business rules, participant validation, duplicate prevention, and exception handling.
    """

    def __init__(self):
        self.repository = review_repository
        self.artist_crud = ArtistProfileCRUD()
        self.booking_crud = BookingCRUD()

    def check_eligibility(
        self,
        db: Session,
        reviewer_id: UUID,
        booking_id: UUID,
        target_user_id: Optional[UUID] = None
    ) -> ReviewEligibilityResponse:
        """
        Checks if a user is eligible to leave a review for a specific booking.
        Rule: Booking must exist, status must be 'completed', user must be a participant,
        and user must not have already submitted a review for this direction.
        """
        booking = self.booking_crud.get(db, booking_id)
        if not booking:
            return ReviewEligibilityResponse(
                eligible=False,
                booking_id=booking_id,
                reviewer_id=reviewer_id,
                reason="Booking not found.",
                already_reviewed=False
            )

        if str(booking.status).lower() != "completed":
            return ReviewEligibilityResponse(
                eligible=False,
                booking_id=booking_id,
                reviewer_id=reviewer_id,
                reason=f"Booking status is '{booking.status}'. Only COMPLETED bookings can be reviewed.",
                already_reviewed=False
            )

        # Participant identification
        is_client = str(booking.client_id) == str(reviewer_id)
        is_artist = False
        if booking.artist_profile:
            is_artist = str(booking.artist_profile.user_id) == str(reviewer_id)
        is_venue = False
        if booking.venue:
            is_venue = str(booking.venue.user_id) == str(reviewer_id)

        if not (is_client or is_artist or is_venue):
            return ReviewEligibilityResponse(
                eligible=False,
                booking_id=booking_id,
                reviewer_id=reviewer_id,
                reason="Access denied: You are not a participant in this booking.",
                already_reviewed=False
            )

        # Target reviewee determination
        resolved_reviewee_id = target_user_id
        resolved_reviewee_role = None

        if is_client:
            if booking.artist_profile:
                resolved_reviewee_id = booking.artist_profile.user_id
                resolved_reviewee_role = "artist"
            elif booking.venue:
                resolved_reviewee_id = booking.venue.user_id
                resolved_reviewee_role = "venue_owner"
        elif is_artist or is_venue:
            resolved_reviewee_id = booking.client_id
            resolved_reviewee_role = "client"

        already_reviewed = self.repository.has_user_reviewed_booking(
            db, booking_id, reviewer_id, resolved_reviewee_id
        )

        if already_reviewed:
            return ReviewEligibilityResponse(
                eligible=False,
                booking_id=booking_id,
                reviewer_id=reviewer_id,
                reviewee_id=resolved_reviewee_id,
                reviewee_role=resolved_reviewee_role,
                reason="You have already submitted a review for this booking.",
                already_reviewed=True
            )

        return ReviewEligibilityResponse(
            eligible=True,
            booking_id=booking_id,
            reviewer_id=reviewer_id,
            reviewee_id=resolved_reviewee_id,
            reviewee_role=resolved_reviewee_role,
            reason=None,
            already_reviewed=False
        )

    def create_review(
        self,
        db: Session,
        reviewer_id: UUID,
        reviewer_role: str,
        data: CreateReviewRequest
    ) -> Review:
        """
        Creates a new Review record after running workflow validations:
        1. Rating between 1 and 5.
        2. Booking workflow validation (status COMPLETED).
        3. Participant authorization.
        4. Duplicate review prevention (409 Conflict).
        """
        if data.rating < 1 or data.rating > 5:
            raise BadRequestException("Rating must be an integer between 1 and 5.")

        # Workflow validation if booking_id provided
        if data.booking_id:
            eligibility = self.check_eligibility(db, reviewer_id, data.booking_id, data.reviewee_id)
            if not eligibility.eligible:
                if eligibility.already_reviewed:
                    raise ConflictException("You have already submitted a review for this booking.")
                if "not a participant" in (eligibility.reason or "").lower():
                    raise ForbiddenException(eligibility.reason)
                raise BadRequestException(eligibility.reason)

            if not data.reviewee_id and eligibility.reviewee_id:
                data.reviewee_id = eligibility.reviewee_id
            if not data.reviewee_role and eligibility.reviewee_role:
                data.reviewee_role = eligibility.reviewee_role

        review_text_val = data.review_text or data.comment or ""

        review_obj = Review(
            booking_id=data.booking_id,
            reviewer_id=reviewer_id,
            reviewer_role=reviewer_role,
            reviewee_id=data.reviewee_id,
            reviewee_role=data.reviewee_role,
            artist_profile_id=data.artist_profile_id,
            venue_id=data.venue_id,
            client_id=reviewer_id,
            rating=data.rating,
            review_title=data.review_title,
            review_text=review_text_val,
            comment=review_text_val,
            is_public=data.is_public,
            images=data.images or [],
            videos=data.videos or []
        )

        db.add(review_obj)
        db.commit()
        db.refresh(review_obj)
        logger.info(f"Review {review_obj.id} created by user {reviewer_id} for booking {data.booking_id} with rating {data.rating}")

        # Update average rating if linked to artist or venue
        if data.artist_profile_id:
            self._update_artist_average_rating(db, data.artist_profile_id)
        if data.venue_id:
            self._update_venue_average_rating(db, data.venue_id)

        return review_obj

    def get_review(self, db: Session, review_id: UUID) -> Review:
        """Retrieves a single review by ID. Raises NotFoundException if missing/deleted."""
        review = self.repository.get_by_id(db, review_id)
        if not review:
            raise NotFoundException("Review not found.")
        return review

    def update_review(
        self,
        db: Session,
        current_user_id: UUID,
        review_id: UUID,
        data: UpdateReviewRequest,
        is_admin: bool = False
    ) -> Review:
        """Updates an existing review."""
        review = self.get_review(db, review_id)

        if not is_admin and str(review.reviewer_id) != str(current_user_id) and str(review.client_id) != str(current_user_id):
            raise ForbiddenException("Access denied: You cannot modify another user's review.")

        if data.rating is not None:
            if data.rating < 1 or data.rating > 5:
                raise BadRequestException("Rating must be an integer between 1 and 5.")
            review.rating = data.rating

        if data.review_title is not None:
            review.review_title = data.review_title
        if data.review_text is not None:
            review.review_text = data.review_text
            review.comment = data.review_text
        elif data.comment is not None:
            review.comment = data.comment
            review.review_text = data.comment

        if data.is_public is not None:
            review.is_public = data.is_public
        if data.images is not None:
            review.images = data.images
        if data.videos is not None:
            review.videos = data.videos

        db.add(review)
        db.commit()
        db.refresh(review)
        logger.info(f"Review {review_id} updated by user {current_user_id}")

        if review.artist_profile_id:
            self._update_artist_average_rating(db, review.artist_profile_id)
        if review.venue_id:
            self._update_venue_average_rating(db, review.venue_id)

        return review

    def delete_review(
        self,
        db: Session,
        current_user_id: UUID,
        review_id: UUID,
        is_admin: bool = False
    ) -> Review:
        """Soft-deletes a review."""
        review = self.get_review(db, review_id)

        if not is_admin and str(review.reviewer_id) != str(current_user_id) and str(review.client_id) != str(current_user_id):
            raise ForbiddenException("Access denied: You cannot delete another user's review.")

        review.soft_delete()
        db.add(review)
        db.commit()
        db.refresh(review)
        logger.info(f"Review {review_id} soft-deleted by user {current_user_id}")

        if review.artist_profile_id:
            self._update_artist_average_rating(db, review.artist_profile_id)
        if review.venue_id:
            self._update_venue_average_rating(db, review.venue_id)

        return review

    def list_reviews(
        self,
        db: Session,
        filters: Optional[ReviewFilters] = None,
        page: int = 1,
        limit: int = 20,
        sort_by: str = "created_at",
        sort_order: str = "desc"
    ) -> Tuple[List[Review], int]:
        """Lists reviews with filtering, pagination, and sorting."""
        offset = (page - 1) * limit
        return self.repository.filter_reviews(
            db,
            filters=filters,
            offset=offset,
            limit=limit,
            sort_by=sort_by,
            sort_order=sort_order
        )

    def get_reviews_by_booking(self, db: Session, booking_id: UUID) -> List[Review]:
        """Gets all non-deleted reviews for a given booking."""
        return self.repository.get_by_booking(db, booking_id)

    def get_my_reviews(
        self,
        db: Session,
        reviewer_id: UUID,
        page: int = 1,
        limit: int = 20
    ) -> Tuple[List[Review], int]:
        """Gets paginated reviews created by current user."""
        offset = (page - 1) * limit
        return self.repository.get_by_reviewer(db, reviewer_id, offset, limit)

    def get_user_reviews(
        self,
        db: Session,
        user_id: UUID,
        page: int = 1,
        limit: int = 20
    ) -> Tuple[List[Review], int]:
        """Gets paginated public reviews received by a user."""
        offset = (page - 1) * limit
        return self.repository.get_by_reviewee(db, user_id, offset, limit)

    # Legacy & portal helper methods
    def get_artist_profile(self, db: Session, user_id: str):
        artist = self.artist_crud.get_by_user_id(db, user_id)
        if not artist:
            raise NotFoundException("Artist profile not found.")
        return artist

    def get_artist_reviews_summary(
        self,
        db: Session,
        user_id: str,
        rating: Optional[int] = None,
        search: Optional[str] = None,
        page: int = 1,
        limit: int = 10
    ) -> dict:
        artist = self.get_artist_profile(db, user_id)
        offset = (page - 1) * limit
        results, total = review_crud.get_by_artist(db, artist.id, rating, search, offset, limit)
        avg_rating, total_reviews, distribution = review_crud.get_summary(db, artist.id)

        return {
            "average_rating": avg_rating,
            "total_reviews": total_reviews,
            "rating_distribution": distribution,
            "reviews": results
        }

    def reply_to_review(self, db: Session, user_id: str, review_id: UUID, reply_comment: str) -> Review:
        artist = self.get_artist_profile(db, user_id)
        review = review_crud.get(db, review_id)
        if not review or review.artist_profile_id != artist.id:
            raise NotFoundException("Review not found.")

        review.reply_comment = reply_comment
        review.reply_at = datetime.utcnow()
        db.add(review)
        db.commit()
        db.refresh(review)

        self._update_artist_average_rating(db, artist.id)
        logger.info(f"Artist user {user_id} replied to review {review_id}")
        return review

    def _update_artist_average_rating(self, db: Session, artist_id: UUID):
        avg_rating, _, _ = review_crud.get_summary(db, artist_id)
        artist = self.artist_crud.get(db, artist_id)
        if artist:
            artist.rating = avg_rating
            db.add(artist)
            db.commit()

    def get_venue_profile(self, db: Session, user_id: str):
        from app.features.venues.crud import VenueCRUD
        venues = VenueCRUD().get_by_user_id(db, user_id)
        if not venues:
            raise NotFoundException("Venue profile not found.")
        return venues[0]

    def get_venue_reviews_summary(
        self,
        db: Session,
        user_id: str,
        rating: Optional[int] = None,
        search: Optional[str] = None,
        page: int = 1,
        limit: int = 10
    ) -> dict:
        venue = self.get_venue_profile(db, user_id)
        offset = (page - 1) * limit
        results, total = review_crud.get_by_venue(db, venue.id, rating, search, offset, limit)
        avg_rating, total_reviews, distribution = review_crud.get_venue_summary(db, venue.id)

        return {
            "average_rating": avg_rating,
            "total_reviews": total,
            "rating_distribution": distribution,
            "reviews": results,
            "total_count": total
        }

    def reply_to_venue_review(self, db: Session, user_id: str, review_id: UUID, reply_comment: str) -> Review:
        venue = self.get_venue_profile(db, user_id)
        review = review_crud.get(db, review_id)
        if not review or review.venue_id != venue.id:
            raise NotFoundException("Review not found.")

        review.reply_comment = reply_comment
        review.reply_at = datetime.utcnow()
        db.add(review)
        db.commit()
        db.refresh(review)

        self._update_venue_average_rating(db, venue.id)
        logger.info(f"Venue owner user {user_id} replied to review {review_id}")
        return review

    def _update_venue_average_rating(self, db: Session, venue_id: UUID):
        avg_rating, _, _ = review_crud.get_venue_summary(db, venue_id)
        from app.features.venues.crud import VenueCRUD
        venue = VenueCRUD().get(db, venue_id)
        if venue:
            metadata = dict(venue.metadata_fields or {})
            metadata["average_rating"] = avg_rating
            venue.metadata_fields = metadata
            db.add(venue)
            db.commit()

    def get_public_venue_reviews_summary(
        self,
        db: Session,
        venue_id: UUID,
        rating: Optional[int] = None,
        search: Optional[str] = None,
        page: int = 1,
        limit: int = 10
    ) -> dict:
        offset = (page - 1) * limit
        results, total = review_crud.get_by_venue(db, venue_id, rating, search, offset, limit)
        avg_rating, total_reviews, distribution = review_crud.get_venue_summary(db, venue_id)

        return {
            "average_rating": avg_rating,
            "total_reviews": total,
            "rating_distribution": distribution,
            "reviews": results,
            "total_count": total
        }


review_service = ReviewService()
