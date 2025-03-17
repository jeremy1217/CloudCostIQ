from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # Admin Access Settings
    ADMIN_ACCESS_ENABLED: bool = os.getenv('ADMIN_ACCESS_ENABLED', 'false').lower() == 'true'
    ADMIN_RATE_LIMIT: int = int(os.getenv('ADMIN_RATE_LIMIT', '100'))  # requests per minute
    ADMIN_ALLOWED_IPS: List[str] = os.getenv('ADMIN_ALLOWED_IPS', '127.0.0.1').split(',')
    ADMIN_ALLOWED_DOMAINS: List[str] = os.getenv('ADMIN_ALLOWED_DOMAINS', '').split(',')
    
    # Security Settings
    ADMIN_SESSION_TIMEOUT: int = int(os.getenv('ADMIN_SESSION_TIMEOUT', '3600'))  # 1 hour
    ADMIN_2FA_REQUIRED: bool = os.getenv('ADMIN_2FA_REQUIRED', 'true').lower() == 'true'
    ADMIN_ACCESS_LOG_RETENTION_DAYS: int = int(os.getenv('ADMIN_ACCESS_LOG_RETENTION_DAYS', '90'))
    
    # Feature Management Settings
    FEATURE_MANAGEMENT_ENABLED: bool = os.getenv('FEATURE_MANAGEMENT_ENABLED', 'true').lower() == 'true'
    FEATURE_TOGGLE_COOLDOWN: int = int(os.getenv('FEATURE_TOGGLE_COOLDOWN', '300'))  # 5 minutes
    
    class Config:
        env_file = ".env"

settings = Settings() 