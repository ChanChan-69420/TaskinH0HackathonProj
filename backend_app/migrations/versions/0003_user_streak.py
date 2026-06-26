"""Add current_streak and last_active_at to user_gamification

Revision ID: 0003_user_streak
Revises: 0002_task_bonus_points
Create Date: 2026-06-15 14:38:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0003_user_streak'
down_revision: Union[str, None] = '0002_task_bonus_points'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('user_gamification', sa.Column('current_streak', sa.Integer(), server_default='0', nullable=False))
    op.add_column('user_gamification', sa.Column('last_active_at', sa.Date(), nullable=True))


def downgrade() -> None:
    op.drop_column('user_gamification', 'last_active_at')
    op.drop_column('user_gamification', 'current_streak')
