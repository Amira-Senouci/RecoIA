from __future__ import annotations

import pytest


@pytest.fixture(autouse=True)
def stub_email_sending(monkeypatch: pytest.MonkeyPatch) -> None:
    """No real SMTP in these API tests -- verification codes/reset tokens are
    read straight out of the database instead (see tests/conftest.py's
    get_latest_* helpers). The actual send_email() implementation has its own
    dedicated tests in tests/test_email.py, unaffected by this stub."""
    monkeypatch.setattr("backend.app.email.send_email", lambda **kwargs: None)
