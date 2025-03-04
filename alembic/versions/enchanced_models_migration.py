"""add enhanced data models

Revision ID: b23a9e53a5d6
Revises: 723a8e53a4c5
Create Date: 2025-03-03 14:20:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import sqlite

# revision identifiers, used by Alembic.
revision: str = 'b23a9e53a5d6'
down_revision: Union[str, None] = '723a8e53a4c5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Define JSON type that works with SQLite
JSON = sa.JSON().with_variant(sqlite.JSON, "sqlite")

def upgrade() -> None:
    # 1. Update the CloudCost table to add new columns
    op.add_column('cloud_cost', sa.Column('account_id', sa.String(), nullable=True, index=True))
    op.add_column('cloud_cost', sa.Column('region', sa.String(), nullable=True, index=True))
    op.add_column('cloud_cost', sa.Column('resource_id', sa.String(), nullable=True, index=True))
    op.add_column('cloud_cost', sa.Column('usage_quantity', sa.Float(), nullable=True))
    op.add_column('cloud_cost', sa.Column('usage_unit', sa.String(), nullable=True))
    
    # Replace metadata with extra_data if needed
    try:
        op.alter_column('cloud_cost', 'metadata', new_column_name='extra_data', type_=JSON)
    except:
        # Column might not exist or have a different name
        try:
            # If extra_data already exists, we don't need to do anything
            op.add_column('cloud_cost', sa.Column('extra_data', JSON, nullable=True))
        except:
            pass
    
    # Create indexes
    op.create_index('idx_cost_date_service', 'cloud_cost', ['date', 'service'])
    op.create_index('idx_cost_provider_date', 'cloud_cost', ['provider', 'date'])
    op.create_index('idx_cost_resource_date', 'cloud_cost', ['resource_id', 'date'])

    # 2. Update the Recommendation table
    op.add_column('recommendations', sa.Column('category', sa.String(), nullable=True, index=True))
    op.add_column('recommendations', sa.Column('title', sa.String(), nullable=True))
    op.add_column('recommendations', sa.Column('savings_percentage', sa.Float(), nullable=True))
    op.add_column('recommendations', sa.Column('confidence', sa.String(), nullable=True))
    op.add_column('recommendations', sa.Column('impact', sa.String(), nullable=True))
    op.add_column('recommendations', sa.Column('effort', sa.String(), nullable=True))
    op.add_column('recommendations', sa.Column('applied_at', sa.DateTime(), nullable=True))
    op.add_column('recommendations', sa.Column('rejected', sa.Boolean(), server_default='0', nullable=False, index=True))
    op.add_column('recommendations', sa.Column('rejected_reason', sa.String(), nullable=True))
    op.add_column('recommendations', sa.Column('resources', JSON, nullable=True))
    op.add_column('recommendations', sa.Column('actual_savings', sa.Float(), nullable=True))
    op.add_column('recommendations', sa.Column('effectiveness', sa.Float(), nullable=True))

    # 3. Create cloud_resources table
    op.create_table(
        'cloud_resources',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('resource_id', sa.String(), nullable=False, index=True, unique=True),
        sa.Column('provider', sa.String(), nullable=False, index=True),
        sa.Column('account_id', sa.String(), nullable=True, index=True),
        sa.Column('region', sa.String(), nullable=True, index=True),
        sa.Column('service', sa.String(), nullable=False, index=True),
        sa.Column('resource_type', sa.String(), nullable=False, index=True),
        sa.Column('name', sa.String(), nullable=True, index=True),
        sa.Column('status', sa.String(), nullable=True, index=True),
        sa.Column('creation_date', sa.DateTime(), nullable=True),
        sa.Column('last_active', sa.DateTime(), nullable=True),
        sa.Column('attributes', JSON, nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP'))
    )

    # 4. Create resource_tags table
    op.create_table(
        'resource_tags',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('key', sa.String(), nullable=False, index=True),
        sa.Column('value', sa.String(), nullable=True, index=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP'))
    )
    op.create_index('idx_tag_key_value', 'resource_tags', ['key', 'value'], unique=True)

    # 5. Create resource_tag_association table
    op.create_table(
        'resource_tag_association',
        sa.Column('resource_id', sa.Integer(), sa.ForeignKey('cloud_resources.id')),
        sa.Column('tag_id', sa.Integer(), sa.ForeignKey('resource_tags.id'))
    )

    # 6. Create cost_anomalies table
    op.create_table(
        'cost_anomalies',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('provider', sa.String(), nullable=False, index=True),
        sa.Column('service', sa.String(), nullable=False, index=True),
        sa.Column('resource_id', sa.String(), nullable=True, index=True),
        sa.Column('date', sa.String(), nullable=False, index=True),
        sa.Column('cost', sa.Float(), nullable=False),
        sa.Column('baseline_cost', sa.Float(), nullable=True),
        sa.Column('deviation', sa.Float(), nullable=True),
        sa.Column('anomaly_score', sa.Float(), nullable=True),
        sa.Column('detection_method', sa.String(), nullable=True),
        sa.Column('status', sa.String(), nullable=False, server_default='open', index=True),
        sa.Column('resolution', sa.String(), nullable=True),
        sa.Column('root_cause', JSON, nullable=True),
        sa.Column('cloud_context', JSON, nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP'), index=True),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP'))
    )

    # 7. Create cost_forecasts table
    op.create_table(
        'cost_forecasts',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('provider', sa.String(), nullable=True, index=True),
        sa.Column('service', sa.String(), nullable=True, index=True),
        sa.Column('target_date', sa.String(), nullable=False, index=True),
        sa.Column('predicted_cost', sa.Float(), nullable=False),
        sa.Column('lower_bound', sa.Float(), nullable=True),
        sa.Column('upper_bound', sa.Float(), nullable=True),
        sa.Column('confidence', sa.String(), nullable=True),
        sa.Column('algorithm', sa.String(), nullable=True),
        sa.Column('data_points_used', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP'), index=True)
    )

    # 8. Create budget_alerts table
    op.create_table(
        'budget_alerts',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('provider', sa.String(), nullable=True, index=True),
        sa.Column('service', sa.String(), nullable=True, index=True),
        sa.Column('account_id', sa.String(), nullable=True, index=True),
        sa.Column('tag_key', sa.String(), nullable=True),
        sa.Column('tag_value', sa.String(), nullable=True),
        sa.Column('time_period', sa.String(), nullable=False),
        sa.Column('amount', sa.Float(), nullable=False),
        sa.Column('threshold_percentage', sa.Float(), nullable=False),
        sa.Column('current_usage', sa.Float(), nullable=True),
        sa.Column('last_evaluated', sa.DateTime(), nullable=True),
        sa.Column('status', sa.String(), nullable=False, server_default='active', index=True),
        sa.Column('email_recipients', JSON, nullable=True),
        sa.Column('webhook_url', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP'))
    )

    # 9. Create alert_history table
    op.create_table(
        'alert_history',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('budget_id', sa.Integer(), sa.ForeignKey('budget_alerts.id'), nullable=True, index=True),
        sa.Column('anomaly_id', sa.Integer(), sa.ForeignKey('cost_anomalies.id'), nullable=True, index=True),
        sa.Column('alert_type', sa.String(), nullable=False, index=True),
        sa.Column('severity', sa.String(), nullable=False, index=True),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('data', JSON, nullable=True),
        sa.Column('acknowledged', sa.Boolean(), server_default='0', nullable=False, index=True),
        sa.Column('acknowledged_at', sa.DateTime(), nullable=True),
        sa.Column('acknowledged_by', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP'), index=True)
    )

    # 10. Create organization_units table
    op.create_table(
        'organization_units',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('name', sa.String(), nullable=False, index=True),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('external_id', sa.String(), nullable=True, index=True),
        sa.Column('parent_id', sa.Integer(), sa.ForeignKey('organization_units.id'), nullable=True, index=True),
        sa.Column('path', sa.String(), nullable=True, index=True),
        sa.Column('account_ids', JSON, nullable=True),
        sa.Column('metadata', JSON, nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP'))
    )

    # 11. Create cost_allocations table
    op.create_table(
        'cost_allocations',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('entity_type', sa.String(), nullable=False, index=True),
        sa.Column('entity_id', sa.String(), nullable=False, index=True),
        sa.Column('entity_name', sa.String(), nullable=False, index=True),
        sa.Column('date', sa.String(), nullable=False, index=True),
        sa.Column('provider', sa.String(), nullable=True, index=True),
        sa.Column('service', sa.String(), nullable=True, index=True),
        sa.Column('cost', sa.Float(), nullable=False),
        sa.Column('allocation_method', sa.String(), nullable=False),
        sa.Column('allocated_by', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP'))
    )
    op.create_index('idx_allocation_entity_date', 'cost_allocations', ['entity_type', 'entity_id', 'date'])
    op.create_index('idx_allocation_date_service', 'cost_allocations', ['date', 'service'])

    # 12. Create cost_categories table
    op.create_table(
        'cost_categories',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('name', sa.String(), nullable=False, index=True),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('rules', JSON, nullable=False),
        sa.Column('created_by', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP'))
    )

    # 13. Create resource_utilizations table
    op.create_table(
        'resource_utilizations',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('resource_id', sa.String(), nullable=False, index=True),
        sa.Column('date', sa.String(), nullable=False, index=True),
        sa.Column('timestamp', sa.DateTime(), nullable=False, index=True),
        sa.Column('provider', sa.String(), nullable=False, index=True),
        sa.Column('service', sa.String(), nullable=False, index=True),
        sa.Column('metric_name', sa.String(), nullable=False, index=True),
        sa.Column('metric_value', sa.Float(), nullable=False),
        sa.Column('metric_unit', sa.String(), nullable=True),
        sa.Column('period', sa.Integer(), nullable=True),
        sa.Column('statistic', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP'))
    )
    op.create_index('idx_utilization_resource_metric_date', 'resource_utilizations', ['resource_id', 'metric_name', 'date'])
    op.create_index('idx_utilization_service_metric_date', 'resource_utilizations', ['service', 'metric_name', 'date'])

    # 14. Create saved_reports table
    op.create_table(
        'saved_reports',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('name', sa.String(), nullable=False, index=True),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('report_type', sa.String(), nullable=False, index=True),
        sa.Column('filters', JSON, nullable=True),
        sa.Column('grouping', JSON, nullable=True),
        sa.Column('time_range', JSON, nullable=True),
        sa.Column('visualization', JSON, nullable=True),
        sa.Column('is_scheduled', sa.Boolean(), server_default='0', nullable=False),
        sa.Column('schedule', JSON, nullable=True),
        sa.Column('created_by', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP'))
    )

    # 15. Create optimization_policies table
    op.create_table(
        'optimization_policies',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('name', sa.String(), nullable=False, index=True),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('resource_type', sa.String(), nullable=False, index=True),
        sa.Column('provider', sa.String(), nullable=False, index=True),
        sa.Column('service', sa.String(), nullable=False, index=True),
        sa.Column('criteria', JSON, nullable=False),
        sa.Column('action', sa.String(), nullable=False),
        sa.Column('parameters', JSON, nullable=True),
        sa.Column('is_automatic', sa.Boolean(), server_default='0', nullable=False),
        sa.Column('approval_required', sa.Boolean(), server_default='1', nullable=False),
        sa.Column('enabled', sa.Boolean(), server_default='1', nullable=False, index=True),
        sa.Column('created_by', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP'))
    )

def downgrade() -> None:
    # Drop new tables in reverse order
    op.drop_table('optimization_policies')
    op.drop_table('saved_reports')
    op.drop_table('resource_utilizations')
    op.drop_table('cost_categories')
    op.drop_table('cost_allocations')
    op.drop_table('organization_units')
    op.drop_table('alert_history')
    op.drop_table('budget_alerts')
    op.drop_table('cost_forecasts')
    op.drop_table('cost_anomalies')
    op.drop_table('resource_tag_association')
    op.drop_table('resource_tags')
    op.drop_table('cloud_resources')
    
    # Remove new columns from recommendations table
    op.drop_column('recommendations', 'category')
    op.drop_column('recommendations', 'title')
    op.drop_column('recommendations', 'savings_percentage')
    op.drop_column('recommendations', 'confidence')
    op.drop_column('recommendations', 'impact')
    op.drop_column('recommendations', 'effort')
    op.drop_column('recommendations', 'applied_at')
    op.drop_column('recommendations', 'rejected')
    op.drop_column('recommendations', 'rejected_reason')
    op.drop_column('recommendations', 'resources')
    op.drop_column('recommendations', 'actual_savings')
    op.drop_column('recommendations', 'effectiveness')
    
    # Remove new columns from cloud_cost table
    op.drop_column('cloud_cost', 'account_id')
    op.drop_column('cloud_cost', 'region')
    op.drop_column('cloud_cost', 'resource_id')
    op.drop_column('cloud_cost', 'usage_quantity')
    op.drop_column('cloud_cost', 'usage_unit')
    
    # Drop indexes
    op.drop_index('idx_cost_date_service', 'cloud_cost')
    op.drop_index('idx_cost_provider_date', 'cloud_cost')
    op.drop_index('idx_cost_resource_date', 'cloud_cost')
    
    # Try to rename extra_data back to metadata
    try:
        op.alter_column('cloud_cost', 'extra_data', new_column_name='metadata')
    except:
        pass