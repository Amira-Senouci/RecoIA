"""SQLite-friendly demo loader for RecoIA.

Fills the `items` table from data_processed/items.parquet (with rating stats
from interactions.parquet) and creates demo users with a few events each, so
the frontend has real products and the recommender has profiles to work with.

Postgres-free: plain SQLAlchemy Core upserts that work on SQLite. Run once
from the repo root AFTER setup_db.py:

    python load_demo_data.py
"""
from __future__ import annotations

import os
from pathlib import Path

import pandas as pd
from sqlalchemy import MetaData, Table, create_engine, insert, select, update, func

from backend.app.security import hash_password
from recsys.config import get_settings

settings = get_settings()
engine = create_engine(settings.database_url, pool_pre_ping=True)
processed = Path(settings.processed_data_dir)
PLACEHOLDER = "https://placehold.co/640x640?text=No+Image"


def _pw_hash(pw: str) -> str:
    return hash_password(pw)


def load_items(conn, meta) -> int:
    items = pd.read_parquet(processed / "items.parquet")
    inter = pd.read_parquet(processed / "interactions.parquet")
    stats = (inter.groupby("item_id")
             .agg(avg_rating=("rating", "mean"), n_ratings=("rating", "size"))
             .reset_index())
    df = items.merge(stats, on="item_id", how="left")

    tbl = Table("items", meta, autoload_with=engine)
    existing = {r[0] for r in conn.execute(select(tbl.c.item_id))}
    rows = []
    for _, r in df.iterrows():
        iid = str(r["item_id"])
        if iid in existing:
            continue
        rows.append({
            "item_id": iid,
            "title": (r.get("title") if pd.notna(r.get("title")) else iid),
            "brand": (r.get("brand") if "brand" in df and pd.notna(r.get("brand")) else None),
            "category": (r.get("category") if pd.notna(r.get("category")) else None),
            "price": float(r["price"]) if "price" in df and pd.notna(r.get("price")) else None,
            "image_url": (r.get("image_url") if "image_url" in df and pd.notna(r.get("image_url")) else PLACEHOLDER),
            "has_image": bool(r.get("has_image")) if "has_image" in df and pd.notna(r.get("has_image")) else False,
            "avg_rating": float(r["avg_rating"]) if pd.notna(r.get("avg_rating")) else None,
            "n_ratings": int(r["n_ratings"]) if pd.notna(r.get("n_ratings")) else 0,
        })
    for i in range(0, len(rows), 1000):
        conn.execute(insert(tbl), rows[i:i + 1000])
    return len(rows)


def load_demo_users(conn, meta) -> int:
    users = Table("users", meta, autoload_with=engine)
    events = Table("events", meta, autoload_with=engine)
    items = Table("items", meta, autoload_with=engine)

    have = {r[0] for r in conn.execute(select(users.c.email))}
    demo = [
        ("demo@recoia.dev", "demo1234", False),
        ("admin@recoia.dev", "admin1234", True),
    ]
    created = 0
    for email, pw, is_admin in demo:
        if email in have:
            # rehash in case this row predates the switch to bcrypt
            conn.execute(update(users).where(users.c.email == email).values(
                password_hash=_pw_hash(pw), is_verified=True))
            continue
        res = conn.execute(insert(users).values(
            email=email, password_hash=_pw_hash(pw), is_admin=is_admin, is_verified=True))
        created += 1
        # give the plain demo user a few view events over real items
        if not is_admin:
            uid = res.inserted_primary_key[0]
            some = [r[0] for r in conn.execute(
                select(items.c.item_id).order_by(func.random()).limit(6))]
            for iid in some:
                conn.execute(insert(events).values(
                    user_id=uid, item_id=iid, event_type="view", value=1.0))
    return created


def main() -> None:
    meta = MetaData()
    with engine.begin() as conn:
        n_items = load_items(conn, meta)
        n_users = load_demo_users(conn, meta)
    with engine.connect() as conn:
        from sqlalchemy import text
        ti = conn.execute(text("SELECT count(*) FROM items")).scalar()
        tu = conn.execute(text("SELECT count(*) FROM users")).scalar()
    print(f"inserted {n_items} new items, {n_users} new users")
    print(f"totals -> items: {ti}, users: {tu}")
    print("demo login:  demo@recoia.dev / demo1234")
    print("admin login: admin@recoia.dev / admin1234")


if __name__ == "__main__":
    main()
