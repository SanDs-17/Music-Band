from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, func
from uuid import UUID
from typing import List, Tuple, Optional, Dict
from app.features.reviews.models import Review
from app.features.auth.models import User
from app.common.repositories.base import BaseRepository

class ReviewCRUD(BaseRepository[Review]):
    def __init__(self):
        super().__init__(Review)

    def get(self, db: Session, id: UUID) -> Optional[Review]:
        return db.query(Review).options(
            joinedload(Review.client)
        ).filter(
            Review.id == id,
            Review.deleted_at.is_(None)
        ).first()

    def get_by_artist(
        self,
        db: Session,
        artist_id: UUID,
        rating: Optional[int] = None,
        search: Optional[str] = None,
        offset: int = 0,
        limit: int = 10
    ) -> Tuple[List[Review], int]:
        query = db.query(Review).options(
            joinedload(Review.client)
        ).filter(
            Review.artist_profile_id == artist_id,
            Review.deleted_at.is_(None)
        )

        if rating:
            query = query.filter(Review.rating == rating)

        if search:
            query = query.join(Review.client).filter(
                or_(
                    Review.comment.ilike(f"%{search}%"),
                    User.name.ilike(f"%{search}%")
                )
            )

        total = query.count()
        results = query.order_by(Review.created_at.desc()).offset(offset).limit(limit).all()
        return results, total

    def get_summary(self, db: Session, artist_id: UUID) -> Tuple[float, int, Dict[int, int]]:
        # Count total and average
        stats = db.query(
            func.avg(Review.rating),
            func.count(Review.id)
        ).filter(
            Review.artist_profile_id == artist_id,
            Review.deleted_at.is_(None)
        ).first()
        
        avg_rating = float(stats[0]) if stats[0] else 0.0
        total_reviews = int(stats[1]) if stats[1] else 0
        
        # Rating frequencies
        freqs = db.query(
            Review.rating,
            func.count(Review.id)
        ).filter(
            Review.artist_profile_id == artist_id,
            Review.deleted_at.is_(None)
        ).group_by(Review.rating).all()
        
        distribution = {5: 0, 4: 0, 3: 0, 2: 0, 1: 0}
        for rating, count in freqs:
            distribution[rating] = count

        return avg_rating, total_reviews, distribution

review_crud = ReviewCRUD()

