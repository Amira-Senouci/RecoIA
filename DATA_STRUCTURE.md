# Data Structure

This repository is prepared so you can copy the Amazon Reviews 2023 files directly into the expected folders without changing code.

## Root layout

```text
recoia/
├── data/
│   ├── raw/
│   ├── processed/
│   └── temp/
├── artifacts/
├── cache/
├── logs/
├── model_outputs/
├── notebook_outputs/
├── reports/
└── results/
```

## Where to copy dataset files

Place the raw Amazon files here:

- `data/raw/All_Beauty/All_Beauty.jsonl.gz`
- `data/raw/All_Beauty/meta_All_Beauty.jsonl.gz`
- `data/raw/Health_and_Personal_Care/Health_and_Personal_Care.jsonl.gz`
- `data/raw/Health_and_Personal_Care/meta_Health_and_Personal_Care.jsonl.gz`
- `data/raw/Handmade_Products/Handmade_Products.jsonl.gz`
- `data/raw/Handmade_Products/meta_Handmade_Products.jsonl.gz`

The pipeline also accepts normalized filenames if you choose to rename the files later:

- `raw_review_<category>.jsonl.gz`
- `raw_meta_<category>.jsonl.gz`

## What the pipeline reads and writes

- `src/recsys/data/download.py` reads from `data/raw/` and skips files that already exist.
- `src/recsys/data/preprocess.py` reads the compressed or plain JSONL files above and writes:
  - `data/processed/interactions.parquet`
  - `data/processed/items.parquet`
  - `data/processed/stats.json`
- `backend/jobs/ingest_catalog.py` reads `data/processed/` plus the raw metadata files and upserts into PostgreSQL.

## Empty folders kept in git

These folders already exist and contain placeholder `.gitkeep` files so the structure stays intact:

- `data/raw/All_Beauty/`
- `data/raw/Health_and_Personal_Care/`
- `data/raw/Handmade_Products/`
- `data/raw/`
- `data/processed/`
- `data/temp/`
- `artifacts/`
- `cache/`
- `logs/`
- `reports/`
- `results/`
- `model_outputs/`
- `notebook_outputs/`

## Copy checklist

Before preprocessing, copy the six Amazon files listed above into `data/raw/` under their category folders. The pipeline accepts either `.jsonl.gz` or `.jsonl`, but the dataset ships compressed and that is the preferred layout.
