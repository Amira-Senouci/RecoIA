from __future__ import annotations

import argparse
import json
from pathlib import Path

import pandas as pd

from recsys.config import get_settings
from recsys.models.retrievers import train_baseline_retrievers


def train_baselines(processed_root: Path) -> dict[str, object]:
    interactions = pd.read_parquet(processed_root / "interactions.parquet")
    retrievers = train_baseline_retrievers(interactions)
    return {
        "popularity_items": int(len(retrievers.popularity.item_scores)),
        "item_item_items": int(len(retrievers.item_item.neighbors)),
        "als_users": int(len(retrievers.als.user_index)),
        "als_items": int(len(retrievers.als.item_index)),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Train baseline recommenders from processed parquet data.")
    args = parser.parse_args()
    settings = get_settings()
    settings.ensure_directories()
    summary = train_baselines(settings.processed_data_dir)
    output_path = settings.results_dir / "baseline_summary.json"
    output_path.write_text(json.dumps(summary, indent=2), encoding="utf-8")
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
