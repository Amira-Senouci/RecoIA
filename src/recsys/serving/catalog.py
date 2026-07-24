from __future__ import annotations

from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

import pandas as pd

from recsys.models.item_item import ItemItemModel, train_item_item_model


@lru_cache(maxsize=4)
def _cached_item_item_model(processed_root: Path) -> ItemItemModel:
    interactions = pd.read_parquet(processed_root / "interactions.parquet")
    return train_item_item_model(interactions)


@dataclass(frozen=True)
class CatalogStore:
    """Read-only access to the processed catalog used by the demo API."""

    processed_root: Path

    def _load_items(self) -> pd.DataFrame:
        path = self.processed_root / "items.parquet"
        if not path.is_file():
            raise FileNotFoundError(f"Missing processed catalog: {path}")
        return pd.read_parquet(path)

    def _load_interactions(self) -> pd.DataFrame:
        path = self.processed_root / "interactions.parquet"
        if not path.is_file():
            raise FileNotFoundError(f"Missing processed interactions: {path}")
        return pd.read_parquet(path)

    @staticmethod
    def _records(frame: pd.DataFrame) -> list[dict[str, object]]:
        records: list[dict[str, object]] = []
        for row in frame.to_dict(orient="records"):
            price = row.get("price")
            rating = row.get("avg_rating")
            n_ratings = row.get("n_ratings")
            records.append(
                {
                    "item_id": str(row["item_id"]),
                    "title": str(row.get("title") or "Untitled item"),
                    "brand": str(row.get("brand") or "Unknown brand"),
                    "category": str(row.get("category") or "Uncategorized"),
                    "price": None if pd.isna(price) else float(price),
                    "image_url": str(row.get("image_url") or ""),
                    "has_image": bool(row.get("has_image", False)),
                    "avg_rating": None if pd.isna(rating) else float(rating),
                    "n_ratings": 0 if pd.isna(n_ratings) else int(n_ratings),
                }
            )
        return records

    def get_item(self, item_id: str) -> dict[str, object] | None:
        items = self._load_items()
        matches = items[items["item_id"].astype(str) == item_id]
        if matches.empty:
            return None
        return self._records(matches.head(1))[0]

    def catalog(self, limit: int) -> list[dict[str, object]]:
        items = self._load_items().copy()
        items = items.sort_values(
            ["n_ratings", "avg_rating", "item_id"],
            ascending=[False, False, True],
            na_position="last",
        )
        return self._records(items.head(limit))

    def search(
        self,
        q: str | None = None,
        category: str | None = None,
        brand: str | None = None,
        min_price: float | None = None,
        max_price: float | None = None,
        sort: str = "relevance",
        limit: int = 24,
        offset: int = 0,
    ) -> tuple[list[dict[str, object]], int]:
        items = self._load_items().copy()
        if q:
            needle = q.strip().lower()
            mask = (
                items["title"].fillna("").astype(str).str.lower().str.contains(needle, regex=False)
                | items["brand"].fillna("").astype(str).str.lower().str.contains(needle, regex=False)
            )
            items = items[mask]
        if category:
            items = items[items["category"] == category]
        if brand:
            items = items[items["brand"] == brand]
        if min_price is not None:
            items = items[items["price"].fillna(0) >= min_price]
        if max_price is not None:
            items = items[items["price"].fillna(0) <= max_price]

        sort_options: dict[str, tuple[list[str], list[bool]]] = {
            "price_asc": (["price"], [True]),
            "price_desc": (["price"], [False]),
            "rating": (["avg_rating", "n_ratings"], [False, False]),
            "relevance": (["n_ratings", "avg_rating"], [False, False]),
        }
        columns, ascending = sort_options.get(sort, sort_options["relevance"])
        items = items.sort_values(columns, ascending=ascending, na_position="last")

        total = len(items)
        page = items.iloc[offset : offset + limit]
        return self._records(page), total

    def recommendations(
        self,
        limit: int,
        excluded_item_ids: set[str] | None = None,
        exclude_categories: set[str] | None = None,
    ) -> list[dict[str, object]]:
        excluded_item_ids = excluded_item_ids or set()
        exclude_categories = exclude_categories or set()
        items = self._load_items().copy()
        interactions = self._load_interactions()
        scores = interactions.groupby("item_id").size().rename("popularity")
        items = items.merge(scores, left_on="item_id", right_index=True, how="inner")
        items = items[items["has_image"].fillna(False)]
        items = items[~items["item_id"].astype(str).isin(excluded_item_ids)]
        if exclude_categories:
            items = items[~items["category"].isin(exclude_categories)]
        items = items.sort_values(
            ["popularity", "avg_rating", "item_id"],
            ascending=[False, False, True],
            na_position="last",
        )
        return self._records(items.head(limit))

    def personalized_recommendations(
        self,
        seed_items: list[str],
        limit: int,
        excluded_item_ids: set[str] | None = None,
        exclude_categories: set[str] | None = None,
    ) -> tuple[list[dict[str, object]], str]:
        """Item-item collaborative filtering seeded by the user's own real
        interaction history (real "view"/"save" events), falling back to
        global popularity only for a genuine cold-start user with no history.

        ``exclude_categories`` powers "discover other categories you might
        like" strips: it still ranks purely by the user's real item-item
        similarity, it just excludes categories already shown elsewhere on
        the page (e.g. the category the user is currently browsing/searching).
        """
        excluded_item_ids = set(excluded_item_ids or set())
        exclude_categories = set(exclude_categories or set())
        if not seed_items:
            return self.recommendations(limit, excluded_item_ids, exclude_categories), "popularity"

        model = _cached_item_item_model(self.processed_root)
        seen = excluded_item_ids | set(seed_items)
        # Over-fetch candidates when category-filtering so enough remain after exclusion.
        fetch_limit = limit * 5 if exclude_categories else limit
        recommended_ids = model.recommend(seed_items=seed_items, seen_items=seen, limit=fetch_limit)
        if not recommended_ids:
            return self.recommendations(limit, excluded_item_ids, exclude_categories), "popularity"

        items = self._load_items().copy()
        items["item_id"] = items["item_id"].astype(str)
        order = {item_id: rank for rank, item_id in enumerate(recommended_ids)}
        matched = items[items["item_id"].isin(order)].copy()
        if exclude_categories:
            matched = matched[~matched["category"].isin(exclude_categories)]
        matched["_rank"] = matched["item_id"].map(order)
        matched = matched.sort_values("_rank")
        records = self._records(matched.head(limit))

        if len(records) < limit:
            backfill_excluded = seen | set(recommended_ids) | {r["item_id"] for r in records}
            records += self.recommendations(limit - len(records), backfill_excluded, exclude_categories)
        return records[:limit], "item_item_personalized"
