from __future__ import annotations

import csv
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from pydantic import BaseModel
from sqlalchemy import text

from backend.app.security import AuthenticatedUser, require_admin
from recsys.config import get_settings

router = APIRouter(prefix="/api/admin", tags=["admin"], dependencies=[Depends(require_admin)])


class SummaryResponse(BaseModel):
    total_users: int
    total_items: int
    total_events: int
    events_last_7d: int
    active_model_version: str | None
    active_model_trained_at: str | None


class AdminUser(BaseModel):
    id: int
    email: str
    is_admin: bool
    created_at: str | None
    event_count: int


class AdminUsersResponse(BaseModel):
    users: list[AdminUser]
    total: int


class RecentEvent(BaseModel):
    id: int
    item_id: str
    item_title: str | None
    event_type: str
    ts: str | None


class AdminUserDetail(BaseModel):
    id: int
    email: str
    is_admin: bool
    created_at: str | None
    recent_events: list[RecentEvent]


class DayCount(BaseModel):
    day: str
    count: int


class TypeCount(BaseModel):
    event_type: str
    count: int


class TopItem(BaseModel):
    item_id: str
    title: str | None
    views: int


class AnalyticsResponse(BaseModel):
    events_by_day: list[DayCount]
    events_by_type: list[TypeCount]
    top_items: list[TopItem]


class ModelRow(BaseModel):
    id: int
    version: str
    path: str | None
    trained_at: str | None
    is_active: bool


class ModelsResponse(BaseModel):
    models: list[ModelRow]


class ModelMetricRow(BaseModel):
    system: str
    hr_at_10: float
    ci95: float
    ndcg_at_10: float
    coverage: float
    diversity: float
    novelty: float


class ModelMetricsResponse(BaseModel):
    metrics: list[ModelMetricRow]
    best_system: str | None


class AdminOrder(BaseModel):
    id: int
    user_email: str
    item_id: str
    item_title: str | None
    quantity: int
    price: float | None
    status: str
    created_at: str | None


class AdminOrdersResponse(BaseModel):
    orders: list[AdminOrder]
    total: int


class Notification(BaseModel):
    id: int
    email: str
    created_at: str | None


class NotificationsResponse(BaseModel):
    notifications: list[Notification]


@router.get("/summary", response_model=SummaryResponse)
def summary(request: Request) -> SummaryResponse:
    engine = request.app.state.engine
    cutoff = (datetime.now(timezone.utc) - timedelta(days=7)).strftime("%Y-%m-%d %H:%M:%S")
    with engine.connect() as connection:
        total_users = connection.execute(text("SELECT count(*) FROM users")).scalar_one()
        total_items = connection.execute(text("SELECT count(*) FROM items")).scalar_one()
        total_events = connection.execute(text("SELECT count(*) FROM events")).scalar_one()
        events_last_7d = connection.execute(
            text("SELECT count(*) FROM events WHERE ts >= :cutoff"), {"cutoff": cutoff}
        ).scalar_one()
        active_model = connection.execute(
            text(
                "SELECT version, trained_at FROM model_registry "
                "WHERE is_active = 1 ORDER BY trained_at DESC, id DESC LIMIT 1"
            )
        ).first()

    return SummaryResponse(
        total_users=total_users,
        total_items=total_items,
        total_events=total_events,
        events_last_7d=events_last_7d,
        active_model_version=active_model.version if active_model else None,
        active_model_trained_at=str(active_model.trained_at) if active_model else None,
    )


@router.get("/users", response_model=AdminUsersResponse)
def list_users(
    request: Request,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    _: AuthenticatedUser = Depends(require_admin),
) -> AdminUsersResponse:
    engine = request.app.state.engine
    offset = (page - 1) * page_size
    with engine.connect() as connection:
        total = connection.execute(text("SELECT count(*) FROM users")).scalar_one()
        rows = connection.execute(
            text(
                "SELECT u.id, u.email, u.is_admin, u.created_at, "
                "COUNT(e.id) AS event_count "
                "FROM users u LEFT JOIN events e ON e.user_id = u.id "
                "GROUP BY u.id, u.email, u.is_admin, u.created_at "
                "ORDER BY u.id ASC LIMIT :limit OFFSET :offset"
            ),
            {"limit": page_size, "offset": offset},
        ).all()

    return AdminUsersResponse(
        total=total,
        users=[
            AdminUser(
                id=row.id,
                email=row.email,
                is_admin=bool(row.is_admin),
                created_at=str(row.created_at) if row.created_at else None,
                event_count=row.event_count,
            )
            for row in rows
        ],
    )


@router.get("/users/{user_id}", response_model=AdminUserDetail)
def user_detail(
    user_id: int, request: Request, _: AuthenticatedUser = Depends(require_admin)
) -> AdminUserDetail:
    engine = request.app.state.engine
    with engine.connect() as connection:
        user_row = connection.execute(
            text("SELECT id, email, is_admin, created_at FROM users WHERE id = :id"), {"id": user_id}
        ).first()
        if user_row is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        event_rows = connection.execute(
            text(
                "SELECT e.id, e.item_id, i.title AS item_title, e.event_type, e.ts "
                "FROM events e LEFT JOIN items i ON i.item_id = e.item_id "
                "WHERE e.user_id = :id ORDER BY e.ts DESC LIMIT 20"
            ),
            {"id": user_id},
        ).all()

    return AdminUserDetail(
        id=user_row.id,
        email=user_row.email,
        is_admin=bool(user_row.is_admin),
        created_at=str(user_row.created_at) if user_row.created_at else None,
        recent_events=[
            RecentEvent(
                id=row.id,
                item_id=row.item_id,
                item_title=row.item_title,
                event_type=row.event_type,
                ts=str(row.ts) if row.ts else None,
            )
            for row in event_rows
        ],
    )


