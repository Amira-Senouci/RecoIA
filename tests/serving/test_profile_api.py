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
        [("item-1", "Top item", "Brand A", "Beauty", 12.5, "https://example.com/1.jpg", True, 4.8, 2)],
        columns=[
            "item_id", "title", "brand", "category", "price", "image_url",
            "has_image", "avg_rating", "n_ratings",
        ],
    ).to_parquet(root / "items.parquet", index=False)
    pd.DataFrame(
        [("u1", "item-1")], columns=["user_id", "item_id"]
    ).to_parquet(root / "interactions.parquet", index=False)


def _build_app(tmp_path: Path):
    _write_processed_data(tmp_path)
    engine = create_engine(f"sqlite:///{tmp_path}/test.db")
    setup_db.metadata.create_all(engine)

    settings = Settings(processed_data_dir=tmp_path)
    bundle = ArtifactBundle(version="test-v1", root=tmp_path, manifest_path=tmp_path / "manifest.json", entries=[])
    app = create_app(settings=settings, catalog=CatalogStore(tmp_path))
    app.state.engine = engine
    app.state.recommender = RecommenderService(bundle=bundle)
    return app


def _register(client: TestClient, app, email: str = "prefs@user.dev") -> str:
    client.post("/api/auth/register", json={"email": email, "password": "password123"})
    code = get_latest_verification_code(app.state.engine, email)
    client.post("/api/auth/verify-email", json={"email": email, "code": code})
    login = client.post("/api/auth/login", json={"email": email, "password": "password123"})
    return login.json()["token"]


def test_preferences_start_empty(tmp_path: Path) -> None:
    app = _build_app(tmp_path)
    with TestClient(app) as client:
        token = _register(client, app)
        response = client.get("/api/profile/preferences", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        assert response.json() == {"category_prefs": []}


def test_update_and_read_back_preferences(tmp_path: Path) -> None:
    app = _build_app(tmp_path)
    with TestClient(app) as client:
        token = _register(client, app)
        headers = {"Authorization": f"Bearer {token}"}

        update = client.put(
            "/api/profile/preferences", json={"category_prefs": ["Beauty", "Electronics"]}, headers=headers
        )
        assert update.status_code == 200
        assert update.json()["category_prefs"] == ["Beauty", "Electronics"]

        read_back = client.get("/api/profile/preferences", headers=headers)
        assert read_back.json()["category_prefs"] == ["Beauty", "Electronics"]

        # a second update overwrites rather than duplicating the row
        second = client.put("/api/profile/preferences", json={"category_prefs": ["Home"]}, headers=headers)
        assert second.json()["category_prefs"] == ["Home"]


def test_preferences_require_auth(tmp_path: Path) -> None:
    app = _build_app(tmp_path)
    with TestClient(app) as client:
        response = client.get("/api/profile/preferences")
        assert response.status_code == 401
