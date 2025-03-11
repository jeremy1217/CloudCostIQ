# Third-party imports
from sqlalchemy import Column, Integer, String, Boolean, Table, ForeignKey, ARRAY
from sqlalchemy.orm import relationship

# Local imports
from backend.database.db import Base

# Association table for user-role relationship
user_role_association = Table(
    'user_role_association', 
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id')),
    Column('role_id', Integer, ForeignKey('roles.id'))
)

class UserModel(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String, nullable=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    roles = relationship("RoleModel", secondary=user_role_association, back_populates="users")
    api_keys = relationship("ApiKeyModel", back_populates="user")
    # Fix this line to properly define the relationship
    cloud_costs = relationship("CloudCost", back_populates="user")

class RoleModel(Base):
    __tablename__ = "roles"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String, nullable=True)
    
    # Relationship with users
    users = relationship("UserModel", secondary=user_role_association, back_populates="roles")
    
    # Permissions as a simple array - using standard ARRAY for PostgreSQL
    permissions = Column(ARRAY(String), nullable=True)

class ApiKeyModel(Base):
    __tablename__ = "api_keys"
    
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
    user = relationship("UserModel", back_populates="api_keys")