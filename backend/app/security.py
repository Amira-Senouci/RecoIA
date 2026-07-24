from __future__ import annotations

import secrets
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import Depends, HTTPException, Request, status
from sqlalchemy import text

from recsys.config import get_settings


@dataclass(frozen=True)
class AuthenticatedUser:
    id: int
    email: str
    is_admin: bool


def generate_otp_code() -> str:
    return f"{secrets.randbelow(1_000_000):06d}"


def generate_reset_token() -> str:
    return secrets.token_urlsafe(32)


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
    except ValueError:
        return False


def create_access_token(user: AuthenticatedUser) -> str:
    settings = get_settings()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expire_minutes)
    payload = {
        "sub": str(user.id),
        "email": user.email,
        "is_admin": user.is_admin,
        "exp": expire,
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm="HS256")


def decode_access_token(token: str) -> AuthenticatedUser:
    settings = get_settings()
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
    except jwt.PyJWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token") from exc
    return AuthenticatedUser(id=int(payload["sub"]), email=payload["email"], is_admin=bool(payload["is_admin"]))


def get_current_user(request: Request) -> AuthenticatedUser:
    authorization = request.headers.get("Authorization", "")
    if not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")
    token = authorization[len("bearer "):].strip()
    user = decode_access_token(token)

    engine = request.app.state.engine
    with engine.connect() as connection:
        row = connection.execute(
            text("SELECT id, email, is_admin FROM users WHERE id = :id"),
            {"id": user.id},
        ).first()
    if row is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User no longer exists")
    return AuthenticatedUser(id=row.id, email=row.email, is_admin=bool(row.is_admin))


def require_admin(user: AuthenticatedUser = Depends(get_current_user)) -> AuthenticatedUser:
    if not user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return user
