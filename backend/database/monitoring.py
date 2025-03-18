from prometheus_client import Counter, Histogram, Gauge
import logging
from typing import Optional
from datetime import datetime
from sqlalchemy import event
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session

# Configure logging
logger = logging.getLogger(__name__)

# Prometheus metrics
db_query_duration = Histogram(
    'db_query_duration_seconds',
    'Database query duration in seconds',
    ['query_type']
)

db_errors = Counter(
    'db_errors_total',
    'Total number of database errors',
    ['error_type']
)

db_connections = Gauge(
    'db_connections_active',
    'Number of active database connections'
)

db_pool_size = Gauge(
    'db_pool_size',
    'Current size of the database connection pool'
)

def setup_monitoring(engine: Engine):
    """Set up database monitoring and metrics collection."""
    
    @event.listens_for(Engine, 'connect')
    def receive_connect(dbapi_connection, connection_record):
        db_connections.inc()
        logger.info("Database connection established")

    @event.listens_for(Engine, 'checkout')
    def receive_checkout(dbapi_connection, connection_record, connection_proxy):
        db_pool_size.set(engine.pool.size())
        logger.debug("Database connection checked out")

    @event.listens_for(Engine, 'checkin')
    def receive_checkin(dbapi_connection, connection_record):
        db_connections.dec()
        logger.debug("Database connection checked in")

    @event.listens_for(Session, 'after_cursor_execute')
    def after_cursor_execute(session, cursor, statement, parameters, context, executemany):
        """Record query execution metrics."""
        query_type = 'write' if statement.lower().startswith(('insert', 'update', 'delete')) else 'read'
        duration = context.execution_options.get('total_time', 0)
        db_query_duration.labels(query_type=query_type).observe(duration)
        
        # Log slow queries
        if duration > 1.0:  # Log queries taking more than 1 second
            logger.warning(f"Slow query detected: {duration:.2f}s - {statement[:100]}...")

def log_db_error(error: Exception, error_type: str = 'unknown'):
    """Log database errors and increment error counter."""
    logger.error(f"Database error: {str(error)}", exc_info=True)
    db_errors.labels(error_type=error_type).inc()

class DatabaseMetrics:
    """Context manager for tracking database operation metrics."""
    
    def __init__(self, operation: str):
        self.operation = operation
        self.start_time: Optional[datetime] = None
    
    def __enter__(self):
        self.start_time = datetime.utcnow()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.start_time:
            duration = (datetime.utcnow() - self.start_time).total_seconds()
            db_query_duration.labels(query_type=self.operation).observe(duration)
            
            if exc_type:
                log_db_error(exc_val, self.operation) 