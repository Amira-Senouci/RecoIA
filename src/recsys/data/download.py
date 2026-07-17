from __future__ import annotations

import argparse
import gzip
import json
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

from datasets import Dataset, DatasetDict, load_dataset

from recsys.config import get_settings

DATASET_ID = "McAuley-Lab/Amazon-Reviews-2023"
DEFAULT_CATEGORIES = (
    "All_Beauty",
    "Health_and_Personal_Care",
    "Handmade_Products",
)


@dataclass(frozen=True)
class DownloadedCategory:
    category: str
    review_path: Path
    meta_path: Path


def _resolve_split(dataset: Dataset | DatasetDict) -> Dataset:
    if isinstance(dataset, DatasetDict):
        if "full" in dataset:
            return dataset["full"]
        first_key = next(iter(dataset.keys()))
        return dataset[first_key]
    return dataset


def _write_jsonl(dataset: Dataset | DatasetDict, destination: Path) -> int:
    rows = 0
    destination.parent.mkdir(parents=True, exist_ok=True)
    with gzip.open(destination, "wt", encoding="utf-8") as handle:
        for row in _resolve_split(dataset):
            handle.write(json.dumps(row, ensure_ascii=False) + "\n")
            rows += 1
    return rows


def download_category(category: str, raw_root: Path) -> DownloadedCategory:
    category_dir = raw_root / category
    review_path = category_dir / f"raw_review_{category}.jsonl.gz"
    meta_path = category_dir / f"raw_meta_{category}.jsonl.gz"

    if not review_path.exists():
        review_dataset = load_dataset(
            DATASET_ID,
            f"raw_review_{category}",
            trust_remote_code=True,
        )
        _write_jsonl(review_dataset, review_path)

    if not meta_path.exists():
        meta_dataset = load_dataset(
            DATASET_ID,
            f"raw_meta_{category}",
            split="full",
            trust_remote_code=True,
        )
        _write_jsonl(meta_dataset, meta_path)

    return DownloadedCategory(category=category, review_path=review_path, meta_path=meta_path)


def download_categories(categories: Iterable[str] = DEFAULT_CATEGORIES) -> list[DownloadedCategory]:
    settings = get_settings()
    settings.ensure_directories()
    results = []
    for category in categories:
        results.append(download_category(category, settings.raw_data_dir))
    return results


def main() -> None:
    parser = argparse.ArgumentParser(description="Download Amazon Reviews 2023 raw review/meta files.")
    parser.add_argument("--category", action="append", dest="categories", help="Category to download; repeatable.")
    args = parser.parse_args()

    categories = tuple(args.categories) if args.categories else DEFAULT_CATEGORIES
    results = download_categories(categories)
    for result in results:
        print(f"{result.category}: {result.review_path} | {result.meta_path}")


if __name__ == "__main__":
    main()
