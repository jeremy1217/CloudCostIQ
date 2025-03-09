# Standard library imports
from datetime import datetime

# Third-party imports
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, JSON, Index, Text
from sqlalchemy.orm import relationship

# Local imports
from backend.database.db import Base

class OptimizationPolicy(Base):
    __tablename__ = "optimization_policies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(String, nullable=True)
    resource_type = Column(String, nullable=False, index=True)  # Type of resource to optimize
    provider = Column(String, nullable=False, index=True)
    service = Column(String, nullable=False, index=True)
    criteria = Column(JSON, nullable=False)  # Criteria for optimization
    action = Column(String, nullable=False)  # Action to take (resize, schedule, etc.)
    parameters = Column(JSON, nullable=True)  # Parameters for the action
    is_automatic = Column(Boolean, default=False)  # Whether to apply automatically
    approval_required = Column(Boolean, default=True)  # Whether approval is required
    enabled = Column(Boolean, default=True, index=True)
    created_by = Column(String, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convert to dictionary for API responses"""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "resource_type": self.resource_type,
            "provider": self.provider,
            "service": self.service,
            "criteria": self.criteria,
            "action": self.action,
            "parameters": self.parameters,
            "is_automatic": self.is_automatic,
            "approval_required": self.approval_required,
            "enabled": self.enabled,
            "created_by": self.created_by,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }