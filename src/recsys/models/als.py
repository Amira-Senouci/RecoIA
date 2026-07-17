from __future__ import annotations

from dataclasses import dataclass

import numpy as np
import pandas as pd


@dataclass(frozen=True)
class ALSModel:
    user_factors: np.ndarray
    item_factors: np.ndarray
    user_index: dict[str, int]
    item_index: dict[str, int]

    def recommend(self, user_id: str, seen_items: set[str] | None = None, limit: int = 20) -> list[str]:
        seen_items = seen_items or set()
        user_position = self.user_index.get(user_id)
        if user_position is None:
            return []
        scores = self.item_factors @ self.user_factors[user_position]
        ranked_indices = np.argsort(scores)[::-1]
        inverse_item_index = {index: item_id for item_id, index in self.item_index.items()}
        recommendations: list[str] = []
        for item_position in ranked_indices:
            item_id = inverse_item_index[int(item_position)]
            if item_id in seen_items:
                continue
            recommendations.append(item_id)
            if len(recommendations) >= limit:
                break
        return recommendations


def train_als_model(interactions: pd.DataFrame, factors: int = 32) -> ALSModel:
    users = {user_id: index for index, user_id in enumerate(interactions["user_id"].astype(str).unique())}
    items = {item_id: index for index, item_id in enumerate(interactions["item_id"].astype(str).unique())}

    matrix = np.zeros((len(users), len(items)), dtype=np.float32)
    for row in interactions[["user_id", "item_id", "rating"]].itertuples(index=False):
        user_index = users[str(row.user_id)]
        item_index = items[str(row.item_id)]
        rating = float(row.rating) if row.rating is not None else 1.0
        matrix[user_index, item_index] += rating

    if matrix.size == 0:
        user_factors = np.zeros((0, factors), dtype=np.float32)
        item_factors = np.zeros((0, factors), dtype=np.float32)
        return ALSModel(user_factors=user_factors, item_factors=item_factors, user_index=users, item_index=items)

    u, s, vt = np.linalg.svd(matrix, full_matrices=False)
    rank = min(factors, len(s))
    sqrt_s = np.sqrt(s[:rank])
    user_factors = (u[:, :rank] * sqrt_s).astype(np.float32)
    item_factors = (vt[:rank, :].T * sqrt_s).astype(np.float32)
    return ALSModel(user_factors=user_factors, item_factors=item_factors, user_index=users, item_index=items)
