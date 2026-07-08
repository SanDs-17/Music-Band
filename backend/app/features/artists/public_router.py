"""
API routes for public and onboarding Artist / Band profile management.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_user
from app.core.exceptions import NotFoundException
from app.features.artists.schemas import (
    ArtistRegisterRequest,
    ArtistProfileResponse,
    ArtistDashboardResponse,
    ArtistProfileUpdate,
    AvailabilityUpdate,
    ConflictCheckRequest,
    ConflictCheckResponse,
    MediaGalleryUpdate,
    PricingUpdate,
    AnalyticsResponse
)
from app.features.artists.router import _format_artist_profile
from app.features.artists.service import ArtistService
from app.common.schemas.base import SuccessResponse

router = APIRouter()
service = ArtistService()

@router.post(
    "/register",
    response_model=SuccessResponse[ArtistProfileResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Register a new Artist / Band profile with complete details"
)
async def register_artist(
    data: ArtistRegisterRequest,
    db: Session = Depends(get_db)
):
    """
    Onboard a new artist or music band profile.
    This handles registration of the User account, assigning roles, and creating the profile.
    """
    artist = service.register_artist(db, data)
    return SuccessResponse(
        success=True,
        data=_format_artist_profile(artist),
        message="Artist profile successfully registered."
    )

@router.get(
    "/me/dashboard",
    response_model=SuccessResponse[ArtistDashboardResponse],
    status_code=status.HTTP_200_OK,
    summary="Get logged-in artist dashboard metrics and widgets"
)
async def get_artist_dashboard(
    current_user_claims: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns dashboard stats, recent reviews, upcoming events, notifications, and monthly performance.
    """
    stats = service.get_dashboard_stats(db, current_user_claims["sub"])
    return SuccessResponse(
        success=True,
        data=stats,
        message="Artist dashboard data retrieved successfully."
    )

@router.get(
    "/me",
    response_model=SuccessResponse[ArtistProfileResponse],
    status_code=status.HTTP_200_OK,
    summary="Get currently authenticated artist profile details"
)
async def get_current_artist_profile(
    current_user_claims: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves the complete profile information for the authenticated performer.
    """
    artist = service.crud.get_by_user_id(db, current_user_claims["sub"])
    if not artist:
        raise NotFoundException("Artist profile not found.")
    return SuccessResponse(
        success=True,
        data=_format_artist_profile(artist),
        message="Artist profile retrieved successfully."
    )

@router.put(
    "/me",
    response_model=SuccessResponse[ArtistProfileResponse],
    status_code=status.HTTP_200_OK,
    summary="Update authenticated artist profile details"
)
async def update_current_artist_profile(
    data: ArtistProfileUpdate,
    current_user_claims: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Updates basic details, genres, languages, and pricing configuration for the logged-in performer.
    """
    artist = service.update_profile(db, current_user_claims["sub"], data)
    return SuccessResponse(
        success=True,
        data=_format_artist_profile(artist),
        message="Artist profile updated successfully."
    )

@router.get(
    "/me/availability",
    response_model=SuccessResponse[AvailabilityUpdate],
    status_code=status.HTTP_200_OK,
    summary="Get authenticated artist availability schedule configuration"
)
async def get_current_artist_availability(
    current_user_claims: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves weekly schedule settings, holidays list, blocked dates list, and break hours for the performer.
    """
    avail = service.get_availability(db, current_user_claims["sub"])
    return SuccessResponse(
        success=True,
        data=avail,
        message="Availability schedule config retrieved successfully."
    )

@router.put(
    "/me/availability",
    response_model=SuccessResponse[AvailabilityUpdate],
    status_code=status.HTTP_200_OK,
    summary="Update authenticated artist availability schedule configuration"
)
async def update_current_artist_availability(
    data: AvailabilityUpdate,
    current_user_claims: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Updates weekly schedule working hours, holidays list, blocked dates list, and break hours.
    """
    avail = service.update_availability(db, current_user_claims["sub"], data.model_dump())
    return SuccessResponse(
        success=True,
        data=avail,
        message="Availability schedule config updated successfully."
    )

@router.post(
    "/me/availability/check-conflict",
    response_model=SuccessResponse[ConflictCheckResponse],
    status_code=status.HTTP_200_OK,
    summary="Check booking slot for schedule conflicts with the performer"
)
async def check_artist_booking_conflict(
    data: ConflictCheckRequest,
    current_user_claims: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Checks if a requested date and time has overlaps with blocked dates, holidays, breaks, or events.
    """
    has_conflict, reason = service.check_availability_conflict(
        db, current_user_claims["sub"], data.date, data.start_time, data.end_time
    )
    return SuccessResponse(
        success=True,
        data=ConflictCheckResponse(has_conflict=has_conflict, reason=reason),
        message="Availability conflict check completed."
    )

@router.get(
    "/me/media",
    response_model=SuccessResponse[MediaGalleryUpdate],
    status_code=status.HTTP_200_OK,
    summary="Get authenticated artist media gallery configuration"
)
async def get_current_artist_media(
    current_user_claims: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves gallery photos lists, videos files lists, and youtube/instagram links.
    """
    media = service.get_media(db, current_user_claims["sub"])
    return SuccessResponse(
        success=True,
        data=media,
        message="Artist media assets config retrieved."
    )

@router.put(
    "/me/media",
    response_model=SuccessResponse[MediaGalleryUpdate],
    status_code=status.HTTP_200_OK,
    summary="Update authenticated artist media gallery configuration"
)
async def update_current_artist_media(
    data: MediaGalleryUpdate,
    current_user_claims: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Updates gallery photos lists, videos files lists, and youtube/instagram links.
    """
    media = service.update_media(db, current_user_claims["sub"], data.model_dump())
    return SuccessResponse(
        success=True,
        data=media,
        message="Artist media assets updated successfully."
    )

@router.get(
    "/me/pricing",
    response_model=SuccessResponse[PricingUpdate],
    status_code=status.HTTP_200_OK,
    summary="Get authenticated artist pricing configuration"
)
async def get_current_artist_pricing(
    current_user_claims: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves base rates, currencies, hourly schedules, surcharges and package lists.
    """
    pricing = service.get_pricing(db, current_user_claims["sub"])
    return SuccessResponse(
        success=True,
        data=pricing,
        message="Artist pricing details retrieved."
    )

@router.put(
    "/me/pricing",
    response_model=SuccessResponse[PricingUpdate],
    status_code=status.HTTP_200_OK,
    summary="Update authenticated artist pricing configuration"
)
async def update_current_artist_pricing(
    data: PricingUpdate,
    current_user_claims: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Updates base rates, currencies, hourly schedules, surcharges and package lists.
    """
    pricing = service.update_pricing(db, current_user_claims["sub"], data.model_dump())
    return SuccessResponse(
        success=True,
        data=pricing,
        message="Artist pricing details updated successfully."
    )

@router.get(
    "/me/analytics",
    response_model=SuccessResponse[AnalyticsResponse],
    status_code=status.HTTP_200_OK,
    summary="Get authenticated artist dashboard business analytics and trends"
)
async def get_current_artist_analytics(
    current_user_claims: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves booking conversions, popular event counts, peak slot hours, and ratings trends.
    """
    analytics = service.get_analytics(db, current_user_claims["sub"])
    return SuccessResponse(
        success=True,
        data=analytics,
        message="Artist analytics insights retrieved successfully."
    )
