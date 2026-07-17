from __future__ import annotations

from dataclasses import dataclass

from .artifacts import ArtifactBundle


@dataclass(frozen=True)
class RecommenderService:
    bundle: ArtifactBundle

    def health(self) -> dict[str, str]:
        return {"status": "ok", "version": self.bundle.version}
