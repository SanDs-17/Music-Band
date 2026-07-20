from sqlalchemy import Column, String, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.common.models.base import BaseModel

class Message(BaseModel):
    __tablename__ = "messages"

    conversation_id = Column(UUID(as_uuid=True), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    sender_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    message_type = Column(String(20), nullable=False, default="TEXT", index=True)  # TEXT
    content = Column(Text, nullable=False)

    # Relationships
    conversation = relationship("Conversation", backref="messages")
    sender = relationship("User", backref="sent_messages")
