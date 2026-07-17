"""SASRec — Self-Attentive Sequential Recommendation (Kang & McAuley, 2018).

src/recsys/models/sasrec.py

Models each user's interaction history as an ORDERED sequence and predicts
the next item with a causal (left-to-right) transformer. Sized for RecoIA's
compact catalog: with ~3.7k items we use full-softmax cross-entropy over the
catalog (simpler and more stable than negative sampling) and train on CPU
in minutes.

Interface matches the other RecoIA models:
    model = train_sasrec_model(train_interactions)
    model.recommend(seed_items=[...chronological...], seen_items=set, limit=10)
"""
from __future__ import annotations

from dataclasses import dataclass, field

import numpy as np
import pandas as pd
import torch
import torch.nn as nn


# ----------------------------------------------------------------------
class _SASRecNet(nn.Module):
    def __init__(self, n_items: int, dim: int, max_len: int,
                 n_blocks: int, n_heads: int, dropout: float) -> None:
        super().__init__()
        self.max_len = max_len
        self.n_heads = n_heads
        # index 0 is padding
        self.item_emb = nn.Embedding(n_items + 1, dim, padding_idx=0)
        self.pos_emb = nn.Embedding(max_len, dim)
        self.emb_dropout = nn.Dropout(dropout)
        layer = nn.TransformerEncoderLayer(
            d_model=dim, nhead=n_heads, dim_feedforward=dim * 4,
            dropout=dropout, batch_first=True, norm_first=True,
            activation="gelu",
        )
        self.encoder = nn.TransformerEncoder(layer, num_layers=n_blocks)
        self.norm = nn.LayerNorm(dim)
        nn.init.normal_(self.item_emb.weight, std=0.02)
        nn.init.normal_(self.pos_emb.weight, std=0.02)
        with torch.no_grad():
            self.item_emb.weight[0].zero_()

    def forward(self, seqs: torch.Tensor) -> torch.Tensor:
        """seqs: (batch, max_len) item indices, 0-padded on the LEFT.

        Causal and key-padding constraints are merged into ONE explicit
        (b*heads, t, t) boolean mask, with the diagonal always allowed.
        Rationale: passing src_key_padding_mask separately lets left-pad
        QUERY rows end up fully masked; a fully-masked softmax row yields
        NaN in PyTorch's fused attention path (eval + no_grad), which then
        poisons every position. Self-attention on pad rows is harmless --
        their outputs are never read.
        """
        b, t = seqs.shape
        positions = torch.arange(t, device=seqs.device).unsqueeze(0)
        h = self.item_emb(seqs) + self.pos_emb(positions)
        h = self.emb_dropout(h)
        causal = torch.triu(
            torch.ones(t, t, dtype=torch.bool, device=seqs.device), diagonal=1)
        pad_keys = (seqs == 0).unsqueeze(1)                 # (b, 1, t)
        blocked = causal.unsqueeze(0) | pad_keys            # (b, t, t)
        eye = torch.eye(t, dtype=torch.bool, device=seqs.device)
        blocked = blocked & ~eye                            # never fully mask a row
        mask = blocked.repeat_interleave(self.n_heads, dim=0)
        h = self.encoder(h, mask=mask)
        h = self.norm(h)
        # tie output weights to item embeddings: logits over the catalog
        return h @ self.item_emb.weight.T          # (b, t, n_items+1)


# ----------------------------------------------------------------------
@dataclass
class SASRecModel:
    net: _SASRecNet
    item_to_idx: dict
    idx_to_item: np.ndarray            # position i -> item_id (1-based offset)
    max_len: int
    train_losses: list = field(default_factory=list)

    @torch.no_grad()
    def recommend(
        self,
        seed_items: list[str],
        seen_items: set[str] | None = None,
        limit: int = 10,
    ) -> list[str]:
        """Next-item prediction from the user's chronological history."""
        seen_items = seen_items or set()
        idxs = [self.item_to_idx[i] for i in seed_items if i in self.item_to_idx]
        if not idxs:
            return []
        idxs = idxs[-self.max_len:]
        seq = torch.zeros(1, self.max_len, dtype=torch.long)
        seq[0, -len(idxs):] = torch.tensor(idxs)
        self.net.eval()
        logits = self.net(seq)[0, -1]              # last position
        logits[0] = -torch.inf                     # padding index
        for item in seen_items | set(seed_items):
            j = self.item_to_idx.get(item)
            if j is not None:
                logits[j] = -torch.inf
        k = min(limit, logits.shape[0] - 1)
        top = torch.topk(logits, k).indices.numpy()
        return [self.idx_to_item[j - 1] for j in top if j > 0]


# ----------------------------------------------------------------------
def _build_sequences(train: pd.DataFrame, item_to_idx: dict,
                     max_len: int) -> list[list[int]]:
    ordered = train.sort_values(["user_id", "timestamp"])
    seqs = []
    for _, items in ordered.groupby("user_id")["item_id"]:
        idxs = [item_to_idx[i] for i in items]
        if len(idxs) >= 2:                         # need at least one target
            seqs.append(idxs[-(max_len + 1):])
    return seqs


def train_sasrec_model(
    train_interactions: pd.DataFrame,
    dim: int = 64,
    max_len: int = 30,
    n_blocks: int = 2,
    n_heads: int = 2,
    dropout: float = 0.3,
    epochs: int = 60,
    batch_size: int = 128,
    lr: float = 1e-3,
    weight_decay: float = 1e-5,
    seed: int = 42,
    verbose: bool = True,
) -> SASRecModel:
    """Train SASRec with full-softmax next-item cross-entropy on CPU."""
    torch.manual_seed(seed)
    np.random.seed(seed)

    items = np.sort(train_interactions["item_id"].unique())
    item_to_idx = {item: j + 1 for j, item in enumerate(items)}   # 0 = pad
    seqs = _build_sequences(train_interactions, item_to_idx, max_len)

    net = _SASRecNet(len(items), dim, max_len, n_blocks, n_heads, dropout)
    opt = torch.optim.AdamW(net.parameters(), lr=lr, weight_decay=weight_decay)
    loss_fn = nn.CrossEntropyLoss(ignore_index=0)

    # pad every sequence once: inputs = seq[:-1], targets = seq[1:]
    X = torch.zeros(len(seqs), max_len, dtype=torch.long)
    Y = torch.zeros(len(seqs), max_len, dtype=torch.long)
    for r, s in enumerate(seqs):
        inp, tgt = s[:-1][-max_len:], s[1:][-max_len:]
        X[r, -len(inp):] = torch.tensor(inp)
        Y[r, -len(tgt):] = torch.tensor(tgt)

    model = SASRecModel(net=net, item_to_idx=item_to_idx,
                        idx_to_item=items, max_len=max_len)
    n = len(seqs)
    net.train()
    for epoch in range(epochs):
        perm = torch.randperm(n)
        total, batches = 0.0, 0
        for start in range(0, n, batch_size):
            idx = perm[start:start + batch_size]
            logits = net(X[idx])                          # (b, t, V+1)
            loss = loss_fn(logits.reshape(-1, logits.shape[-1]),
                           Y[idx].reshape(-1))
            opt.zero_grad()
            loss.backward()
            torch.nn.utils.clip_grad_norm_(net.parameters(), 5.0)
            opt.step()
            total += float(loss.detach())
            batches += 1
        model.train_losses.append(total / batches)
        if verbose and (epoch + 1) % 10 == 0:
            print(f"  epoch {epoch + 1:>3}/{epochs}  loss {total / batches:.4f}")
    net.eval()
    return model
