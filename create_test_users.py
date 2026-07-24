"""Creates three demo test users, each seeded with real view/save history in a
different category -- so none of them are cold-start users -- and proves their
personalized "Top Picks For You" recommendations actually diverge.

Uses the exact same CatalogStore.personalized_recommendations() the live
/api/recommendations endpoint calls, so this reflects real serving behavior,
not a simulation of it.

Run once from the repo root (after setup_db.py / load_demo_data.py):

    python create_test_users.py
"""
from __future__ import annotations

from sqlalchemy import create_engine, text

from backend.app.security import hash_password
from recsys.config import get_settings
from recsys.serving.catalog import CatalogStore

settings = get_settings()
engine = create_engine(settings.database_url, pool_pre_ping=True)
catalog = CatalogStore(settings.processed_data_dir)

PASSWORD = "test1234"
SEEDS_PER_USER = 8

TEST_USERS = [
    ("test-beauty@recoia.dev", "All Beauty"),
    ("test-health@recoia.dev", "Health & Personal Care"),
    ("test-handmade@recoia.dev", "Handmade"),
]


def pick_seed_items(category: str, limit: int) -> list[str]:
    with engine.connect() as conn:
        rows = conn.execute(
            text(
                "SELECT item_id FROM items WHERE category = :category "
                "ORDER BY n_ratings DESC LIMIT :limit"
            ),
            {"category": category, "limit": limit},
        ).all()
    return [row.item_id for row in rows]


def upsert_user(email: str) -> int:
    with engine.begin() as conn:
        existing = conn.execute(text("SELECT id FROM users WHERE email = :email"), {"email": email}).first()
        if existing is not None:
            conn.execute(
                text("UPDATE users SET password_hash = :ph, is_verified = 1 WHERE id = :id"),
                {"ph": hash_password(PASSWORD), "id": existing.id},
            )
            return int(existing.id)
        result = conn.execute(
            text(
                "INSERT INTO users (email, password_hash, is_admin, is_verified) "
                "VALUES (:email, :ph, 0, 1)"
            ),
            {"email": email, "ph": hash_password(PASSWORD)},
        )
        return int(result.lastrowid)


def seed_events(user_id: int, item_ids: list[str]) -> None:
    with engine.begin() as conn:
        # clear any previous test events so this script is safe to re-run
        conn.execute(text("DELETE FROM events WHERE user_id = :uid"), {"uid": user_id})
        for item_id in item_ids:
            conn.execute(
                text("INSERT INTO events (user_id, item_id, event_type) VALUES (:uid, :iid, 'view')"),
                {"uid": user_id, "iid": item_id},
            )
        for item_id in item_ids[:3]:
            conn.execute(
                text("INSERT INTO events (user_id, item_id, event_type) VALUES (:uid, :iid, 'save')"),
                {"uid": user_id, "iid": item_id},
            )


def main() -> None:
    print(f"database: {settings.database_url}\n")
    results = []
    for email, category in TEST_USERS:
        seed_ids = pick_seed_items(category, SEEDS_PER_USER)
        if not seed_ids:
            print(f"SKIP {email}: no items found in category '{category}'")
            continue
        user_id = upsert_user(email)
        seed_events(user_id, seed_ids)
        items, source = catalog.personalized_recommendations(seed_items=seed_ids, limit=8)
        results.append((email, category, items, source))

        print(f"{email}  (password: {PASSWORD})")
        print(f"  seeded category : {category}")
        print(f"  history         : {len(seed_ids)} view events + {min(3, len(seed_ids))} save events (not cold start)")
        print(f"  reco source     : {source}")
        for item in items[:5]:
            print(f"    - [{item['category']}] {item['title'][:60]}")
        print()

    recommendation_sets = [tuple(i["item_id"] for i in r[2]) for r in results]
    if len(set(recommendation_sets)) == len(recommendation_sets):
        print("CONFIRMED: every test user gets a different set of recommendations.")
    else:
        print("WARNING: at least two test users received identical recommendation sets.")

    non_popularity = [r for r in results if r[3] != "item_item_personalized"]
    if non_popularity:
        print("WARNING: these users fell back to plain popularity (not truly personalized):")
        for email, category, _items, source in non_popularity:
            print(f"  - {email} ({category}) -> {source}")
    else:
        print("CONFIRMED: every test user received real item-item personalized picks, not cold-start popularity.")


if __name__ == "__main__":
    main()
