from __future__ import annotations

import argparse
import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

import pandas as pd

from recsys.config import get_settings


DEFAULT_MAX_INTERACTIONS = 1_000_000
DEFAULT_CORE = 5
FALLBACK_CORE = 3
PLACEHOLDER_IMAGE_URL = "https://placehold.co/640x640?text=No+Image"


def _resolve_data_file(directory: Path, stems: Iterable[str]) -> Path:
    candidates: list[Path] = []
    for stem in stems:
        candidates.append(directory / f"{stem}.jsonl.gz")
        candidates.append(directory / f"{stem}.jsonl")
    for candidate in candidates:
        if candidate.exists():
            return candidate
    raise FileNotFoundError("Missing data file: " + " or ".join(str(candidate) for candidate in candidates))


@dataclass(frozen=True)
class PreprocessResult:
    interactions_path: Path
    items_path: Path
    stats_path: Path
    stats: dict[str, object]


def _read_table(path: Path) -> pd.DataFrame:
    if path.suffix == ".parquet":
        return pd.read_parquet(path)
    return pd.read_json(path, lines=True)


def _normalize_brand(value: object, fallback: object) -> str | None:
    if isinstance(value, str) and value.strip():
        return value.strip()
    if isinstance(fallback, str) and fallback.strip():
        return fallback.strip()
    return None


def _parse_price(value: object) -> float | None:
    if value is None:
        return None
    if isinstance(value, (int, float)) and not pd.isna(value):
        return float(value)
    text = str(value).strip()
    if not text or text.lower() == "none":
        return None
    match = re.search(r"-?\d+(?:\.\d+)?", text.replace(",", ""))
    return float(match.group(0)) if match else None


def _extract_first_image(images: object) -> tuple[str | None, bool]:
    if not isinstance(images, list) or not images:
        return PLACEHOLDER_IMAGE_URL, False
    for image in images:
        if not isinstance(image, dict):
            continue
        for key in ("large", "large_image_url", "hi_res", "medium_image_url", "small_image_url", "thumb"):
            value = image.get(key)
            if isinstance(value, str) and value:
                return value, True
    return PLACEHOLDER_IMAGE_URL, False


def _iterative_k_core(frame: pd.DataFrame, core: int) -> pd.DataFrame:
    filtered = frame.copy()
    while True:
        user_counts = filtered.groupby("user_id").size()
        item_counts = filtered.groupby("item_id").size()
        keep_users = user_counts[user_counts >= core].index
        keep_items = item_counts[item_counts >= core].index
        next_frame = filtered[filtered["user_id"].isin(keep_users) & filtered["item_id"].isin(keep_items)]
        if len(next_frame) == len(filtered):
            return next_frame.reset_index(drop=True)
        filtered = next_frame


def _cap_interactions(frame: pd.DataFrame, max_interactions: int) -> pd.DataFrame:
    if len(frame) <= max_interactions:
        return frame.reset_index(drop=True)
    user_stats = (
        frame.groupby("user_id")
        .agg(interactions=("item_id", "size"), latest_ts=("timestamp", "max"))
        .sort_values(["interactions", "latest_ts"], ascending=[False, False])
    )
    chosen_users: list[str] = []
    total = 0
    for user_id, row in user_stats.iterrows():
        interactions = int(row["interactions"])
        if total >= max_interactions:
            break
        chosen_users.append(user_id)
        total += interactions
    trimmed = frame[frame["user_id"].isin(chosen_users)].sort_values(["timestamp", "user_id", "item_id"])
    if len(trimmed) > max_interactions:
        trimmed = trimmed.iloc[-max_interactions:].copy()
    return trimmed.reset_index(drop=True)


def _load_reviews(raw_root: Path, categories: Iterable[str]) -> pd.DataFrame:
    frames: list[pd.DataFrame] = []
    for category in categories:
        path = _resolve_data_file(raw_root / category, [f"raw_review_{category}", category])
        frame = _read_table(path)
        frame = frame.assign(source_category=category)
        frames.append(frame)
    combined = pd.concat(frames, ignore_index=True)
    combined = combined.rename(columns={"parent_asin": "item_id"})
    combined = combined[["user_id", "item_id", "rating", "timestamp", "source_category"]]
    combined = combined.dropna(subset=["user_id", "item_id", "timestamp"])
    combined["timestamp"] = combined["timestamp"].astype("int64")
    combined["rating"] = pd.to_numeric(combined["rating"], errors="coerce")
    combined = combined.dropna(subset=["rating"])
    combined = combined.drop_duplicates(subset=["user_id", "item_id", "timestamp", "rating"])
    combined = combined.sort_values(["user_id", "timestamp", "item_id"]).reset_index(drop=True)
    return combined


