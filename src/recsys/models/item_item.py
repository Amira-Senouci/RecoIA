from __future__ import annotations

from dataclasses import dataclass
from collections import defaultdict

import pandas as pd


@dataclass(frozen=True)
class ItemItemModel:
    neighbors: dict[str, list[tuple[str, float]]]

    def recommend(
        self,
        seed_items: list[str],
        seen_items: set[str] | None = None,
        limit: int = 20,
    ) -> list[str]:
        scores: dict[str, float] = defaultdict(float)
        seen = set(seed_items) | (seen_items or set())
        for item_id in seed_items:
            for neighbor_id, similarity in self.neighbors.get(item_id, []):
                if neighbor_id in seen:
                    continue
                scores[neighbor_id] += similarity
        ranked = sorted(scores.items(), key=lambda item: item[1], reverse=True)
        return [item_id for item_id, _score in ranked[:limit]]


def train_item_item_model(interactions: pd.DataFrame, limit_per_item: int = 50) -> ItemItemModel:
    frame = interactions[["user_id", "item_id"]].drop_duplicates().copy()
    user_to_items = frame.groupby("user_id")["item_id"].apply(list)
    co_counts: dict[str, dict[str, int]] = defaultdict(lambda: defaultdict(int))

    for items in user_to_items:
        unique_items = list(dict.fromkeys(items))
        for index, item_id in enumerate(unique_items):
            for neighbor_id in unique_items[index + 1 :]:
                co_counts[item_id][neighbor_id] += 1
                co_counts[neighbor_id][item_id] += 1

    neighbors: dict[str, list[tuple[str, float]]] = {}
    item_counts = frame.groupby("item_id").size().to_dict()
    for item_id, related in co_counts.items():
        base_count = float(item_counts.get(item_id, 1))
        scored = sorted(
            ((neighbor_id, count / base_count) for neighbor_id, count in related.items()),
            key=lambda item: item[1],
            reverse=True,
        )[:limit_per_item]
        neighbors[item_id] = scored
    return ItemItemModel(neighbors=neighbors)
