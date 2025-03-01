import os
from sqlalchemy import create_engine, Column, Integer, Float, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from pathlib import Path

# Create the directory if it doesn't exist
db_dir = Path(os.path.dirname(os.path.abspath(__file__)))
db_dir.mkdir(parents=True, exist_ok=True)

# Use an absolute path to the database
DATABASE_URL = f"sqlite:///{os.path.join(db_dir, 'cloudcostiq.db')}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Dependency for DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Create tables
Base.metadata.create_all(bind=engine)
