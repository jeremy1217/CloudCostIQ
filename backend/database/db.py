from sqlalchemy import create_engine, Column, Integer, Float, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

DATABASE_URL = "sqlite:///backend/database/cloudcostiq.db"  # Update path for SQLite


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

# Cost Insights Model
class CostInsight(Base):
    __tablename__ = "cost_insights"

    id = Column(Integer, primary_key=True, index=True)
    provider = Column(String, index=True)
    service = Column(String)
    cost = Column(Float)
    date = Column(DateTime, default=datetime.utcnow)
    anomaly = Column(String, nullable=True)

# Create tables
Base.metadata.create_all(bind=engine)
