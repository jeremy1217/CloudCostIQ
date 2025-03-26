# Standard library imports
from datetime import datetime

# Third-party imports
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship

# Local imports
from backend.database.db import Base

class CloudCost(Base):
    __tablename__ = "cloud_costs"

    id = Column(Integer, primary_key=True, index=True)
    provider = Column(String, nullable=False)
    service = Column(String, nullable=False)
    cost = Column(Float, nullable=False)
    date = Column(String, nullable=False)  # ISO format date string (YYYY-MM-DD)
    timestamp = Column(DateTime, nullable=False, default=datetime.utcnow)
    extra_data = Column(String, nullable=True)  # JSON string for additional metadata
    
    # User relationship
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    user = relationship("UserModel", backref="cloud_costs")