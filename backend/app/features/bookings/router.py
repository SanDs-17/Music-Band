from typing import Optional
from uuid import UUID

from app.common.schemas.base import SuccessResponse
from app.core.database import get_db
from app.core.dependencies import (
    get_current_artist,
    get_current_client,
    get_current_user,
    get_current_venue_owner,
)
from app.features.bookings.schemas import (
    BookingCreateRequest,
    BookingResponse,
    CounterOfferRequest,
)
from app.features.bookings.service import booking_service
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

router = APIRouter(tags=["Bookings"])


@router.post(
    "",
    response_model=SuccessResponse[BookingResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create a new booking request (initiated by client)",
)
async def create_booking_request(
    data: BookingCreateRequest,
    current_user_claims: dict = Depends(get_current_client),
    db: Session = Depends(get_db),
):
    """
    Submits a new booking request to the artist. Validates availability slot conflicts first.
    """
    booking = booking_service.create_booking(db, UUID(current_user_claims["sub"]), data)
    return SuccessResponse(
        success=True,
        data=_format_booking(booking),
        message="Booking request created successfully.",
    )


@router.get(
    "/artist",
    response_model=SuccessResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="Get bookings and requests list for the authenticated artist",
)
async def get_artist_bookings_list(
    status: Optional[str] = Query(
        None,
        description="Filter by pending, accepted, rejected, counter_offered, cancelled",
    ),
    search: Optional[str] = Query(
        None, description="Search by client name, event name, or location"
    ),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    current_user_claims: dict = Depends(get_current_artist),
    db: Session = Depends(get_db),
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
            "limit": limit,
        },
        message="Artist bookings list retrieved.",
    )


