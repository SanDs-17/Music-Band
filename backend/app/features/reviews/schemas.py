from typing import Optional, List, Dict
from uuid import UUID
from datetime import datetime
from pydantic import Field
from app.common.schemas.base import BaseSchema


class ClientBriefResponse(BaseSchema):
    id: UUID
    name: str


class UserBriefResponse(BaseSchema):
    id: UUID
    name: str
    email: Optional[str] = None


class CreateReviewRequest(BaseSchema):
    booking_id: Optional[UUID] = None
    reviewee_id: Optional[UUID] = None
    reviewee_role: Optional[str] = None
    artist_profile_id: Optional[UUID] = None
    venue_id: Optional[UUID] = None
    rating: int = Field(..., ge=1, le=5, description="Rating score between 1 and 5")
    review_title: Optional[str] = Field(None, max_length=255)
    review_text: Optional[str] = None
    comment: Optional[str] = None
    is_public: bool = True
    images: List[str] = Field(default_factory=list)
    videos: List[str] = Field(default_factory=list)


class UpdateReviewRequest(BaseSchema):
    rating: Optional[int] = Field(None, ge=1, le=5)
    review_title: Optional[str] = Field(None, max_length=255)
    review_text: Optional[str] = None
    comment: Optional[str] = None
    is_public: Optional[bool] = None
    images: Optional[List[str]] = None
    videos: Optional[List[str]] = None


class ReviewFilters(BaseSchema):
    booking_id: Optional[UUID] = None
    reviewer_id: Optional[UUID] = None
    reviewee_id: Optional[UUID] = None
    artist_profile_id: Optional[UUID] = None
    venue_id: Optional[UUID] = None
    rating: Optional[int] = None
    is_public: Optional[bool] = None
    search: Optional[str] = None


class ReviewPagination(BaseSchema):
    total: int
    page: int
    limit: int
    pages: int


class ReviewEligibilityResponse(BaseSchema):
    eligible: bool
    booking_id: UUID
    reviewer_id: UUID
    reviewee_id: Optional[UUID] = None
    reviewee_role: Optional[str] = None
    reason: Optional[str] = None
    already_reviewed: bool = False


class ReviewResponse(BaseSchema):
    id: UUID
    booking_id: Optional[UUID] = None
    reviewer_id: Optional[UUID] = None
    reviewer_role: Optional[str] = "client"
    reviewee_id: Optional[UUID] = None
    reviewee_role: Optional[str] = None
    artist_profile_id: Optional[UUID] = None
    venue_id: Optional[UUID] = None
    client_id: Optional[UUID] = None
    rating: int
    review_title: Optional[str] = None
    review_text: Optional[str] = None
    comment: Optional[str] = None
    is_public: bool = True
    reply_comment: Optional[str] = None
    reply_at: Optional[datetime] = None
    images: List[str] = Field(default_factory=list)
    videos: List[str] = Field(default_factory=list)
    reviewer: Optional[UserBriefResponse] = None
    reviewee: Optional[UserBriefResponse] = None
    client: Optional[ClientBriefResponse] = None
    created_at: datetime
    updated_at: Optional[datetime] = None


class ReviewListResponse(BaseSchema):
    items: List[ReviewResponse] = Field(default_factory=list)
    pagination: ReviewPagination


class ReviewDetailsResponse(BaseSchema):
    id: UUID
    rating: int
    comment: str
    review_title: Optional[str] = None
    review_text: Optional[str] = None
    reply_comment: Optional[str] = None
    reply_at: Optional[datetime] = None
    images: List[str] = Field(default_factory=list)
    videos: List[str] = Field(default_factory=list)
    client: ClientBriefResponse
    created_at: datetime


class ReviewSummaryResponse(BaseSchema):
    average_rating: float
    total_reviews: int
    rating_distribution: Dict[int, int]
    reviews: List[ReviewDetailsResponse] = Field(default_factory=list)


class ReviewReplyRequest(BaseSchema):
    reply_comment: str
