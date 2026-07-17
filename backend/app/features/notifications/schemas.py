from uuid import UUID
from datetime import datetime
from app.common.schemas.base import BaseSchema

class NotificationResponse(BaseSchema):
    id: UUID
    user_id: UUID
    title: str
    message: str
    is_read: bool
    created_at: datetime

class NotificationMarkReadRequest(BaseSchema):
    is_read: bool = True
