from sqlalchemy import Column, Integer, String, Float, DateTime
from backend.database.db import Base  # ✅ Import the correct Base

class CloudCost(Base):
    __tablename__ = "cloud_cost"

    id = Column(Integer, primary_key=True, index=True)
    provider = Column(String, nullable=False)
    service = Column(String, nullable=False)
    cost = Column(Float, nullable=False)
    timestamp = Column(DateTime, nullable=False)
