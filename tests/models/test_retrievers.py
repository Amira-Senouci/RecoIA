from __future__ import annotations

import pandas as pd
import pytest

from recsys.models.retrievers import train_baseline_retrievers


@pytest.fixture
def interactions() -> pd.DataFrame:
    return pd.DataFrame(
        [
            ("u1", "a", 5.0),
            ("u1", "b", 5.0),
            ("u2", "a", 4.0),
            ("u2", "c", 4.0),
            ("u3", "b", 4.0),
            ("u3", "c", 4.0),
            ("u4", "c", 5.0),
            ("u4", "d", 5.0),
        ],
        columns=["user_id", "item_id", "rating"],
    )


def test_baseline_recommender_fuses_all_legs(interactions: pd.DataFrame) -> None:
    retrievers = train_baseline_retrievers(interactions)

    recommendations = retrievers.recommend(
        user_id="u1",
        seed_items=["a"],
        seen_items={"a", "b"},
        limit=2,
    )

    assert recommendations
    assert len(recommendations) <= 2
    assert all(item not in {"a", "b"} for item in recommendations)


def test_baseline_recommender_validates_weight_count(interactions: pd.DataFrame) -> None:
    retrievers = train_baseline_retrievers(interactions)

    with pytest.raises(ValueError, match="retrieval weights"):
        retrievers.recommend(
            user_id="u1",
            seed_items=["a"],
            seen_items={"a", "b"},
            weights=(1.0,),
        )
