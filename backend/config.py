"""
Application configuration module.
Provides centralized configuration management for the application.
"""

# Standard library imports
from pathlib import Path
import os

# Third-party imports
from pydantic import Field
from pydantic_settings import BaseSettings

# Base directory of the project
BASE_DIR = Path(__file__).parent.parent

class Settings(BaseSettings):
    """Application settings"""
    # Database
    DATABASE_URL: str = Field(default=f"sqlite:///{os.path.join(BASE_DIR, 'cloudcostiq.db')}")
    
    # API
    API_HOST: str = Field(default="0.0.0.0")
    API_PORT: int = Field(default=8000)
    API_DEBUG: bool = Field(default=True)
    
    # CORS
    CORS_ORIGINS: list = Field(default=["*"])
    
    # Mock data settings
    USE_MOCK_DATA: bool = Field(default=True)
    MOCK_DATA_DAYS: int = Field(default=90)
    
    # AI model settings
    ANOMALY_THRESHOLD: float = Field(default=2.0)  # Z-score threshold for anomaly detection
    FORECAST_DAYS: int = Field(default=30)  # Default number of days to forecast
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Create global settings instance
settings = Settings()