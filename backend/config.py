"""
Application configuration module.
Provides centralized configuration management for the application.
"""
import os
from pathlib import Path
from pydantic import BaseSettings

# Base directory of the project
BASE_DIR = Path(__file__).parent.parent

class Settings(BaseSettings):
    """Application settings"""
    # Database
    DATABASE_URL: str = f"sqlite:///{os.path.join(BASE_DIR, 'cloudcostiq.db')}"
    
    # API
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    API_DEBUG: bool = True
    
    # CORS
    CORS_ORIGINS: list = ["*"]
    
    # Mock data settings
    USE_MOCK_DATA: bool = True
    MOCK_DATA_DAYS: int = 90
    
    # AI model settings
    ANOMALY_THRESHOLD: float = 2.0  # Z-score threshold for anomaly detection
    FORECAST_DAYS: int = 30  # Default number of days to forecast
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Create global settings instance
settings = Settings()