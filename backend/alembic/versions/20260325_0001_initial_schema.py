"""initial schema

Revision ID: 20260325_0001
Revises:
Create Date: 2026-03-25 00:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "20260325_0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "user",
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=True),
        sa.Column("email", sa.String(), nullable=True),
        sa.Column("password_hash", sa.String(), nullable=True),
        sa.Column("is_admin", sa.Boolean(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("created_by", sa.Integer(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("updated_by", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["created_by"], ["user.user_id"]),
        sa.ForeignKeyConstraint(["updated_by"], ["user.user_id"]),
        sa.PrimaryKeyConstraint("user_id"),
    )

    op.create_table(
        "customer",
        sa.Column("customer_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=True),
        sa.Column("phone", sa.String(), nullable=True),
        sa.Column("email", sa.String(), nullable=True),
        sa.Column("emergency_contact_name", sa.String(), nullable=True),
        sa.Column("emergency_contact_phone", sa.String(), nullable=True),
        sa.Column("signed_up_on", sa.DateTime(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("created_by", sa.Integer(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("updated_by", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["created_by"], ["user.user_id"]),
        sa.ForeignKeyConstraint(["updated_by"], ["user.user_id"]),
        sa.PrimaryKeyConstraint("customer_id"),
    )

    op.create_table(
        "vet",
        sa.Column("vet_id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("address", sa.String(length=255), nullable=False),
        sa.Column("phone", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("created_by", sa.Integer(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("updated_by", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["created_by"], ["user.user_id"]),
        sa.ForeignKeyConstraint(["updated_by"], ["user.user_id"]),
        sa.PrimaryKeyConstraint("vet_id"),
    )

    op.create_table(
        "service",
        sa.Column("service_id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("price", sa.Float(), nullable=False),
        sa.Column("description", sa.String(length=500), nullable=False),
        sa.Column("duration", sa.Float(), nullable=True),
        sa.Column("is_publicly_offered", sa.Boolean(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("created_by", sa.Integer(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("updated_by", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["created_by"], ["user.user_id"]),
        sa.ForeignKeyConstraint(["updated_by"], ["user.user_id"]),
        sa.PrimaryKeyConstraint("service_id"),
    )

    op.create_table(
        "invoice",
        sa.Column("invoice_id", sa.Integer(), nullable=False),
        sa.Column("date_start", sa.Date(), nullable=False),
        sa.Column("date_end", sa.Date(), nullable=False),
        sa.Column("date_issued", sa.Date(), nullable=False),
        sa.Column("date_due", sa.Date(), nullable=True),
        sa.Column("date_paid", sa.Date(), nullable=True),
        sa.Column("price_subtotal", sa.Float(), nullable=False),
        sa.Column("price_discount", sa.Float(), nullable=False),
        sa.Column("price_total", sa.Float(), nullable=False),
        sa.Column("customer_id", sa.Integer(), nullable=True),
        sa.Column("reference", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("created_by", sa.Integer(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("updated_by", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["created_by"], ["user.user_id"]),
        sa.ForeignKeyConstraint(["customer_id"], ["customer.customer_id"]),
        sa.ForeignKeyConstraint(["updated_by"], ["user.user_id"]),
        sa.PrimaryKeyConstraint("invoice_id"),
    )

    op.create_table(
        "expense",
        sa.Column("expense_id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("price", sa.Float(), nullable=False),
        sa.Column("description", sa.String(length=255), nullable=True),
        sa.Column("category", sa.String(length=255), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("created_by", sa.Integer(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("updated_by", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["created_by"], ["user.user_id"]),
        sa.ForeignKeyConstraint(["updated_by"], ["user.user_id"]),
        sa.PrimaryKeyConstraint("expense_id"),
    )

    op.create_table(
        "dog",
        sa.Column("dog_id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("date_of_birth", sa.Date(), nullable=True),
        sa.Column("is_allowed_treats", sa.Boolean(), nullable=False),
        sa.Column("is_allowed_off_the_lead", sa.Boolean(), nullable=False),
        sa.Column("is_allowed_on_social_media", sa.Boolean(), nullable=False),
        sa.Column("is_neutered_or_spayed", sa.Boolean(), nullable=False),
        sa.Column("behavioral_issues", sa.String(length=6000), nullable=False),
        sa.Column("medical_needs", sa.String(length=6000), nullable=False),
        sa.Column("breed", sa.String(length=255), nullable=True),
        sa.Column("customer_id", sa.Integer(), nullable=False),
        sa.Column("vet_id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("created_by", sa.Integer(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("updated_by", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["created_by"], ["user.user_id"]),
        sa.ForeignKeyConstraint(["customer_id"], ["customer.customer_id"]),
        sa.ForeignKeyConstraint(["updated_by"], ["user.user_id"]),
        sa.ForeignKeyConstraint(["vet_id"], ["vet.vet_id"]),
        sa.PrimaryKeyConstraint("dog_id"),
    )

    op.create_table(
        "booking",
        sa.Column("booking_id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("time", sa.Time(), nullable=False),
        sa.Column("customer_id", sa.Integer(), nullable=False),
        sa.Column("service_id", sa.Integer(), nullable=False),
        sa.Column("invoice_id", sa.Integer(), nullable=True),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("created_by", sa.Integer(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("updated_by", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["created_by"], ["user.user_id"]),
        sa.ForeignKeyConstraint(["customer_id"], ["customer.customer_id"]),
        sa.ForeignKeyConstraint(["invoice_id"], ["invoice.invoice_id"]),
        sa.ForeignKeyConstraint(["service_id"], ["service.service_id"]),
        sa.ForeignKeyConstraint(["updated_by"], ["user.user_id"]),
        sa.ForeignKeyConstraint(["user_id"], ["user.user_id"]),
        sa.PrimaryKeyConstraint("booking_id"),
    )


def downgrade() -> None:
    op.drop_table("booking")
    op.drop_table("dog")
    op.drop_table("expense")
    op.drop_table("invoice")
    op.drop_table("service")
    op.drop_table("vet")
    op.drop_table("customer")
    op.drop_table("user")
