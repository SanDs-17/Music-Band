from datetime import datetime
from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.features.messaging.conversation.service import conversation_service
from app.features.messaging.conversation.repository import conversation_repository
from app.features.messaging.message.models import Message
from app.features.messaging.message.repository import message_repository

class MessageService:
    def send_message(
        self,
        db: Session,
        conversation_id: UUID,
        sender_id: UUID,
        content: str
    ) -> Message:
        # Validate conversation existence & participant authorization
        conversation = conversation_service.get_conversation(db, conversation_id, sender_id)

        # Closed conversations are read-only
        if conversation.status == "CLOSED":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Closed conversations are read-only"
            )

        # Validate content
        stripped_content = content.strip() if content else ""
        if not stripped_content:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Message content cannot be empty"
            )

        if len(stripped_content) > 2000:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Message content exceeds maximum allowed length of 2000 characters"
            )

        message = Message(
            conversation_id=conversation_id,
            sender_id=sender_id,
            message_type="TEXT",
            content=stripped_content
        )
        new_msg = message_repository.create(db, message)

        # Update last message timestamp
        conversation.last_message_at = datetime.now()
        conversation_repository.save(db, conversation)

        return new_msg

    def get_message_history(
        self,
        db: Session,
        conversation_id: UUID,
        user_id: UUID,
        page: int = 1,
        limit: int = 50
    ) -> list[Message]:
        # Validate conversation access
        conversation_service.get_conversation(db, conversation_id, user_id)
        return message_repository.list_by_conversation_id(db, conversation_id, page, limit)

message_service = MessageService()
