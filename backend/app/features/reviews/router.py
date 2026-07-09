from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional
from app.core.database import get_db
from app.core.dependencies import get_current_artist, get_current_venue_owner
from app.common.schemas.base import SuccessResponse
from app.features.reviews.schemas import (
    ReviewSummaryResponse,
    ReviewDetailsResponse,
    ReviewReplyRequest
)
from app.features.reviews.service import review_service

router = APIRouter(tags=["Reviews"])

@router.get(
    "/artist",
    response_model=SuccessResponse[ReviewSummaryResponse],
    status_code=status.HTTP_200_OK,
    summary="Get reviews list and distribution summary for the authenticated artist"
)
async def get_artist_reviews_list(
    rating: Optional[int] = Query(None, ge=1, le=5, description="Filter by rating level (1-5)"),
    search: Optional[str] = Query(None, description="Search reviewer name or comments"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    current_user_claims: dict = Depends(get_current_artist),
    db: Session = Depends(get_db)
):
    """
    Retrieves average score, rating distributions, and comments feeds for the performer.
    """
    summary = review_service.get_artist_reviews_summary(
        db, current_user_claims["sub"], rating, search, page, limit
    )
    return SuccessResponse(
        success=True,
        data={
            "average_rating": summary["average_rating"],
            "total_reviews": summary["total_reviews"],
            "rating_distribution": summary["rating_distribution"],
            "reviews": [_format_review(r) for r in summary["reviews"]]
        },
        message="Reviews list and stats retrieved."
    )

@router.put(
    "/{review_id}/reply",
    response_model=SuccessResponse[ReviewDetailsResponse],
    status_code=status.HTTP_200_OK,
    summary="Add / edit performer reply to a review comment"
)
async def reply_to_customer_review(
    review_id: UUID,
    data: ReviewReplyRequest,
    current_user_claims: dict = Depends(get_current_artist),
    db: Session = Depends(get_db)
):
    """
    Saves performer response remarks to host comment. Updates timeline.
    """
    review = review_service.reply_to_review(
        db, current_user_claims["sub"], review_id, data.reply_comment
    )
    return SuccessResponse(
        success=True,
        data=_format_review(review),
        message="Review reply updated."
    )


@router.get(
    "/venue",
    response_model=SuccessResponse[ReviewSummaryResponse],
    status_code=status.HTTP_200_OK,
    summary="Get reviews list and distribution summary for the authenticated venue owner"
)
async def get_venue_reviews_list(
    rating: Optional[int] = Query(None, ge=1, le=5, description="Filter by rating level (1-5)"),
    search: Optional[str] = Query(None, description="Search reviewer name or comments"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    current_user_claims: dict = Depends(get_current_venue_owner),
    db: Session = Depends(get_db)
):
    """
    Retrieves average score, rating distributions, and comments feeds for the venue.
    """
    summary = review_service.get_venue_reviews_summary(
        db, current_user_claims["sub"], rating, search, page, limit
    )
    return SuccessResponse(
        success=True,
        data={
            "average_rating": summary["average_rating"],
            "total_reviews": summary["total_reviews"],
            "rating_distribution": summary["rating_distribution"],
            "reviews": [_format_review(r) for r in summary["reviews"]]
        },
        message="Venue reviews list and stats retrieved."
    )


@router.put(
    "/venue/{review_id}/reply",
    response_model=SuccessResponse[ReviewDetailsResponse],
    status_code=status.HTTP_200_OK,
    summary="Add / edit venue owner reply to a review comment"
)
async def reply_to_venue_review(
    review_id: UUID,
    data: ReviewReplyRequest,
    current_user_claims: dict = Depends(get_current_venue_owner),
    db: Session = Depends(get_db)
):
    """
    Saves venue owner response remarks to client review comment.
    """
    review = review_service.reply_to_venue_review(
        db, current_user_claims["sub"], review_id, data.reply_comment
    )
    return SuccessResponse(
        success=True,
        data=_format_review(review),
        message="Venue review reply updated."
    )


def _format_review(r) -> dict:
    return {
        "id": str(r.id),
        "rating": r.rating,
        "comment": r.comment,
        "reply_comment": r.reply_comment,
        "reply_at": r.reply_at.isoformat() if r.reply_at else None,
        "images": r.images or [],
        "videos": r.videos or [],
        "client": {
            "id": str(r.client.id),
            "name": r.client.name
        },
        "created_at": r.created_at.isoformat()
    }


@router.get(
    "/public/venue/{venue_id}",
    response_model=SuccessResponse[ReviewSummaryResponse],
    status_code=status.HTTP_200_OK,
    summary="Get reviews list and stats for a venue publicly by ID (no auth)"
)
async def get_public_venue_reviews(
    venue_id: UUID,
    rating: Optional[int] = Query(None, ge=1, le=5, description="Filter by rating level (1-5)"),
    search: Optional[str] = Query(None, description="Search comments"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Retrieves reviews average score, distributions, and comments list for a venue publicly by its ID.
    """
    summary = review_service.get_public_venue_reviews_summary(
        db, venue_id, rating, search, page, limit
    )
    return SuccessResponse(
        success=True,
        data={
            "average_rating": summary["average_rating"],
            "total_reviews": summary["total_reviews"],
            "rating_distribution": summary["rating_distribution"],
            "reviews": [_format_review(r) for r in summary["reviews"]]
        },
        message="Venue reviews list and stats retrieved publicly."
    )
