"""merge heads

Revision ID: 95aea601d9d0
Revises: 65555c8f3b54, b8cbf2a5cd26
Create Date: 2026-01-05 14:30:39.135363

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '95aea601d9d0'
down_revision: Union[str, None] = ('65555c8f3b54', 'b8cbf2a5cd26')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
