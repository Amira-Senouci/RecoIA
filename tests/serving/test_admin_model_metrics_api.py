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
            setup_db.users.insert().values(
                email="admin@recoia.dev", password_hash=hash_password("admin1234"),
                is_admin=True, is_verified=True,
            )
        )

    settings = Settings(processed_data_dir=tmp_path)
    bundle = ArtifactBundle(version="test-v1", root=tmp_path, manifest_path=tmp_path / "manifest.json", entries=[])
    app = create_app(settings=settings, catalog=CatalogStore(tmp_path))
    app.state.engine = engine
    app.state.recommender = RecommenderService(bundle=bundle)
    return app


def test_model_metrics_reads_real_evaluation_table(tmp_path: Path) -> None:
    # Uses the real notebooks/results/final_master_table.csv shipped in this repo --
    # this endpoint intentionally has no synthetic/mocked data path.
    app = _build_app(tmp_path)
    with TestClient(app) as client:
        login = client.post("/api/auth/login", json={"email": "admin@recoia.dev", "password": "admin1234"})
        token = login.json()["token"]

        response = client.get("/api/admin/model-metrics", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        body = response.json()
        systems = {row["system"] for row in body["metrics"]}
        assert "hybrid_rrf_weighted" in systems
        assert "popularity" in systems
        assert body["best_system"] == "hybrid_rrf_weighted"