@router.get(
    "/{booking_id}",
    response_model=SuccessResponse[BookingResponse],
    status_code=status.HTTP_200_OK,
    summary="Get booking details including timeline and client details",
)
async def get_booking_details(
    booking_id: UUID,
    current_user_claims: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieves full details of a specific booking request. Accessible by client or target artist.
    """
    booking = booking_service.get_booking_details(
        db, current_user_claims["sub"], booking_id
    )
    return SuccessResponse(
        success=True,
        data=_format_booking(booking),
        message="Booking details retrieved.",
    )


@router.put(
    "/{booking_id}/accept",
    response_model=SuccessResponse[BookingResponse],
    status_code=status.HTTP_200_OK,
    summary="Accept an incoming booking request",
)
async def accept_booking_request(
    booking_id: UUID,
    current_user_claims: dict = Depends(get_current_artist),
    db: Session = Depends(get_db),
):
    booking = booking_service.accept_booking(db, current_user_claims["sub"], booking_id)
    return SuccessResponse(
        success=True,
        data=_format_booking(booking),
        message="Booking request accepted successfully.",
    )


@router.put(
    "/{booking_id}/reject",
    response_model=SuccessResponse[BookingResponse],
    status_code=status.HTTP_200_OK,
    summary="Reject an incoming booking request",
)
async def reject_booking_request(
    booking_id: UUID,
    current_user_claims: dict = Depends(get_current_artist),
    db: Session = Depends(get_db),
):
    booking = booking_service.reject_booking(db, current_user_claims["sub"], booking_id)
    return SuccessResponse(
        success=True,
        data=_format_booking(booking),
        message="Booking request rejected successfully.",
    )


@router.put(
    "/{booking_id}/counter",
    response_model=SuccessResponse[BookingResponse],
    status_code=status.HTTP_200_OK,
    summary="Make a price counter offer on the booking request",
)
async def counter_offer_booking_request(
    booking_id: UUID,
    data: CounterOfferRequest,
    current_user_claims: dict = Depends(get_current_artist),
    db: Session = Depends(get_db),
):
    booking = booking_service.counter_offer(
        db, current_user_claims["sub"], booking_id, data.counter_price, data.message
    )
    return SuccessResponse(
        success=True,
        data=_format_booking(booking),
        message="Counter offer placed successfully.",
    )


@router.put(
    "/{booking_id}/cancel",
    response_model=SuccessResponse[BookingResponse],
    status_code=status.HTTP_200_OK,
    summary="Cancel a booking request",
)
async def cancel_booking_request(
    booking_id: UUID,
    current_user_claims: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    booking = booking_service.cancel_booking(db, current_user_claims["sub"], booking_id)
    return SuccessResponse(
        success=True,
        data=_format_booking(booking),
        message="Booking request cancelled.",
    )


@router.get(
    "/venue",
    response_model=SuccessResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="Get bookings and requests list for the authenticated venue owner",
)
async def get_venue_bookings_list(
    status: Optional[str] = Query(
        None, description="Filter by pending, accepted, rejected, cancelled, completed"
    ),
    search: Optional[str] = Query(
        None, description="Search by client name, event name, or location"
    ),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    current_user_claims: dict = Depends(get_current_venue_owner),
    db: Session = Depends(get_db),
):
    """
    Retrieves a paginated list of incoming booking requests and confirmed event reservations for the venue.
    """
    results, total = booking_service.get_venue_bookings(
        db, current_user_claims["sub"], status, search, page, limit
    )
    return SuccessResponse(
        success=True,
        data={
            "bookings": [_format_booking_brief(b) for b in results],
            "total": total,
            "page": page,
            "limit": limit,
        },
        message="Venue bookings list retrieved.",
    )


@router.get(
    "/venue/{booking_id}",
    response_model=SuccessResponse[BookingResponse],
    status_code=status.HTTP_200_OK,
    summary="Get venue booking details including timeline and client details",
)
async def get_venue_booking_details(
    booking_id: UUID,
    current_user_claims: dict = Depends(get_current_venue_owner),
    db: Session = Depends(get_db),
):
    """
    Retrieves full details of a specific venue booking. Accessible by target venue owner.
    """
    booking = booking_service.get_venue_booking_details(
        db, current_user_claims["sub"], booking_id
    )
    return SuccessResponse(
        success=True,
        data=_format_booking(booking),
        message="Venue booking details retrieved.",
    )


@router.put(
    "/venue/{booking_id}/accept",
    response_model=SuccessResponse[BookingResponse],
    status_code=status.HTTP_200_OK,
    summary="Accept an incoming venue booking request",
)
async def accept_venue_booking_request(
    booking_id: UUID,
    current_user_claims: dict = Depends(get_current_venue_owner),
    db: Session = Depends(get_db),
):
    booking = booking_service.accept_venue_booking(
        db, current_user_claims["sub"], booking_id
    )
    return SuccessResponse(
        success=True,
        data=_format_booking(booking),
        message="Venue booking request accepted successfully.",
    )


@router.put(
    "/venue/{booking_id}/reject",
    response_model=SuccessResponse[BookingResponse],
    status_code=status.HTTP_200_OK,
    summary="Reject an incoming venue booking request",
)
async def reject_venue_booking_request(
    booking_id: UUID,
    current_user_claims: dict = Depends(get_current_venue_owner),
    db: Session = Depends(get_db),
):
    booking = booking_service.reject_venue_booking(
        db, current_user_claims["sub"], booking_id
    )
    return SuccessResponse(
        success=True,
        data=_format_booking(booking),
        message="Venue booking request rejected successfully.",
    )


@router.put(
    "/venue/{booking_id}/complete",
    response_model=SuccessResponse[BookingResponse],
    status_code=status.HTTP_200_OK,
    summary="Mark a confirmed venue booking as completed",
)
async def complete_venue_booking_request(
    booking_id: UUID,
    current_user_claims: dict = Depends(get_current_venue_owner),
    db: Session = Depends(get_db),
):
    booking = booking_service.complete_venue_booking(
        db, current_user_claims["sub"], booking_id
    )
    return SuccessResponse(
        success=True,
        data=_format_booking(booking),
        message="Venue booking marked as completed successfully.",
    )


@router.put(
    "/venue/{booking_id}/cancel",
    response_model=SuccessResponse[BookingResponse],
    status_code=status.HTTP_200_OK,
    summary="Cancel a venue booking request",
)
async def cancel_venue_booking_request(
    booking_id: UUID,
    current_user_claims: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    booking = booking_service.cancel_venue_booking(
        db, current_user_claims["sub"], booking_id
    )
    return SuccessResponse(
        success=True,
        data=_format_booking(booking),
        message="Venue booking request cancelled.",
    )


def _format_booking_brief(b) -> dict:
    def _as_iso(val):
        try:
            return val.isoformat()
        except Exception:
            return str(val)

    def _time_short(val):
        try:
            return val.isoformat()[:5]
        except Exception:
            return str(val)[:5]

    return {
        "id": str(b.id),
        "event_name": b.event_name,
        "event_date": _as_iso(b.event_date),
        "start_time": _time_short(b.start_time),
        "end_time": _time_short(b.end_time),
        "proposed_price": float(b.proposed_price),
        "counter_price": float(b.counter_price) if b.counter_price else None,
        "status": b.status,
        "created_at": _as_iso(b.created_at),
    }


def _timeline_entry_to_dict(entry) -> dict:
    """Convert a timeline entry (dict, ORM object, or SimpleNamespace) to a plain dict."""
    if isinstance(entry, dict):
        return entry
    # Handle ORM models and SimpleNamespace objects via __dict__ or vars()
    try:
        raw = vars(entry)
        # SQLAlchemy model instances include internal state keys — filter them
        return {k: v for k, v in raw.items() if not k.startswith("_")}
    except TypeError:
        pass
    # Fallback: build dict from known timeline fields via getattr
    return {
        "id": getattr(entry, "id", None),
        "status": getattr(entry, "status", None),
        "message": getattr(entry, "message", None),
        "event_type": getattr(entry, "event_type", None),
        "created_by_role": getattr(entry, "created_by_role", None),
        "created_at": str(getattr(entry, "created_at", "")),
    }


def _format_booking(b) -> dict:
    # Resolve timeline: prefer the `timeline` JSON column (list of dicts from accept/reject methods),
    # then fall back to `timeline_events` (ORM relationship rows).
    raw_timeline = getattr(b, "timeline", None) or getattr(b, "timeline_events", None) or []
    timeline = [_timeline_entry_to_dict(e) for e in raw_timeline]

    return {
        **_format_booking_brief(b),
        "location": getattr(b, "location", None),
        "notes": getattr(b, "notes", None),
        "client": {
            "id": str(b.client.id),
            "name": b.client.name,
            "email": b.client.email,
        },
        # serialized timeline entries as plain dicts for frontend compatibility
        "timeline": timeline,
        "updated_at": (
            b.updated_at.isoformat()
            if hasattr(b, "updated_at") and hasattr(b.updated_at, "isoformat")
            else str(getattr(b, "updated_at", ""))
        ),
    }
