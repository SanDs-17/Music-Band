from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional, List

from app.core.database import get_db
from app.core.dependencies import get_current_user, get_current_artist, get_current_venue_owner
from app.common.schemas.base import SuccessResponse
from app.features.reviews.schemas import (
    CreateReviewRequest,
    UpdateReviewRequest,
    ReviewResponse,
    ReviewListResponse,
    ReviewFilters,
    ReviewSummaryResponse,
    ReviewDetailsResponse,
    ReviewReplyRequest,
    ReviewEligibilityResponse
)
from app.features.reviews.service import review_service

router = APIRouter(tags=["Reviews"])


# ─── PORTAL SPECIFIC & PUBLIC STATIC ENDPOINTS (BEFORE PARAMETERIZED ROUTES) ─

@router.get(
    "/artist",
    response_model=SuccessResponse[ReviewSummaryResponse],
    status_code=status.HTTP_200_OK,
    summary="Get reviews list and distribution summary for the authenticated artist"
)
async def get_artist_reviews_list(
    rating: Optional[int] = Query(None, ge=1, le=5),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    current_user_claims: dict = Depends(get_current_artist),
    db: Session = Depends(get_db)
):
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


@router.get(
    "/venue",
    response_model=SuccessResponse[ReviewSummaryResponse],
    status_code=status.HTTP_200_OK,
    summary="Get reviews list and distribution summary for the authenticated venue owner"
)
async def get_venue_reviews_list(
    rating: Optional[int] = Query(None, ge=1, le=5),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    current_user_claims: dict = Depends(get_current_venue_owner),
    db: Session = Depends(get_db)
):
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


