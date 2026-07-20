from uuid import UUID
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.common.schemas.base import SuccessResponse
from app.features.messaging.message.service import message_service
from app.features.messaging.message.schemas import (
    MessageCreate,
    MessageResponse,
)

router = APIRouter()

@router.post("", response_model=SuccessResponse[MessageResponse], status_code=status.HTTP_201_CREATED)
def send_message(
    conversation_id: UUID,
    payload: MessageCreate,
    db: Session = Depends(get_db),
    current_user_claims: dict = Depends(get_current_user),
):
    current_user_id = UUID(current_user_claims["sub"])
    message = message_service.send_message(db, conversation_id, current_user_id, payload.content)
    return SuccessResponse(data=MessageResponse.model_validate(message))

@router.get("", response_model=SuccessResponse[list[MessageResponse]])
def get_message_history(
    conversation_id: UUID,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user_claims: dict = Depends(get_current_user),
):
    current_user_id = UUID(current_user_claims["sub"])
    messages = message_service.get_message_history(db, conversation_id, current_user_id, page, limit)
    data = [MessageResponse.model_validate(m) for m in messages]
    return SuccessResponse(data=data)
