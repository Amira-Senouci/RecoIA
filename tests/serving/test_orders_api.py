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
    with engine.begin() as conn:
        conn.execute(
            setup_db.items.insert().values(
                item_id="item-1", title="Top item", brand="Brand A", category="Beauty",
                price=12.5, image_url="https://example.com/1.jpg", has_image=True,
                avg_rating=4.8, n_ratings=2,
            )
        )

    settings = Settings(processed_data_dir=tmp_path)
    bundle = ArtifactBundle(version="test-v1", root=tmp_path, manifest_path=tmp_path / "manifest.json", entries=[])
    app = create_app(settings=settings, catalog=CatalogStore(tmp_path))
    app.state.engine = engine
    app.state.recommender = RecommenderService(bundle=bundle)
    return app


def _register(client: TestClient, app, email: str = "shopper@user.dev") -> str:
    client.post("/api/auth/register", json={"email": email, "password": "password123"})
    code = get_latest_verification_code(app.state.engine, email)
    client.post("/api/auth/verify-email", json={"email": email, "code": code})
    login = client.post("/api/auth/login", json={"email": email, "password": "password123"})
    return login.json()["token"]


def test_create_and_list_order(tmp_path: Path) -> None:
    app = _build_app(tmp_path)
    with TestClient(app) as client:
        token = _register(client, app)
        headers = {"Authorization": f"Bearer {token}"}

        created = client.post("/api/orders", json={"item_id": "item-1", "quantity": 2}, headers=headers)
        assert created.status_code == 201
        body = created.json()
        assert body["item_id"] == "item-1"
        assert body["quantity"] == 2
        assert body["price"] == 12.5
        assert body["status"] == "completed"

        listed = client.get("/api/orders", headers=headers)
        assert listed.status_code == 200
        orders = listed.json()["orders"]
        assert len(orders) == 1
        assert orders[0]["item_title"] == "Top item"


def test_order_unknown_item_returns_404(tmp_path: Path) -> None:
    app = _build_app(tmp_path)
    with TestClient(app) as client:
        token = _register(client, app)
        response = client.post(
            "/api/orders", json={"item_id": "does-not-exist"}, headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 404


def test_orders_require_auth(tmp_path: Path) -> None:
    app = _build_app(tmp_path)
    with TestClient(app) as client:
        response = client.get("/api/orders")
        assert response.status_code == 401


def test_admin_orders_lists_across_users(tmp_path: Path) -> None:
    app = _build_app(tmp_path)
    with TestClient(app) as client:
        token = _register(client, app)
        client.post("/api/orders", json={"item_id": "item-1"}, headers={"Authorization": f"Bearer {token}"})

        with app.state.engine.begin() as conn:
            conn.execute(
                setup_db.users.insert().values(
                    email="admin@recoia.dev", password_hash="x", is_admin=True, is_verified=True
                )
            )
        from backend.app.security import hash_password
        with app.state.engine.begin() as conn:
            conn.execute(
                setup_db.users.update()
                .where(setup_db.users.c.email == "admin@recoia.dev")
                .values(password_hash=hash_password("admin1234"))
            )
        admin_login = client.post("/api/auth/login", json={"email": "admin@recoia.dev", "password": "admin1234"})
        admin_token = admin_login.json()["token"]

        response = client.get("/api/admin/orders", headers={"Authorization": f"Bearer {admin_token}"})
        assert response.status_code == 200
        assert response.json()["total"] == 1
        assert response.json()["orders"][0]["user_email"] == "shopper@user.dev"
