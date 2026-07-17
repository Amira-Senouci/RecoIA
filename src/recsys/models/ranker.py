"""Learning-to-rank over multi-leg candidates — src/recsys/models/ranker.py

Stage 2 of the RecoIA pipeline: the legs (and their RRF union) GENERATE
candidates; a LightGBM LambdaRank model RE-RANKS them using features RRF
cannot see (popularity, rating quality, per-leg agreement, history length).

Leakage discipline: the ranker is trained with labels from the INNER
validation split (each user's last training interaction) against legs
trained on the remaining training data — the outer test item is never
visible during training, mirroring notebook 06's weight-tuning protocol.
"""
from __future__ import annotations

from dataclasses import dataclass

import lightgbm as lgb
import numpy as np
import pandas as pd

LEG_ORDER = ["item_item", "sasrec", "content", "als", "popularity"]


# ----------------------------------------------------------------------
def build_features(
    leg_rankings_per_user: dict[str, dict[str, list[str]]],
    item_pop: pd.Series,
    item_rating: pd.Series,
    hist_len: dict[str, int],
) -> tuple[np.ndarray, pd.DataFrame, list[str]]:
    """Candidate features for every (user, item) in the union of leg lists.

    Per candidate: reciprocal rank in each leg (0 if absent), number of
    legs that retrieved it (consensus), log-popularity, mean rating,
    log user-history length.
    Returns (X, meta[user_id,item_id], feature_names).
    """
    rows, meta = [], []
    for user, rankings in leg_rankings_per_user.items():
        cands: dict[str, dict[str, float]] = {}
        for leg in LEG_ORDER:
            for rank, item in enumerate(rankings.get(leg, []), start=1):
                cands.setdefault(item, {})[leg] = 1.0 / rank
        h = float(np.log1p(hist_len.get(user, 0)))
        for item, rr in cands.items():
            rows.append([
                *[rr.get(leg, 0.0) for leg in LEG_ORDER],
                float(len(rr)),
                float(np.log1p(item_pop.get(item, 0))),
                float(item_rating.get(item, 0.0)),
                h,
            ])
            meta.append((user, item))
    X = np.asarray(rows, dtype=np.float32)
    meta_df = pd.DataFrame(meta, columns=["user_id", "item_id"])
    names = [f"rr_{leg}" for leg in LEG_ORDER] + [
        "n_legs", "log_pop", "mean_rating", "log_hist_len"]
    return X, meta_df, names


# ----------------------------------------------------------------------
@dataclass
class RankerModel:
    booster: lgb.Booster
    feature_names: list[str]

    def rank(
        self,
        leg_rankings_per_user: dict[str, dict[str, list[str]]],
        item_pop: pd.Series,
        item_rating: pd.Series,
        hist_len: dict[str, int],
        limit: int = 10,
    ) -> dict[str, list[str]]:
        """Re-rank each user's candidate union; returns user -> top items."""
        X, meta, _ = build_features(
            leg_rankings_per_user, item_pop, item_rating, hist_len)
        if len(meta) == 0:
            return {}
        scores = self.booster.predict(X)
        df = meta.assign(score=scores)
        df = df.sort_values(["user_id", "score"], ascending=[True, False])
        return {u: g["item_id"].tolist()[:limit]
                for u, g in df.groupby("user_id", sort=False)}

    def feature_importance(self) -> pd.DataFrame:
        return pd.DataFrame({
            "feature": self.feature_names,
            "gain": self.booster.feature_importance("gain"),
        }).sort_values("gain", ascending=False).reset_index(drop=True)


# ----------------------------------------------------------------------
def train_ranker(
    leg_rankings_per_user: dict[str, dict[str, list[str]]],
    truth_per_user: dict[str, str],
    item_pop: pd.Series,
    item_rating: pd.Series,
    hist_len: dict[str, int],
    params: dict | None = None,
    num_rounds: int = 300,
) -> RankerModel:
    """Train LambdaRank on candidate unions with one relevant item per user.

    Only users whose relevant item actually appears among their candidates
    contribute training groups (LambdaRank needs >= 1 positive per query);
    the share of such users is the candidate recall and is the generator's
    responsibility, reported by the calling notebook.
    """
    X, meta, names = build_features(
        leg_rankings_per_user, item_pop, item_rating, hist_len)
    y = np.array(
        [1 if truth_per_user.get(u) == i else 0
         for u, i in zip(meta["user_id"], meta["item_id"])],
        dtype=np.int8,
    )
    pos_users = set(meta["user_id"][y == 1])
    keep = meta["user_id"].isin(pos_users).to_numpy()
    Xk, yk, mk = X[keep], y[keep], meta[keep]

    order = np.argsort(mk["user_id"].to_numpy(), kind="stable")
    Xk, yk = Xk[order], yk[order]
    groups_sorted = mk["user_id"].to_numpy()[order]
    group_sizes = (pd.Series(groups_sorted)
                   .groupby(groups_sorted, sort=False).size().to_numpy())

    default_params = {
        "objective": "lambdarank",
        "metric": "ndcg",
        "ndcg_eval_at": [10],
        "learning_rate": 0.05,
        "num_leaves": 31,
        "min_data_in_leaf": 30,
        "feature_fraction": 0.9,
        "verbosity": -1,
        "seed": 42,
    }
    booster = lgb.train(
        params or default_params,
        lgb.Dataset(Xk, label=yk, group=group_sizes, feature_name=names),
        num_boost_round=num_rounds,
    )
    return RankerModel(booster=booster, feature_names=names)
