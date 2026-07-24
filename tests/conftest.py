from __future__ import annotations

from sqlalchemy import Engine, text


def get_latest_verification_code(engine: Engine, email: str) -> str:
    with engine.connect() as connection:
        row = connection.execute(
            text(
                "SELECT ev.code FROM email_verifications ev "
                "JOIN users u ON u.id = ev.user_id "
                "WHERE u.email = :email ORDER BY ev.id DESC LIMIT 1"
            ),
            {"email": email},
        ).first()
    assert row is not None, f"no verification code found for {email}"
    return row.code


def get_latest_reset_token(engine: Engine, email: str) -> str:
    with engine.connect() as connection:
        row = connection.execute(
            text(
                "SELECT pr.token FROM password_resets pr "
                "JOIN users u ON u.id = pr.user_id "
                "WHERE u.email = :email ORDER BY pr.id DESC LIMIT 1"
            ),
            {"email": email},
        ).first()
    assert row is not None, f"no reset token found for {email}"
    return row.token
