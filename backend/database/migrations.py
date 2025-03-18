import logging
from typing import Optional, List
from alembic import command
from alembic.config import Config
from sqlalchemy import text
from sqlalchemy.engine import Engine
from datetime import datetime
import os

logger = logging.getLogger(__name__)

class DatabaseMigration:
    def __init__(self, alembic_cfg: Config, engine: Engine):
        self.alembic_cfg = alembic_cfg
        self.engine = engine
        self.backup_dir = "database_backups"
        os.makedirs(self.backup_dir, exist_ok=True)

    def create_backup(self, version: str) -> str:
        """Create a database backup before migration."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_file = f"{self.backup_dir}/backup_{version}_{timestamp}.sql"
        
        try:
            with self.engine.connect() as conn:
                # Get all table names
                result = conn.execute(text("""
                    SELECT tablename 
                    FROM pg_tables 
                    WHERE schemaname = 'public'
                """))
                tables = [row[0] for row in result]
                
                # Create backup for each table
                with open(backup_file, 'w') as f:
                    for table in tables:
                        # Get table data
                        result = conn.execute(text(f"SELECT * FROM {table}"))
                        rows = result.fetchall()
                        
                        # Write table data to backup file
                        f.write(f"-- Table: {table}\n")
                        for row in rows:
                            values = [f"'{str(v)}'" if v is not None else 'NULL' for v in row]
                            f.write(f"INSERT INTO {table} VALUES ({', '.join(values)});\n")
                        f.write("\n")
                
                logger.info(f"Database backup created: {backup_file}")
                return backup_file
        except Exception as e:
            logger.error(f"Failed to create database backup: {str(e)}")
            raise

    def rollback(self, version: str, backup_file: str):
        """Rollback database to a specific version using backup."""
        try:
            # Stop any active transactions
            with self.engine.connect() as conn:
                conn.execute(text("SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = current_database()"))
            
            # Restore from backup
            with self.engine.connect() as conn:
                with open(backup_file, 'r') as f:
                    for line in f:
                        if line.strip() and not line.startswith('--'):
                            conn.execute(text(line))
            
            # Downgrade to specific version
            command.downgrade(self.alembic_cfg, version)
            
            logger.info(f"Successfully rolled back to version {version}")
        except Exception as e:
            logger.error(f"Failed to rollback database: {str(e)}")
            raise

    def migrate(self, target_version: str = "head"):
        """Run database migration with backup and rollback capability."""
        try:
            # Get current version
            command.current(self.alembic_cfg)
            
            # Create backup
            backup_file = self.create_backup(target_version)
            
            try:
                # Run migration
                command.upgrade(self.alembic_cfg, target_version)
                logger.info(f"Successfully migrated to version {target_version}")
            except Exception as e:
                logger.error(f"Migration failed: {str(e)}")
                # Rollback to previous version
                self.rollback("head", backup_file)
                raise
                
        except Exception as e:
            logger.error(f"Migration process failed: {str(e)}")
            raise

    def get_migration_history(self) -> List[dict]:
        """Get migration history."""
        try:
            command.history(self.alembic_cfg)
            # Parse history output and return as structured data
            # This is a simplified version - you might want to parse the actual output
            return [
                {
                    "version": "head",
                    "description": "Latest version",
                    "timestamp": datetime.now().isoformat()
                }
            ]
        except Exception as e:
            logger.error(f"Failed to get migration history: {str(e)}")
            raise

def setup_migrations(alembic_cfg_path: str, engine: Engine) -> DatabaseMigration:
    """Set up database migrations."""
    alembic_cfg = Config(alembic_cfg_path)
    alembic_cfg.set_main_option("sqlalchemy.url", str(engine.url))
    return DatabaseMigration(alembic_cfg, engine) 