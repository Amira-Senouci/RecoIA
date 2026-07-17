# RecoIA v3

Initial scaffold for the RecoIA v3 architecture.

## Data

The P1 data phase uses the real Amazon Reviews 2023 dataset for `All_Beauty`, `Health_and_Personal_Care`, and `Handmade_Products`.

Download the raw files:

```bash
python -m recsys.data.download
```

Preprocess them into parquet artifacts:

```bash
python -m recsys.data.preprocess --max-interactions 1000000
```

The notebook walkthrough lives in [notebooks/01_data_preprocessing.ipynb](notebooks/01_data_preprocessing.ipynb).

