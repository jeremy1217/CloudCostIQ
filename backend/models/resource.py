# Standard library imports
from datetime import datetime

# Third-party imports
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Table, JSON, Index, Text
from sqlalchemy.orm import relationship
from sqlalchemy import JSON
from sqlalchemy.sql import func

# Local imports
from backend.database.db import Base

# Association table for many-to-many relationships
resource_tag_association = Table(
    'resource_tag_association',
    Base.metadata,
    Column('resource_id', Integer, ForeignKey('cloud_resources.id')),
    Column('tag_id', Integer, ForeignKey('resource_tags.id'))
)

class CloudResource(Base):
    __tablename__ = "cloud_resources"

    id = Column(Integer, primary_key=True, index=True)
    resource_id = Column(String, unique=True, index=True)
    provider = Column(String, index=True)
    account_id = Column(String, index=True)
    region = Column(String, index=True)
    service = Column(String, index=True)
    resource_type = Column(String, index=True)
    name = Column(String, index=True)
    status = Column(String, index=True)
    creation_date = Column(DateTime(timezone=True))
    last_active = Column(DateTime(timezone=True))
    attributes = Column(JSON)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    tags = relationship("ResourceTag", secondary=resource_tag_association, backref="resources")

    def to_dict(self):
        """Convert to dictionary for API responses"""
        return {
            "id": self.id,
            "resource_id": self.resource_id,
            "provider": self.provider,
            "account_id": self.account_id,
            "region": self.region,
            "service": self.service,
            "resource_type": self.resource_type,
            "name": self.name,
            "status": self.status,
            "creation_date": self.creation_date.isoformat() if self.creation_date else None,
            "last_active": self.last_active.isoformat() if self.last_active else None,
            "attributes": self.attributes,
            "tags": [tag.to_dict() for tag in self.tags],
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

class ResourceTag(Base):
    __tablename__ = "resource_tags"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, index=True)
    value = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "key": self.key,
            "value": self.value,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }