"""CRUD + auth helpers for Band accounts.

Uses Mokijo's existing password hashing and JWT issuance
(app.core.security) so authentication flows through the same
`check_user_authorization` dependency used by the rest of Mokijo.
"""

import hashlib
import json
from datetime import datetime, timedelta
from typing import Optional

from sqlalchemy.orm import Session

import jwt as pyjwt
from app.core.security import SECRET_KEY, ALGORITHM, create_access_token, hash_password, verify_password
from app.models.band_models import BandAccount, BandArtistProfile


def _normalize(email: str) -> str:
    return (email or "").strip().lower()


def get_account_by_email(db: Session, email: str) -> Optional[BandAccount]:
    return (
        db.query(BandAccount)
        .filter(BandAccount.email == _normalize(email))
        .filter(BandAccount.deleted_at.is_(None))
        .first()
    )


def get_account_by_id(db: Session, account_id: int) -> Optional[BandAccount]:
    return db.query(BandAccount).filter(BandAccount.id == account_id).first()


def create_account(db: Session, email: str, password: str, name: str, role: str, phone: str | None = None) -> BandAccount:
    if get_account_by_email(db, email):
        raise ValueError("Email already registered")
    if role not in {"client", "artist", "venue_owner", "admin"}:
        raise ValueError("Invalid role")
    account = BandAccount(
        email=_normalize(email),
        password_hash=hash_password(password),
        name=name,
        role=role,
        phone=phone,
        is_active=True,
        is_verified=False,
    )
    db.add(account)
    db.commit()
    db.refresh(account)

    if role == "artist":
        profile = BandArtistProfile(
            account_id=account.id,
            display_name=name,
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

    return account


def authenticate(db: Session, email: str, password: str) -> Optional[BandAccount]:
    account = get_account_by_email(db, email)
    if not account:
        return None
    if not verify_password(password, account.password_hash):
        return None
    if not account.is_active or account.deleted_at is not None:
        return None
    return account


def change_password(db: Session, account: BandAccount, current_password: str, new_password: str) -> bool:
    if not verify_password(current_password, account.password_hash):
        return False
    account.password_hash = hash_password(new_password)
    db.commit()
    return True


def soft_delete_account(db: Session, account: BandAccount) -> None:
    account.deleted_at = datetime.utcnow()
    account.is_active = False
    db.commit()


def set_active(db: Session, account: BandAccount, is_active: bool) -> BandAccount:
    account.is_active = is_active
    db.commit()
    db.refresh(account)
    return account


def verify_account(db: Session, account_id: int) -> BandAccount | None:
    account = get_account_by_id(db, account_id)
    if not account:
        return None
    account.is_verified = True
    db.commit()
    db.refresh(account)
    return account


VERIFY_TOKEN_MINUTES = 24 * 60


def make_verify_token(account: BandAccount) -> str:
    sub = json.dumps({"id": account.id, "role": "verify"})
    return create_access_token(data={"sub": sub}, expires_delta=timedelta(minutes=VERIFY_TOKEN_MINUTES))


def verify_email_token(db: Session, token: str) -> Optional[BandAccount]:
    try:
        payload = pyjwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except Exception:
        return None

    sub = payload.get("sub")
    data = sub if isinstance(sub, dict) else {}
    if not data and isinstance(sub, str):
        try:
            data = json.loads(sub)
        except Exception:
            data = {}

    if data.get("role") != "verify" or "id" not in data:
        return None

    account = get_account_by_id(db, int(data["id"]))
    if not account or not account.is_active or account.deleted_at is not None:
        return None

    account.is_verified = True
    db.commit()
    db.refresh(account)
    return account


def resend_verification(db: Session, email: str) -> bool:
    account = get_account_by_email(db, email)
    if not account or account.is_verified:
        return False
    token = make_verify_token(account)
    from app.services.email import send_verification_email
    return send_verification_email(account.email, token)


# ── Password reset (sandbox: tokens are logged, no email transport) ───────────

RESET_TOKEN_MINUTES = 60


def make_reset_token(account: BandAccount) -> str:
    """Create a short-lived JWT identifying the account for password reset."""
    import json
    from app.core.security import create_access_token

    sub = json.dumps({"id": account.id, "role": "reset"})
    return create_access_token(data={"sub": sub}, expires_delta=timedelta(minutes=RESET_TOKEN_MINUTES))


def consume_reset_token(db: Session, token: str, new_password: str) -> bool:
    import json
    import jwt as pyjwt
    from app.core.security import SECRET_KEY, ALGORITHM

    try:
        payload = pyjwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except Exception:
        return False
    sub = payload.get("sub")
    data = sub if isinstance(sub, dict) else {}
    if not data and isinstance(sub, str):
        try:
            data = json.loads(sub)
        except Exception:
            data = {}
    if data.get("role") != "reset" or "id" not in data:
        return False
    account = get_account_by_id(db, int(data["id"]))
    if not account:
        return False
    account.password_hash = hash_password(new_password)
    db.commit()
    return True


# ── Admin listing ─────────────────────────────────────────────────────────────

def list_accounts(db: Session, search: str | None = None, role: str | None = None,
                  is_active: bool | None = None, limit: int = 50, offset: int = 0):
    q = db.query(BandAccount).filter(BandAccount.deleted_at.is_(None))
    if search:
        like = f"%{search.lower()}%"
        q = q.filter(BandAccount.email.ilike(like) | BandAccount.name.ilike(like))
    if role:
        q = q.filter(BandAccount.role == role)
    if is_active is not None:
        q = q.filter(BandAccount.is_active == is_active)
    total = q.count()
    items = q.order_by(BandAccount.created_at.desc()).offset(offset).limit(limit).all()
    return items, total
