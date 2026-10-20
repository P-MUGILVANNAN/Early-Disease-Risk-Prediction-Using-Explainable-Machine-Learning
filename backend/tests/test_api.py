"""
Comprehensive automated tests for Early Disease Risk Prediction backend.
Covers:
- Dataset validation & preprocessing
- Schema validation & invalid input handling
- Health, disease listing, datasets status
- Prediction and SHAP explanation generation
- Evaluation metrics endpoints
- Dashboard summary & prediction history
- PDF report generation
- Ollama availability and fallback response
"""

import pytest
from fastapi.testclient import TestClient
from pathlib import Path
import json

from app.main import app
from app.core.config import settings

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data
    assert data["database"] == "connected"


def test_list_diseases():
    response = client.get("/api/diseases")
    assert response.status_code == 200
    diseases = response.json()
    assert len(diseases) == 3
    disease_ids = [d["id"] for d in diseases]
    assert "diabetes" in disease_ids
    assert "heart_disease" in disease_ids
    assert "kidney_disease" in disease_ids

    # Check structure
    diab = next(d for d in diseases if d["id"] == "diabetes")
    assert len(diab["features"]) == 8
    assert "risk_thresholds" in diab


def test_datasets_status():
    response = client.get("/api/datasets/status")
    assert response.status_code == 200
    datasets = response.json()
    assert len(datasets) == 3
    for d in datasets:
        assert d["available"] is True
        assert d["rows"] > 0
        assert d["size_bytes"] > 0


def test_models_list():
    response = client.get("/api/models")
    assert response.status_code == 200
    models = response.json()
    assert len(models) == 3
    for m in models:
        assert m["status"] == "Ready"
        assert m["model_version"] == "1.0.0"


def test_models_metrics_endpoint():
    for disease in ["diabetes", "heart_disease", "kidney_disease"]:
        response = client.get(f"/api/models/{disease}/metrics")
        assert response.status_code == 200
        metrics = response.json()
        assert "accuracy" in metrics
        assert "roc_auc" in metrics
        assert "confusion_matrix" in metrics
        assert "roc_curve" in metrics
        assert "baseline_comparison" in metrics
        assert len(metrics["baseline_comparison"]) >= 3


def test_global_feature_importance():
    response = client.get("/api/models/diabetes/feature-importance")
    assert response.status_code == 200
    data = response.json()
    assert data["disease"] == "diabetes"
    assert len(data["features"]) == 8
    assert data["features"][0]["mean_abs_shap"] > 0


def test_diabetes_prediction_valid():
    payload = {
        "Pregnancies": 2,
        "Glucose": 140,
        "BloodPressure": 80,
        "SkinThickness": 32,
        "Insulin": 120,
        "BMI": 33.5,
        "DiabetesPedigreeFunction": 0.52,
        "Age": 45
    }
    response = client.post("/api/predict/diabetes", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert 0.0 <= data["probability"] <= 1.0
    assert data["risk_category"] in ["Lower estimated risk", "Intermediate estimated risk", "Higher estimated risk"]
    assert len(data["top_features"]) == 5
    assert len(data["all_features"]) == 8
    assert "educational_summary" in data
    assert "disclaimer" in data
    assert data["prediction_id"] is not None


def test_heart_prediction_valid():
    payload = {
        "age": 58,
        "sex": 1,
        "cp": 4,
        "trestbps": 140,
        "chol": 260,
        "fbs": 0,
        "restecg": 1,
        "thalach": 135,
        "exang": 1,
        "oldpeak": 2.2,
        "slope": 2,
        "ca": 2,
        "thal": 7.0
    }
    response = client.post("/api/predict/heart_disease", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert 0.0 <= data["probability"] <= 1.0
    assert len(data["top_features"]) == 5


def test_kidney_prediction_valid():
    payload = {
        "age": 48.0,
        "bp": 80.0,
        "sg": 1.020,
        "al": 1.0,
        "su": 0.0,
        "rbc": "normal",
        "pc": "normal",
        "pcc": "notpresent",
        "ba": "notpresent",
        "bgr": 121.0,
        "bu": 36.0,
        "sc": 1.2,
        "sod": 138.0,
        "pot": 4.4,
        "hemo": 15.4,
        "pcv": 44.0,
        "wc": 7800.0,
        "rc": 5.2,
        "htn": "yes",
        "dm": "yes",
        "cad": "no",
        "appet": "good",
        "pe": "no",
        "ane": "no"
    }
    response = client.post("/api/predict/kidney_disease", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert 0.0 <= data["probability"] <= 1.0
    assert len(data["top_features"]) == 5


def test_invalid_input_handling():
    # Missing required field 'Glucose' and out-of-range 'Age'
    bad_payload = {
        "Pregnancies": 3,
        "Age": -10
    }
    response = client.post("/api/predict/diabetes", json=bad_payload)
    assert response.status_code == 422


def test_dashboard_summary():
    response = client.get("/api/dashboard/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["total_assessments"] >= 1
    assert "disease_counts" in data
    assert "risk_distribution" in data
    assert len(data["recent_assessments"]) > 0


def test_prediction_history():
    response = client.get("/api/predictions")
    assert response.status_code == 200
    items = response.json()
    assert len(items) > 0
    first_id = items[0]["id"]

    # Test single retrieval
    single_resp = client.get(f"/api/predictions/{first_id}")
    assert single_resp.status_code == 200
    assert single_resp.json()["prediction_id"] == first_id


def test_pdf_report_download():
    # Get any existing prediction ID
    hist_resp = client.get("/api/predictions?limit=1")
    first_id = hist_resp.json()[0]["id"]

    resp = client.get(f"/api/predictions/{first_id}/report")
    assert resp.status_code == 200
    assert resp.headers["content-type"] == "application/pdf"
    assert len(resp.content) > 1000  # valid PDF file size
    assert resp.content.startswith(b"%PDF")


def test_llm_status_and_explain():
    status_resp = client.get("/api/llm/status")
    assert status_resp.status_code == 200
    data = status_resp.json()
    assert "connected" in data
    assert "model" in data

    explain_req = {
        "disease": "diabetes",
        "probability": 0.68,
        "risk_category": "Higher estimated risk",
        "top_features": [
            {"feature": "Glucose", "display_name": "Plasma Glucose", "value": 160, "shap_value": 0.45, "impact": "increases_risk"},
            {"feature": "BMI", "display_name": "BMI", "value": 33.2, "shap_value": 0.28, "impact": "increases_risk"}
        ],
        "user_query": "Why did glucose matter so much?"
    }
    explain_resp = client.post("/api/llm/explain", json=explain_req)
    assert explain_resp.status_code == 200
    exp_data = explain_resp.json()
    assert len(exp_data["explanation"]) > 50
    assert exp_data["source"] in ["ollama", "predefined_fallback"]
    assert "safety_disclaimer" in exp_data
