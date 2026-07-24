from __future__ import annotations

from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone

from fastapi import Depends, FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import text

from backend.app.routers import admin, auth, events, favorites, orders, profile
from backend.app.security import AuthenticatedUser, get_current_user
from recsys.config import Settings, get_settings
from recsys.serving.artifacts import ArtifactError, load_artifact_bundle, load_active_version
from recsys.serving.catalog import CatalogStore
from recsys.serving.recommender import RecommenderService


class CatalogItem(BaseModel):
    item_id: str
    title: str
    brand: str
    category: str
    price: float | None
    image_url: str
    has_image: bool
    avg_rating: float | None
    n_ratings: int


class CatalogResponse(BaseModel):
    items: list[CatalogItem]
    total: int | None = None


class RecommendationResponse(BaseModel):
    source: str
    version: str
    items: list[CatalogItem]


def create_app(settings: Settings | None = None, catalog: CatalogStore | None = None) -> FastAPI:
    settings = settings or get_settings()

    @asynccontextmanager
    async def lifespan(application: FastAPI):
        if getattr(application.state, "engine", None) is None:
            from sqlalchemy import create_engine

            application.state.engine = create_engine(settings.database_url, pool_pre_ping=True)
        if getattr(application.state, "recommender", None) is None:
            engine = application.state.engine
            version = settings.active_version or load_active_version(engine)
            bundle = load_artifact_bundle(settings.artifacts_dir, version)
            application.state.recommender = RecommenderService(bundle=bundle)
        yield

    app = FastAPI(title="RecoIA v3", version="0.1.0", lifespan=lifespan)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=False,
        allow_methods=["GET", "POST"],
        allow_headers=["*"],
    )
    app.state.catalog = catalog or CatalogStore(settings.processed_data_dir)
    app.include_router(auth.router)
    app.include_router(events.router)
    app.include_router(favorites.router)
    app.include_router(orders.router)
    app.include_router(profile.router)
    app.include_router(admin.router)

    @app.get("/health")
    @app.get("/api/health")
    @app.get("/api/healthz")
    def health() -> dict[str, str]:
        recommender = getattr(app.state, "recommender", None)
        if recommender is None:
            raise ArtifactError("Application started without a loaded artifact bundle")
        return recommender.health()

    @app.get("/api/catalog", response_model=CatalogResponse)
    def catalog_items(
        limit: int = Query(default=12, ge=1, le=5000),
        offset: int = Query(default=0, ge=0),
        q: str | None = Query(default=None),
        category: str | None = Query(default=None),
        brand: str | None = Query(default=None),
        min_price: float | None = Query(default=None),
        max_price: float | None = Query(default=None),
        sort: str = Query(default="relevance"),
    ) -> CatalogResponse:
        is_search = bool(q or category or brand or min_price is not None or max_price is not None or offset or sort != "relevance")
        if is_search:
            found, total = app.state.catalog.search(
                q=q, category=category, brand=brand, min_price=min_price,
                max_price=max_price, sort=sort, limit=limit, offset=offset,
            )
            return CatalogResponse(items=found, total=total)
        return CatalogResponse(items=app.state.catalog.catalog(limit))

    @app.get("/api/catalog/trending", response_model=CatalogResponse)
    def trending(limit: int = Query(default=12, ge=1, le=100)) -> CatalogResponse:
        engine = app.state.engine
        cutoff = (datetime.now(timezone.utc) - timedelta(days=7)).strftime("%Y-%m-%d %H:%M:%S")
        with engine.connect() as connection:
            rows = connection.execute(
                text(
                    "SELECT i.item_id, i.title, i.brand, i.category, i.price, i.image_url, "
                    "i.has_image, i.avg_rating, i.n_ratings, COUNT(e.id) AS trend_score "
                    "FROM events e JOIN items i ON i.item_id = e.item_id "
                    "WHERE e.event_type IN ('view', 'save') AND e.ts >= :cutoff "
                    "GROUP BY i.item_id ORDER BY trend_score DESC LIMIT :limit"
                ),
                {"cutoff": cutoff, "limit": limit},
            ).all()
        return CatalogResponse(
            items=[
                CatalogItem(
                    item_id=row.item_id, title=row.title, brand=row.brand, category=row.category,
                    price=row.price, image_url=row.image_url, has_image=bool(row.has_image),
                    avg_rating=row.avg_rating, n_ratings=row.n_ratings,
                )
                for row in rows
            ]
        )

    @app.get("/api/recently-viewed", response_model=CatalogResponse)
    def recently_viewed(
        limit: int = Query(default=12, ge=1, le=100),
        user: AuthenticatedUser = Depends(get_current_user),
    ) -> CatalogResponse:
        engine = app.state.engine
        with engine.connect() as connection:
            rows = connection.execute(
                text(
                    "SELECT i.item_id, i.title, i.brand, i.category, i.price, i.image_url, "
                    "i.has_image, i.avg_rating, i.n_ratings "
                    "FROM items i JOIN ("
                    "  SELECT item_id, MAX(id) AS last_id FROM events "
                    "  WHERE user_id = :user_id AND event_type = 'view' GROUP BY item_id"
                    ") v ON v.item_id = i.item_id "
                    "ORDER BY v.last_id DESC LIMIT :limit"
                ),
                {"user_id": user.id, "limit": limit},
            ).all()
        return CatalogResponse(
            items=[
                CatalogItem(
                    item_id=row.item_id, title=row.title, brand=row.brand, category=row.category,
                    price=row.price, image_url=row.image_url, has_image=bool(row.has_image),
                    avg_rating=row.avg_rating, n_ratings=row.n_ratings,
                )
                for row in rows
            ]
        )

    @app.get("/api/catalog/{item_id}", response_model=CatalogItem)
    def catalog_item(item_id: str) -> CatalogItem:
        item = app.state.catalog.get_item(item_id)
        if item is None:
            raise HTTPException(status_code=404, detail="Item not found")
        return CatalogItem(**item)

    @app.get("/api/recommendations", response_model=RecommendationResponse)
    def recommendations(
        limit: int = Query(default=12, ge=1, le=100),
        exclude_item: list[str] = Query(default=[]),
        exclude_category: list[str] = Query(default=[]),
        user: AuthenticatedUser = Depends(get_current_user),
    ) -> RecommendationResponse:
        recommender = getattr(app.state, "recommender", None)
        if recommender is None:
            raise ArtifactError("Application started without a loaded artifact bundle")

        engine = app.state.engine
        with engine.connect() as connection:
            rows = connection.execute(
                text(
                    "SELECT item_id FROM ("
                    "  SELECT item_id, MAX(id) AS last_id FROM events"
                    "  WHERE user_id = :user_id AND event_type IN ('view', 'save')"
                    "  GROUP BY item_id"
                    ") ORDER BY last_id DESC LIMIT 50"
                ),
                {"user_id": user.id},
            ).all()
        seed_items = [row.item_id for row in rows]

        items, source = app.state.catalog.personalized_recommendations(
            seed_items=seed_items, limit=limit,
            excluded_item_ids=set(exclude_item), exclude_categories=set(exclude_category),
        )
        return RecommendationResponse(source=source, version=recommender.bundle.version, items=items)

    return app


app = create_app()
