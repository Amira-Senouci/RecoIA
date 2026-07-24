from __future__ import annotations

from pathlib import Path

import pandas as pd
import setup_db
from fastapi.testclient import TestClient
from sqlalchemy import create_engine

from backend.app.main import create_app
from backend.app.security import hash_password
from recsys.config import Settings
from recsys.serving.artifacts import ArtifactBundle
from recsys.serving.catalog import CatalogStore
from recsys.serving.recommender import RecommenderService
from tests.conftest import get_latest_verification_code


def _write_processed_data(root: Path) -> None:
    pd.DataFrame(
        [
            ("item-1", "Top item", "Brand A", "Beauty", 12.5, "https://example.com/1.jpg", True, 4.8, 2),
            ("item-2", "Second item", "Brand B", "Home", 20.0, "https://example.com/2.jpg", True, 4.2, 5),
        ],
        columns=[
            "item_id", "title", "brand", "category", "price", "image_url",
            "has_image", "avg_rating", "n_ratings",
        ],
    ).to_parquet(root / "items.parquet", index=False)
    pd.DataFrame(
        [("u1", "item-1"), ("u1", "item-2")], columns=["user_id", "item_id"]
    ).to_parquet(root / "interactions.parquet", index=False)


def _build_app(tmp_path: Path):
    _write_processed_data(tmp_path)
    engine = create_engine(f"sqlite:///{tmp_path}/test.db")
    setup_db.metadata.create_all(engine)
    with engine.begin() as conn:
        conn.execute(
            setup_db.items.insert(),
            [
                {
                    "item_id": "item-1", "title": "Top item", "brand": "Brand A",
                    "category": "Beauty", "price": 12.5, "image_url": "https://example.com/1.jpg",
                    "has_image": True, "avg_rating": 4.8, "n_ratings": 2,
                },
                {
                    "item_id": "item-2", "title": "Second item", "brand": "Brand B",
                    "category": "Home", "price": 20.0, "image_url": "https://example.com/2.jpg",
                    "has_image": True, "avg_rating": 4.2, "n_ratings": 5,
                },
            ],
        )

    settings = Settings(processed_data_dir=tmp_path)
    bundle = ArtifactBundle(version="test-v1", root=tmp_path, manifest_path=tmp_path / "manifest.json", entries=[])
    app = create_app(settings=settings, catalog=CatalogStore(tmp_path))
    app.state.engine = engine
    app.state.recommender = RecommenderService(bundle=bundle)
    return app


def _register(client: TestClient, app, email: str = "fan@user.dev") -> str:
    response = client.post("/api/auth/register", json={"email": email, "password": "password123"})
    assert response.status_code == 201
    code = get_latest_verification_code(app.state.engine, email)
    verify = client.post("/api/auth/verify-email", json={"email": email, "code": code})
    assert verify.status_code == 200
    login = client.post("/api/auth/login", json={"email": email, "password": "password123"})
    assert login.status_code == 200
    return login.json()["token"]


def test_favorites_start_empty(tmp_path: Path) -> None:
    app = _build_app(tmp_path)
    with TestClient(app) as client:
        token = _register(client, app)
        response = client.get("/api/favorites", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        assert response.json()["items"] == []


def test_add_and_list_favorite(tmp_path: Path) -> None:
    app = _build_app(tmp_path)
    with TestClient(app) as client:
        token = _register(client, app)
        headers = {"Authorization": f"Bearer {token}"}

        add = client.post("/api/favorites/item-1", headers=headers)
        assert add.status_code == 201
        assert add.json() == {"favorited": True}

        listed = client.get("/api/favorites", headers=headers)
        assert listed.status_code == 200
        items = listed.json()["items"]
        assert len(items) == 1
        assert items[0]["item_id"] == "item-1"


def test_add_unknown_item_returns_404(tmp_path: Path) -> None:
    app = _build_app(tmp_path)
    with TestClient(app) as client:
        token = _register(client, app)
        response = client.post("/api/favorites/does-not-exist", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 404


def test_remove_favorite_drops_it_from_list(tmp_path: Path) -> None:
    app = _build_app(tmp_path)
    with TestClient(app) as client:
        token = _register(client, app)
        headers = {"Authorization": f"Bearer {token}"}

        client.post("/api/favorites/item-1", headers=headers)
        client.post("/api/favorites/item-2", headers=headers)

        remove = client.delete("/api/favorites/item-1", headers=headers)
        assert remove.status_code == 200
        assert remove.json() == {"favorited": False}

        listed = client.get("/api/favorites", headers=headers)
        items = listed.json()["items"]
        assert [item["item_id"] for item in items] == ["item-2"]


def test_favorites_require_auth(tmp_path: Path) -> None:
    app = _build_app(tmp_path)
    with TestClient(app) as client:
        response = client.get("/api/favorites")
        assert response.status_code == 401
