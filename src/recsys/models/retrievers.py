from __future__ import annotations

from dataclasses import dataclass

import pandas as pd

from .als import ALSModel, train_als_model
from .item_item import ItemItemModel, train_item_item_model
from .popularity import PopularityModel, train_popularity_model


@dataclass(frozen=True)
class BaselineRetrievers:
    popularity: PopularityModel
    item_item: ItemItemModel
    als: ALSModel

    def _leg_rankings(
        self,
        user_id: str,
        seed_items: list[str],
        seen_items: set[str],
        depth: int,
    ) -> list[list[str]]:
        """Ranked lists from each retrieval leg, personalized legs first."""
        return [
            self.item_item.recommend(seed_items=seed_items, limit=depth),
            self.als.recommend(user_id=user_id, seen_items=seen_items, limit=depth),
            self.popularity.recommend(seen_items=seen_items, limit=depth),
        ]

    def candidate_union(
        self,
        user_id: str,
        seed_items: list[str],
        seen_items: set[str],
        limit: int = 150,
        per_leg: int = 50,
    ) -> list[str]:
        """Candidate GENERATOR: the deduplicated union of all legs.

        Output order is NOT a ranking — this pool feeds a downstream
        ranker (RRF or LightGBM). For final ranked recommendations use
        ``recommend`` below.

        Bug fixed vs. previous version: the output cap equaled the
        per-leg fetch size and was filled leg-by-leg, so the popularity
        leg alone always filled every slot and the other legs never
        contributed. Now each leg contributes up to ``per_leg`` items
        and the cap defaults to room for all legs.
        """
        deduplicated: list[str] = []
        seen_or_added = set(seen_items)
        # round-robin across legs so no single leg can crowd out the others
        rankings = self._leg_rankings(user_id, seed_items, seen_items, per_leg)
        for tier in range(per_leg):
            for ranking in rankings:
                if tier >= len(ranking):
                    continue
                item_id = ranking[tier]
                if item_id in seen_or_added:
                    continue
                deduplicated.append(item_id)
                seen_or_added.add(item_id)
                if len(deduplicated) >= limit:
                    return deduplicated
        return deduplicated

    def recommend(
        self,
        user_id: str,
        seed_items: list[str],
        seen_items: set[str],
        limit: int = 10,
        depth: int = 50,
        weights: tuple[float, float, float] = (2.0, 1.0, 0.5),
    ) -> list[str]:
        """Final ranked hybrid via Reciprocal Rank Fusion.

        Fetches DEEP ranked lists (``depth`` per leg), fuses by rank,
        truncates after fusion. ``weights`` follow the leg order
        (item_item, als, popularity) and default to the empirically
        measured strength of each leg on this dataset.
        """
       


def train_baseline_retrievers(interactions: pd.DataFrame) -> BaselineRetrievers:
    return BaselineRetrievers(
        popularity=train_popularity_model(interactions),
        item_item=train_item_item_model(interactions),
        als=train_als_model(interactions),
    )