"""Create all RecoIA tables in the configured database (SQLite-friendly) and
register an active model version so the backend can boot.

Run once from the repo root:

    python setup_db.py

Reads the same settings the app uses (RECOIA_DATABASE_URL etc.), creates the
schema if missing, and inserts/activates a model_registry row for the version
named by RECOIA_ACTIVE_VERSION (default "demo") if its artifacts/manifest exist.
Safe to re-run.
"""
from __future__ import annotations

import os
from pathlib import Path

from sqlalchemy import (
    Boolean, Column, DateTime, Float, Integer, MetaData, String, Table, Text,
    create_engine, func, insert, select, update,
)

from recsys.config import get_settings

settings = get_settings()
DB_URL = settings.database_url
ACTIVE_VERSION = os.environ.get("RECOIA_ACTIVE_VERSION", "demo")

metadata = MetaData()

items = Table(
    "items", metadata,
    Column("item_id", String, primary_key=True),
    Column("title", Text),
    Column("brand", Text),
    Column("category", Text),
    Column("price", Float),
    Column("image_url", Text),
    Column("has_image", Boolean, default=False),
    Column("avg_rating", Float),
    Column("n_ratings", Integer, default=0),
)

users = Table(
    "users", metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("email", String, unique=True, nullable=False),
    Column("password_hash", Text, nullable=False),
    Column("is_admin", Boolean, default=False),
    Column("is_verified", Boolean, default=False),
    Column("created_at", DateTime, server_default=func.now()),
)

email_verifications = Table(
    "email_verifications", metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("user_id", Integer, nullable=False),
    Column("code", String, nullable=False),
    Column("expires_at", DateTime, nullable=False),
    Column("used", Boolean, default=False),
    Column("created_at", DateTime, server_default=func.now()),
)

password_resets = Table(
    "password_resets", metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("user_id", Integer, nullable=False),
    Column("token", String, nullable=False, unique=True),
    Column("expires_at", DateTime, nullable=False),
    Column("used", Boolean, default=False),
    Column("created_at", DateTime, server_default=func.now()),
)

orders = Table(
    "orders", metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("user_id", Integer, nullable=False),
    Column("item_id", String, nullable=False),
    Column("quantity", Integer, nullable=False, default=1),
    Column("price", Float),
    Column("status", String, nullable=False, default="completed"),
    Column("created_at", DateTime, server_default=func.now()),
)

events = Table(
    "events", metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("user_id", Integer),
    Column("item_id", String),
    Column("event_type", String, nullable=False),
    Column("value", Float),
    Column("query", Text),
    Column("session_id", String),
    Column("ts", DateTime, server_default=func.now()),
)

user_profiles = Table(
    "user_profiles", metadata,
    Column("user_id", Integer, primary_key=True),
    Column("profile_vec", Text),
    Column("category_prefs", Text),
    Column("seen_items", Text),
    Column("updated_at", DateTime),
)

recommendations_served = Table(
    "recommendations_served", metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("user_id", Integer),
    Column("item_id", String),
    Column("rank", Integer),
    Column("surface", String),
    Column("model_ver", String),
    Column("clicked", Boolean, default=False),
    Column("ts", DateTime, server_default=func.now()),
)

model_registry = Table(
    "model_registry", metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("version", String, nullable=False),
    Column("path", Text),
    Column("trained_at", DateTime, server_default=func.now()),
    Column("metrics", Text),
    Column("is_active", Boolean, default=False),
)

metrics_daily = Table(
    "metrics_daily", metadata,
    Column("day", String),
    Column("metric", String),
    Column("value", Float),
)


def _migrate_existing_tables(engine) -> None:
    """Add columns to tables that already existed before this schema change.

    metadata.create_all() only creates missing tables; it never alters ones
    that are already present, so a DB created before `is_verified` was added
    needs this explicit ALTER TABLE to catch up. Safe to re-run.
    """
    with engine.begin() as conn:
        existing_columns = {row[1] for row in conn.exec_driver_sql("PRAGMA table_info(users)")}
        if "is_verified" not in existing_columns:
            conn.exec_driver_sql("ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT 0")
            print("migrated: added users.is_verified")


def main() -> None:
    print(f"database: {DB_URL}")
    engine = create_engine(DB_URL, pool_pre_ping=True)
    metadata.create_all(engine)
    _migrate_existing_tables(engine)
    print("tables created:", ", ".join(sorted(metadata.tables)))

    # register + activate the demo version if not already active
    art_dir = Path(settings.artifacts_dir) if hasattr(settings, "artifacts_dir") \
        else Path(os.environ.get("RECOIA_ARTIFACTS_DIR", "artifacts"))
    version_path = art_dir / ACTIVE_VERSION
    with engine.begin() as conn:
        exists = conn.execute(
            select(model_registry.c.id).where(model_registry.c.version == ACTIVE_VERSION)
        ).first()
        if exists is None:
            conn.execute(insert(model_registry).values(
                version=ACTIVE_VERSION, path=str(version_path), is_active=True))
            print(f"registered active version '{ACTIVE_VERSION}' -> {version_path}")
        else:
            conn.execute(update(model_registry)
                         .where(model_registry.c.version == ACTIVE_VERSION)
                         .values(is_active=True))
            conn.execute(update(model_registry)
                         .where(model_registry.c.version != ACTIVE_VERSION)
                         .values(is_active=False))
            print(f"version '{ACTIVE_VERSION}' already present; set active")

    if not (version_path / "manifest.json").is_file():
        print(f"\nNOTE: {version_path/'manifest.json'} not found.")
        print("  The DB is ready, but the backend's artifact check may still")
        print("  fail until a manifest exists for this version. If startup")
        print("  complains about artifacts, tell me and I'll handle that next.")
    print("\ndone.")


if __name__ == "__main__":
    main()
