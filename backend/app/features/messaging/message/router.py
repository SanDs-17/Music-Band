from uuid import UUID
from fastapi import APIRouter, Depends, Query, File, Form, UploadFile, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.common.schemas.base import SuccessResponse
from app.features.messaging.message.service import message_service
from app.features.messaging.message.schemas import (
    MessageCreate,
    MessageEdit,
    MessageForward,
    MessageResponse,
    ReactionCreate,
    ReactionResponse,
    TypingPayload,
    PresenceResponse,
    MessageSearchResponse,
)

router = APIRouter()
direct_message_router = APIRouter()
user_presence_router = APIRouter()

# ── Nested Conversation Message Endpoints (/{conversation_id}/...) ─────────────

@router.post("", response_model=SuccessResponse[MessageResponse], status_code=status.HTTP_201_CREATED)
def send_message(
    conversation_id: UUID,
    payload: MessageCreate,
    db: Session = Depends(get_db),
    current_user_claims: dict = Depends(get_current_user),
):
    current_user_id = UUID(current_user_claims["sub"])
    message = message_service.send_message(
        db,
        conversation_id,
        current_user_id,
        payload.content,
        payload.reply_to_message_id,
    )
    return SuccessResponse(data=MessageResponse.model_validate(message))

@router.post("/attachment", response_model=SuccessResponse[MessageResponse], status_code=status.HTTP_201_CREATED)
async def send_attachment_message(
    conversation_id: UUID,
    file: UploadFile = File(...),
    content: str = Form(""),
    reply_to_message_id: UUID | None = Form(None),
    db: Session = Depends(get_db),
    current_user_claims: dict = Depends(get_current_user),
):
    current_user_id = UUID(current_user_claims["sub"])
    message = await message_service.send_attachment_message(
        db,
        conversation_id,
        current_user_id,
        file,
        content,
        reply_to_message_id,
    )
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

@router.post("/read", response_model=SuccessResponse[list[MessageResponse]])
def mark_conversation_as_read(
    conversation_id: UUID,
    db: Session = Depends(get_db),
    current_user_claims: dict = Depends(get_current_user),
):
    current_user_id = UUID(current_user_claims["sub"])
    marked_msgs = message_service.mark_as_read(db, conversation_id, current_user_id)
    data = [MessageResponse.model_validate(m) for m in marked_msgs]
    return SuccessResponse(data=data)

@router.post("/typing", response_model=SuccessResponse[bool])
def set_typing_status(
    conversation_id: UUID,
    payload: TypingPayload,
    db: Session = Depends(get_db),
    current_user_claims: dict = Depends(get_current_user),
):
    current_user_id = UUID(current_user_claims["sub"])
    res = message_service.set_typing_status(db, conversation_id, current_user_id, payload.is_typing)
    return SuccessResponse(data=res)

@router.get("/search", response_model=SuccessResponse[MessageSearchResponse])
def search_messages(
    conversation_id: UUID,
    query: str = Query(..., min_length=1),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user_claims: dict = Depends(get_current_user),
):
    current_user_id = UUID(current_user_claims["sub"])
    total, msgs = message_service.search_messages(db, conversation_id, current_user_id, query, page, limit)
    messages_data = [MessageResponse.model_validate(m) for m in msgs]
    return SuccessResponse(data=MessageSearchResponse(total=total, page=page, limit=limit, messages=messages_data))

@router.delete("/pin", response_model=SuccessResponse[bool])
def unpin_message(
    conversation_id: UUID,
    db: Session = Depends(get_db),
    current_user_claims: dict = Depends(get_current_user),
):
    current_user_id = UUID(current_user_claims["sub"])
    message_service.unpin_message(db, conversation_id, current_user_id)
    return SuccessResponse(data=True)


# ── Direct Message Endpoints (/messages/{message_id}) ────────────────────────────

@direct_message_router.get("/{message_id}/download")
def download_attachment(
    message_id: UUID,
    db: Session = Depends(get_db),
    current_user_claims: dict = Depends(get_current_user),
):
    current_user_id = UUID(current_user_claims["sub"])
    attachment_info = message_service.download_attachment(db, message_id, current_user_id)
    return SuccessResponse(data=attachment_info)

@direct_message_router.patch("/{message_id}", response_model=SuccessResponse[MessageResponse])
def edit_message(
    message_id: UUID,
    payload: MessageEdit,
    db: Session = Depends(get_db),
    current_user_claims: dict = Depends(get_current_user),
):
    current_user_id = UUID(current_user_claims["sub"])
    updated = message_service.edit_message(db, message_id, current_user_id, payload.content)
    return SuccessResponse(data=MessageResponse.model_validate(updated))

@direct_message_router.delete("/{message_id}", response_model=SuccessResponse[MessageResponse])
def delete_message(
    message_id: UUID,
    db: Session = Depends(get_db),
    current_user_claims: dict = Depends(get_current_user),
):
    current_user_id = UUID(current_user_claims["sub"])
    deleted = message_service.delete_message(db, message_id, current_user_id)
    return SuccessResponse(data=MessageResponse.model_validate(deleted))

@direct_message_router.post("/{message_id}/forward", response_model=SuccessResponse[MessageResponse])
def forward_message(
    message_id: UUID,
    payload: MessageForward,
    db: Session = Depends(get_db),
    current_user_claims: dict = Depends(get_current_user),
):
    current_user_id = UUID(current_user_claims["sub"])
    forwarded = message_service.forward_message(db, message_id, current_user_id, payload.target_conversation_id)
    return SuccessResponse(data=MessageResponse.model_validate(forwarded))

@direct_message_router.post("/{message_id}/reactions", response_model=SuccessResponse[ReactionResponse])
def add_reaction(
    message_id: UUID,
    payload: ReactionCreate,
    db: Session = Depends(get_db),
    current_user_claims: dict = Depends(get_current_user),
):
    current_user_id = UUID(current_user_claims["sub"])
    reaction = message_service.add_reaction(db, message_id, current_user_id, payload.emoji)
    return SuccessResponse(data=ReactionResponse.model_validate(reaction))

@direct_message_router.delete("/{message_id}/reactions/{emoji}", response_model=SuccessResponse[bool])
def remove_reaction(
    message_id: UUID,
    emoji: str,
    db: Session = Depends(get_db),
    current_user_claims: dict = Depends(get_current_user),
):
    current_user_id = UUID(current_user_claims["sub"])
    res = message_service.remove_reaction(db, message_id, current_user_id, emoji)
    return SuccessResponse(data=res)

@direct_message_router.post("/{message_id}/pin", response_model=SuccessResponse[bool])
def pin_message(
    message_id: UUID,
    db: Session = Depends(get_db),
    current_user_claims: dict = Depends(get_current_user),
):
    current_user_id = UUID(current_user_claims["sub"])
    message_service.pin_message(db, message_id, current_user_id)
    return SuccessResponse(data=True)


# ── User Presence Router (/users/{user_id}/presence) ──────────────────────────

@user_presence_router.get("/{user_id}/presence", response_model=SuccessResponse[PresenceResponse])
def get_user_presence(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user_claims: dict = Depends(get_current_user),
):
    presence = message_service.get_user_presence(db, user_id)
    return SuccessResponse(data=PresenceResponse(
        user_id=presence["user_id"],
        is_online=presence["is_online"],
        last_seen=presence["last_seen"],
    ))