@router.get(
    "/me",
    response_model=SuccessResponse[ReviewListResponse],
    status_code=status.HTTP_200_OK,
    summary="Get reviews created by authenticated user (Workflow)"
)
async def get_my_reviews(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user_claims: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    reviewer_id = UUID(current_user_claims["sub"])
    items, total = review_service.get_my_reviews(db, reviewer_id, page=page, limit=limit)
    pages = (total + limit - 1) // limit if total > 0 else 0

    return SuccessResponse(
        success=True,
        data={
            "items": [_format_full_review(r) for r in items],
            "pagination": {
                "total": total,
                "page": page,
                "limit": limit,
                "pages": pages
            }
        },
        message="My reviews retrieved successfully."
    )


@router.get(
    "/eligibility/{booking_id}",
    response_model=SuccessResponse[ReviewEligibilityResponse],
    status_code=status.HTTP_200_OK,
    summary="Check review submission eligibility for a booking (Workflow)"
)
async def check_review_eligibility(
    booking_id: UUID,
    target_user_id: Optional[UUID] = Query(None),
    current_user_claims: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    reviewer_id = UUID(current_user_claims["sub"])
    eligibility = review_service.check_eligibility(db, reviewer_id, booking_id, target_user_id)
    return SuccessResponse(
        success=True,
        data=eligibility,
        message="Eligibility checked successfully."
    )


@router.get(
    "/user/{user_id}",
    response_model=SuccessResponse[ReviewListResponse],
    status_code=status.HTTP_200_OK,
    summary="Get public reviews received by a user (Workflow)"
)
async def get_user_reviews(
    user_id: UUID,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    items, total = review_service.get_user_reviews(db, user_id, page=page, limit=limit)
    pages = (total + limit - 1) // limit if total > 0 else 0

    return SuccessResponse(
        success=True,
        data={
            "items": [_format_full_review(r) for r in items],
            "pagination": {
                "total": total,
                "page": page,
                "limit": limit,
                "pages": pages
            }
        },
        message="User reviews retrieved successfully."
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
    review = review_service.reply_to_venue_review(
        db, current_user_claims["sub"], review_id, data.reply_comment
    )
    return SuccessResponse(
        success=True,
        data=_format_review(review),
        message="Venue review reply updated."
    )


@router.get(
    "/public/venue/{venue_id}",
    response_model=SuccessResponse[ReviewSummaryResponse],
    status_code=status.HTTP_200_OK,
    summary="Get reviews list and stats for a venue publicly by ID (no auth)"
)
async def get_public_venue_reviews(
    venue_id: UUID,
    rating: Optional[int] = Query(None, ge=1, le=5),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
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


@router.get(
    "/booking/{booking_id}",
    response_model=SuccessResponse[List[ReviewResponse]],
    status_code=status.HTTP_200_OK,
    summary="Get all reviews for a specific booking (Foundation)"
)
async def get_booking_reviews(
    booking_id: UUID,
    db: Session = Depends(get_db)
):
    reviews = review_service.get_reviews_by_booking(db, booking_id)
    return SuccessResponse(
        success=True,
        data=[_format_full_review(r) for r in reviews],
        message="Booking reviews retrieved successfully."
    )


# ─── FOUNDATION REST ENDPOINTS ─────────────────────────────────────────────

@router.post(
    "",
    response_model=SuccessResponse[ReviewResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create a new review with workflow validation"
)
async def create_review(
    data: CreateReviewRequest,
    current_user_claims: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    reviewer_id = UUID(current_user_claims["sub"])
    reviewer_role = current_user_claims.get("role", "client")
    review = review_service.create_review(db, reviewer_id, reviewer_role, data)
    return SuccessResponse(
        success=True,
        data=_format_full_review(review),
        message="Review created successfully."
    )


@router.get(
    "",
    response_model=SuccessResponse[ReviewListResponse],
    status_code=status.HTTP_200_OK,
    summary="List reviews with filtering, sorting, and pagination"
)
async def list_reviews(
    booking_id: Optional[UUID] = Query(None),
    reviewer_id: Optional[UUID] = Query(None),
    reviewee_id: Optional[UUID] = Query(None),
    artist_profile_id: Optional[UUID] = Query(None),
    venue_id: Optional[UUID] = Query(None),
    rating: Optional[int] = Query(None, ge=1, le=5),
    is_public: Optional[bool] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    db: Session = Depends(get_db)
):
    filters = ReviewFilters(
        booking_id=booking_id,
        reviewer_id=reviewer_id,
        reviewee_id=reviewee_id,
        artist_profile_id=artist_profile_id,
        venue_id=venue_id,
        rating=rating,
        is_public=is_public,
        search=search
    )
    items, total = review_service.list_reviews(
        db,
        filters=filters,
        page=page,
        limit=limit,
        sort_by=sort_by,
        sort_order=sort_order
    )
    pages = (total + limit - 1) // limit if total > 0 else 0

    return SuccessResponse(
        success=True,
        data={
            "items": [_format_full_review(r) for r in items],
            "pagination": {
                "total": total,
                "page": page,
                "limit": limit,
                "pages": pages
            }
        },
        message="Reviews retrieved successfully."
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
    review = review_service.reply_to_review(
        db, current_user_claims["sub"], review_id, data.reply_comment
    )
    return SuccessResponse(
        success=True,
        data=_format_review(review),
        message="Review reply updated."
    )


@router.get(
    "/{review_id}",
    response_model=SuccessResponse[ReviewResponse],
    status_code=status.HTTP_200_OK,
    summary="Get review details by ID"
)
async def get_review_detail(
    review_id: UUID,
    db: Session = Depends(get_db)
):
    review = review_service.get_review(db, review_id)
    return SuccessResponse(
        success=True,
        data=_format_full_review(review),
        message="Review retrieved successfully."
    )


@router.put(
    "/{review_id}",
    response_model=SuccessResponse[ReviewResponse],
    status_code=status.HTTP_200_OK,
    summary="Update review details"
)
async def update_review(
    review_id: UUID,
    data: UpdateReviewRequest,
    current_user_claims: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    current_user_id = UUID(current_user_claims["sub"])
    is_admin = current_user_claims.get("role") == "admin"
    review = review_service.update_review(db, current_user_id, review_id, data, is_admin=is_admin)
    return SuccessResponse(
        success=True,
        data=_format_full_review(review),
        message="Review updated successfully."
    )


@router.delete(
    "/{review_id}",
    response_model=SuccessResponse[ReviewResponse],
    status_code=status.HTTP_200_OK,
    summary="Soft-delete a review"
)
async def delete_review(
    review_id: UUID,
    current_user_claims: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    current_user_id = UUID(current_user_claims["sub"])
    is_admin = current_user_claims.get("role") == "admin"
    review = review_service.delete_review(db, current_user_id, review_id, is_admin=is_admin)
    return SuccessResponse(
        success=True,
        data=_format_full_review(review),
        message="Review soft-deleted successfully."
    )


def _format_full_review(r) -> dict:
    return {
        "id": str(r.id),
        "booking_id": str(r.booking_id) if r.booking_id else None,
        "reviewer_id": str(r.reviewer_id) if r.reviewer_id else None,
        "reviewer_role": r.reviewer_role,
        "reviewee_id": str(r.reviewee_id) if r.reviewee_id else None,
        "reviewee_role": r.reviewee_role,
        "artist_profile_id": str(r.artist_profile_id) if r.artist_profile_id else None,
        "venue_id": str(r.venue_id) if r.venue_id else None,
        "client_id": str(r.client_id) if r.client_id else None,
        "rating": r.rating,
        "review_title": r.review_title,
        "review_text": r.review_text or r.comment,
        "comment": r.comment or r.review_text,
        "is_public": r.is_public if r.is_public is not None else True,
        "reply_comment": r.reply_comment,
        "reply_at": r.reply_at.isoformat() if r.reply_at else None,
        "images": r.images or [],
        "videos": r.videos or [],
        "reviewer": {
            "id": str(r.reviewer.id),
            "name": r.reviewer.name,
            "email": r.reviewer.email
        } if r.reviewer else None,
        "reviewee": {
            "id": str(r.reviewee.id),
            "name": r.reviewee.name,
            "email": r.reviewee.email
        } if r.reviewee else None,
        "client": {
            "id": str(r.client.id),
            "name": r.client.name
        } if r.client else None,
        "created_at": r.created_at.isoformat(),
        "updated_at": r.updated_at.isoformat() if r.updated_at else None
    }


def _format_review(r) -> dict:
    return {
        "id": str(r.id),
        "rating": r.rating,
        "comment": r.comment or r.review_text or "",
        "review_title": r.review_title,
        "review_text": r.review_text or r.comment,
        "reply_comment": r.reply_comment,
        "reply_at": r.reply_at.isoformat() if r.reply_at else None,
        "images": r.images or [],
        "videos": r.videos or [],
        "client": {
            "id": str(r.client.id) if r.client else (str(r.reviewer_id) if r.reviewer_id else str(r.id)),
            "name": r.client.name if r.client else (r.reviewer.name if r.reviewer else "Verified Client")
        },
        "created_at": r.created_at.isoformat()
    }
