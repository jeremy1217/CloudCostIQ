# Third-party imports
from sqlalchemy import Column, Integer, String, Boolean, Table, ForeignKey, ARRAY, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

# Local imports
from backend.database.db import Base

# Association table for user-role relationship
user_role_association = Table(
    'user_role_association', 
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id')),
    Column('role_id', Integer, ForeignKey('roles.id'))
)

class SubscriptionModel(Base):
    __tablename__ = "subscriptions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    plan_id = Column(Integer, ForeignKey("plans.id"))
    start_date = Column(DateTime, default=datetime.utcnow)
    end_date = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    auto_renew = Column(Boolean, default=True)
    
    # Relationships
    user = relationship("UserModel", back_populates="subscription")
    plan = relationship("Plan", backref="subscriptions")

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
    subscription = relationship("SubscriptionModel", back_populates="user", uselist=False)
    # Remove the cloud_costs relationship for now as it's causing issues
    # cloud_costs = relationship("CloudCost", back_populates="user")

    def get_plan_features(self):
        """Get the features available to the user based on their subscription"""
        if not self.subscription or not self.subscription.is_active:
            return None
        return self.subscription.plan.features

    def can_access_feature(self, feature_name):
        """Check if the user can access a specific feature"""
        features = self.get_plan_features()
        if not features:
            return False
        return features.get(feature_name, False)

    def get_cloud_accounts_limit(self):
        """Get the maximum number of cloud accounts allowed"""
        if not self.subscription or not self.subscription.is_active:
            return 0
        return self.subscription.plan.max_cloud_accounts

    def get_data_retention_days(self):
        """Get the number of days data is retained"""
        if not self.subscription or not self.subscription.is_active:
            return 0
        return self.subscription.plan.data_retention_days

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