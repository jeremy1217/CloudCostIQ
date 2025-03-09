# Standard library imports
from datetime import datetime

# Third-party imports
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, JSON, Index, Text
from sqlalchemy.orm import relationship

# Local imports
from backend.database.db import Base

class ResourceUtilization(Base):
    __tablename__ = "resource_utilizations"

    id = Column(Integer, primary_key=True, index=True)
    resource_id = Column(String, nullable=False, index=True)
    date = Column(String, nullable=False, index=True)  # ISO format date string (YYYY-MM-DD)
    timestamp = Column(DateTime, nullable=False, index=True)
    provider = Column(String, nullable=False, index=True)
    service = Column(String, nullable=False, index=True)
    metric_name = Column(String, nullable=False, index=True)  # cpu_utilization, memory_utilization, etc.
    metric_value = Column(Float, nullable=False)
    metric_unit = Column(String, nullable=True)  # Percent, bytes, etc.
    period = Column(Integer, nullable=True)  # Measurement period in seconds
    statistic = Column(String, nullable=True)  # avg, max, min, etc.
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    
    __table_args__ = (
        # Composite indexes for common queries
        Index('idx_utilization_resource_metric_date', 'resource_id', 'metric_name', 'date'),
        Index('idx_utilization_service_metric_date', 'service', 'metric_name', 'date'),
    )
    
    def to_dict(self):
        """Convert to dictionary for API responses"""
        return {
            "id": self.id,
            "resource_id": self.resource_id,
            "date": self.date,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "provider": self.provider,
            "service": self.service,
            "metric_name": self.metric_name,
            "metric_value": self.metric_value,
            "metric_unit": self.metric_unit,
            "period": self.period,
            "statistic": self.statistic,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }