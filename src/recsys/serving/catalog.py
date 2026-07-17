from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import pandas as pd


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

    def catalog(self, limit: int) -> list[dict[str, object]]:
        items = self._load_items().copy()
        items = items.sort_values(
            ["n_ratings", "avg_rating", "item_id"],
            ascending=[False, False, True],
            na_position="last",
        )
        return self._records(items.head(limit))

    def recommendations(
        self,
        limit: int,
        excluded_item_ids: set[str] | None = None,
    ) -> list[dict[str, object]]:
        excluded_item_ids = excluded_item_ids or set()
        items = self._load_items().copy()
        interactions = self._load_interactions()
        scores = interactions.groupby("item_id").size().rename("popularity")
        items = items.merge(scores, left_on="item_id", right_index=True, how="inner")
        items = items[items["has_image"].fillna(False)]
        items = items[~items["item_id"].astype(str).isin(excluded_item_ids)]
        items = items.sort_values(
            ["popularity", "avg_rating", "item_id"],
            ascending=[False, False, True],
            na_position="last",
        )
        return self._records(items.head(limit))
