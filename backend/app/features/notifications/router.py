from uuid import UUID
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.common.schemas.base import SuccessResponse
from app.features.notifications.crud import notification_crud
from app.core.exceptions import NotFoundException, ForbiddenException

router = APIRouter(tags=["Notifications"])

def _format_notification(n) -> dict:
    return {
        "id": str(n.id),
        "user_id": str(n.user_id),
        "title": n.title,
        "message": n.message,
        "is_read": n.is_read,
        "created_at": n.created_at.isoformat()
    }

@router.get(
    "",
    response_model=SuccessResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="Get paginated notifications for the authenticated user"
)
async def list_notifications(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    current_user_claims: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = UUID(current_user_claims["sub"])
    results = notification_crud.get_by_user(db, user_id, page, limit)
    total = notification_crud.count_by_user(db, user_id)
    return SuccessResponse(
        success=True,
        data={
            "notifications": [_format_notification(n) for n in results],
            "total": total,
            "page": page,
            "limit": limit
        },
        message="Notifications list retrieved."
    )

@router.put(
    "/{notification_id}/read",
    response_model=SuccessResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="Mark a specific notification as read"
)
async def mark_read(
    notification_id: UUID,
    current_user_claims: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = UUID(current_user_claims["sub"])
    notification = notification_crud.get(db, notification_id)
    if not notification:
        raise NotFoundException("Notification not found.")
    if notification.user_id != user_id:
        raise ForbiddenException("Access denied.")
    
    notification_crud.mark_as_read(db, notification)
    return SuccessResponse(
        success=True,
        data=_format_notification(notification),
        message="Notification marked as read."
    )

@router.put(
    "/read-all",
    response_model=SuccessResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="Mark all notifications as read for current user"
)
async def mark_all_read(
    current_user_claims: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = UUID(current_user_claims["sub"])
    notification_crud.mark_all_as_read(db, user_id)
    return SuccessResponse(
        success=True,
        data={},
        message="All notifications marked as read."
    )
