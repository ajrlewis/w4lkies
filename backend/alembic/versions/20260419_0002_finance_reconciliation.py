"""finance reconciliation tables

Revision ID: 20260419_0002
Revises: 20260325_0001
Create Date: 2026-04-19 00:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "20260419_0002"
down_revision: Union[str, None] = "78019c1b4dbc"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "bank_statement_import",
        sa.Column("bank_statement_import_id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("source", sa.String(length=50), nullable=False),
        sa.Column("file_name", sa.String(length=255), nullable=False),
        sa.Column("file_type", sa.String(length=16), nullable=False),
        sa.Column("currency", sa.String(length=16), nullable=True),
        sa.Column("date_start", sa.Date(), nullable=True),
        sa.Column("date_end", sa.Date(), nullable=True),
        sa.Column("transaction_count", sa.Integer(), nullable=False),
        sa.Column("imported_at", sa.DateTime(), nullable=False),
        sa.Column("imported_by", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("created_by", sa.Integer(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("updated_by", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["created_by"], ["user.user_id"]),
        sa.ForeignKeyConstraint(["imported_by"], ["user.user_id"]),
        sa.ForeignKeyConstraint(["updated_by"], ["user.user_id"]),
        sa.PrimaryKeyConstraint("bank_statement_import_id"),
    )

    op.create_table(
        "bank_transaction",
        sa.Column("bank_transaction_id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("bank_statement_import_id", sa.Integer(), nullable=False),
        sa.Column("transaction_date", sa.Date(), nullable=False),
        sa.Column("amount", sa.Float(), nullable=False),
        sa.Column("currency", sa.String(length=16), nullable=True),
        sa.Column("description", sa.String(length=1024), nullable=True),
        sa.Column("counterparty", sa.String(length=255), nullable=True),
        sa.Column("transaction_type", sa.String(length=100), nullable=True),
        sa.Column("status", sa.String(length=100), nullable=True),
        sa.Column("external_id", sa.String(length=255), nullable=True),
        sa.Column("raw_reference", sa.String(length=255), nullable=True),
        sa.Column("matched_invoice_id", sa.Integer(), nullable=True),
        sa.Column("matched_expense_id", sa.Integer(), nullable=True),
        sa.Column("matched_at", sa.DateTime(), nullable=True),
        sa.Column("matched_by", sa.Integer(), nullable=True),
        sa.Column("match_method", sa.String(length=32), nullable=True),
        sa.Column("match_confidence", sa.Float(), nullable=True),
        sa.Column("match_note", sa.String(length=1024), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("created_by", sa.Integer(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("updated_by", sa.Integer(), nullable=False),
        sa.CheckConstraint(
            "(matched_invoice_id IS NULL) OR (matched_expense_id IS NULL)",
            name="ck_bank_transaction_single_match_target",
        ),
        sa.ForeignKeyConstraint(
            ["bank_statement_import_id"],
            ["bank_statement_import.bank_statement_import_id"],
        ),
        sa.ForeignKeyConstraint(["created_by"], ["user.user_id"]),
        sa.ForeignKeyConstraint(["matched_by"], ["user.user_id"]),
        sa.ForeignKeyConstraint(["matched_expense_id"], ["expense.expense_id"]),
        sa.ForeignKeyConstraint(["matched_invoice_id"], ["invoice.invoice_id"]),
        sa.ForeignKeyConstraint(["updated_by"], ["user.user_id"]),
        sa.PrimaryKeyConstraint("bank_transaction_id"),
        sa.UniqueConstraint(
            "bank_statement_import_id",
            "external_id",
            name="uq_bank_transaction_import_external_id",
        ),
    )

    op.create_index(
        "ix_bank_transaction_import_id",
        "bank_transaction",
        ["bank_statement_import_id"],
    )
    op.create_index(
        "ix_bank_transaction_date",
        "bank_transaction",
        ["transaction_date"],
    )
    op.create_index(
        "ix_bank_transaction_amount",
        "bank_transaction",
        ["amount"],
    )
    op.create_index(
        "ix_bank_transaction_matched_invoice",
        "bank_transaction",
        ["matched_invoice_id"],
    )
    op.create_index(
        "ix_bank_transaction_matched_expense",
        "bank_transaction",
        ["matched_expense_id"],
    )


def downgrade() -> None:
    op.drop_index("ix_bank_transaction_matched_expense", table_name="bank_transaction")
    op.drop_index("ix_bank_transaction_matched_invoice", table_name="bank_transaction")
    op.drop_index("ix_bank_transaction_amount", table_name="bank_transaction")
    op.drop_index("ix_bank_transaction_date", table_name="bank_transaction")
    op.drop_index("ix_bank_transaction_import_id", table_name="bank_transaction")
    op.drop_table("bank_transaction")
    op.drop_table("bank_statement_import")
