# Standard library imports
from datetime import datetime

# Third-party imports
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, JSON, Index, Text
from sqlalchemy.orm import relationship

# Local imports
from backend.database.db import Base

class SavedReport(Base):
    __tablename__ = "saved_reports"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(String, nullable=True)
    report_type = Column(String, nullable=False, index=True)  # cost, utilization, optimization, etc.
    filters = Column(JSON, nullable=True)  # Report filters
    grouping = Column(JSON, nullable=True)  # How data is grouped
    time_range = Column(JSON, nullable=True)  # Time range for the report
    visualization = Column(JSON, nullable=True)  # Visualization settings
    is_scheduled = Column(Boolean, default=False)
    schedule = Column(JSON, nullable=True)  # Schedule settings if automated
    created_by = Column(String, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convert to dictionary for API responses"""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "report_type": self.report_type,
            "filters": self.filters,
            "grouping": self.grouping,
            "time_range": self.time_range,
            "visualization": self.visualization,
            "is_scheduled": self.is_scheduled,
            "schedule": self.schedule,
            "created_by": self.created_by,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }