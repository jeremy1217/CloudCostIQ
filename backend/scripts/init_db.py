from sqlalchemy import create_engine, Table, Column, Integer, ForeignKey, text, MetaData
from sqlalchemy.orm import sessionmaker
from backend.database.db import Base
from backend.database.metadata import metadata
from backend.models.models import RoleModel, UserModel, user_role_association
from backend.models.cloud_cost import CloudCost
from backend.config import settings
import logging

logger = logging.getLogger(__name__)

def init_database():
    """Initialize the database and create tables"""
    try:
        # Create engine
        engine = create_engine(settings.DATABASE_URL)
        
        # Drop all tables
        with engine.connect() as conn:
            conn.execute(text("DROP TABLE IF EXISTS cloud_costs, user_role_association, api_keys, feature_configs, audit_logs, users, roles CASCADE"))
            conn.commit()
        logger.info("Dropped all tables")
        
        # Create all tables
        Base.metadata.create_all(bind=engine)
        logger.info("Created all tables")
        
        # Create session
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        
        # Create default roles
        default_roles = [
            {
                "name": "admin",
                "description": "Full system access",
            },
            {
                "name": "staff",
                "description": "Staff member with elevated access",
            },
            {
                "name": "user",
                "description": "Standard user",
            }
        ]
        
        for role_data in default_roles:
            role = RoleModel(**role_data)
            db.add(role)
        
        db.commit()
        logger.info("Created default roles")
        
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        if 'db' in locals():
            db.rollback()
    finally:
        if 'db' in locals():
            db.close()

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    init_database() 