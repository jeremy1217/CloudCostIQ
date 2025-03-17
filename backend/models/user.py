# Third-party imports
from sqlalchemy import Column, Integer, String, Boolean, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime

# Local imports
from backend.database.db import Base
from backend.models.subscription import SubscriptionModel
from backend.models.role import RoleModel, user_role_association

class UserModel(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    type = Column(String, default="customer")  # customer or staff
    role_names = Column(JSON, default=list)  # List of role names for quick access
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Optional fields for user profile
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    company = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    
    # Settings and preferences
    preferences = Column(JSON, default=dict)
    
    # 2FA settings
    two_factor_enabled = Column(Boolean, default=False)
    two_factor_secret = Column(String, nullable=True)
    
    # Relationships
    api_keys = relationship("ApiKeyModel", back_populates="user")
    subscription = relationship("SubscriptionModel", back_populates="user", uselist=False)
    roles = relationship("RoleModel", secondary=user_role_association, back_populates="users")

    def __repr__(self):
        return f"<User {self.email}>"
    
    @property
    def username(self):
        """Return email as username for compatibility with authentication system"""
        return self.email
    
    @property
    def is_admin(self):
        """Check if user has admin role"""
        return any(role.name == "admin" for role in self.roles)
    
    @property
    def is_staff(self):
        """Check if user is staff"""
        return self.type == "staff"
    
    def has_role(self, role_name: str) -> bool:
        """Check if user has a specific role"""
        return any(role.name == role_name for role in self.roles)
    
    def add_role(self, role: "RoleModel") -> None:
        """Add a role to the user"""
        if role not in self.roles:
            self.roles.append(role)
            if not self.role_names:
                self.role_names = []
            if role.name not in self.role_names:
                self.role_names.append(role.name)
    
    def remove_role(self, role: "RoleModel") -> None:
        """Remove a role from the user"""
        if role in self.roles:
            self.roles.remove(role)
            if self.role_names and role.name in self.role_names:
                self.role_names.remove(role.name)

    def get_plan_features(self):
        """Get the features available to the user based on their subscription"""
        if not self.subscription or not self.subscription.plan:
            return {}
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