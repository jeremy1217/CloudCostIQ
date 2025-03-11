# Standard library imports
from datetime import datetime

# Third-party imports
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, JSON, Index, Text
from sqlalchemy.orm import relationship
from sqlalchemy import JSON

# Local imports
from backend.database.db import Base

class OrganizationUnit(Base):
    __tablename__ = "organization_units"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(String, nullable=True)
    external_id = Column(String, nullable=True, index=True)  # ID in the cloud provider
    parent_id = Column(Integer, ForeignKey("organization_units.id"), nullable=True, index=True)
    path = Column(String, nullable=True, index=True)  # Full path in the org hierarchy
    account_ids = Column(JSON, nullable=True)  # List of account IDs in this unit
    meta_data = Column(JSON, nullable=True)  # Additional metadata
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Self-referential relationship
    children = relationship("OrganizationUnit", backref="parent", remote_side=[id])
    
    def to_dict(self):
        """Convert to dictionary for API responses"""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "external_id": self.external_id,
            "parent_id": self.parent_id,
            "path": self.path,
            "account_ids": self.account_ids,
            "metadata": self.metadata,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }