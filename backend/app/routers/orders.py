from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from sqlalchemy import text

from backend.app.security import AuthenticatedUser, get_current_user

router = APIRouter(prefix="/api/orders", tags=["orders"])


class CreateOrderRequest(BaseModel):
    item_id: str
    quantity: int = 1


class Order(BaseModel):
    id: int
    item_id: str
    item_title: str | None
    quantity: int
    price: float | None
    status: str
    created_at: str | None


class OrdersResponse(BaseModel):
    orders: list[Order]


@router.post("", response_model=Order, status_code=status.HTTP_201_CREATED)
def create_order(
    payload: CreateOrderRequest, request: Request, user: AuthenticatedUser = Depends(get_current_user)
) -> Order:
    if payload.quantity < 1:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Quantity must be at least 1")

    engine = request.app.state.engine
    with engine.begin() as connection:
        item = connection.execute(
            text("SELECT item_id, title, price FROM items WHERE item_id = :item_id"),
            {"item_id": payload.item_id},
        ).first()
        if item is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")

        result = connection.execute(
            text(
                "INSERT INTO orders (user_id, item_id, quantity, price, status) "
                "VALUES (:user_id, :item_id, :quantity, :price, 'completed')"
            ),
            {
                "user_id": user.id,
                "item_id": item.item_id,
                "quantity": payload.quantity,
                "price": item.price,
            },
        )
        order_row = connection.execute(
            text("SELECT id, created_at FROM orders WHERE id = :id"),
            {"id": result.lastrowid},
        ).first()

    return Order(
        id=order_row.id,
        item_id=item.item_id,
        item_title=item.title,
        quantity=payload.quantity,
        price=item.price,
        status="completed",
        created_at=str(order_row.created_at) if order_row.created_at else None,
    )


@router.get("", response_model=OrdersResponse)
def list_orders(request: Request, user: AuthenticatedUser = Depends(get_current_user)) -> OrdersResponse:
    engine = request.app.state.engine
    with engine.connect() as connection:
        rows = connection.execute(
            text(
                "SELECT o.id, o.item_id, i.title AS item_title, o.quantity, o.price, "
                "o.status, o.created_at "
                "FROM orders o LEFT JOIN items i ON i.item_id = o.item_id "
                "WHERE o.user_id = :user_id ORDER BY o.id DESC"
            ),
            {"user_id": user.id},
        ).all()

    return OrdersResponse(
        orders=[
            Order(
                id=row.id,
                item_id=row.item_id,
                item_title=row.item_title,
                quantity=row.quantity,
                price=row.price,
                status=row.status,
                created_at=str(row.created_at) if row.created_at else None,
            )
            for row in rows
        ]
    )
