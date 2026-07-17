from __future__ import annotations

import json
from hashlib import sha256
from pathlib import Path

import pytest

from recsys.serving.artifacts import ArtifactError, load_artifact_bundle


def _write_manifest(root: Path) -> None:
    payload = b"alive"
    artifact = root / "ranker.txt"
    artifact.write_bytes(payload)
    (root / "manifest.json").write_text(
        json.dumps(
            {
                "version": "v2026-07-16",
                "files": [
                    {
                        "path": "ranker.txt",
                        "sha256": sha256(payload).hexdigest(),
                        "notebook": "08_Ranking_LightGBM",
                    }
                ],
            }
        ),
        encoding="utf-8",
    )


def test_load_artifact_bundle_validates_manifest(tmp_path: Path) -> None:
    version_dir = tmp_path / "v2026-07-16"
    version_dir.mkdir()
    _write_manifest(version_dir)

    bundle = load_artifact_bundle(tmp_path, "v2026-07-16")

    assert bundle.version == "v2026-07-16"
    assert bundle.entries[0].path == "ranker.txt"


def test_load_artifact_bundle_refuses_missing_files(tmp_path: Path) -> None:
    version_dir = tmp_path / "v2026-07-16"
    version_dir.mkdir()
    (version_dir / "manifest.json").write_text(
        json.dumps(
            {
                "version": "v2026-07-16",
                "files": [
                    {
                        "path": "ranker.txt",
                        "sha256": "0" * 64,
                        "notebook": "08_Ranking_LightGBM",
                    }
                ],
            }
        ),
        encoding="utf-8",
    )

    with pytest.raises(ArtifactError):
        load_artifact_bundle(tmp_path, "v2026-07-16")
