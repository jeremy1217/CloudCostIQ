from pydantic_settings import BaseSettings
from typing import List, Optional
import os

class Settings(BaseSettings):
    # Server settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Environment
    NODE_ENV: str = "development"
    
    # Database settings
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/cloudcostiq"
    
    # JWT settings
    JWT_SECRET_KEY: str = "your-secret-key-change-this-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Redis settings
    REDIS_URL: str = "redis://localhost:6379"
    REDIS_DB: int = 0
    
    # AWS settings
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_REGION: str = "us-east-1"
    
    # Feature tracking settings
    FEATURE_TRACKING_ENABLED: bool = True
    FEATURE_TRACKING_REDIS_KEY_PREFIX: str = "feature_tracking:"
    
    # Admin Access Settings
    ADMIN_ACCESS_ENABLED: bool = False
    ADMIN_RATE_LIMIT: int = 100
    ADMIN_ALLOWED_IPS: list[str] = ["127.0.0.1"]
    ADMIN_ALLOWED_DOMAINS: list[str] = []
    
    # Security Settings
    ADMIN_SESSION_TIMEOUT: int = 3600
    ADMIN_2FA_REQUIRED: bool = True
    ADMIN_ACCESS_LOG_RETENTION_DAYS: int = 90
    
    # Feature Management Settings
    FEATURE_MANAGEMENT_ENABLED: bool = True
    FEATURE_TOGGLE_COOLDOWN: int = 300

    model_config = {
        "env_file": ".env",
        "case_sensitive": True,
        "env_prefix": "",
        "extra": "allow"
    }

# Create a global settings instance
settings = Settings()

# Export the settings instance
__all__ = ["Settings", "settings"] 