from __future__ import annotations

from fastapi import APIRouter, Depends, Request, status
from pydantic import BaseModel
from sqlalchemy import text

from backend.app.security import AuthenticatedUser, get_current_user

router = APIRouter(prefix="/api/events", tags=["events"])


class EventRequest(BaseModel):
    item_id: str
    event_type: str
    value: float | None = None


class EventResponse(BaseModel):
    id: int


@router.post("", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
def create_event(
    payload: EventRequest,
    request: Request,
    user: AuthenticatedUser = Depends(get_current_user),
) -> EventResponse:
    engine = request.app.state.engine
    with engine.begin() as connection:
        result = connection.execute(
            text(
                "INSERT INTO events (user_id, item_id, event_type, value) "
                "VALUES (:user_id, :item_id, :event_type, :value)"
            ),
            {
                "user_id": user.id,
                "item_id": payload.item_id,
                "event_type": payload.event_type,
                "value": payload.value,
            },
        )
        event_id = result.lastrowid
    return EventResponse(id=int(event_id))
