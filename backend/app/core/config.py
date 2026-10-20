import os
from pathlib import Path
from pydantic_settings import BaseSettings
from typing import List

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    APP_NAME: str = "Early Disease Risk Prediction Using Explainable Machine Learning"
    APP_VERSION: str = "1.0.0"
    APP_ENV: str = "development"
    DATABASE_URL: str = "mysql+pymysql://root:password@localhost:3306/disease_risk_db"
    FRONTEND_URL: str = "http://localhost:5173"
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.2:latest"
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]

    BASE_DIR: Path = BACKEND_DIR
    DATA_RAW_DIR: Path = BACKEND_DIR / "data" / "raw"
    DATA_PROCESSED_DIR: Path = BACKEND_DIR / "data" / "processed"
    MODELS_DIR: Path = BACKEND_DIR / "models"
    REPORTS_DIR: Path = BACKEND_DIR / "reports"

    # Risk thresholds per disease (Illustrative Model-Output Bands)
    RISK_THRESHOLDS: dict = {
        "diabetes": {"lower_max": 0.35, "higher_min": 0.65},
        "heart_disease": {"lower_max": 0.35, "higher_min": 0.65},
        "kidney_disease": {"lower_max": 0.35, "higher_min": 0.65},
    }

    class Config:
        env_file = BACKEND_DIR / ".env"
        extra = "allow"


settings = Settings()
