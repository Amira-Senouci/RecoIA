"""Two-Tower retrieval — src/recsys/models/two_tower.py

Dual-encoder retrieval (Covington et al., 2016; Yi et al., 2019): a USER
tower and an ITEM tower map both sides into one vector space where
relevance is a dot product. RecoIA's instantiation is deliberately small
and CPU-trainable:

  - item tower  = frozen BGE item embeddings -> 2-layer MLP
  - user tower  = mean of history's BGE embeddings -> 2-layer MLP
  - training    = in-batch sampled softmax (each positive in the batch is
                  a negative for every other row), temperature-scaled

The towers are decoupled from the ContentModel object: pass item_ids and
the embedding matrix, so the module has no heavy imports beyond torch.

Interface matches the other legs:
    model = train_two_tower_model(train_interactions, item_ids, item_emb)
    model.recommend(seed_items=[...], seen_items=set, limit=10)
"""
from __future__ import annotations

from dataclasses import dataclass, field

import numpy as np
import pandas as pd
import torch
import torch.nn as nn


class _Tower(nn.Module):
    def __init__(self, in_dim: int, out_dim: int, hidden: int) -> None:
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(in_dim, hidden), nn.GELU(),
            nn.Linear(hidden, out_dim),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        z = self.net(x)
        return z / z.norm(dim=-1, keepdim=True).clamp_min(1e-8)


@dataclass
class TwoTowerModel:
    user_tower: _Tower
    item_vectors: np.ndarray          # (n_items, out_dim) item-tower output
    item_ids: np.ndarray
    index: dict
    base_emb: np.ndarray              # frozen input embeddings (for profiles)
    train_losses: list = field(default_factory=list)

    @torch.no_grad()
    def recommend(
        self,
        seed_items: list[str],
        seen_items: set[str] | None = None,
        limit: int = 10,
    ) -> list[str]:
        seen_items = seen_items or set()
        rows = [self.index[i] for i in seed_items if i in self.index]
        if not rows:
            return []
        profile = self.base_emb[rows].mean(axis=0, keepdims=True)
        self.user_tower.eval()
        u = self.user_tower(torch.from_numpy(profile).float()).numpy()[0]
        scores = self.item_vectors @ u
        for item in seen_items | set(seed_items):
            r = self.index.get(item)
            if r is not None:
                scores[r] = -np.inf
        k = min(limit, len(scores) - 1)
        top = np.argpartition(-scores, k)[:k]
        top = top[np.argsort(-scores[top])]
        return [self.item_ids[r] for r in top]


def train_two_tower_model(
    train_interactions: pd.DataFrame,
    item_ids: np.ndarray,
    item_embeddings: np.ndarray,
    out_dim: int = 128,
    hidden: int = 256,
    epochs: int = 30,
    batch_size: int = 256,
    lr: float = 1e-3,
    temperature: float = 0.07,
    seed: int = 42,
    verbose: bool = True,
) -> TwoTowerModel:
    """Train with in-batch softmax on (leave-one-out profile, positive) pairs.

    For each training pair, the user representation is the mean embedding of
    the user's history EXCLUDING the positive item — otherwise the positive
    leaks into its own query and the model learns the identity function.
    """
    torch.manual_seed(seed)
    rng = np.random.default_rng(seed)

    index = {it: r for r, it in enumerate(item_ids)}
    base = item_embeddings.astype(np.float32)
    in_dim = base.shape[1]

    # training pairs: (user, positive item), users need >= 2 known items
    hist = (train_interactions.groupby("user_id")["item_id"].agg(list))
    pairs: list[tuple[list[int], int]] = []
    for items in hist:
        rows = [index[i] for i in items if i in index]
        if len(rows) >= 2:
            for pos in rows:
                pairs.append((rows, pos))
    if verbose:
        print(f"training pairs: {len(pairs):,}")

    user_tower = _Tower(in_dim, out_dim, hidden)
    item_tower = _Tower(in_dim, out_dim, hidden)
    params = list(user_tower.parameters()) + list(item_tower.parameters())
    opt = torch.optim.AdamW(params, lr=lr, weight_decay=1e-5)
    loss_fn = nn.CrossEntropyLoss()

    model = TwoTowerModel(user_tower=user_tower, item_vectors=np.zeros(1),
                          item_ids=item_ids, index=index, base_emb=base)
    n = len(pairs)
    for epoch in range(epochs):
        order = rng.permutation(n)
        total, nb = 0.0, 0
        user_tower.train(); item_tower.train()
        for s in range(0, n, batch_size):
            batch = [pairs[j] for j in order[s:s + batch_size]]
            if len(batch) < 8:
                continue
            profiles, pos_rows = [], []
            for rows, pos in batch:
                others = [r for r in rows if r != pos] or rows
                profiles.append(base[others].mean(axis=0))
                pos_rows.append(pos)
            U = user_tower(torch.from_numpy(np.stack(profiles)).float())
            I = item_tower(torch.from_numpy(base[pos_rows]).float())
            logits = (U @ I.T) / temperature          # (b, b)
            target = torch.arange(len(batch))
            loss = loss_fn(logits, target)
            opt.zero_grad(); loss.backward(); opt.step()
            total += float(loss.detach()); nb += 1
        model.train_losses.append(total / max(nb, 1))
        if verbose and (epoch + 1) % 5 == 0:
            print(f"  epoch {epoch + 1:>3}/{epochs}  loss {total / max(nb, 1):.4f}")

    item_tower.eval()
    with torch.no_grad():
        model.item_vectors = item_tower(torch.from_numpy(base).float()).numpy()
    return model
