"""Content-based recommendation via sentence embeddings.

src/recsys/models/content.py

Items are represented by normalized sentence embeddings of their textual
metadata (title + description). A user is represented by the mean of the
embeddings of the items they interacted with (their "profile"). Scoring is
cosine similarity, which for normalized vectors is a dot product.

Unlike the collaborative baselines, this model can score ANY item that has
metadata — including items with zero interactions (cold start).

At RecoIA's catalog scale (thousands of items) brute-force numpy scoring is
faster and simpler than an ANN index; do not add FAISS below ~100k items.
"""
from __future__ import annotations

from dataclasses import dataclass

import numpy as np
import pandas as pd


@dataclass(frozen=True)
class ContentModel:
    item_ids: np.ndarray          # item_id per embedding row
    embeddings: np.ndarray        # (n_items, dim), L2-normalized float32
    index: dict                   # item_id -> row

    # ------------------------------------------------------------------
    def profile(self, history_items: list[str]) -> np.ndarray | None:
        """Mean embedding of the user's known items (their taste vector)."""
        rows = [self.index[i] for i in history_items if i in self.index]
        if not rows:
            return None
        vec = self.embeddings[rows].mean(axis=0)
        norm = np.linalg.norm(vec)
        return vec / norm if norm > 0 else None

    # ------------------------------------------------------------------
    def recommend(
        self,
        seed_items: list[str],
        seen_items: set[str] | None = None,
        limit: int = 20,
    ) -> list[str]:
        """Top items by cosine similarity to the mean-of-history profile."""
        seen_items = seen_items or set()
        vec = self.profile(seed_items)
        if vec is None:
            return []
        scores = self.embeddings @ vec
        # exclude the user's own items from results
        for item in seen_items | set(seed_items):
            row = self.index.get(item)
            if row is not None:
                scores[row] = -np.inf
        k = min(limit, len(scores) - 1)
        top = np.argpartition(-scores, k)[:k]
        top = top[np.argsort(-scores[top])]
        return [self.item_ids[r] for r in top]

    # ------------------------------------------------------------------
    def similar_items(self, item_id: str, limit: int = 10) -> list[str]:
        """Nearest neighbors of one item — the 'Similar items' rail."""
        row = self.index.get(item_id)
        if row is None:
            return []
        scores = self.embeddings @ self.embeddings[row]
        scores[row] = -np.inf
        k = min(limit, len(scores) - 1)
        top = np.argpartition(-scores, k)[:k]
        top = top[np.argsort(-scores[top])]
        return [self.item_ids[r] for r in top]


# ----------------------------------------------------------------------
def build_item_texts(items: pd.DataFrame, max_chars: int = 1500) -> list[str]:
    """Concatenate title + description-like text per item, truncated."""
    title = items["title"].fillna("") if "title" in items else ""
    text = items["text"].fillna("") if "text" in items else ""
    return (title + ". " + text).str[:max_chars].tolist()


def train_content_model(
    items: pd.DataFrame,
    model_name: str = "BAAI/bge-base-en-v1.5",
    batch_size: int = 32,
    precomputed: np.ndarray | None = None,
) -> ContentModel:
    """Encode the catalog (or wrap precomputed embeddings) into a ContentModel.

    Args:
        items: catalog frame with at least ``item_id`` and text columns.
        model_name: sentence-transformers model id.
        batch_size: CPU-friendly encoding batch size.
        precomputed: optional (n_items, dim) matrix aligned with ``items``
            row order — used to reload exported embeddings without
            re-encoding.
    """
    item_ids = items["item_id"].to_numpy()
    if precomputed is not None:
        emb = precomputed.astype(np.float32)
        norms = np.linalg.norm(emb, axis=1, keepdims=True)
        emb = emb / np.maximum(norms, 1e-12)
    else:
        from sentence_transformers import SentenceTransformer

        encoder = SentenceTransformer(model_name)
        emb = encoder.encode(
            build_item_texts(items),
            batch_size=batch_size,
            show_progress_bar=True,
            normalize_embeddings=True,
        ).astype(np.float32)

    index = {item: row for row, item in enumerate(item_ids)}
    return ContentModel(item_ids=item_ids, embeddings=emb, index=index)
