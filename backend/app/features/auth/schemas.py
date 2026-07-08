"""
Pydantic validation schemas for Authentication request/responses.
"""

from typing import List, Optional
from uuid import UUID
from pydantic import EmailStr, Field
from app.common.schemas.base import BaseSchema

class PermissionResponse(BaseSchema):
    id: UUID
    name: str
    description: Optional[str] = None

class RoleResponse(BaseSchema):
    id: UUID
    name: str
    description: Optional[str] = None
    permissions: List[PermissionResponse] = []

class UserRegister(BaseSchema):
    email: EmailStr
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters")
    name: str = Field(..., min_length=2, max_length=150)
    role_name: str = Field(..., description="Role to assign: client, artist, or venue_owner")

class UserLogin(BaseSchema):
    email: EmailStr
    password: str

class TokenResponse(BaseSchema):
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"

class RefreshTokenRequest(BaseSchema):
    refresh_token: str

class ForgotPasswordRequest(BaseSchema):
    email: EmailStr

class ResetPasswordRequest(BaseSchema):
    token: str
    new_password: str = Field(..., min_length=8)

class UserResponse(BaseSchema):
    id: UUID
    email: EmailStr
    name: str
    is_active: bool
    is_verified: bool
    roles: List[RoleResponse] = []

class UserStatusUpdate(BaseSchema):
    is_active: bool

class BulkStatusUpdate(BaseSchema):
    user_ids: List[UUID]
    is_active: bool

class PaginatedUserList(BaseSchema):
    items: List[UserResponse]
    total: int
