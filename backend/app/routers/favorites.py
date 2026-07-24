from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from sqlalchemy import text

from backend.app.security import AuthenticatedUser, get_current_user

router = APIRouter(prefix="/api/favorites", tags=["favorites"])


class FavoriteItem(BaseModel):
    item_id: str
    title: str
    brand: str
    category: str
    price: float | None
    image_url: str
    has_image: bool
    avg_rating: float | None
    n_ratings: int


class FavoritesResponse(BaseModel):
    items: list[FavoriteItem]


class FavoriteStatus(BaseModel):
    favorited: bool


@router.get("", response_model=FavoritesResponse)
def list_favorites(
    request: Request, user: AuthenticatedUser = Depends(get_current_user)
) -> FavoritesResponse:
    engine = request.app.state.engine
    with engine.connect() as connection:
        rows = connection.execute(
            text(
                "SELECT i.item_id, i.title, i.brand, i.category, i.price, "
                "i.image_url, i.has_image, i.avg_rating, i.n_ratings "
                "FROM items i "
                "JOIN ("
                "  SELECT item_id, event_type FROM events"
                "  WHERE id IN ("
                "    SELECT MAX(id) FROM events"
                "    WHERE user_id = :user_id AND event_type IN ('save', 'unsave')"
                "    GROUP BY item_id"
                "  )"
                ") latest ON latest.item_id = i.item_id "
                "WHERE latest.event_type = 'save' "
                "ORDER BY i.item_id"
            ),
            {"user_id": user.id},
        ).all()

    return FavoritesResponse(
        items=[
            FavoriteItem(
                item_id=row.item_id,
                title=row.title,
                brand=row.brand,
                category=row.category,
                price=row.price,
                image_url=row.image_url,
                has_image=bool(row.has_image),
                avg_rating=row.avg_rating,
                n_ratings=row.n_ratings,
            )
            for row in rows
        ]
    )


@router.post("/{item_id}", response_model=FavoriteStatus, status_code=status.HTTP_201_CREATED)
def add_favorite(
    item_id: str, request: Request, user: AuthenticatedUser = Depends(get_current_user)
) -> FavoriteStatus:
    engine = request.app.state.engine
    with engine.begin() as connection:
        exists = connection.execute(
            text("SELECT 1 FROM items WHERE item_id = :item_id"), {"item_id": item_id}
        ).first()
        if exists is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
        connection.execute(
            text(
                "INSERT INTO events (user_id, item_id, event_type) "
                "VALUES (:user_id, :item_id, 'save')"
            ),
            {"user_id": user.id, "item_id": item_id},
        )
    return FavoriteStatus(favorited=True)


@router.delete("/{item_id}", response_model=FavoriteStatus)
def remove_favorite(
    item_id: str, request: Request, user: AuthenticatedUser = Depends(get_current_user)
) -> FavoriteStatus:
    engine = request.app.state.engine
    with engine.begin() as connection:
        connection.execute(
            text(
                "INSERT INTO events (user_id, item_id, event_type) "
                "VALUES (:user_id, :item_id, 'unsave')"
            ),
            {"user_id": user.id, "item_id": item_id},
        )
    return FavoriteStatus(favorited=False)
