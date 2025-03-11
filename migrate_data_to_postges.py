"""
Script to migrate data from SQLite to PostgreSQL.
This script handles data transfer after the PostgreSQL schema has been created.
"""

import os
import sys
from pathlib import Path
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Add project root to Python path
project_root = Path(__file__).resolve().parent
sys.path.insert(0, str(project_root))

# SQLAlchemy imports
import sqlalchemy as sa
from sqlalchemy.orm import sessionmaker

# Import models - ensure all models are imported
from backend.models.user import UserModel, RoleModel, ApiKeyModel
from backend.models.cloud_cost import CloudCost
from backend.models.recommendation import Recommendation
from backend.models.anomaly import CostAnomaly
from backend.models.budget import BudgetAlert, AlertHistory
from backend.models.resource import CloudResource, ResourceTag
from backend.models.allocation import CostAllocation, CostCategory
from backend.models.forecast import CostForecast
from backend.models.organization import OrganizationUnit
from backend.models.policy import OptimizationPolicy
from backend.models.report import SavedReport
from backend.models.utilization import ResourceUtilization

# Define the model order for migration (to respect foreign key constraints)
MODEL_ORDER = [
    UserModel, RoleModel, ApiKeyModel,  # Users must come before cloud_costs
    CloudCost, Recommendation, 
    CostAnomaly, CostForecast,
    CloudResource, ResourceTag,
    BudgetAlert, AlertHistory,
    OrganizationUnit, CostAllocation, CostCategory,
    OptimizationPolicy, SavedReport, ResourceUtilization
]

# SQLite connection
sqlite_path = os.path.join(project_root, 'backend', 'database', 'cloudcostiq.db')
sqlite_url = f"sqlite:///{sqlite_path}"
sqlite_engine = sa.create_engine(sqlite_url)
SQLiteSession = sessionmaker(bind=sqlite_engine)

# PostgreSQL connection
from backend.config import settings
postgres_engine = sa.create_engine(settings.DATABASE_URL)
PostgresSession = sessionmaker(bind=postgres_engine)

def migrate_data():
    """Migrate data from SQLite to PostgreSQL"""
    logger.info("Starting data migration from SQLite to PostgreSQL...")
    
    # First check if SQLite database exists
    if not os.path.exists(sqlite_path):
        logger.error(f"SQLite database not found at: {sqlite_path}")
        return
        
    # Check if PostgreSQL database is accessible
    try:
        conn = postgres_engine.connect()
        conn.close()
    except Exception as e:
        logger.error(f"Cannot connect to PostgreSQL database: {str(e)}")
        return
    
    # For each model, transfer data in the correct order
    total_records = 0
    
    for model in MODEL_ORDER:
        model_name = model.__name__
        logger.info(f"Migrating {model_name}...")
        
        sqlite_session = SQLiteSession()
        postgres_session = PostgresSession()
        
        try:
            # Get records from SQLite
            records = sqlite_session.query(model).all()
            
            if not records:
                logger.info(f"  No records found for {model_name}")
                continue
                
            # For each record, create a copy in PostgreSQL
            count = 0
            for record in records:
                # Build a dictionary of column values
                record_dict = {}
                for column in model.__table__.columns:
                    # Get the value, handling potential AttributeError
                    try:
                        value = getattr(record, column.name)
                    except AttributeError:
                        logger.warning(f"  Column {column.name} not found in {model_name}")
                        continue
                    
                    # Handle JSON conversion
                    if isinstance(column.type, sa.JSON) and isinstance(value, str):
                        try:
                            record_dict[column.name] = json.loads(value)
                        except (json.JSONDecodeError, TypeError):
                            # If JSON parsing fails, keep as string
                            record_dict[column.name] = value
                    else:
                        record_dict[column.name] = value
                
                # Create new record in PostgreSQL
                try:
                    new_record = model(**record_dict)
                    postgres_session.add(new_record)
                    count += 1
                    
                    # Commit in batches to avoid memory issues
                    if count % 100 == 0:
                        postgres_session.commit()
                        logger.info(f"  Migrated {count} records for {model_name}")
                        
                except Exception as e:
                    logger.error(f"  Error creating {model_name} record: {str(e)}")
                    postgres_session.rollback()
                    
                    # Try again without problematic columns (optional)
                    try:
                        # Create a sanitized record dictionary
                        safe_dict = {}
                        for key, value in record_dict.items():
                            if key in ['id', 'created_at', 'updated_at']:
                                safe_dict[key] = value
                        
                        if safe_dict:
                            new_record = model(**safe_dict)
                            postgres_session.add(new_record)
                            logger.warning(f"  Migrated {model_name} record with limited fields")
                            count += 1
                    except Exception:
                        pass
            
            # Final commit for this model
            postgres_session.commit()
            total_records += count
            
            logger.info(f"  Migrated {count} records for {model_name}")
            
        except Exception as e:
            postgres_session.rollback()
            logger.error(f"  Error migrating {model_name}: {str(e)}")
        finally:
            sqlite_session.close()
            postgres_session.close()
    
    logger.info(f"Migration complete! Total records migrated: {total_records}")

if __name__ == "__main__":
    # Ask for confirmation
    response = input("This will migrate data from SQLite to PostgreSQL. Continue? (y/n): ")
    if response.lower() == 'y':
        migrate_data()
    else:
        print("Migration cancelled.")