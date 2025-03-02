"""add date column to cloud_cost

Revision ID: 723a8e53a4c5
Revises: 
Create Date: 2025-03-02 09:16:34.201010

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '723a8e53a4c5'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('cloud_cost', sa.Column('date', sa.String(), nullable=False, server_default='2025-03-01'))

def downgrade() -> None:
    op.drop_column('cloud_cost', 'date')
