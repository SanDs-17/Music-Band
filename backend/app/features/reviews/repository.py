from typing import List, Optional, Tuple
from uuid import UUID
from sqlalchemy.orm import Session, joinedload
from app.common.repositories.base import BaseRepository
from app.features.reviews.models import Review
from app.features.reviews.schemas import ReviewFilters


class ReviewRepository(BaseRepository[Review]):
    """
    Repository pattern implementation for Review entities.
    Strictly handles database interactions: CRUD, pagination, filtering, sorting, lookup.
    No business logic.
    """

    def __init__(self):
        super().__init__(Review)

    def get_by_id(self, db: Session, review_id: UUID) -> Optional[Review]:
        """Retrieves a single active review by ID."""
        return (
            db.query(Review)
            .options(
                joinedload(Review.reviewer),
                joinedload(Review.reviewee),
                joinedload(Review.client),
                joinedload(Review.artist_profile),
                joinedload(Review.venue)
            )
            .filter(Review.id == review_id, Review.deleted_at.is_(None))
            .first()
        )

    def get_by_booking(self, db: Session, booking_id: UUID) -> List[Review]:
        """Retrieves all non-deleted reviews associated with a specific booking."""
        return (
            db.query(Review)
            .options(
                joinedload(Review.reviewer),
                joinedload(Review.reviewee),
                joinedload(Review.client)
            )
            .filter(Review.booking_id == booking_id, Review.deleted_at.is_(None))
            .all()
        )

    def find_existing_review(
        self,
        db: Session,
        booking_id: UUID,
        reviewer_id: UUID,
        reviewee_id: Optional[UUID] = None
    ) -> Optional[Review]:
        """Looks up an active review for a specific booking and reviewer (and optional reviewee)."""
        query = db.query(Review).filter(
            Review.booking_id == booking_id,
            (Review.reviewer_id == reviewer_id) | (Review.client_id == reviewer_id),
            Review.deleted_at.is_(None)
        )
        if reviewee_id:
            query = query.filter(
                (Review.reviewee_id == reviewee_id) |
                (Review.artist_profile_id == reviewee_id) |
                (Review.venue_id == reviewee_id)
            )
        return query.first()

    def has_user_reviewed_booking(
        self,
        db: Session,
        booking_id: UUID,
        reviewer_id: UUID,
        reviewee_id: Optional[UUID] = None
    ) -> bool:
        """Returns True if a review has already been submitted for this direction."""
        return self.find_existing_review(db, booking_id, reviewer_id, reviewee_id) is not None

    def get_by_reviewer(
        self,
        db: Session,
        reviewer_id: UUID,
        offset: int = 0,
        limit: int = 20
    ) -> Tuple[List[Review], int]:
        """Retrieves paginated reviews written by a specific reviewer."""
        query = (
            db.query(Review)
            .options(
                joinedload(Review.reviewer),
                joinedload(Review.reviewee),
                joinedload(Review.client)
            )
            .filter(
                (Review.reviewer_id == reviewer_id) | (Review.client_id == reviewer_id),
                Review.deleted_at.is_(None)
            )
        )
        total = query.count()
        items = query.order_by(Review.created_at.desc()).offset(offset).limit(limit).all()
        return items, total

    def get_by_reviewee(
        self,
        db: Session,
        reviewee_id: UUID,
        offset: int = 0,
        limit: int = 20
    ) -> Tuple[List[Review], int]:
        """Retrieves paginated reviews received by a specific reviewee user/entity."""
        query = (
            db.query(Review)
            .options(
                joinedload(Review.reviewer),
                joinedload(Review.reviewee),
                joinedload(Review.client)
            )
            .filter(
                (Review.reviewee_id == reviewee_id) |
                (Review.artist_profile_id == reviewee_id) |
                (Review.venue_id == reviewee_id),
                Review.deleted_at.is_(None)
            )
        )
        total = query.count()
        items = query.order_by(Review.created_at.desc()).offset(offset).limit(limit).all()
        return items, total

    def filter_reviews(
        self,
        db: Session,
        filters: Optional[ReviewFilters] = None,
        offset: int = 0,
        limit: int = 20,
        sort_by: str = "created_at",
        sort_order: str = "desc"
    ) -> Tuple[List[Review], int]:
        """Applies filters, pagination, and sorting to list reviews."""
        query = db.query(Review).options(
            joinedload(Review.reviewer),
            joinedload(Review.reviewee),
            joinedload(Review.client)
        ).filter(Review.deleted_at.is_(None))

        if filters:
            if filters.booking_id:
                query = query.filter(Review.booking_id == filters.booking_id)
            if filters.reviewer_id:
                query = query.filter(
                    (Review.reviewer_id == filters.reviewer_id) |
                    (Review.client_id == filters.reviewer_id)
                )
            if filters.reviewee_id:
                query = query.filter(
                    (Review.reviewee_id == filters.reviewee_id) |
                    (Review.artist_profile_id == filters.reviewee_id) |
                    (Review.venue_id == filters.reviewee_id)
                )
            if filters.artist_profile_id:
                query = query.filter(Review.artist_profile_id == filters.artist_profile_id)
            if filters.venue_id:
                query = query.filter(Review.venue_id == filters.venue_id)
            if filters.rating is not None:
                query = query.filter(Review.rating == filters.rating)
            if filters.is_public is not None:
                query = query.filter(Review.is_public.is_(filters.is_public))
            if filters.search:
                search_term = f"%{filters.search}%"
                query = query.filter(
                    (Review.review_title.ilike(search_term)) |
                    (Review.review_text.ilike(search_term)) |
                    (Review.comment.ilike(search_term))
                )

        total = query.count()

        # Dynamic sorting
        sort_col = getattr(Review, sort_by, Review.created_at)
        if sort_order.lower() == "asc":
            query = query.order_by(sort_col.asc())
        else:
            query = query.order_by(sort_col.desc())

        items = query.offset(offset).limit(limit).all()
        return items, total

    def soft_delete(self, db: Session, review_id: UUID) -> Optional[Review]:
        """Soft-deletes a review by marking deleted_at timestamp."""
        review = self.get_by_id(db, review_id)
        if review:
            review.soft_delete()
            db.add(review)
            db.commit()
            db.refresh(review)
        return review


review_repository = ReviewRepository()
