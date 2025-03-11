"""
Direct PostgreSQL schema creation script with ordered table creation.
This script bypasses Alembic migrations and directly creates all tables in PostgreSQL
in the correct order to handle foreign key dependencies.
"""

import os
import sys
from pathlib import Path

# Add project root to Python path
project_root = Path(__file__).resolve().parent
sys.path.insert(0, str(project_root))

# Import models - make sure all models are imported properly
from sqlalchemy import inspect, MetaData, Table, text
from sqlalchemy.schema import CreateTable
from sqlalchemy.exc import ProgrammingError

# Import database components
from backend.database.db import Base, engine

# Import all models explicitly to ensure they're registered with Base.metadata
from backend.models.user import UserModel, RoleModel, ApiKeyModel, user_role_association
from backend.models.cloud_cost import CloudCost
from backend.models.recommendation import Recommendation
from backend.models.anomaly import CostAnomaly
from backend.models.budget import BudgetAlert, AlertHistory
from backend.models.resource import CloudResource, ResourceTag, resource_tag_association
from backend.models.allocation import CostAllocation, CostCategory
from backend.models.forecast import CostForecast
from backend.models.organization import OrganizationUnit
from backend.models.policy import OptimizationPolicy
from backend.models.report import SavedReport
from backend.models.utilization import ResourceUtilization

# Get PostgreSQL connection string from config
from backend.config import settings

def create_postgres_schema():
    """Create PostgreSQL schema directly with ordered table creation"""
    print("Creating PostgreSQL schema...")
    
    # Create database engine
    conn = engine.connect()
    
    # Check if database exists and has tables
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()
    
    if existing_tables:
        response = input(f"Database already has {len(existing_tables)} tables. Drop and recreate? (y/n): ")
        if response.lower() == 'y':
            # Drop all tables in reverse order to handle dependencies
            print("Dropping existing tables...")
            
            # Use raw SQL to disable foreign key checks if needed
            try:
                conn.execute(text("SET CONSTRAINTS ALL DEFERRED"))
            except:
                print("Note: Could not defer constraints - tables with foreign keys may fail to drop")
            
            # Try to drop tables with minimal errors
            for table_name in reversed(inspector.get_table_names()):
                try:
                    conn.execute(text(f'DROP TABLE IF EXISTS "{table_name}" CASCADE'))
                    print(f"  Dropped table {table_name}")
                except Exception as e:
                    print(f"  Error dropping table {table_name}: {str(e)}")
            
            conn.commit()
        else:
            print("Exiting without making changes.")
            conn.close()
            return
    
    print("Creating tables in correct dependency order...")
    
    # Define the order of table creation to handle dependencies
    # This matches the foreign key relationships in the application
    
    # Step 1: Create basic tables with no foreign keys
    tables_phase1 = [
        RoleModel.__table__,
        UserModel.__table__,
        ResourceTag.__table__
    ]
    
    # Step 2: Create association tables and tables with foreign keys to phase 1
    tables_phase2 = [
        Base.metadata.tables['user_role_association'],
        ApiKeyModel.__table__,
        OrganizationUnit.__table__,  # Self-referential FK, but basic table can be created
        CloudCost.__table__,
        CloudResource.__table__,
    ]
    
    # Step 3: Create tables dependent on phase 2
    tables_phase3 = [
        Base.metadata.tables['resource_tag_association'],
        CostAnomaly.__table__,
        CostForecast.__table__,
        BudgetAlert.__table__,
        Recommendation.__table__,
        CostCategory.__table__,
        ResourceUtilization.__table__,
    ]
    
    # Step 4: Create remaining tables that depend on phase 3
    tables_phase4 = [
        AlertHistory.__table__,
        CostAllocation.__table__,
        SavedReport.__table__,
        OptimizationPolicy.__table__
    ]
    
    # Combine all phases
    all_tables_ordered = tables_phase1 + tables_phase2 + tables_phase3 + tables_phase4
    
    # Create tables in order
    tables_created = 0
    try:
        # Create each table explicitly in the defined order
        for table in all_tables_ordered:
            try:
                table_name = table.name
                if not inspector.has_table(table_name):
                    table.create(engine)
                    print(f"  Created table: {table_name}")
                    tables_created += 1
                else:
                    print(f"  Table already exists: {table_name}")
            except Exception as e:
                print(f"  Error creating table {table.name}: {str(e)}")
        
        conn.commit()
    except Exception as e:
        conn.rollback()
        print(f"Error creating tables: {str(e)}")
    finally:
        conn.close()
    
    # Print summary
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print(f"Schema creation complete. Database now has {len(tables)} tables.")
    print(f"Successfully created {tables_created} new tables.")
    
    print("\nNext steps:")
    print("1. To populate with test data, run: python backend/database/seed.py")
    print("2. To set up Alembic for future migrations: alembic stamp head")

if __name__ == "__main__":
    create_postgres_schema()