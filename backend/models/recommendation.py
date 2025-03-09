# Standard library imports
from datetime import datetime  

# Third-party imports
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from sqlalchemy.ext.declarative import declarative_base

# Local imports
from backend.database.db import Base

class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    provider = Column(String, nullable=False)
    service = Column(String, nullable=False)
    suggestion = Column(String, nullable=False)
    command = Column(String, nullable=False)
    savings = Column(Float, nullable=False)
    applied = Column(Boolean, default=False)
    timestamp = Column(DateTime, nullable=False, default=datetime.utcnow)