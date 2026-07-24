"""Expands the browsable product catalog (items.parquet) with real products
pulled from the raw Amazon metadata files, beyond the ~3,700 "core" items that
have enough review history to be usable for CF model training.

Adds real title/brand/price/image data for each new product -- nothing here
is fabricated. New items have no interaction history yet, so they honestly
show "No ratings yet" and won't appear in personalized recommendations until
real users interact with them, exactly like a newly-listed real product.

interactions.parquet (and therefore every offline model evaluation number
already computed in the notebooks) is left untouched.

Run once from the repo root:

    python expand_catalog.py
"""
from __future__ import annotations

import pandas as pd

from recsys.config import get_settings
from recsys.data.preprocess import _load_meta, _normalize_brand, _parse_price, _extract_first_image

TARGET_TOTAL = 10_000
CATEGORIES = ("All_Beauty", "Health_and_Personal_Care", "Handmade_Products")


def _transform_meta(meta: pd.DataFrame) -> pd.DataFrame:
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
    image_urls, has_images = [], []
    for images in meta.get("images", pd.Series([None] * len(meta))):
        image_url, has_image = _extract_first_image(images)
        image_urls.append(image_url)
        has_images.append(has_image)
    meta["image_url"] = image_urls
    meta["has_image"] = has_images
    meta["category"] = meta.get("main_category", meta.get("source_category"))
    items = meta[["item_id", "title", "brand", "category", "price", "image_url", "has_image", "source_category"]]
    items = items.drop_duplicates("item_id")
    items = items[items["title"].notna() & (items["title"].astype(str).str.strip() != "")]
    return items.reset_index(drop=True)


def main() -> None:
    settings = get_settings()
    items_path = settings.processed_data_dir / "items.parquet"
    existing = pd.read_parquet(items_path)
    existing_ids = set(existing["item_id"].astype(str))
    print(f"existing catalog: {len(existing)} core items")

    to_add = TARGET_TOTAL - len(existing)
    if to_add <= 0:
        print(f"catalog already has {len(existing)} items, target is {TARGET_TOTAL} -- nothing to do")
        return

    meta = _load_meta(settings.raw_data_dir, CATEGORIES)
    candidates = _transform_meta(meta)
    candidates = candidates[~candidates["item_id"].astype(str).isin(existing_ids)]
    print(f"real candidate products available (raw metadata, excluding existing): {len(candidates)}")

    per_category = to_add // len(CATEGORIES)
    picked_frames = []
    for category in CATEGORIES:
        pool = candidates[candidates["source_category"] == category]
        # prefer real images first, fill the rest with non-image listings
        with_image = pool[pool["has_image"]]
        without_image = pool[~pool["has_image"]]
        picked = pd.concat([with_image.head(per_category), without_image]).head(per_category)
        picked_frames.append(picked)
        print(f"  {category}: adding {len(picked)} (pool had {len(pool)})")

    new_items = pd.concat(picked_frames, ignore_index=True)
    remaining = to_add - len(new_items)
    if remaining > 0:
        leftover_pool = candidates[~candidates["item_id"].isin(new_items["item_id"])]
        new_items = pd.concat([new_items, leftover_pool.head(remaining)], ignore_index=True)

    new_items = new_items.drop(columns=["source_category"])
    new_items["avg_rating"] = pd.NA
    new_items["n_ratings"] = 0

    combined = pd.concat([existing, new_items], ignore_index=True)
    combined = combined.drop_duplicates("item_id").reset_index(drop=True)
    combined.to_parquet(items_path, index=False)

    print(f"\nadded {len(new_items)} real products with no interaction history yet")
    print(f"catalog total: {len(combined)} items")
    print(combined["category"].value_counts())


if __name__ == "__main__":
    main()
