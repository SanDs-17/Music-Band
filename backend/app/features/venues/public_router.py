from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.features.venues.schemas import VenueRegisterRequest, VenueResponse
from app.features.venues.service import VenueService
from app.common.schemas.base import SuccessResponse
from app.features.venues.router import _format_venue_profile

router = APIRouter(tags=["Venues"])
service = VenueService()

@router.post(
    "/register",
    response_model=SuccessResponse[VenueResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Register a new Venue and Owner account"
)
async def register_venue_owner(
    data: VenueRegisterRequest,
    db: Session = Depends(get_db)
):
    """
    Submits a 10-step wizard form to register a new Venue Owner credentials and space details.
    """
    venue = service.register_venue(db, data)
    return SuccessResponse(
        success=True,
        data=_format_venue_profile(venue),
        message="Venue and owner registered successfully. Awaiting administration review."
    )
