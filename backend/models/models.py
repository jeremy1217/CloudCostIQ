from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Table, Index, CheckConstraint, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.database.base import Base, metadata

# Association table for user roles
user_role_association = Table(
    'user_role_association',
    metadata,
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
    users = relationship("UserModel", secondary=user_role_association, back_populates="roles")

class UserModel(Base):
    __tablename__ = "users"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True)
    username = Column(String, unique=True)
    full_name = Column(String)
    hashed_password = Column(String)
    is_active = Column(Boolean)
    created_at = Column(DateTime)
    updated_at = Column(DateTime)
    roles = relationship("RoleModel", secondary=user_role_association, back_populates="users")
    api_keys = relationship("ApiKeyModel", back_populates="user", cascade="all, delete-orphan")

    @property
    def role_names(self):
        return [role.name for role in self.roles]

    def has_role(self, role_name: str) -> bool:
        """Check if user has a specific role"""
        return any(role.name == role_name for role in self.roles)

    def add_role(self, role: "RoleModel") -> None:
        """Add a role to the user"""
        if role not in self.roles:
            self.roles.append(role)

    def remove_role(self, role: "RoleModel") -> None:
        """Remove a role from the user"""
        if role in self.roles:
            self.roles.remove(role)

class ApiKeyModel(Base):
    __tablename__ = "api_keys"
    __table_args__ = (
        CheckConstraint('provider IN ("aws", "azure", "gcp")', name='valid_provider'),
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

class CloudCost(Base):
    __tablename__ = "cloud_costs"
    __table_args__ = (
        Index('idx_cost_date', 'date'),
        Index('idx_cost_provider', 'provider'),
        Index('idx_cost_service', 'service'),
        {'extend_existing': True}
    )

    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime, nullable=False, index=True)
    provider = Column(String, nullable=False, index=True)  # AWS, Azure, GCP
    service = Column(String, nullable=False, index=True)  # EC2, S3, etc.
    cost = Column(Integer, nullable=False)  # Cost in cents
    user_id = Column(Integer, ForeignKey("users.id", ondelete='CASCADE'))
    user = relationship("UserModel", backref="cloud_costs")

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