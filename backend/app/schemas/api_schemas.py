from pydantic import BaseModel
from typing import List, Dict, Any, Optional


class HealthResponse(BaseModel):
    status: str
    version: str
    environment: str
    database: str
    ollama_connected: bool


class DiseaseInfo(BaseModel):
    id: str
    title: str
    description: str
    dataset_name: str
    features_count: int
    features: List[Dict[str, Any]]
    risk_thresholds: Dict[str, float]


class DatasetStatusResponse(BaseModel):
    disease: str
    filename: str
    available: bool
    size_bytes: int
    rows: int
    columns: int
    target_distribution: Dict[str, int]
    missing_values_count: int
    features: List[str]


class ModelMetricsResponse(BaseModel):
    disease: str
    model_name: str
    model_version: str
    training_date: str
    accuracy: float
    precision: float
    recall: float
    specificity: float
    f1_score: float
    roc_auc: float
    pr_auc: float
    brier_score: float
    confusion_matrix: Dict[str, int]  # {"tp": ..., "fp": ..., "tn": ..., "fn": ...}
    roc_curve: List[Dict[str, float]]  # [{"fpr": 0.0, "tpr": 0.0}, ...]
    pr_curve: List[Dict[str, float]]   # [{"recall": 1.0, "precision": 0.5}, ...]
    baseline_comparison: List[Dict[str, Any]]


class GlobalFeatureImportanceItem(BaseModel):
    feature: str
    display_name: str
    mean_abs_shap: float
    description: str


class GlobalFeatureImportanceResponse(BaseModel):
    disease: str
    features: List[GlobalFeatureImportanceItem]


class DashboardSummaryResponse(BaseModel):
    total_assessments: int
    disease_counts: Dict[str, int]
    risk_distribution: Dict[str, int]
    recent_assessments: List[Dict[str, Any]]
    model_statuses: Dict[str, bool]


class PredictionHistoryItem(BaseModel):
    id: int
    disease: str
    disease_title: str
    probability: float
    risk_category: str
    top_features: List[str]
    model_version: str
    created_at: str
    is_demo: bool


class OllamaStatusResponse(BaseModel):
    connected: bool
    base_url: str
    model: str
    model_available: bool
    available_models: List[str]
    message: str


class OllamaExplainRequest(BaseModel):
    disease: str
    probability: float
    risk_category: str
    top_features: List[Dict[str, Any]]
    user_query: Optional[str] = None


class OllamaExplainResponse(BaseModel):
    explanation: str
    source: str  # "ollama" or "predefined_fallback"
    model_used: str
    safety_disclaimer: str
