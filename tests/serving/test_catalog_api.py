from __future__ import annotations

from pathlib import Path

import pandas as pd
from fastapi.testclient import TestClient

from backend.app.main import create_app
from recsys.config import Settings
from recsys.serving.artifacts import ArtifactBundle
from recsys.serving.catalog import CatalogStore
from recsys.serving.recommender import RecommenderService


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


def test_catalog_and_recommendations_are_available_from_api(tmp_path: Path) -> None:
    _write_processed_data(tmp_path)
    settings = Settings(processed_data_dir=tmp_path)
    bundle = ArtifactBundle(version="test-v1", root=tmp_path, manifest_path=tmp_path / "manifest.json", entries=[])
    app = create_app(settings=settings, catalog=CatalogStore(tmp_path))
    app.state.recommender = RecommenderService(bundle=bundle)

    with TestClient(app) as client:
        catalog = client.get("/api/catalog?limit=2")
        recommendations = client.get("/api/recommendations?limit=2")
        health = client.get("/api/health")

    assert catalog.status_code == 200
    assert catalog.json()["items"][0]["item_id"] == "item-2"
    assert recommendations.status_code == 200
    assert recommendations.json()["source"] == "popularity"
    assert [item["item_id"] for item in recommendations.json()["items"]] == ["item-1"]
    assert health.json() == {"status": "ok", "version": "test-v1"}
