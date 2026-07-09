from sqlalchemy import Column, DateTime, ForeignKey, Integer, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.common.models.base import BaseModel

class Review(BaseModel):
    __tablename__ = "reviews"

    artist_profile_id = Column(UUID(as_uuid=True), ForeignKey("artist_profiles.id", ondelete="CASCADE"), nullable=True, index=True)
    venue_id = Column(UUID(as_uuid=True), ForeignKey("venues.id", ondelete="CASCADE"), nullable=True, index=True)
    client_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    booking_id = Column(UUID(as_uuid=True), ForeignKey("bookings.id", ondelete="SET NULL"), nullable=True, index=True)
    
    rating = Column(Integer, nullable=False, default=5)
    comment = Column(Text, nullable=False)
    
    # Performer Reply
    reply_comment = Column(Text, nullable=True)
    reply_at = Column(DateTime, nullable=True)

    # Customer Media Uploads
    images = Column(JSON, default=list, nullable=False)  # ["url1", "url2"]
    videos = Column(JSON, default=list, nullable=False)  # ["url1", "url2"]

    # Relationships
    artist_profile = relationship("ArtistProfile", backref="artist_reviews")
    venue = relationship("Venue", backref="venue_reviews")
    client = relationship("User", backref="client_reviews")
    booking = relationship("Booking", backref="booking_reviews")
