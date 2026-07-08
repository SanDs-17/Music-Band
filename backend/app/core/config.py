"""
Application Configuration — Pydantic BaseSettings

All environment variables are read from .env file and validated here.
Never access os.environ directly — always use settings.VARIABLE_NAME.

Usage:
    from app.core.config import settings
    print(settings.DATABASE_URL)
"""

import json
from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # ── Application ───────────────────────────────────────────────────────────
    APP_NAME: str = "BandConnect"
    APP_URL: str = "http://localhost:3000"
    API_URL: str = "http://localhost:8000"
    ENVIRONMENT: str = "development"  # development | staging | production

    # ── Database ──────────────────────────────────────────────────────────────
    DATABASE_URL: str

    # ── Security ──────────────────────────────────────────────────────────────
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ── Redis ─────────────────────────────────────────────────────────────────
    REDIS_URL: str = "redis://localhost:6379/0"

    # ── CORS ──────────────────────────────────────────────────────────────────
    ALLOWED_ORIGINS: list[str] = ["http://localhost:3000"]

    # ── AWS S3 ────────────────────────────────────────────────────────────────
    AWS_ACCESS_KEY_ID: str | None = None
    AWS_SECRET_ACCESS_KEY: str | None = None
    AWS_BUCKET_NAME: str | None = None
    AWS_REGION: str = "ap-south-1"

    # ── Razorpay ──────────────────────────────────────────────────────────────
    RAZORPAY_KEY_ID: str | None = None
    RAZORPAY_KEY_SECRET: str | None = None

    # ── Email ─────────────────────────────────────────────────────────────────
    SMTP_HOST: str = "smtp.mailtrap.io"
    SMTP_PORT: int = 587
    SMTP_USER: str | None = None
    SMTP_PASS: str | None = None
    FROM_EMAIL: str = "noreply@bandconnect.in"
    FROM_NAME: str = "BandConnect"

    # ── Storage ───────────────────────────────────────────────────────────────
    # When USE_S3 is False, files are stored locally in uploads/
    # Set USE_S3=True in production
    USE_S3: bool = False
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE_MB: int = 5
    ALLOWED_IMAGE_TYPES: list[str] = ["image/jpeg", "image/png", "image/webp", "image/gif"]

    # ── Platform Commission ───────────────────────────────────────────────────
    PLATFORM_COMMISSION_PERCENT: float = 10.0

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"

    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT == "development"

    @property
    def database_url_sync(self) -> str:
        """Synchronous database URL for Alembic."""
        return self.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True

        @classmethod
        def parse_env_var(cls, field_name: str, raw_val: str):
            # Allow JSON-serialized lists in env vars (e.g., ALLOWED_ORIGINS)
            if field_name in ("ALLOWED_ORIGINS", "ALLOWED_IMAGE_TYPES"):
                try:
                    return json.loads(raw_val)
                except (json.JSONDecodeError, ValueError):
                    return [raw_val]
            return raw_val


@lru_cache
def get_settings() -> Settings:
    """
    Returns a cached Settings instance.
    Use this in FastAPI dependencies via Depends(get_settings).
    """
    return Settings()


# Module-level singleton — import and use directly
settings = get_settings()
