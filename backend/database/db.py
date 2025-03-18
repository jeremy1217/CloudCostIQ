# Standard library imports
from datetime import datetime
import logging
from prometheus_client import Counter, Histogram

# Third-party imports
from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import QueuePool

# Local imports
from backend.config import settings

# Configure logging
logging.basicConfig()
logger = logging.getLogger('sqlalchemy.engine')
logger.setLevel(logging.INFO)

# Prometheus metrics
db_query_time = Histogram('db_query_duration_seconds', 'Database query duration in seconds')
db_errors = Counter('db_errors_total', 'Total number of database errors')

# Create SQLAlchemy engine with connection pooling
engine = create_engine(
    settings.DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,
    max_overflow=10,
    pool_timeout=30,
    pool_recycle=1800,  # Recycle connections after 30 minutes
    pool_pre_ping=True  # Enable connection health checks
)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class
Base = declarative_base()

# Database health check function
def check_db_health():
    try:
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        return True
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        db_errors.inc()
        return False

# Query performance monitoring
@event.listens_for(Session, 'after_cursor_execute')
def after_cursor_execute(session, cursor, statement, parameters, context, executemany):
    total = cursor.rowcount
    if total > 1000:  # Log slow queries
        logger.warning(f"Large query executed: {total} rows affected")
    db_query_time.observe(context.execution_options.get('total_time', 0))

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()