from __future__ import annotations

import smtplib

import pytest

from backend.app import email as email_module
from recsys.config import Settings


def test_send_email_requires_smtp_configuration(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(email_module, "get_settings", lambda: Settings())
    with pytest.raises(email_module.EmailNotConfiguredError):
        email_module.send_email(to="user@example.com", subject="hi", body="hello")


def test_send_email_wraps_smtp_failures(monkeypatch: pytest.MonkeyPatch) -> None:
    configured = Settings(
        smtp_host="smtp.example.com",
        smtp_username="bot@example.com",
        smtp_password="secret",
        smtp_from_email="bot@example.com",
    )
    monkeypatch.setattr(email_module, "get_settings", lambda: configured)

    class ExplodingSMTP:
        def __init__(self, *args, **kwargs) -> None:
            raise smtplib.SMTPConnectError(421, "could not connect")

    monkeypatch.setattr(smtplib, "SMTP", ExplodingSMTP)

    with pytest.raises(email_module.EmailDeliveryError):
        email_module.send_email(to="user@example.com", subject="hi", body="hello")


def test_send_email_succeeds_with_valid_smtp(monkeypatch: pytest.MonkeyPatch) -> None:
    configured = Settings(
        smtp_host="smtp.example.com",
        smtp_username="bot@example.com",
        smtp_password="secret",
        smtp_from_email="bot@example.com",
    )
    monkeypatch.setattr(email_module, "get_settings", lambda: configured)

    sent_messages = []

    class FakeSMTP:
        def __init__(self, *args, **kwargs) -> None:
            pass

        def __enter__(self):
            return self

        def __exit__(self, *args) -> None:
            return None

        def starttls(self) -> None:
            pass

        def login(self, username: str, password: str) -> None:
            assert username == "bot@example.com"
            assert password == "secret"

        def send_message(self, message) -> None:
            sent_messages.append(message)

    monkeypatch.setattr(smtplib, "SMTP", FakeSMTP)

    email_module.send_email(to="user@example.com", subject="Your code", body="123456")

    assert len(sent_messages) == 1
    assert sent_messages[0]["To"] == "user@example.com"
    assert sent_messages[0]["Subject"] == "Your code"
