"""Weighted Reciprocal Rank Fusion hybrid — src/recsys/models/hybrid.py

Fuses the ranked lists of RecoIA's individual models ("legs") into one
recommendation list. Weights are NOT hand-picked: they are derived from
each leg's measured validation strength via a single temperature
parameter beta, itself selected on validation data:

    w_leg  proportional to  (NDCG_val(leg)) ** beta

beta = 0  -> equal weights (pure RRF)
beta -> large -> winner-takes-all (best single leg)

so one scalar spans the whole spectrum from "democracy" to "dictatorship",
and the data chooses the point in between.
"""
from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass

import numpy as np


# ----------------------------------------------------------------------
def weighted_rrf(
    leg_rankings: dict[str, list[str]],
    weights: dict[str, float],
    limit: int = 10,
    k: int = 60,
) -> list[str]:
    """Fuse per-leg ranked lists (deep lists in, truncate AFTER fusion)."""
    scores: dict[str, float] = defaultdict(float)
    for leg, ranking in leg_rankings.items():
        w = weights.get(leg, 0.0)
        if w == 0.0:
            continue
        for rank, item in enumerate(ranking, start=1):
            scores[item] += w / (k + rank)
    return [item for item, _ in sorted(scores.items(), key=lambda x: -x[1])][:limit]


def strength_weights(leg_strength: dict[str, float], beta: float) -> dict[str, float]:
    """Weights proportional to measured leg strength ** beta, normalized."""
    raw = {leg: max(s, 0.0) ** beta for leg, s in leg_strength.items()}
    total = sum(raw.values()) or 1.0
    return {leg: v / total for leg, v in raw.items()}


# ----------------------------------------------------------------------
@dataclass(frozen=True)
class HybridRecommender:
    """Serving-side wrapper: fixed weights, fuse whatever legs are present.

    Legs are supplied per-request as ranked lists, so the hybrid stays
    agnostic to how each leg is computed (model object, cache, service).
    Missing legs simply contribute nothing — graceful degradation.
    """
    weights: dict[str, float]
    k: int = 60

    def recommend(self, leg_rankings: dict[str, list[str]], limit: int = 10) -> list[str]:
        return weighted_rrf(leg_rankings, self.weights, limit=limit, k=self.k)


# ----------------------------------------------------------------------
def evaluate_rankings(
    recs_per_user: dict[str, list[str]],
    truth_per_user: dict[str, str],
    k: int = 10,
) -> dict[str, float]:
    """HR@k and NDCG@k for one-relevant-item-per-user evaluation."""
    hits, ndcg, n = 0, 0.0, 0
    for user, target in truth_per_user.items():
        recs = recs_per_user.get(user)
        if recs is None:
            continue
        n += 1
        top = recs[:k]
        if target in top:
            hits += 1
            ndcg += 1.0 / np.log2(top.index(target) + 2)
    n = max(n, 1)
    return {"HR": hits / n, "NDCG": ndcg / n, "n": n}


def select_beta(
    leg_rankings_per_user: dict[str, dict[str, list[str]]],
    leg_strength: dict[str, float],
    truth_per_user: dict[str, str],
    betas: tuple[float, ...] = (0.0, 0.5, 1.0, 2.0, 4.0, 8.0),
    limit: int = 10,
    k: int = 60,
) -> tuple[float, dict[float, float]]:
    """Grid-search beta on validation data; returns (best_beta, ndcg_per_beta).

    leg_rankings_per_user: user_id -> {leg_name -> deep ranked list}.
    """
    curve: dict[float, float] = {}
    for beta in betas:
        weights = strength_weights(leg_strength, beta)
        fused = {
            user: weighted_rrf(rankings, weights, limit=limit, k=k)
            for user, rankings in leg_rankings_per_user.items()
        }
        curve[beta] = evaluate_rankings(fused, truth_per_user, k=limit)["NDCG"]
    best = max(curve, key=curve.get)
    return best, curve
