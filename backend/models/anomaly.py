# Standard library imports
from datetime import datetime

# Third-party imports
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, JSON, Index, Text
from sqlalchemy.orm import relationship
from sqlalchemy import JSON

# Local imports
from backend.database.db import Base

class CostAnomaly(Base):
    __tablename__ = "cost_anomalies"

    id = Column(Integer, primary_key=True, index=True)
    provider = Column(String, nullable=False, index=True)
    service = Column(String, nullable=False, index=True)
    resource_id = Column(String, nullable=True, index=True)
    date = Column(String, nullable=False, index=True)
    cost = Column(Float, nullable=False)
    baseline_cost = Column(Float, nullable=True)  # Expected cost
    deviation = Column(Float, nullable=True)  # Percentage deviation
    anomaly_score = Column(Float, nullable=True)  # Detection algorithm score
    detection_method = Column(String, nullable=True)  # Algorithm used
    status = Column(String, nullable=False, default="open", index=True)  # open, investigating, resolved, dismissed
    resolution = Column(String, nullable=True)  # How the anomaly was resolved
    root_cause = Column(JSON, nullable=True)  # Root cause analysis
    cloud_context = Column(JSON, nullable=True)  # Cloud-specific context
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convert to dictionary for API responses"""
        return {
            "id": self.id,
            "provider": self.provider,
            "service": self.service,
            "resource_id": self.resource_id,
            "date": self.date,
            "cost": self.cost,
            "baseline_cost": self.baseline_cost,
            "deviation": self.deviation,
            "anomaly_score": self.anomaly_score,
            "detection_method": self.detection_method,
            "status": self.status,
            "resolution": self.resolution,
            "root_cause": self.root_cause,
            "cloud_context": self.cloud_context,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }