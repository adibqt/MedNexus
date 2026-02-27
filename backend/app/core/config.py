import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional
from dotenv import load_dotenv

# Get the backend directory (where .env file is located)
BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_FILE = BASE_DIR / ".env"

# Explicitly load the .env file
load_dotenv(ENV_FILE)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )
    
    # Application
    APP_NAME: str = "MedNexus API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # CORS
    ALLOWED_ORIGINS: list = ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"]
    
    # Database - will be loaded from .env
    DATABASE_URL: str
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60  # Access token - 1 hour
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30  # Long-lived refresh token
    
    # Google AI
    GOOGLE_API_KEY: Optional[str] = None
    
    # LiveKit
    LIVEKIT_URL: Optional[str] = None
    LIVEKIT_API_KEY: Optional[str] = None
    LIVEKIT_API_SECRET: Optional[str] = None

    # Email / SMTP
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM_NAME: str = "MedNexus Healthcare"
    SMTP_FROM_EMAIL: Optional[str] = None
    SMTP_USE_TLS: bool = True


settings = Settings()
