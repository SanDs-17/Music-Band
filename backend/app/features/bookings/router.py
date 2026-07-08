from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional
from app.core.database import get_db
from app.core.dependencies import get_current_user, get_current_client, get_current_artist
from app.common.schemas.base import SuccessResponse
from app.features.bookings.schemas import (
    BookingResponse,
    BookingCreateRequest,
    CounterOfferRequest
)
from app.features.bookings.service import booking_service

router = APIRouter(tags=["Bookings"])

@router.post(
    "",
    response_model=SuccessResponse[BookingResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create a new booking request (initiated by client)"
)
async def create_booking_request(
    data: BookingCreateRequest,
    current_user_claims: dict = Depends(get_current_client),
    db: Session = Depends(get_db)
):
    """
    Submits a new booking request to the artist. Validates availability slot conflicts first.
    """
    booking = booking_service.create_booking(db, UUID(current_user_claims["sub"]), data)
    return SuccessResponse(
        success=True,
        data=_format_booking(booking),
        message="Booking request created successfully."
    )

@router.get(
    "/artist",
    response_model=SuccessResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="Get bookings and requests list for the authenticated artist"
)
async def get_artist_bookings_list(
    status: Optional[str] = Query(None, description="Filter by pending, accepted, rejected, counter_offered, cancelled"),
    search: Optional[str] = Query(None, description="Search by client name, event name, or location"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    current_user_claims: dict = Depends(get_current_artist),
    db: Session = Depends(get_db)
):
    """
    Retrieves a paginated list of incoming booking requests and confirmed bookings for the performer.
    """
    results, total = booking_service.get_artist_bookings(
        db, current_user_claims["sub"], status, search, page, limit
    )
    return SuccessResponse(
        success=True,
        data={
            "bookings": [_format_booking_brief(b) for b in results],
            "total": total,
            "page": page,
            "limit": limit
        },
        message="Artist bookings list retrieved."
    )

@router.get(
    "/{booking_id}",
    response_model=SuccessResponse[BookingResponse],
    status_code=status.HTTP_200_OK,
    summary="Get booking details including timeline and client details"
)
async def get_booking_details(
    booking_id: UUID,
    current_user_claims: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves full details of a specific booking request. Accessible by client or target artist.
    """
    booking = booking_service.get_booking_details(db, current_user_claims["sub"], booking_id)
    return SuccessResponse(
        success=True,
        data=_format_booking(booking),
        message="Booking details retrieved."
    )

@router.put(
    "/{booking_id}/accept",
    response_model=SuccessResponse[BookingResponse],
    status_code=status.HTTP_200_OK,
    summary="Accept an incoming booking request"
)
async def accept_booking_request(
    booking_id: UUID,
    current_user_claims: dict = Depends(get_current_artist),
    db: Session = Depends(get_db)
):
    booking = booking_service.accept_booking(db, current_user_claims["sub"], booking_id)
    return SuccessResponse(
        success=True,
        data=_format_booking(booking),
        message="Booking request accepted successfully."
    )

@router.put(
    "/{booking_id}/reject",
    response_model=SuccessResponse[BookingResponse],
    status_code=status.HTTP_200_OK,
    summary="Reject an incoming booking request"
)
async def reject_booking_request(
    booking_id: UUID,
    current_user_claims: dict = Depends(get_current_artist),
    db: Session = Depends(get_db)
):
    booking = booking_service.reject_booking(db, current_user_claims["sub"], booking_id)
    return SuccessResponse(
        success=True,
        data=_format_booking(booking),
        message="Booking request rejected successfully."
    )

@router.put(
    "/{booking_id}/counter",
    response_model=SuccessResponse[BookingResponse],
    status_code=status.HTTP_200_OK,
    summary="Make a price counter offer on the booking request"
)
async def counter_offer_booking_request(
    booking_id: UUID,
    data: CounterOfferRequest,
    current_user_claims: dict = Depends(get_current_artist),
    db: Session = Depends(get_db)
):
    booking = booking_service.counter_offer(
        db, current_user_claims["sub"], booking_id, data.counter_price, data.message
    )
    return SuccessResponse(
        success=True,
        data=_format_booking(booking),
        message="Counter offer placed successfully."
    )

@router.put(
    "/{booking_id}/cancel",
    response_model=SuccessResponse[BookingResponse],
    status_code=status.HTTP_200_OK,
    summary="Cancel a booking request"
)
async def cancel_booking_request(
    booking_id: UUID,
    current_user_claims: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    booking = booking_service.cancel_booking(db, current_user_claims["sub"], booking_id)
    return SuccessResponse(
        success=True,
        data=_format_booking(booking),
        message="Booking request cancelled."
    )


def _format_booking_brief(b) -> dict:
    return {
        "id": str(b.id),
        "event_name": b.event_name,
        "event_date": b.event_date.isoformat(),
        "start_time": b.start_time.isoformat()[:5],
        "end_time": b.end_time.isoformat()[:5],
        "proposed_price": float(b.proposed_price),
        "counter_price": float(b.counter_price) if b.counter_price else None,
        "status": b.status,
        "created_at": b.created_at.isoformat()
    }

def _format_booking(b) -> dict:
    return {
        **_format_booking_brief(b),
        "location": b.location,
        "notes": b.notes,
        "client": {
            "id": str(b.client.id),
            "name": b.client.name,
            "email": b.client.email
        },
        "timeline": b.timeline or [],
        "updated_at": b.updated_at.isoformat()
    }
