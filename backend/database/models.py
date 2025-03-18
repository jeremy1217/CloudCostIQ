from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Table, Index, CheckConstraint, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from .db import Base, metadata

# Custom types for encrypted fields
class EncryptedString(String):
    """Custom type for encrypted string fields"""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._key = None  # Encryption key will be set from settings

    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        # TODO: Implement encryption
        return value

    def process_result_value(self, value, dialect):
        if value is None:
            return None
        # TODO: Implement decryption
        return value

# Association table for user roles
user_role_association = Table(
    'user_role_association',
    metadata,
    Column('user_id', Integer, ForeignKey('users.id', ondelete='CASCADE')),
    Column('role_id', Integer, ForeignKey('roles.id', ondelete='CASCADE')),
    extend_existing=True
)

class Role(Base):
    __tablename__ = "roles"
    __table_args__ = (
        {'extend_existing': True},
        UniqueConstraint('name', name='uq_role_name')
    )

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(String, nullable=True)
    users = relationship("User", secondary=user_role_association, back_populates="roles")

class User(Base):
    __tablename__ = "users"
    __table_args__ = (
        {'extend_existing': True},
        Index('idx_user_email_username', 'email', 'username'),
        UniqueConstraint('email', name='uq_user_email'),
        UniqueConstraint('username', name='uq_user_username')
    )

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    roles = relationship("Role", secondary=user_role_association, back_populates="users")

class ApiKey(Base):
    __tablename__ = "api_keys"
    __table_args__ = (
        {'extend_existing': True},
        Index('idx_active_api_keys', 'is_active').where(is_active == True),
        CheckConstraint("provider IN ('aws', 'azure', 'gcp')", name='valid_provider')
    )

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    key_hash = Column(String, nullable=False)  # Store hashed key for verification
    provider = Column(String, index=True, nullable=False)  # AWS, Azure, GCP
    encrypted_credentials = Column(EncryptedString, nullable=False)  # Encrypted API credentials
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    last_used = Column(DateTime, nullable=True, index=True)
    
    # User relationship
    user_id = Column(Integer, ForeignKey("users.id", ondelete='CASCADE'))
    user = relationship("User", backref="api_keys")

class CloudConnection(Base):
    __tablename__ = "cloud_connections"
    __table_args__ = (
        {'extend_existing': True},
        CheckConstraint("provider IN ('aws', 'azure', 'gcp')", name='valid_cloud_provider'),
        Index('idx_active_connections', 'is_active').where(is_active == True)
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete='CASCADE'))
    provider = Column(String, nullable=False)  # e.g., "aws", "azure", "gcp"
    name = Column(String, nullable=False)
    credentials = Column(EncryptedString, nullable=False)  # Encrypted credentials JSON
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", backref="cloud_connections") 