"""
Pydantic validation schemas for Venue profiles.
"""

from typing import Optional, List, Dict, Any
from uuid import UUID
from pydantic import Field, EmailStr
from app.common.schemas.base import BaseSchema
from app.features.categories.schemas import CategoryResponse
from app.features.artists.schemas import UserBriefResponse


class CityBriefResponse(BaseSchema):
    id: UUID
    name: str


class VenueResponse(BaseSchema):
    id: UUID
    user_id: UUID
    user: UserBriefResponse
    name: str
    description: Optional[str] = None
    address: str
    city_id: UUID
    city: CityBriefResponse
    
    # Newly added fields
    venue_type: Optional[str] = None
    business_name: Optional[str] = None
    contact_details: Optional[str] = None
    min_capacity: int = 0
    pincode: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    google_map_location: Optional[str] = None

    base_price: float
    capacity: int  # max capacity
    verification_status: str
    verification_notes: Optional[str] = None
    facilities: List[str] = []
    gallery: List[str] = []
    pricing_details: Dict[str, Any] = {}
    availability_rules: Dict[str, Any] = {}
    categories: List[CategoryResponse] = []
    created_at: str


class VenueVerificationUpdate(BaseSchema):
    verification_status: str = Field(..., description="Statuses: approved, rejected, pending")
    verification_notes: Optional[str] = Field(None, max_length=255)


class PaginatedVenueList(BaseSchema):
    items: List[VenueResponse]
    total: int


class VenueRegisterRequest(BaseSchema):
    # Step 1: Owner Account
    email: EmailStr
    mobile: str
    password: str

    # Step 2: Owner Details
    owner_name: str
    business_name: str
    contact_details: Optional[str] = None

    # Step 3: Venue Details
    venue_name: str
    venue_type: str  # Marriage Hall, Resort, etc.
    description: Optional[str] = None

    # Step 4: Location
    country: str
    state: str
    city_id: UUID
    address: str
    google_map_location: Optional[str] = None
    pincode: str

    # Step 5: Facilities
    facilities: List[str] = []

    # Step 6: Capacity
    min_capacity: int
    max_capacity: int

    # Step 7: Pricing
    base_price: float
    hourly_price: float
    extra_charges: float = 0.0
    security_deposit: float = 0.0

    # Step 8: Gallery
    images: List[str] = []
    videos: List[str] = []
    virtual_tour: Optional[str] = None

    # Step 9: Availability
    weekly_schedule: Dict[str, Any] = {}
    holidays: List[str] = []
    blocked_dates: List[str] = []
