"""
API routes for system settings and audit logging logs.
"""

from typing import Optional
from fastapi import APIRouter, Depends, status, Query, Request
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_admin
from app.features.settings.schemas import (
    SystemSettingResponse,
    SystemSettingUpdate,
    AuditLogResponse,
    PaginatedAuditLogList
)
from app.features.settings.service import SettingService
from app.features.settings.crud import AuditLogCRUD
from app.common.schemas.base import SuccessResponse

router = APIRouter()
service = SettingService()
audit_crud = AuditLogCRUD()


@router.get(
    "/audit-logs",
    response_model=SuccessResponse[PaginatedAuditLogList],
    status_code=status.HTTP_200_OK,
    summary="List audit logs (Admin only)"
)
async def list_audit_logs(
    action: Optional[str] = Query(None, description="Filter logs by action"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_admin_claims: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Admin-only route returning paginated history of administrative operations logs."""
    logs, total = audit_crud.get_filtered_logs(db, action=action, limit=limit, offset=offset)
    
    formatted = []
    for log in logs:
        formatted.append(
            AuditLogResponse(
                id=log.id,
                user_id=log.user_id,
                user_name=log.user.name if log.user else "System",
                action=log.action,
                ip_address=log.ip_address,
                user_agent=log.user_agent,
                payload=log.payload or {},
                created_at=log.created_at.isoformat()
            )
        )

    return SuccessResponse(
        success=True,
        data=PaginatedAuditLogList(items=formatted, total=total),
        message="Audit logs retrieved successfully."
    )


@router.get(
    "/{key}",
    response_model=SuccessResponse[SystemSettingResponse],
    status_code=status.HTTP_200_OK,
    summary="Get application setting (Admin only)"
)
async def get_system_setting(
    key: str,
    current_admin_claims: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Admin-only route returning dynamic configuration values by key descriptor."""
    setting = service.get_setting(db, key)
    return SuccessResponse(
        success=True,
        data=SystemSettingResponse(
            key=setting.key,
            value=setting.value,
            description=setting.description,
            updated_at=setting.updated_at.isoformat()
        ),
        message="Setting retrieved successfully."
    )


@router.put(
    "/{key}",
    response_model=SuccessResponse[SystemSettingResponse],
    status_code=status.HTTP_200_OK,
    summary="Update system setting value (Admin only)"
)
async def update_system_setting(
    key: str,
    data: SystemSettingUpdate,
    request: Request,
    current_admin_claims: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Admin-only route updating configuration parameters and logging to audit logs."""
    user_id = current_admin_claims["sub"]
    ip_address = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("user-agent", "unknown")
    
    setting = service.update_setting(
        db,
        key=key,
        value=data.value,
        user_id=user_id,
        ip_address=ip_address,
        user_agent=user_agent
    )
    
    return SuccessResponse(
        success=True,
        data=SystemSettingResponse(
            key=setting.key,
            value=setting.value,
            description=setting.description,
            updated_at=setting.updated_at.isoformat()
        ),
        message="Setting updated and logged successfully."
    )
