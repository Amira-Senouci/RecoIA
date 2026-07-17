# RecoIA v3 Architecture

This repo follows the P1 data phase from the RecoIA v3 prompt.

## Fixed categories

- `All_Beauty`
- `Health_and_Personal_Care`
- `Handmade_Products`

## Schema contract

The backend uses PostgreSQL tables for `users`, `items`, `events`, `user_profiles`, `recommendations_served`, `model_registry`, and `metrics_daily`.

The `items` table includes `has_image` so the serving layer can exclude products without a valid image from recommendation surfaces.

## Artifact contract

Training runs write versioned directories under `artifacts/<version>/` with a `manifest.json` file that lists every produced file and its SHA256 checksum.

The application refuses to boot if the active version is missing a manifest or if any listed artifact is absent or checksum-invalid.

## Data phase commands

- `python -m recsys.data.download`
- `python -m recsys.data.preprocess --max-interactions 1000000`
- `python -m backend.jobs.ingest_catalog`
