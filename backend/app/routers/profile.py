from __future__ import annotations

import json
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel
from sqlalchemy import text

from backend.app.security import AuthenticatedUser, get_current_user

router = APIRouter(prefix="/api/profile", tags=["profile"])


class PreferencesResponse(BaseModel):
    category_prefs: list[str]


class UpdatePreferencesRequest(BaseModel):
    category_prefs: list[str]


@router.get("/preferences", response_model=PreferencesResponse)
def get_preferences(
    request: Request, user: AuthenticatedUser = Depends(get_current_user)
) -> PreferencesResponse:
    engine = request.app.state.engine
    with engine.connect() as connection:
        row = connection.execute(
            text("SELECT category_prefs FROM user_profiles WHERE user_id = :user_id"),
            {"user_id": user.id},
        ).first()
    prefs = json.loads(row.category_prefs) if row and row.category_prefs else []
    return PreferencesResponse(category_prefs=prefs)


@router.put("/preferences", response_model=PreferencesResponse)
def update_preferences(
    payload: UpdatePreferencesRequest,
    request: Request,
    user: AuthenticatedUser = Depends(get_current_user),
) -> PreferencesResponse:
    engine = request.app.state.engine
    encoded = json.dumps(payload.category_prefs)
    with engine.begin() as connection:
        existing = connection.execute(
            text("SELECT user_id FROM user_profiles WHERE user_id = :user_id"),
            {"user_id": user.id},
        ).first()
        if existing is None:
            connection.execute(
                text(
                    "INSERT INTO user_profiles (user_id, category_prefs, updated_at) "
                    "VALUES (:user_id, :category_prefs, :updated_at)"
                ),
                {"user_id": user.id, "category_prefs": encoded, "updated_at": datetime.now(timezone.utc)},
            )
        else:
            connection.execute(
                text(
                    "UPDATE user_profiles SET category_prefs = :category_prefs, updated_at = :updated_at "
                    "WHERE user_id = :user_id"
                ),
                {"category_prefs": encoded, "updated_at": datetime.now(timezone.utc), "user_id": user.id},
            )
    return PreferencesResponse(category_prefs=payload.category_prefs)
