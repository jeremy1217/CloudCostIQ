from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from backend.database.db import Base

class CloudCost(Base):
    __tablename__ = "cloud_cost"

    id = Column(Integer, primary_key=True, index=True)
    provider = Column(String, nullable=False)
    service = Column(String, nullable=False)
    cost = Column(Float, nullable=False)
    date = Column(String, nullable=False)  # ISO format date string (YYYY-MM-DD)
    timestamp = Column(DateTime, nullable=False, default=datetime.utcnow)
    extra_data = Column(String, nullable=True)  # JSON string for additional metadata (renamed from 'metadata')