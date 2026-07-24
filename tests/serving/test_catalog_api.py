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
            ("item-1", "Top item", "Brand A", "Beauty", 12.5, "https://example.com/1.jpg", True, 4.8, 2),
            ("item-2", "No image", "Brand B", "Beauty", 9.0, "", False, 4.9, 3),
        ],
        columns=[
            "item_id", "title", "brand", "category", "price", "image_url",
            "has_image", "avg_rating", "n_ratings",
        ],
    ).to_parquet(root / "items.parquet", index=False)
    pd.DataFrame(
        [("u1", "item-1"), ("u2", "item-1"), ("u3", "item-2")],
        columns=["user_id", "item_id"],
    ).to_parquet(root / "interactions.parquet", index=False)


def _build_app(tmp_path: Path, write_data=_write_processed_data):
    write_data(tmp_path)
    engine = create_engine(f"sqlite:///{tmp_path}/test.db")
    setup_db.metadata.create_all(engine)

    settings = Settings(processed_data_dir=tmp_path)
    bundle = ArtifactBundle(version="test-v1", root=tmp_path, manifest_path=tmp_path / "manifest.json", entries=[])
    app = create_app(settings=settings, catalog=CatalogStore(tmp_path))
    app.state.engine = engine
    app.state.recommender = RecommenderService(bundle=bundle)
    return app


def _register(client: TestClient, app, email: str) -> str:
    client.post("/api/auth/register", json={"email": email, "password": "password123"})
    code = get_latest_verification_code(app.state.engine, email)
    client.post("/api/auth/verify-email", json={"email": email, "code": code})
    login = client.post("/api/auth/login", json={"email": email, "password": "password123"})
    return login.json()["token"]


def test_catalog_and_recommendations_are_available_from_api(tmp_path: Path) -> None:
    app = _build_app(tmp_path)

    with TestClient(app) as client:
        token = _register(client, app, "cold-start@user.dev")
        headers = {"Authorization": f"Bearer {token}"}

        catalog = client.get("/api/catalog?limit=2")
        recommendations = client.get("/api/recommendations?limit=2", headers=headers)
        health = client.get("/api/health")

    assert catalog.status_code == 200
    assert catalog.json()["items"][0]["item_id"] == "item-2"
    assert recommendations.status_code == 200
    # a freshly registered user has no event history yet -- true cold start,
    # correctly falls back to global popularity rather than pretending to personalize
    assert recommendations.json()["source"] == "popularity"
    assert [item["item_id"] for item in recommendations.json()["items"]] == ["item-1"]
    assert health.json() == {"status": "ok", "version": "test-v1"}


def test_recommendations_require_auth(tmp_path: Path) -> None:
    app = _build_app(tmp_path)
    with TestClient(app) as client:
        response = client.get("/api/recommendations")
        assert response.status_code == 401


def _write_two_cluster_data(root: Path) -> None:
    items = [
        ("beauty-1", "Beauty Serum", "GlowCo", "Beauty", 20.0, "https://example.com/b1.jpg", True, 4.5, 10),
        ("beauty-2", "Beauty Cream", "GlowCo", "Beauty", 22.0, "https://example.com/b2.jpg", True, 4.6, 12),
        ("beauty-3", "Beauty Mask", "GlowCo", "Beauty", 18.0, "https://example.com/b3.jpg", True, 4.4, 8),
        ("tools-1", "Cordless Drill", "BuildIt", "Tools", 60.0, "https://example.com/t1.jpg", True, 4.3, 9),
        ("tools-2", "Socket Set", "BuildIt", "Tools", 40.0, "https://example.com/t2.jpg", True, 4.2, 7),
        ("tools-3", "Tool Belt", "BuildIt", "Tools", 25.0, "https://example.com/t3.jpg", True, 4.1, 6),
    ]
    pd.DataFrame(
        items,
        columns=[
            "item_id", "title", "brand", "category", "price", "image_url",
            "has_image", "avg_rating", "n_ratings",
        ],
    ).to_parquet(root / "items.parquet", index=False)

    # Five synthetic shoppers who each bought all three beauty items together,
    # and five different shoppers who each bought all three tools together --
    # real co-purchase signal the item-item model learns from.
    rows = []
    for i in range(5):
        for item_id in ("beauty-1", "beauty-2", "beauty-3"):
            rows.append((f"beauty-shopper-{i}", item_id))
    for i in range(5):
        for item_id in ("tools-1", "tools-2", "tools-3"):
            rows.append((f"tools-shopper-{i}", item_id))
    pd.DataFrame(rows, columns=["user_id", "item_id"]).to_parquet(root / "interactions.parquet", index=False)


