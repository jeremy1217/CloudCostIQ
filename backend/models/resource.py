# Standard library imports
from datetime import datetime

# Third-party imports
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Table, JSON, Index, Text
from sqlalchemy.orm import relationship

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
    resource_id = Column(String, nullable=False, index=True, unique=True)  # Cloud provider's resource ID
    provider = Column(String, nullable=False, index=True)
    account_id = Column(String, nullable=True, index=True)
    region = Column(String, nullable=True, index=True)
    service = Column(String, nullable=False, index=True)
    resource_type = Column(String, nullable=False, index=True)  # EC2 instance, S3 bucket, etc.
    name = Column(String, nullable=True, index=True)  # Resource name if available
    status = Column(String, nullable=True, index=True)  # running, stopped, etc.
    creation_date = Column(DateTime, nullable=True)
    last_active = Column(DateTime, nullable=True)  # Last time resource was used
    attributes = Column(JSON, nullable=True)  # Resource-specific attributes
    tags = relationship("ResourceTag", secondary=resource_tag_association, back_populates="resources")
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
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
    key = Column(String, nullable=False, index=True)
    value = Column(String, nullable=True, index=True)
    resources = relationship("CloudResource", secondary=resource_tag_association, back_populates="tags")
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    
    __table_args__ = (
        # Composite unique constraint
        Index('idx_tag_key_value', 'key', 'value', unique=True),
    )
    
    def to_dict(self):
        """Convert to dictionary for API responses"""
        return {
            "id": self.id,
            "key": self.key,
            "value": self.value,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }