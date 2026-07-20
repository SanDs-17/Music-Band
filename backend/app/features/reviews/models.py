from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, Boolean, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.common.models.base import BaseModel


class Review(BaseModel):
    """
    Review and Rating entity model.
    Establishes complete foundation for rating scores, feedback, titles, and roles.
    """
    __tablename__ = "reviews"

    booking_id = Column(UUID(as_uuid=True), ForeignKey("bookings.id", ondelete="SET NULL"), nullable=True, index=True)
    reviewer_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    reviewer_role = Column(String(50), nullable=True, default="client")
    reviewee_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    reviewee_role = Column(String(50), nullable=True)

    artist_profile_id = Column(UUID(as_uuid=True), ForeignKey("artist_profiles.id", ondelete="CASCADE"), nullable=True, index=True)
    venue_id = Column(UUID(as_uuid=True), ForeignKey("venues.id", ondelete="CASCADE"), nullable=True, index=True)
    client_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)

    rating = Column(Integer, nullable=False, default=5)
    review_title = Column(String(255), nullable=True)
    review_text = Column(Text, nullable=True)
    comment = Column(Text, nullable=True)  # Backward compatibility alias
    is_public = Column(Boolean, default=True, nullable=False)

    # Performer Reply
    reply_comment = Column(Text, nullable=True)
    reply_at = Column(DateTime, nullable=True)

    # Customer Media Uploads
    images = Column(JSON, default=list, nullable=False)  # ["url1", "url2"]
    videos = Column(JSON, default=list, nullable=False)  # ["url1", "url2"]

    # Relationships
    reviewer = relationship("User", foreign_keys=[reviewer_id], backref="reviews_given")
    reviewee = relationship("User", foreign_keys=[reviewee_id], backref="reviews_received")
    artist_profile = relationship("ArtistProfile", backref="artist_reviews")
    venue = relationship("Venue", backref="venue_reviews")
    client = relationship("User", foreign_keys=[client_id], backref="client_reviews")
    booking = relationship("Booking", backref="booking_reviews")

    @property
    def effective_comment(self) -> str:
        return self.review_text or self.comment or ""
