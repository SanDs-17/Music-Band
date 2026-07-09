from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime
from typing import Optional
from loguru import logger
from app.features.reviews.crud import review_crud
from app.features.reviews.models import Review
from app.features.artists.crud import ArtistProfileCRUD
from app.core.exceptions import NotFoundException

class ReviewService:
    def __init__(self):
        self.artist_crud = ArtistProfileCRUD()

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
        
        # Proactively update overall artist rating
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
        
        # Proactively update overall venue rating
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
        """Retrieves rating averages, distributions, and review feeds publicly by venue ID."""
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