@router.get("/analytics", response_model=AnalyticsResponse)
def analytics(request: Request) -> AnalyticsResponse:
    engine = request.app.state.engine
    cutoff = (datetime.now(timezone.utc) - timedelta(days=14)).strftime("%Y-%m-%d %H:%M:%S")
    with engine.connect() as connection:
        by_day = connection.execute(
            text(
                "SELECT SUBSTR(CAST(ts AS TEXT), 1, 10) AS day, COUNT(*) AS count "
                "FROM events WHERE ts >= :cutoff GROUP BY day ORDER BY day ASC"
            ),
            {"cutoff": cutoff},
        ).all()
        by_type = connection.execute(
            text("SELECT event_type, COUNT(*) AS count FROM events GROUP BY event_type ORDER BY count DESC")
        ).all()
        top_items = connection.execute(
            text(
                "SELECT e.item_id, i.title AS title, COUNT(*) AS views "
                "FROM events e LEFT JOIN items i ON i.item_id = e.item_id "
                "WHERE e.event_type = 'view' "
                "GROUP BY e.item_id, i.title ORDER BY views DESC LIMIT 5"
            )
        ).all()

    return AnalyticsResponse(
        events_by_day=[DayCount(day=row.day, count=row.count) for row in by_day],
        events_by_type=[TypeCount(event_type=row.event_type, count=row.count) for row in by_type],
        top_items=[TopItem(item_id=row.item_id, title=row.title, views=row.views) for row in top_items],
    )


@router.get("/models", response_model=ModelsResponse)
def models(request: Request) -> ModelsResponse:
    engine = request.app.state.engine
    with engine.connect() as connection:
        rows = connection.execute(
            text(
                "SELECT id, version, path, trained_at, is_active FROM model_registry "
                "ORDER BY trained_at DESC, id DESC"
            )
        ).all()

    return ModelsResponse(
        models=[
            ModelRow(
                id=row.id,
                version=row.version,
                path=row.path,
                trained_at=str(row.trained_at) if row.trained_at else None,
                is_active=bool(row.is_active),
            )
            for row in rows
        ]
    )


@router.get("/model-metrics", response_model=ModelMetricsResponse)
def model_metrics() -> ModelMetricsResponse:
    settings = get_settings()
    csv_path = settings.project_root / "notebooks" / "results" / "final_master_table.csv"
    if not csv_path.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Offline evaluation results not found (notebooks/results/final_master_table.csv missing)",
        )

    with csv_path.open(newline="", encoding="utf-8") as handle:
        rows = list(csv.DictReader(handle))

    metrics = [
        ModelMetricRow(
            system=row["system"],
            hr_at_10=float(row["HR@10"]),
            ci95=float(row["ci95"]),
            ndcg_at_10=float(row["NDCG@10"]),
            coverage=float(row["coverage"]),
            diversity=float(row["diversity"]),
            novelty=float(row["novelty"]),
        )
        for row in rows
    ]
    best = max(metrics, key=lambda m: m.hr_at_10) if metrics else None
    return ModelMetricsResponse(metrics=metrics, best_system=best.system if best else None)


@router.get("/orders", response_model=AdminOrdersResponse)
def list_orders(
    request: Request,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> AdminOrdersResponse:
    engine = request.app.state.engine
    offset = (page - 1) * page_size
    with engine.connect() as connection:
        total = connection.execute(text("SELECT count(*) FROM orders")).scalar_one()
        rows = connection.execute(
            text(
                "SELECT o.id, u.email AS user_email, o.item_id, i.title AS item_title, "
                "o.quantity, o.price, o.status, o.created_at "
                "FROM orders o "
                "LEFT JOIN users u ON u.id = o.user_id "
                "LEFT JOIN items i ON i.item_id = o.item_id "
                "ORDER BY o.id DESC LIMIT :limit OFFSET :offset"
            ),
            {"limit": page_size, "offset": offset},
        ).all()

    return AdminOrdersResponse(
        total=total,
        orders=[
            AdminOrder(
                id=row.id,
                user_email=row.user_email or "unknown",
                item_id=row.item_id,
                item_title=row.item_title,
                quantity=row.quantity,
                price=row.price,
                status=row.status,
                created_at=str(row.created_at) if row.created_at else None,
            )
            for row in rows
        ],
    )


@router.get("/notifications", response_model=NotificationsResponse)
def notifications(request: Request) -> NotificationsResponse:
    engine = request.app.state.engine
    cutoff = (datetime.now(timezone.utc) - timedelta(days=7)).strftime("%Y-%m-%d %H:%M:%S")
    with engine.connect() as connection:
        rows = connection.execute(
            text(
                "SELECT id, email, created_at FROM users "
                "WHERE created_at >= :cutoff ORDER BY id DESC LIMIT 10"
            ),
            {"cutoff": cutoff},
        ).all()

    return NotificationsResponse(
        notifications=[
            Notification(id=row.id, email=row.email, created_at=str(row.created_at) if row.created_at else None)
            for row in rows
        ]
    )
