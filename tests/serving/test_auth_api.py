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
from tests.conftest import get_latest_reset_token, get_latest_verification_code


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


def _register_and_verify(client: TestClient, app, email: str, password: str = "password123") -> None:
    register = client.post("/api/auth/register", json={"email": email, "password": password})
    assert register.status_code == 201
    code = get_latest_verification_code(app.state.engine, email)
    verify = client.post("/api/auth/verify-email", json={"email": email, "code": code})
    assert verify.status_code == 200


def test_register_then_login_returns_token(tmp_path: Path) -> None:
    app = _build_app(tmp_path)
    with TestClient(app) as client:
        register = client.post("/api/auth/register", json={"email": "new@user.dev", "password": "password123"})
        assert register.status_code == 201
        assert register.json() == {"email": "new@user.dev"}

        # login before verifying is rejected
        unverified_login = client.post("/api/auth/login", json={"email": "new@user.dev", "password": "password123"})
        assert unverified_login.status_code == 403
        assert unverified_login.json()["detail"] == "email_not_verified"

        code = get_latest_verification_code(app.state.engine, "new@user.dev")
        verify = client.post("/api/auth/verify-email", json={"email": "new@user.dev", "code": code})
        assert verify.status_code == 200
        assert verify.json()["verified"] is True

        login = client.post("/api/auth/login", json={"email": "new@user.dev", "password": "password123"})
        assert login.status_code == 200
        token = login.json()["token"]

        me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert me.status_code == 200
        assert me.json()["email"] == "new@user.dev"


def test_verify_email_rejects_wrong_code(tmp_path: Path) -> None:
    app = _build_app(tmp_path)
    with TestClient(app) as client:
        client.post("/api/auth/register", json={"email": "wrong@user.dev", "password": "password123"})
        response = client.post("/api/auth/verify-email", json={"email": "wrong@user.dev", "code": "000000"})
        assert response.status_code == 400


def test_resend_verification_issues_new_code(tmp_path: Path) -> None:
    app = _build_app(tmp_path)
    with TestClient(app) as client:
        client.post("/api/auth/register", json={"email": "resend@user.dev", "password": "password123"})

        resend = client.post("/api/auth/resend-verification", json={"email": "resend@user.dev"})
        assert resend.status_code == 200
        new_code = get_latest_verification_code(app.state.engine, "resend@user.dev")

        verify_new = client.post("/api/auth/verify-email", json={"email": "resend@user.dev", "code": new_code})
        assert verify_new.status_code == 200


def test_login_rejects_wrong_password(tmp_path: Path) -> None:
    app = _build_app(tmp_path)
    with TestClient(app) as client:
        response = client.post("/api/auth/login", json={"email": "admin@recoia.dev", "password": "wrong"})
        assert response.status_code == 401


def test_register_rejects_duplicate_email(tmp_path: Path) -> None:
    app = _build_app(tmp_path)
    with TestClient(app) as client:
        response = client.post(
            "/api/auth/register", json={"email": "admin@recoia.dev", "password": "password123"}
        )
        assert response.status_code == 409


def test_forgot_and_reset_password_flow(tmp_path: Path) -> None:
    app = _build_app(tmp_path)
    with TestClient(app) as client:
        _register_and_verify(client, app, "reset@user.dev")

        forgot = client.post("/api/auth/forgot-password", json={"email": "reset@user.dev"})
        assert forgot.status_code == 200
        assert forgot.json() == {"sent": True}
        token = get_latest_reset_token(app.state.engine, "reset@user.dev")

        reset = client.post(
            "/api/auth/reset-password", json={"token": token, "new_password": "newpassword123"}
        )
        assert reset.status_code == 200
        assert reset.json()["reset"] is True

        old_login = client.post("/api/auth/login", json={"email": "reset@user.dev", "password": "password123"})
        assert old_login.status_code == 401

        new_login = client.post("/api/auth/login", json={"email": "reset@user.dev", "password": "newpassword123"})
        assert new_login.status_code == 200

        reused = client.post(
            "/api/auth/reset-password", json={"token": token, "new_password": "anotherpassword123"}
        )
        assert reused.status_code == 400


def test_forgot_password_does_not_leak_account_existence(tmp_path: Path) -> None:
    app = _build_app(tmp_path)
    with TestClient(app) as client:
        response = client.post("/api/auth/forgot-password", json={"email": "nobody@user.dev"})
        assert response.status_code == 200
        assert response.json() == {"sent": True}


def test_change_password_while_authenticated(tmp_path: Path) -> None:
    app = _build_app(tmp_path)
    with TestClient(app) as client:
        _register_and_verify(client, app, "changeme@user.dev")
        login = client.post("/api/auth/login", json={"email": "changeme@user.dev", "password": "password123"})
        token = login.json()["token"]
        headers = {"Authorization": f"Bearer {token}"}

        wrong_current = client.put(
            "/api/auth/change-password",
            json={"current_password": "wrongpassword", "new_password": "newpassword123"},
            headers=headers,
        )
        assert wrong_current.status_code == 401

        changed = client.put(
            "/api/auth/change-password",
            json={"current_password": "password123", "new_password": "newpassword123"},
            headers=headers,
        )
        assert changed.status_code == 200
        assert changed.json() == {"changed": True}

        old_login = client.post("/api/auth/login", json={"email": "changeme@user.dev", "password": "password123"})
        assert old_login.status_code == 401

        new_login = client.post(
            "/api/auth/login", json={"email": "changeme@user.dev", "password": "newpassword123"}
        )
        assert new_login.status_code == 200


def test_change_password_requires_auth(tmp_path: Path) -> None:
    app = _build_app(tmp_path)
    with TestClient(app) as client:
        response = client.put(
            "/api/auth/change-password",
            json={"current_password": "x", "new_password": "newpassword123"},
        )
        assert response.status_code == 401


def test_admin_routes_require_admin_role(tmp_path: Path) -> None:
    app = _build_app(tmp_path)
    with TestClient(app) as client:
        _register_and_verify(client, app, "plain@user.dev")
        login = client.post("/api/auth/login", json={"email": "plain@user.dev", "password": "password123"})
        token = login.json()["token"]

        forbidden = client.get("/api/admin/summary", headers={"Authorization": f"Bearer {token}"})
        assert forbidden.status_code == 403

        unauthenticated = client.get("/api/admin/summary")
        assert unauthenticated.status_code == 401

        admin_login = client.post("/api/auth/login", json={"email": "admin@recoia.dev", "password": "admin1234"})
        admin_token = admin_login.json()["token"]
        summary = client.get("/api/admin/summary", headers={"Authorization": f"Bearer {admin_token}"})
        assert summary.status_code == 200
        assert summary.json()["total_users"] == 2
        assert summary.json()["active_model_version"] is None
