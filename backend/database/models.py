from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from .db import Base, metadata

# Association table for user roles
user_role_association = Table(
    'user_role_association',
    metadata,
    Column('user_id', Integer, ForeignKey('users.id')),
    Column('role_id', Integer, ForeignKey('roles.id')),
    extend_existing=True
)

class Role(Base):
    __tablename__ = "roles"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String, nullable=True)
    users = relationship("User", secondary=user_role_association, back_populates="roles")

class User(Base):
    __tablename__ = "users"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    full_name = Column(String, nullable=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    roles = relationship("Role", secondary=user_role_association, back_populates="users")

class ApiKey(Base):
    __tablename__ = "api_keys"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    key_hash = Column(String)  # Store hashed key for verification
    provider = Column(String, index=True)  # AWS, Azure, GCP
    encrypted_credentials = Column(String)  # Encrypted API credentials
    is_active = Column(Boolean, default=True)
    created_at = Column(String)  # ISO format date
    last_used = Column(String, nullable=True)  # ISO format date
    
    # User relationship
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", backref="api_keys")

class CloudConnection(Base):
    __tablename__ = "cloud_connections"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    provider = Column(String)  # e.g., "aws", "azure", "gcp"
    name = Column(String)
    credentials = Column(String)  # Encrypted credentials JSON
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", backref="cloud_connections") 