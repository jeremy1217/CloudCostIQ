"""
Application configuration module.
Provides centralized configuration management for the application.
"""

# Standard library imports
from pathlib import Path
import os

# Third-party imports
from pydantic import Field, validator
from pydantic_settings import BaseSettings
from typing import List, Optional, Union

# Base directory of the project
BASE_DIR = Path(__file__).parent.parent

class Settings(BaseSettings):
    """Application settings"""
    # Server Settings
    PORT: str = "3000"
    NODE_ENV: str = "development"
    
    # Database Settings
    DATABASE_URL: str = "sqlite:///./app.db"
    
    # JWT Settings
    JWT_SECRET_KEY: str = "your-secret-key"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Admin Access Settings
    ADMIN_ACCESS_ENABLED: bool = True
    ADMIN_RATE_LIMIT: int = 100  # requests per minute
    ADMIN_ALLOWED_IPS: Union[List[str], str] = ["127.0.0.1"]
    ADMIN_ALLOWED_DOMAINS: List[str] = []
    ADMIN_SESSION_TIMEOUT: int = 3600  # 1 hour
    ADMIN_2FA_REQUIRED: bool = True
    ADMIN_ACCESS_LOG_RETENTION_DAYS: int = 90
    
    # Feature Management Settings
    FEATURE_MANAGEMENT_ENABLED: bool = True
    FEATURE_TOGGLE_COOLDOWN: int = 300  # 5 minutes

    @validator("ADMIN_ALLOWED_IPS", pre=True)
    def parse_admin_ips(cls, v):
        if isinstance(v, str):
            # If it's a comma-separated string
            if "," in v:
                return [ip.strip() for ip in v.split(",")]
            # If it's a single IP
            if not v.startswith("["):
                return [v.strip()]
            # Otherwise, let pydantic handle it as JSON
        return v
    
    class Config:
        env_file = ".env"
        # Allow extra fields to prevent validation errors for unknown env vars
        extra = "allow"

# Create global settings instance
settings = Settings()