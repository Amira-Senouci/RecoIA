from __future__ import annotations

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, EmailStr
from sqlalchemy import text

from backend.app import email as email_module
from backend.app.security import (
    AuthenticatedUser,
    create_access_token,
    generate_otp_code,
    generate_reset_token,
    get_current_user,
    hash_password,
    verify_password,
)
from recsys.config import get_settings

router = APIRouter(prefix="/api/auth", tags=["auth"])

VERIFICATION_TTL_MINUTES = 15
RESET_TTL_MINUTES = 15


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterResponse(BaseModel):
    email: str


class ResendVerificationRequest(BaseModel):
    email: EmailStr


class VerifyEmailRequest(BaseModel):
    email: EmailStr
    code: str


class VerifyEmailResponse(BaseModel):
    verified: bool


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: str
    is_admin: bool


class TokenResponse(BaseModel):
    token: str
    user: UserOut


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ForgotPasswordResponse(BaseModel):
    sent: bool


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


class ResetPasswordResponse(BaseModel):
    reset: bool


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class ChangePasswordResponse(BaseModel):
    changed: bool


def _send_or_fail(to: str, subject: str, body: str) -> None:
    try:
        email_module.send_email(to=to, subject=subject, body=body)
    except (email_module.EmailNotConfiguredError, email_module.EmailDeliveryError) as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc


def _issue_verification_code(connection, user_id: int) -> str:
    code = generate_otp_code()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=VERIFICATION_TTL_MINUTES)
    connection.execute(
        text(
            "INSERT INTO email_verifications (user_id, code, expires_at, used) "
            "VALUES (:user_id, :code, :expires_at, 0)"
        ),
        {"user_id": user_id, "code": code, "expires_at": expires_at},
    )
    return code


@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, request: Request) -> RegisterResponse:
    if len(payload.password) < 8:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password must be at least 8 characters")

    engine = request.app.state.engine
    with engine.begin() as connection:
        existing = connection.execute(
            text("SELECT id FROM users WHERE email = :email"), {"email": payload.email}
        ).first()
        if existing is not None:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

        result = connection.execute(
            text(
                "INSERT INTO users (email, password_hash, is_admin, is_verified) "
                "VALUES (:email, :password_hash, false, false)"
            ),
            {"email": payload.email, "password_hash": hash_password(payload.password)},
        )
        user_id = result.lastrowid if result.lastrowid is not None else connection.execute(
            text("SELECT id FROM users WHERE email = :email"), {"email": payload.email}
        ).scalar_one()
        code = _issue_verification_code(connection, int(user_id))

    _send_or_fail(
        to=payload.email,
        subject="Verify your RecoIA email",
        body=(
            f"Your RecoIA verification code is: {code}\n\n"
            f"Enter this code on the verification page to activate your account. "
            f"It expires in {VERIFICATION_TTL_MINUTES} minutes."
        ),
    )
    return RegisterResponse(email=payload.email)


@router.post("/resend-verification", response_model=RegisterResponse)
def resend_verification(payload: ResendVerificationRequest, request: Request) -> RegisterResponse:
    engine = request.app.state.engine
    with engine.begin() as connection:
        user = connection.execute(
            text("SELECT id, is_verified FROM users WHERE email = :email"), {"email": payload.email}
        ).first()
        if user is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No account with that email")
        if user.is_verified:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email is already verified")
        code = _issue_verification_code(connection, user.id)

    _send_or_fail(
        to=payload.email,
        subject="Your new RecoIA verification code",
        body=(
            f"Your new RecoIA verification code is: {code}\n\n"
            f"Enter this code on the verification page to activate your account. "
            f"It expires in {VERIFICATION_TTL_MINUTES} minutes."
        ),
    )
    return RegisterResponse(email=payload.email)


@router.post("/verify-email", response_model=VerifyEmailResponse)
def verify_email(payload: VerifyEmailRequest, request: Request) -> VerifyEmailResponse:
    engine = request.app.state.engine
    now = datetime.now(timezone.utc)
    with engine.begin() as connection:
        user = connection.execute(
            text("SELECT id FROM users WHERE email = :email"), {"email": payload.email}
        ).first()
        if user is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No account with that email")

        row = connection.execute(
            text(
                "SELECT id, expires_at FROM email_verifications "
                "WHERE user_id = :user_id AND code = :code AND used = 0 "
                "ORDER BY id DESC LIMIT 1"
            ),
            {"user_id": user.id, "code": payload.code},
        ).first()
        if row is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid verification code")

        expires_at = row.expires_at
        if isinstance(expires_at, str):
            expires_at = datetime.fromisoformat(expires_at)
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at < now:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Verification code has expired")

        connection.execute(
            text("UPDATE email_verifications SET used = 1 WHERE id = :id"), {"id": row.id}
        )
        connection.execute(
            text("UPDATE users SET is_verified = 1 WHERE id = :id"), {"id": user.id}
        )

    return VerifyEmailResponse(verified=True)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, request: Request) -> TokenResponse:
    engine = request.app.state.engine
    with engine.connect() as connection:
        row = connection.execute(
            text("SELECT id, email, password_hash, is_admin, is_verified FROM users WHERE email = :email"),
            {"email": payload.email},
        ).first()

    if row is None or not verify_password(payload.password, row.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    if not row.is_verified:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="email_not_verified")

    user = AuthenticatedUser(id=row.id, email=row.email, is_admin=bool(row.is_admin))
    return TokenResponse(token=create_access_token(user), user=UserOut(id=user.id, email=user.email, is_admin=user.is_admin))


@router.get("/me", response_model=UserOut)
def me(user: AuthenticatedUser = Depends(get_current_user)) -> UserOut:
    return UserOut(id=user.id, email=user.email, is_admin=user.is_admin)


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
def forgot_password(payload: ForgotPasswordRequest, request: Request) -> ForgotPasswordResponse:
    engine = request.app.state.engine
    with engine.begin() as connection:
        user = connection.execute(
            text("SELECT id FROM users WHERE email = :email"), {"email": payload.email}
        ).first()
        if user is None:
            # Always return 200 so this endpoint can't be used to enumerate accounts.
            return ForgotPasswordResponse(sent=True)

        token = generate_reset_token()
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=RESET_TTL_MINUTES)
        connection.execute(
            text(
                "INSERT INTO password_resets (user_id, token, expires_at, used) "
                "VALUES (:user_id, :token, :expires_at, 0)"
            ),
            {"user_id": user.id, "token": token, "expires_at": expires_at},
        )

    reset_link = f"{get_settings().frontend_base_url.rstrip('/')}/reset-password/{token}"
    _send_or_fail(
        to=payload.email,
        subject="Reset your RecoIA password",
        body=(
            f"Click the link below to reset your RecoIA password:\n\n{reset_link}\n\n"
            f"This link expires in {RESET_TTL_MINUTES} minutes. If you didn't request this, ignore this email."
        ),
    )
    return ForgotPasswordResponse(sent=True)


@router.post("/reset-password", response_model=ResetPasswordResponse)
def reset_password(payload: ResetPasswordRequest, request: Request) -> ResetPasswordResponse:
    if len(payload.new_password) < 8:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password must be at least 8 characters")

    engine = request.app.state.engine
    now = datetime.now(timezone.utc)
    with engine.begin() as connection:
        row = connection.execute(
            text(
                "SELECT id, user_id, expires_at FROM password_resets "
                "WHERE token = :token AND used = 0 ORDER BY id DESC LIMIT 1"
            ),
            {"token": payload.token},
        ).first()
        if row is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or already-used reset token")

        expires_at = row.expires_at
        if isinstance(expires_at, str):
            expires_at = datetime.fromisoformat(expires_at)
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at < now:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Reset token has expired")

        connection.execute(
            text("UPDATE users SET password_hash = :password_hash WHERE id = :id"),
            {"password_hash": hash_password(payload.new_password), "id": row.user_id},
        )
        connection.execute(
            text("UPDATE password_resets SET used = 1 WHERE id = :id"), {"id": row.id}
        )

    return ResetPasswordResponse(reset=True)


@router.put("/change-password", response_model=ChangePasswordResponse)
def change_password(
    payload: ChangePasswordRequest,
    request: Request,
    user: AuthenticatedUser = Depends(get_current_user),
) -> ChangePasswordResponse:
    if len(payload.new_password) < 8:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password must be at least 8 characters")

    engine = request.app.state.engine
    with engine.begin() as connection:
        row = connection.execute(
            text("SELECT password_hash FROM users WHERE id = :id"), {"id": user.id}
        ).first()
        if row is None or not verify_password(payload.current_password, row.password_hash):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Current password is incorrect")

        connection.execute(
            text("UPDATE users SET password_hash = :password_hash WHERE id = :id"),
            {"password_hash": hash_password(payload.new_password), "id": user.id},
        )

    return ChangePasswordResponse(changed=True)
