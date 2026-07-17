from __future__ import annotations

import json
from dataclasses import dataclass
from hashlib import sha256
from pathlib import Path

from sqlalchemy import Engine, text


@dataclass(frozen=True)
class ArtifactManifestEntry:
    path: str
    sha256: str
    notebook: str


@dataclass(frozen=True)
class ArtifactBundle:
    version: str
    root: Path
    manifest_path: Path
    entries: list[ArtifactManifestEntry]


class ArtifactError(RuntimeError):
    pass


def _load_manifest(manifest_path: Path) -> ArtifactBundle:
    payload = json.loads(manifest_path.read_text(encoding="utf-8"))
    entries = [ArtifactManifestEntry(**entry) for entry in payload["files"]]
    return ArtifactBundle(
        version=payload["version"],
        root=manifest_path.parent,
        manifest_path=manifest_path,
        entries=entries,
    )


def _verify_entry(root: Path, entry: ArtifactManifestEntry) -> None:
    file_path = root / entry.path
    if not file_path.is_file():
        raise ArtifactError(f"Missing artifact file: {entry.path}")
    digest = sha256(file_path.read_bytes()).hexdigest()
    if digest != entry.sha256:
        raise ArtifactError(f"Checksum mismatch for {entry.path}")


def load_artifact_bundle(artifacts_dir: Path, version: str) -> ArtifactBundle:
    manifest_path = artifacts_dir / version / "manifest.json"
    if not manifest_path.is_file():
        raise ArtifactError(f"Missing manifest: {manifest_path}")
    bundle = _load_manifest(manifest_path)
    for entry in bundle.entries:
        _verify_entry(bundle.root, entry)
    return bundle


def load_active_version(engine: Engine) -> str:
    query = text(
        """
        SELECT version
        FROM model_registry
        WHERE is_active = TRUE
        ORDER BY trained_at DESC NULLS LAST, id DESC
        LIMIT 1
        """
    )
    with engine.connect() as connection:
        result = connection.execute(query).scalar_one_or_none()
    if result is None:
        raise ArtifactError("No active model version registered")
    return str(result)
