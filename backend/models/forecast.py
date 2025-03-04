from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, JSON, Index, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.database.db import Base

class CostForecast(Base):
    __tablename__ = "cost_forecasts"

    id = Column(Integer, primary_key=True, index=True)
    provider = Column(String, nullable=True, index=True)  # Can be null for aggregate forecasts
    service = Column(String, nullable=True, index=True)  # Can be null for aggregate forecasts
    target_date = Column(String, nullable=False, index=True)  # ISO format date string (YYYY-MM-DD)
    predicted_cost = Column(Float, nullable=False)
    lower_bound = Column(Float, nullable=True)  # Lower confidence interval
    upper_bound = Column(Float, nullable=True)  # Upper confidence interval
    confidence = Column(String, nullable=True)  # Confidence level (high, medium, low)
    algorithm = Column(String, nullable=True)  # Algorithm used
    data_points_used = Column(Integer, nullable=True)  # How many data points were used
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)
    
    def to_dict(self):
        """Convert to dictionary for API responses"""
        return {
            "id": self.id,
            "provider": self.provider,
            "service": self.service,
            "target_date": self.target_date,
            "predicted_cost": self.predicted_cost,
            "lower_bound": self.lower_bound,
            "upper_bound": self.upper_bound,
            "confidence": self.confidence,
            "algorithm": self.algorithm,
            "data_points_used": self.data_points_used,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }