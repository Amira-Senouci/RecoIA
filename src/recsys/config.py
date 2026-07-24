from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="RECOIA_", case_sensitive=False, env_file=".env", extra="ignore"
    )

    project_root: Path = Path(__file__).resolve().parents[2]
    data_dir: Path = project_root / "data"
    raw_data_dir: Path = data_dir / "raw"
    processed_data_dir: Path = data_dir / "processed"
    temp_data_dir: Path = data_dir / "temp"
    artifacts_dir: Path = project_root / "artifacts"
    logs_dir: Path = project_root / "logs"
    cache_dir: Path = project_root / "cache"
    reports_dir: Path = project_root / "reports"
    results_dir: Path = project_root / "results"
    model_outputs_dir: Path = project_root / "model_outputs"
    notebook_outputs_dir: Path = project_root / "notebook_outputs"
    database_url: str = "postgresql+psycopg://recoia:recoia@localhost:5432/recoia"
    active_version: str | None = None
    cors_origins: list[str] = ["http://localhost:4173"]
    jwt_secret: str = "dev-secret-change-me"
    jwt_expire_minutes: int = 1440
    frontend_base_url: str = "http://127.0.0.1:4173"
    smtp_host: str | None = None
    smtp_port: int = 587
    smtp_username: str | None = None
    smtp_password: str | None = None
    smtp_from_email: str | None = None

    def ensure_directories(self) -> None:
        for directory in (
            self.data_dir,
            self.raw_data_dir,
            self.processed_data_dir,
            self.temp_data_dir,
            self.artifacts_dir,
            self.logs_dir,
            self.cache_dir,
            self.reports_dir,
            self.results_dir,
            self.model_outputs_dir,
            self.notebook_outputs_dir,
        ):
            directory.mkdir(parents=True, exist_ok=True)


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
