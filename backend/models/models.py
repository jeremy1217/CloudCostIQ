from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Table, Index, CheckConstraint, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.database.db import Base

# Association table for user roles
user_role_association = Table(
    'user_role_association',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id', ondelete='CASCADE')),
    Column('role_id', Integer, ForeignKey('roles.id', ondelete='CASCADE')),
    extend_existing=True
)

class RoleModel(Base):
    __tablename__ = "roles"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True)
    description = Column(String)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    users = relationship("UserModel", secondary=user_role_association, back_populates="roles")

class UserModel(Base):
    __tablename__ = "users"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True)
    hashed_password = Column(String)
    type = Column(String)  # admin, staff, user
    role_names = Column(String)  # JSON array of role names
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    first_name = Column(String)
    last_name = Column(String)
    company = Column(String)
    phone = Column(String)
    preferences = Column(String)  # JSON object for user preferences
    two_factor_enabled = Column(Boolean, default=False)
    two_factor_secret = Column(String)

    roles = relationship("RoleModel", secondary=user_role_association, back_populates="users")
    api_keys = relationship("ApiKeyModel", back_populates="user")

class ApiKeyModel(Base):
    __tablename__ = "api_keys"
    __table_args__ = (
        CheckConstraint("provider IN ('aws', 'azure', 'gcp')", name='valid_provider'),
        {'extend_existing': True}
    )

    id = Column(Integer, primary_key=True)
    name = Column(String)
    key_hash = Column(String)
    provider = Column(String)
    encrypted_credentials = Column(String)
    is_active = Column(Boolean)
    created_at = Column(DateTime)
    last_used = Column(DateTime)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'))
    user = relationship("UserModel", back_populates="api_keys")

class FeatureConfig(Base):
    __tablename__ = "feature_configs"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    enabled = Column(Boolean, default=True)
    usage_limit = Column(Integer, nullable=True)
    updated_by = Column(Integer, ForeignKey('users.id'))
    updated_at = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String)
    feature = Column(String)
    user_id = Column(Integer, ForeignKey('users.id'))
    details = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow, index=True) 