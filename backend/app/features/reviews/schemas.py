from typing import Optional, List, Dict
from uuid import UUID
from datetime import datetime
from app.common.schemas.base import BaseSchema

class ClientBriefResponse(BaseSchema):
    id: UUID
    name: str


class ReviewDetailsResponse(BaseSchema):
    id: UUID
    rating: int
    comment: str
    reply_comment: Optional[str] = None
    reply_at: Optional[datetime] = None
    images: List[str] = []
    videos: List[str] = []
    client: ClientBriefResponse
    created_at: datetime


class ReviewSummaryResponse(BaseSchema):
    average_rating: float
    total_reviews: int
    rating_distribution: Dict[int, int]
    reviews: List[ReviewDetailsResponse] = []


class ReviewReplyRequest(BaseSchema):
    reply_comment: str
