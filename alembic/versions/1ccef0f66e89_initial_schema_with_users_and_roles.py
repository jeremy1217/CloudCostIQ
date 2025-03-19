"""Initial schema with users and roles

Revision ID: 1ccef0f66e89
Revises: 
Create Date: 2024-03-19 01:42:42.123456

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1ccef0f66e89'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create roles table
    op.create_table(
        'roles',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=80), nullable=False),
        sa.Column('description', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )
    op.create_index(op.f('ix_roles_id'), 'roles', ['id'], unique=False)

    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('username', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=True),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email'),
        sa.UniqueConstraint('username')
    )
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_username'), 'users', ['username'], unique=True)

    # Create user_role_association table
    op.create_table(
        'user_role_association',
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('role_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['role_id'], ['roles.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.UniqueConstraint('user_id', 'role_id', name='uq_user_role')
    )

    # Create cloud_costs table
    op.create_table(
        'cloud_costs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('provider', sa.String(), nullable=False),
        sa.Column('service', sa.String(), nullable=False),
        sa.Column('cost', sa.Integer(), nullable=False),
        sa.Column('date', sa.DateTime(), nullable=False),
        sa.Column('timestamp', sa.DateTime(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_cloud_costs_id'), 'cloud_costs', ['id'], unique=False)
    op.create_index(op.f('ix_cloud_costs_date'), 'cloud_costs', ['date'], unique=False)
    op.create_index(op.f('ix_cloud_costs_provider'), 'cloud_costs', ['provider'], unique=False)
    op.create_index(op.f('ix_cloud_costs_service'), 'cloud_costs', ['service'], unique=False)

    # Create cloud_resources table
    op.create_table(
        'cloud_resources',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('resource_id', sa.String(), nullable=False),
        sa.Column('provider', sa.String(), nullable=False),
        sa.Column('account_id', sa.String(), nullable=True),
        sa.Column('region', sa.String(), nullable=True),
        sa.Column('service', sa.String(), nullable=False),
        sa.Column('resource_type', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=True),
        sa.Column('status', sa.String(), nullable=True),
        sa.Column('creation_date', sa.DateTime(), nullable=True),
        sa.Column('last_active', sa.DateTime(), nullable=True),
        sa.Column('attributes', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_cloud_resources_account_id'), 'cloud_resources', ['account_id'], unique=False)
    op.create_index(op.f('ix_cloud_resources_id'), 'cloud_resources', ['id'], unique=False)
    op.create_index(op.f('ix_cloud_resources_name'), 'cloud_resources', ['name'], unique=False)
    op.create_index(op.f('ix_cloud_resources_provider'), 'cloud_resources', ['provider'], unique=False)
    op.create_index(op.f('ix_cloud_resources_region'), 'cloud_resources', ['region'], unique=False)
    op.create_index(op.f('ix_cloud_resources_resource_id'), 'cloud_resources', ['resource_id'], unique=True)
    op.create_index(op.f('ix_cloud_resources_resource_type'), 'cloud_resources', ['resource_type'], unique=False)
    op.create_index(op.f('ix_cloud_resources_service'), 'cloud_resources', ['service'], unique=False)
    op.create_index(op.f('ix_cloud_resources_status'), 'cloud_resources', ['status'], unique=False)

    # Create recommendations table
    op.create_table(
        'recommendations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('provider', sa.String(), nullable=False),
        sa.Column('service', sa.String(), nullable=False),
        sa.Column('suggestion', sa.String(), nullable=False),
        sa.Column('command', sa.String(), nullable=False),
        sa.Column('savings', sa.Float(), nullable=False),
        sa.Column('applied', sa.Boolean(), nullable=True),
        sa.Column('timestamp', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_recommendations_id'), 'recommendations', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_recommendations_id'), table_name='recommendations')
    op.drop_table('recommendations')
    
    op.drop_index(op.f('ix_cloud_resources_status'), table_name='cloud_resources')
    op.drop_index(op.f('ix_cloud_resources_service'), table_name='cloud_resources')
    op.drop_index(op.f('ix_cloud_resources_resource_type'), table_name='cloud_resources')
    op.drop_index(op.f('ix_cloud_resources_resource_id'), table_name='cloud_resources')
    op.drop_index(op.f('ix_cloud_resources_region'), table_name='cloud_resources')
    op.drop_index(op.f('ix_cloud_resources_provider'), table_name='cloud_resources')
    op.drop_index(op.f('ix_cloud_resources_name'), table_name='cloud_resources')
    op.drop_index(op.f('ix_cloud_resources_id'), table_name='cloud_resources')
    op.drop_index(op.f('ix_cloud_resources_account_id'), table_name='cloud_resources')
    op.drop_table('cloud_resources')
    
    op.drop_index(op.f('ix_cloud_costs_service'), table_name='cloud_costs')
    op.drop_index(op.f('ix_cloud_costs_provider'), table_name='cloud_costs')
    op.drop_index(op.f('ix_cloud_costs_date'), table_name='cloud_costs')
    op.drop_index(op.f('ix_cloud_costs_id'), table_name='cloud_costs')
    op.drop_table('cloud_costs')
    
    op.drop_table('user_role_association')
    op.drop_index(op.f('ix_users_username'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_table('users')
    op.drop_index(op.f('ix_roles_id'), table_name='roles')
    op.drop_table('roles')
