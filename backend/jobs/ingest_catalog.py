from __future__ import annotations

import argparse
import json
from pathlib import Path

import pandas as pd
from sqlalchemy import MetaData, Table, create_engine
from sqlalchemy.dialects.postgresql import insert

from recsys.config import get_settings

PLACEHOLDER_IMAGE_URL = "https://placehold.co/640x640?text=No+Image"


def _resolve_data_file(directory: Path, stems: list[str]) -> Path:
    candidates: list[Path] = []
    for stem in stems:
        candidates.append(directory / f"{stem}.jsonl.gz")
        candidates.append(directory / f"{stem}.jsonl")
    for candidate in candidates:
        if candidate.exists():
            return candidate
    raise FileNotFoundError("Missing data file: " + " or ".join(str(candidate) for candidate in candidates))


def _load_meta_map(raw_root: Path, categories: list[str]) -> dict[str, dict[str, object]]:
    mapping: dict[str, dict[str, object]] = {}
    for category in categories:
        path = _resolve_data_file(raw_root / category, [f"raw_meta_{category}", f"meta_{category}"])
        frame = pd.read_json(path, lines=True)
        for _, row in frame.iterrows():
            item_id = row.get("parent_asin")
            if not isinstance(item_id, str) or not item_id:
                continue
            details = row.get("details") if isinstance(row.get("details"), dict) else {}
            brand = details.get("Brand") if isinstance(details, dict) else None
            images = row.get("images") if isinstance(row.get("images"), list) else []
            image_url = PLACEHOLDER_IMAGE_URL
            has_image = False
            for image in images:
                if not isinstance(image, dict):
                    continue
                for key in ("large", "large_image_url", "hi_res", "medium_image_url", "small_image_url", "thumb"):
                    value = image.get(key)
                    if isinstance(value, str) and value:
                        image_url = value
                        has_image = True
                        break
                if has_image:
                    break
            mapping[item_id] = {
                "title": row.get("title"),
                "brand": brand or row.get("store"),
                "category": row.get("main_category") or category,
                "price": row.get("price"),
                "image_url": image_url,
                "has_image": has_image,
            }
    return mapping


def ingest_catalog(processed_root: Path, raw_root: Path, database_url: str, batch_size: int = 1000) -> int:
    items = pd.read_parquet(processed_root / "items.parquet")
    interactions = pd.read_parquet(processed_root / "interactions.parquet")
    meta_map = _load_meta_map(raw_root, sorted({str(category) for category in items["category"].dropna().unique()}))
    rating_stats = interactions.groupby("item_id").agg(avg_rating=("rating", "mean"), n_ratings=("rating", "size")).reset_index()
    merged = items.merge(rating_stats, on="item_id", how="left", suffixes=("", "_recalc"))

    records = []
    for _, row in merged.iterrows():
        meta = meta_map.get(str(row["item_id"]), {})
        has_image = bool(meta.get("has_image", row.get("has_image", False)))
        image_url = meta.get("image_url", row.get("image_url", PLACEHOLDER_IMAGE_URL))
        records.append(
            {
                "item_id": row["item_id"],
                "title": meta.get("title", row.get("title")),
                "brand": meta.get("brand", row.get("brand")),
                "category": meta.get("category", row.get("category")),
                "price": meta.get("price", row.get("price")),
                "image_url": image_url,
                "has_image": has_image,
                "avg_rating": row.get("avg_rating"),
                "n_ratings": int(row.get("n_ratings") or 0),
            }
        )

    engine = create_engine(database_url, pool_pre_ping=True)
    items_table = Table("items", MetaData(), autoload_with=engine)
    upserted = 0
    with engine.begin() as connection:
        for start in range(0, len(records), batch_size):
            batch = records[start : start + batch_size]
            if not batch:
                continue
            insert_stmt = insert(items_table).values(batch)
            update_columns = {
                "title": insert_stmt.excluded.title,
                "brand": insert_stmt.excluded.brand,
                "category": insert_stmt.excluded.category,
                "price": insert_stmt.excluded.price,
                "image_url": insert_stmt.excluded.image_url,
                "has_image": insert_stmt.excluded.has_image,
                "avg_rating": insert_stmt.excluded.avg_rating,
                "n_ratings": insert_stmt.excluded.n_ratings,
            }
            upsert = insert_stmt.on_conflict_do_update(index_elements=["item_id"], set_=update_columns)
            connection.execute(upsert)
            upserted += len(batch)
    return upserted


def main() -> None:
    parser = argparse.ArgumentParser(description="Upsert processed catalog items into PostgreSQL.")
    args = parser.parse_args()
    settings = get_settings()
    settings.ensure_directories()
    upserted = ingest_catalog(settings.processed_data_dir, settings.raw_data_dir, settings.database_url)
    print(json.dumps({"upserted": upserted}, indent=2))


if __name__ == "__main__":
    main()