def _load_meta(raw_root: Path, categories: Iterable[str]) -> pd.DataFrame:
    frames: list[pd.DataFrame] = []
    for category in categories:
        path = _resolve_data_file(raw_root / category, [f"raw_meta_{category}", f"meta_{category}"])
        frame = _read_table(path)
        frame = frame.assign(source_category=category)
        frames.append(frame)
    combined = pd.concat(frames, ignore_index=True)
    combined = combined.rename(columns={"parent_asin": "item_id"})
    return combined


def _select_items(meta: pd.DataFrame, interactions: pd.DataFrame) -> pd.DataFrame:
    rating_stats = interactions.groupby("item_id").agg(avg_rating=("rating", "mean"), n_ratings=("rating", "size")).reset_index()
    meta = meta.copy()
    meta["price"] = meta.get("price", pd.Series(index=meta.index, dtype="object")).map(_parse_price)
    if "details" in meta.columns:
        details = meta["details"].apply(lambda value: value if isinstance(value, dict) else {})
    else:
        details = pd.Series([{}] * len(meta), index=meta.index)
    brand = []
    for row_details, store in zip(details, meta.get("store", pd.Series([None] * len(meta)))):
        brand.append(_normalize_brand(row_details.get("Brand"), store))
    meta["brand"] = brand
    image_urls = []
    has_images = []
    for images in meta.get("images", pd.Series([None] * len(meta))):
        image_url, has_image = _extract_first_image(images)
        image_urls.append(image_url)
        has_images.append(has_image)
    meta["image_url"] = image_urls
    meta["has_image"] = has_images
    meta["category"] = meta.get("main_category", meta.get("source_category"))
    meta = meta[meta["item_id"].isin(interactions["item_id"].unique())]
    items = meta[["item_id", "title", "brand", "category", "price", "image_url", "has_image"]].drop_duplicates("item_id")
    items = items.merge(rating_stats, on="item_id", how="left")
    items["avg_rating"] = items["avg_rating"].astype(float)
    items["n_ratings"] = items["n_ratings"].astype("Int64")
    items["has_image"] = items["has_image"].fillna(False)
    items["image_url"] = items["image_url"].fillna(PLACEHOLDER_IMAGE_URL)
    return items.reset_index(drop=True)


def preprocess_dataset(
    raw_root: Path,
    processed_root: Path,
    categories: Iterable[str],
    max_interactions: int = DEFAULT_MAX_INTERACTIONS,
    primary_core: int = DEFAULT_CORE,
    min_interactions_for_core: int = 50_000,
) -> PreprocessResult:
    processed_root.mkdir(parents=True, exist_ok=True)
    interactions = _load_reviews(raw_root, categories)
    interactions = _iterative_k_core(interactions, primary_core)
    used_core = primary_core
    if len(interactions) < min_interactions_for_core and primary_core > FALLBACK_CORE:
        interactions = _load_reviews(raw_root, categories)
        interactions = _iterative_k_core(interactions, FALLBACK_CORE)
        used_core = FALLBACK_CORE
    interactions = _cap_interactions(interactions, max_interactions)
    meta = _load_meta(raw_root, categories)
    items = _select_items(meta, interactions)

    interactions_path = processed_root / "interactions.parquet"
    items_path = processed_root / "items.parquet"
    stats_path = processed_root / "stats.json"

    interactions.to_parquet(interactions_path, index=False)
    items.to_parquet(items_path, index=False)

    density = len(interactions) / max(len(interactions["user_id"].unique()) * len(interactions["item_id"].unique()), 1)
    stats = {
        "categories": list(categories),
        "used_core": used_core,
        "max_interactions": max_interactions,
        "interactions": int(len(interactions)),
        "users": int(interactions["user_id"].nunique()),
        "items": int(interactions["item_id"].nunique()),
        "density": density,
        "missing_image_pct": float((~items["has_image"]).mean() * 100.0),
    }
    stats_path.write_text(json.dumps(stats, indent=2), encoding="utf-8")
    return PreprocessResult(interactions_path=interactions_path, items_path=items_path, stats_path=stats_path, stats=stats)


def main() -> None:
    parser = argparse.ArgumentParser(description="Preprocess Amazon Reviews 2023 raw files into parquet artifacts.")
    parser.add_argument("--core", type=int, default=DEFAULT_CORE)
    parser.add_argument("--max-interactions", type=int, default=DEFAULT_MAX_INTERACTIONS)
    parser.add_argument("--category", action="append", dest="categories")
    args = parser.parse_args()

    settings = get_settings()
    settings.ensure_directories()
    categories = tuple(args.categories) if args.categories else ("All_Beauty", "Health_and_Personal_Care", "Handmade_Products")
    result = preprocess_dataset(
        settings.raw_data_dir,
        settings.processed_data_dir,
        categories=categories,
        max_interactions=args.max_interactions,
        primary_core=args.core,
    )
    print(json.dumps(result.stats, indent=2))


if __name__ == "__main__":
    main()
