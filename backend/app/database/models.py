from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, Boolean
from app.database.session import Base


class PredictionRecord(Base):
    __tablename__ = "prediction_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    disease = Column(String(50), nullable=False, index=True)
    inputs_json = Column(Text, nullable=False)
    probability = Column(Float, nullable=False)
    risk_category = Column(String(50), nullable=False, index=True)
    top_features_json = Column(Text, nullable=False)
    shap_values_json = Column(Text, nullable=False)
    base_value = Column(Float, nullable=False, default=0.0)
    model_version = Column(String(50), nullable=False, default="1.0.0")
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc), index=True)
    is_demo = Column(Boolean, nullable=False, default=False)
