from pydantic import BaseModel
from typing import List, Optional, Any, Dict


class FeatureContribution(BaseModel):
    feature: str
    display_name: str
    value: Any
    shap_value: float
    impact: str  # 'increases_risk', 'decreases_risk', 'neutral'
    description: str


class PredictionResponse(BaseModel):
    prediction_id: Optional[int] = None
    disease: str
    disease_title: str
    probability: float
    risk_category: str
    base_value: float
    top_features: List[FeatureContribution]
    all_features: List[FeatureContribution]
    model_version: str
    timestamp: str
    educational_summary: str
    limitations: List[str]
    disclaimer: str


class ExplainRequest(BaseModel):
    disease: str
    inputs: Dict[str, Any]


class ExplainResponse(BaseModel):
    disease: str
    base_value: float
    features: List[FeatureContribution]
    summary_text: str
    interpretation_note: str
