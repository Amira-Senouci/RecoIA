"""Initial schema for RecoIA v3."""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "0001_initial_schema"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("email", sa.Text(), nullable=False, unique=True),
        sa.Column("password_hash", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("is_admin", sa.Boolean(), server_default=sa.text("false")),
    )

    op.create_table(
        "items",
        sa.Column("item_id", sa.Text(), primary_key=True),
        sa.Column("title", sa.Text()),
        sa.Column("brand", sa.Text()),
        sa.Column("category", sa.Text()),
        sa.Column("price", sa.Numeric()),
        sa.Column("image_url", sa.Text()),
        sa.Column("has_image", sa.Boolean(), server_default=sa.text("true")),
        sa.Column("avg_rating", sa.Float()),
        sa.Column("n_ratings", sa.Integer()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )

    op.create_table(
        "events",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("user_id", sa.BigInteger(), sa.ForeignKey("users.id")),
        sa.Column("item_id", sa.Text(), sa.ForeignKey("items.item_id")),
        sa.Column("event_type", sa.Text(), nullable=False),
        sa.Column("value", sa.Float()),
        sa.Column("query", sa.Text()),
        sa.Column("session_id", sa.Uuid()),
        sa.Column("ts", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )
    op.create_index("ix_events_user_id_ts_desc", "events", ["user_id", "ts"], postgresql_ops={"ts": "DESC"})
    op.create_index("ix_events_item_id_event_type", "events", ["item_id", "event_type"])

    op.create_table(
        "user_profiles",
        sa.Column("user_id", sa.BigInteger(), sa.ForeignKey("users.id"), primary_key=True),
        sa.Column("profile_vec", sa.LargeBinary()),
        sa.Column("category_prefs", sa.JSON()),
        sa.Column("seen_items", sa.ARRAY(sa.Text())),
        sa.Column("updated_at", sa.DateTime(timezone=True)),
    )

    op.create_table(
        "recommendations_served",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("user_id", sa.BigInteger()),
        sa.Column("item_id", sa.Text()),
        sa.Column("rank", sa.Integer()),
        sa.Column("surface", sa.Text()),
        sa.Column("model_ver", sa.Text()),
        sa.Column("ts", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("clicked", sa.Boolean(), server_default=sa.text("false")),
    )

    op.create_table(
        "model_registry",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("version", sa.Text()),
        sa.Column("path", sa.Text()),
        sa.Column("trained_at", sa.DateTime(timezone=True)),
        sa.Column("metrics", sa.JSON()),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("false")),
    )

    op.create_table(
        "metrics_daily",
        sa.Column("day", sa.Date(), primary_key=True),
        sa.Column("metric", sa.Text(), primary_key=True),
        sa.Column("value", sa.Float()),
    )


def downgrade() -> None:
    op.drop_table("metrics_daily")
    op.drop_table("model_registry")
    op.drop_table("recommendations_served")
    op.drop_table("user_profiles")
    op.drop_index("ix_events_item_id_event_type", table_name="events")
    op.drop_index("ix_events_user_id_ts_desc", table_name="events")
    op.drop_table("events")
    op.drop_table("items")
    op.drop_table("users")
