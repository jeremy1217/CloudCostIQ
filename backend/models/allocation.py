from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, JSON, Index, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.database.db import Base

class CostAllocation(Base):
    __tablename__ = "cost_allocations"

    id = Column(Integer, primary_key=True, index=True)
    entity_type = Column(String, nullable=False, index=True)  # project, department, team, etc.
    entity_id = Column(String, nullable=False, index=True)
    entity_name = Column(String, nullable=False, index=True)
    date = Column(String, nullable=False, index=True)  # ISO format date string (YYYY-MM-DD)
    provider = Column(String, nullable=True, index=True)
    service = Column(String, nullable=True, index=True)
    cost = Column(Float, nullable=False)
    allocation_method = Column(String, nullable=False)  # tag-based, manual, etc.
    allocated_by = Column(String, nullable=True)  # User who allocated the cost
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    __table_args__ = (
        # Composite indexes for common queries
        Index('idx_allocation_entity_date', 'entity_type', 'entity_id', 'date'),
        Index('idx_allocation_date_service', 'date', 'service'),
    )
    
    def to_dict(self):
        """Convert to dictionary for API responses"""
        return {
            "id": self.id,
            "entity_type": self.entity_type,
            "entity_id": self.entity_id,
            "entity_name": self.entity_name,
            "date": self.date,
            "provider": self.provider,
            "service": self.service,
            "cost": self.cost,
            "allocation_method": self.allocation_method,
            "allocated_by": self.allocated_by,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

class CostCategory(Base):
    __tablename__ = "cost_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(String, nullable=True)
    rules = Column(JSON, nullable=False)  # Rules for categorizing costs
    created_by = Column(String, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convert to dictionary for API responses"""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "rules": self.rules,
            "created_by": self.created_by,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }