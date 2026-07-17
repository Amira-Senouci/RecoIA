"""Reciprocal Rank Fusion — src/recsys/models/fusion.py

Fuses ranked recommendation lists by RANK, not by score, per
Cormack, Clarke & Buettcher (2009):

    RRF(item) = sum over models m of  1 / (k + rank_m(item))

where rank is 1-based and k=60 damps the dominance of top ranks.
An item absent from a model's list simply contributes nothing —
no imputation, no score normalization needed.

IMPORTANT USAGE RULE: fuse DEEP lists, truncate AFTER fusion.
Fusing three top-10 lists into a top-10 barely reorders anything;
fetch ~50 per model, fuse, then cut to 10. That is the difference
between rank fusion and list concatenation (the bug this replaces).
"""
from __future__ import annotations

from collections import defaultdict
from collections.abc import Sequence


def rrf_fuse(
    ranked_lists: Sequence[Sequence[str]],
    limit: int = 10,
    k: int = 60,
    weights: Sequence[float] | None = None,
) -> list[str]:
    """Fuse ranked item lists with Reciprocal Rank Fusion.

    Args:
        ranked_lists: one ranked list of item_ids per model, best first.
            Pass DEEP lists (e.g. top-50 per model), not top-`limit`.
        limit: number of items to return after fusion.
        k: RRF damping constant (60 is the standard from the paper).
        weights: optional per-model multipliers (same order as
            ranked_lists), e.g. to trust item-item more than popularity.
            Defaults to equal weights.

    Returns:
        Fused ranked list of item_ids, best first, length <= limit.
    """
    if weights is None:
        weights = [1.0] * len(ranked_lists)
    if len(weights) != len(ranked_lists):
        raise ValueError("weights must match ranked_lists length")

    scores: dict[str, float] = defaultdict(float)
    for w, ranking in zip(weights, ranked_lists):
        for rank, item in enumerate(ranking, start=1):
            scores[item] += w / (k + rank)

    return [item for item, _ in
            sorted(scores.items(), key=lambda x: -x[1])][:limit]
