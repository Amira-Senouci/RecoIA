from __future__ import annotations

from pathlib import Path

import pandas as pd
import setup_db
from fastapi.testclient import TestClient
from sqlalchemy import create_engine

from backend.app.main import create_app
from recsys.config import Settings
from recsys.serving.artifacts import ArtifactBundle
from recsys.serving.catalog import CatalogStore
from recsys.serving.recommender import RecommenderService
from tests.conftest import get_latest_verification_code


def _write_processed_data(root: Path) -> None:
    pd.DataFrame(
        [
            ("item-1", "Blue Sneakers", "Nike", "Shoes", 60.0, "https://example.com/1.jpg", True, 4.5, 10),
            ("item-2", "Red Sneakers", "Adidas", "Shoes", 40.0, "https://example.com/2.jpg", True, 4.0, 5),
            ("item-3", "Face Cream", "Nivea", "Beauty", 15.0, "https://example.com/3.jpg", True, 4.8, 20),
        ],
        columns=[
            "item_id", "title", "brand", "category", "price", "image_url",
            "has_image", "avg_rating", "n_ratings",
        ],
    ).to_parquet(root / "items.parquet", index=False)
    pd.DataFrame(
        [("u1", "item-1"), ("u1", "item-2"), ("u1", "item-3")],
        columns=["user_id", "item_id"],
    ).to_parquet(root / "interactions.parquet", index=False)


def _build_app(tmp_path: Path):
    _write_processed_data(tmp_path)
    engine = create_engine(f"sqlite:///{tmp_path}/test.db")
    setup_db.metadata.create_all(engine)
    with engine.begin() as conn:
        conn.execute(
            setup_db.items.insert(),
            [
                {"item_id": "item-1", "title": "Blue Sneakers", "brand": "Nike", "category": "Shoes",
                 "price": 60.0, "image_url": "https://example.com/1.jpg", "has_image": True,
                 "avg_rating": 4.5, "n_ratings": 10},
                {"item_id": "item-2", "title": "Red Sneakers", "brand": "Adidas", "category": "Shoes",
                 "price": 40.0, "image_url": "https://example.com/2.jpg", "has_image": True,
                 "avg_rating": 4.0, "n_ratings": 5},
                {"item_id": "item-3", "title": "Face Cream", "brand": "Nivea", "category": "Beauty",
                 "price": 15.0, "image_url": "https://example.com/3.jpg", "has_image": True,
                 "avg_rating": 4.8, "n_ratings": 20},
            ],
        )

    settings = Settings(processed_data_dir=tmp_path)
    bundle = ArtifactBundle(version="test-v1", root=tmp_path, manifest_path=tmp_path / "manifest.json", entries=[])
    app = create_app(settings=settings, catalog=CatalogStore(tmp_path))
    app.state.engine = engine
    app.state.recommender = RecommenderService(bundle=bundle)
    return app


def _register(client: TestClient, app, email: str = "browser@user.dev") -> str:
    client.post("/api/auth/register", json={"email": email, "password": "password123"})
    code = get_latest_verification_code(app.state.engine, email)
    client.post("/api/auth/verify-email", json={"email": email, "code": code})
    login = client.post("/api/auth/login", json={"email": email, "password": "password123"})
    return login.json()["token"]


def test_catalog_search_by_query(tmp_path: Path) -> None:
    app = _build_app(tmp_path)
    with TestClient(app) as client:
        response = client.get("/api/catalog?q=sneakers")
        assert response.status_code == 200
        body = response.json()
        assert body["total"] == 2
        assert {item["item_id"] for item in body["items"]} == {"item-1", "item-2"}


def test_catalog_search_by_category_and_sort(tmp_path: Path) -> None:
    app = _build_app(tmp_path)
    with TestClient(app) as client:
        response = client.get("/api/catalog?category=Shoes&sort=price_asc")
        assert response.status_code == 200
        items = response.json()["items"]
        assert [item["item_id"] for item in items] == ["item-2", "item-1"]


def test_catalog_search_by_price_range(tmp_path: Path) -> None:
    app = _build_app(tmp_path)
    with TestClient(app) as client:
        response = client.get("/api/catalog?min_price=20&max_price=50")
        assert response.status_code == 200
        items = response.json()["items"]
        assert [item["item_id"] for item in items] == ["item-2"]


def test_trending_returns_items_with_recent_events(tmp_path: Path) -> None:
    app = _build_app(tmp_path)
    with TestClient(app) as client:
        token = _register(client, app)
        headers = {"Authorization": f"Bearer {token}"}
        client.post("/api/events", json={"item_id": "item-3", "event_type": "view"}, headers=headers)
        client.post("/api/events", json={"item_id": "item-3", "event_type": "view"}, headers=headers)
        client.post("/api/events", json={"item_id": "item-1", "event_type": "view"}, headers=headers)

        response = client.get("/api/catalog/trending")
        assert response.status_code == 200
        items = response.json()["items"]
        assert items[0]["item_id"] == "item-3"


def test_recently_viewed_is_per_user_and_ordered(tmp_path: Path) -> None:
    app = _build_app(tmp_path)
    with TestClient(app) as client:
        token = _register(client, app)
        headers = {"Authorization": f"Bearer {token}"}
        client.post("/api/events", json={"item_id": "item-1", "event_type": "view"}, headers=headers)
        client.post("/api/events", json={"item_id": "item-2", "event_type": "view"}, headers=headers)

        response = client.get("/api/recently-viewed", headers=headers)
        assert response.status_code == 200
        items = response.json()["items"]
        assert [item["item_id"] for item in items] == ["item-2", "item-1"]


def test_recently_viewed_requires_auth(tmp_path: Path) -> None:
    app = _build_app(tmp_path)
    with TestClient(app) as client:
        response = client.get("/api/recently-viewed")
        assert response.status_code == 401
