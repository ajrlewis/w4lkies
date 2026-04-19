"""legacy bridge revision for existing production stamp

Revision ID: 78019c1b4dbc
Revises: 20260325_0001
Create Date: 2026-04-19 21:20:00.000000
"""

from typing import Sequence, Union


# revision identifiers, used by Alembic.
revision: str = "78019c1b4dbc"
down_revision: Union[str, None] = "20260325_0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Legacy placeholder: this revision exists to match prior production state.
    return None


def downgrade() -> None:
    return None
