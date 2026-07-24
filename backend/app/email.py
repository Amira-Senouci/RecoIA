from __future__ import annotations

import smtplib
from email.message import EmailMessage

from recsys.config import get_settings


class EmailNotConfiguredError(RuntimeError):
    pass


class EmailDeliveryError(RuntimeError):
    pass


def send_email(to: str, subject: str, body: str) -> None:
    settings = get_settings()
    if not (settings.smtp_host and settings.smtp_username and settings.smtp_password and settings.smtp_from_email):
        raise EmailNotConfiguredError(
            "Email sending is not configured. Set RECOIA_SMTP_HOST, RECOIA_SMTP_USERNAME, "
            "RECOIA_SMTP_PASSWORD, and RECOIA_SMTP_FROM_EMAIL in .env."
        )

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = f"RecoIA <{settings.smtp_from_email}>"
    message["To"] = to
    message.set_content(body)

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=10) as server:
            server.starttls()
            server.login(settings.smtp_username, settings.smtp_password)
            server.send_message(message)
    except (smtplib.SMTPException, OSError) as exc:
        raise EmailDeliveryError(f"Could not send email to {to}: {exc}") from exc
