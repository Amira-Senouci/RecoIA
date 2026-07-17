from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

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


class RecommendationResponse(BaseModel):
    source: str
    version: str
    items: list[CatalogItem]


def create_app(settings: Settings | None = None, catalog: CatalogStore | None = None) -> FastAPI:
    settings = settings or get_settings()

    @asynccontextmanager
    async def lifespan(application: FastAPI):
        if getattr(application.state, "recommender", None) is None:
            from sqlalchemy import create_engine

            engine = create_engine(settings.database_url, pool_pre_ping=True)
            version = settings.active_version or load_active_version(engine)
            bundle = load_artifact_bundle(settings.artifacts_dir, version)
            application.state.recommender = RecommenderService(bundle=bundle)
        yield

    app = FastAPI(title="RecoIA v3", version="0.1.0", lifespan=lifespan)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=False,
        allow_methods=["GET"],
        allow_headers=["*"],
    )
    app.state.catalog = catalog or CatalogStore(settings.processed_data_dir)

    @app.get("/health")
    @app.get("/api/health")
    @app.get("/api/healthz")
    def health() -> dict[str, str]:
        recommender = getattr(app.state, "recommender", None)
        if recommender is None:
            raise ArtifactError("Application started without a loaded artifact bundle")
        return recommender.health()

    @app.get("/api/catalog", response_model=CatalogResponse)
    def catalog_items(limit: int = Query(default=12, ge=1, le=100)) -> CatalogResponse:
        return CatalogResponse(items=app.state.catalog.catalog(limit))

    @app.get("/api/recommendations", response_model=RecommendationResponse)
    def recommendations(
        limit: int = Query(default=12, ge=1, le=100),
        exclude_item: list[str] = Query(default=[]),
    ) -> RecommendationResponse:
        recommender = getattr(app.state, "recommender", None)
        if recommender is None:
            raise ArtifactError("Application started without a loaded artifact bundle")
        return RecommendationResponse(
            source="popularity",
            version=recommender.bundle.version,
            items=app.state.catalog.recommendations(limit, set(exclude_item)),
        )

    return app


app = create_app()