def test_recommendations_are_personalized_and_differ_by_user_history(tmp_path: Path) -> None:
    app = _build_app(tmp_path, write_data=_write_two_cluster_data)

    with TestClient(app) as client:
        beauty_token = _register(client, app, "beauty-fan@user.dev")
        tools_token = _register(client, app, "tools-fan@user.dev")

        # Give each real user genuine history in one cluster only -- neither is cold start.
        client.post(
            "/api/events", json={"item_id": "beauty-1", "event_type": "view"},
            headers={"Authorization": f"Bearer {beauty_token}"},
        )
        client.post(
            "/api/events", json={"item_id": "tools-1", "event_type": "view"},
            headers={"Authorization": f"Bearer {tools_token}"},
        )

        # Exactly 2 true neighbors exist per cluster (3 items minus the seed itself);
        # request only that many so popularity backfill doesn't mix in the other cluster.
        beauty_recos = client.get(
            "/api/recommendations?limit=2", headers={"Authorization": f"Bearer {beauty_token}"}
        )
        tools_recos = client.get(
            "/api/recommendations?limit=2", headers={"Authorization": f"Bearer {tools_token}"}
        )

    assert beauty_recos.status_code == 200
    assert tools_recos.status_code == 200
    assert beauty_recos.json()["source"] == "item_item_personalized"
    assert tools_recos.json()["source"] == "item_item_personalized"

    beauty_ids = {item["item_id"] for item in beauty_recos.json()["items"]}
    tools_ids = {item["item_id"] for item in tools_recos.json()["items"]}

    # The beauty shopper should see the other beauty items, not tools, and vice versa.
    assert {"beauty-2", "beauty-3"}.issubset(beauty_ids)
    assert not beauty_ids & {"tools-1", "tools-2", "tools-3"}
    assert {"tools-2", "tools-3"}.issubset(tools_ids)
    assert not tools_ids & {"beauty-1", "beauty-2", "beauty-3"}
    assert beauty_ids != tools_ids


def _write_cluster_data_with_cross_category_link(root: Path) -> None:
    items = [
        ("beauty-1", "Beauty Serum", "GlowCo", "Beauty", 20.0, "https://example.com/b1.jpg", True, 4.5, 10),
        ("beauty-2", "Beauty Cream", "GlowCo", "Beauty", 22.0, "https://example.com/b2.jpg", True, 4.6, 12),
        ("makeup-1", "Matte Lipstick", "GlowCo", "Makeup", 15.0, "https://example.com/m1.jpg", True, 4.7, 9),
        ("tools-1", "Cordless Drill", "BuildIt", "Tools", 60.0, "https://example.com/t1.jpg", True, 4.3, 9),
        ("tools-2", "Socket Set", "BuildIt", "Tools", 40.0, "https://example.com/t2.jpg", True, 4.2, 7),
    ]
    pd.DataFrame(
        items,
        columns=[
            "item_id", "title", "brand", "category", "price", "image_url",
            "has_image", "avg_rating", "n_ratings",
        ],
    ).to_parquet(root / "items.parquet", index=False)

    rows = []
    # Beauty shoppers also buy makeup-1 -- a real cross-category co-purchase signal.
    for i in range(5):
        for item_id in ("beauty-1", "beauty-2", "makeup-1"):
            rows.append((f"beauty-shopper-{i}", item_id))
    for i in range(5):
        for item_id in ("tools-1", "tools-2"):
            rows.append((f"tools-shopper-{i}", item_id))
    pd.DataFrame(rows, columns=["user_id", "item_id"]).to_parquet(root / "interactions.parquet", index=False)


def test_recommendations_can_exclude_a_category_for_cross_category_discovery(tmp_path: Path) -> None:
    app = _build_app(tmp_path, write_data=_write_cluster_data_with_cross_category_link)

    with TestClient(app) as client:
        token = _register(client, app, "beauty-shopper@user.dev")
        headers = {"Authorization": f"Bearer {token}"}
        client.post("/api/events", json={"item_id": "beauty-1", "event_type": "view"}, headers=headers)

        # Without exclusion: same-category neighbor (beauty-2) ranks first.
        default_recos = client.get("/api/recommendations?limit=1", headers=headers)
        assert default_recos.json()["items"][0]["item_id"] == "beauty-2"

        # With Beauty excluded: still real personalization (the genuine cross-category
        # co-purchase link to makeup-1), not just arbitrary popularity, and never Beauty.
        cross_category = client.get(
            "/api/recommendations?limit=3&exclude_category=Beauty", headers=headers
        )
        assert cross_category.status_code == 200
        body = cross_category.json()
        assert body["source"] == "item_item_personalized"
        item_ids = [item["item_id"] for item in body["items"]]
        categories = {item["category"] for item in body["items"]}
        assert "Beauty" not in categories
        assert item_ids[0] == "makeup-1"
