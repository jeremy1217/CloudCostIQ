import os
from pathlib import Path

# Standard library imports
from datetime import datetime
import logging

# Third-party imports
from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import QueuePool

# Local imports
from backend.config import settings
from backend.database.monitoring import setup_monitoring, log_db_error

# Configure logging
logging.basicConfig()
logger = logging.getLogger('sqlalchemy.engine')
logger.setLevel(logging.INFO)

# Use PostgreSQL URL from settings
SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL

# Create SQLAlchemy engine with connection pooling
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    poolclass=QueuePool,
    pool_size=5,
    max_overflow=10
)

# Set up monitoring
setup_monitoring(engine)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class
Base = declarative_base()

# Import models to ensure they are registered with Base
from backend.models.models import RoleModel, UserModel
from backend.models.cloud_cost import CloudCost

# Database health check function
def check_db_health():
    try:
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        return True
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        log_db_error(e, 'health_check')
        return False

# Dependency to get DB session
def get_db():
    """Get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()