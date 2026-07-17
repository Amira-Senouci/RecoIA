from __future__ import annotations

from dataclasses import dataclass

import pandas as pd


@dataclass(frozen=True)
class PopularityModel:
    item_scores: pd.Series

    def recommend(self, seen_items: set[str] | None = None, limit: int = 20) -> list[str]:
        seen_items = seen_items or set()
        ranked = self.item_scores.drop(labels=[item for item in seen_items if item in self.item_scores.index], errors="ignore")
        return ranked.head(limit).index.tolist()


def train_popularity_model(interactions: pd.DataFrame, weight_column: str | None = None) -> PopularityModel:
    frame = interactions.copy()
    if weight_column and weight_column in frame.columns:
        scores = frame.groupby("item_id")[weight_column].sum()
    else:
        scores = frame.groupby("item_id").size().astype(float)
    scores = scores.sort_values(ascending=False)
    return PopularityModel(item_scores=scores)
