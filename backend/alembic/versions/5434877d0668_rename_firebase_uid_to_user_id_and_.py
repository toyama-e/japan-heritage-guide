"""rename firebase_uid to user_id and change type to int

Revision ID: 5434877d0668
Revises: a470392a7df4
Create Date: 2026-01-06 07:04:50.013369

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5434877d0668'
down_revision: Union[str, None] = 'a470392a7df4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1) 既存の制約・indexを外す（参照元が変わるため）
    op.drop_constraint('uq_visits_user_heritage', 'visits', type_='unique')
    op.drop_index('ix_visits_firebase_uid', table_name='visits')

    # 2) カラム名変更（firebase_uid -> user_id）
    op.alter_column('visits', 'firebase_uid', new_column_name='user_id')

    # 3) 型変更（text/varchar -> int）
    op.alter_column(
        'visits',
        'user_id',
        type_=sa.Integer(),
        postgresql_using='user_id::integer',
        nullable=False,
    )

    # 4) index を user_id で作り直し
    op.create_index('ix_visits_user_id', 'visits', ['user_id'], unique=False)

    # 5) unique 制約を user_id 基準で作り直し
    op.create_unique_constraint(
        'uq_visits_user_heritage',
        'visits',
        ['user_id', 'world_heritage_id']
    )

    # 6) FK（users が存在するなら追加）
    op.create_foreign_key(
        'fk_visits_user_id_users',
        'visits',
        'users',
        ['user_id'],
        ['id'],
        ondelete='CASCADE'
    )


def downgrade() -> None:
    op.drop_constraint('fk_visits_user_id_users', 'visits', type_='foreignkey')
    op.drop_constraint('uq_visits_user_heritage', 'visits', type_='unique')
    op.drop_index('ix_visits_user_id', table_name='visits')

    op.alter_column(
        'visits',
        'user_id',
        type_=sa.VARCHAR(),
        postgresql_using='user_id::text',
        nullable=False,
    )
    op.alter_column('visits', 'user_id', new_column_name='firebase_uid')

    op.create_index('ix_visits_firebase_uid', 'visits', ['firebase_uid'], unique=False)
    op.create_unique_constraint('uq_visits_user_heritage', 'visits', ['firebase_uid', 'world_heritage_id'])

