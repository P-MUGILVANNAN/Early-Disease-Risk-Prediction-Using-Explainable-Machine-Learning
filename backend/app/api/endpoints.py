"""
FastAPI REST API endpoints matching Section 12 specifications.
"""

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Dict, Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from pydantic import ValidationError
from sqlalchemy.orm import Session
from sqlalchemy import desc, text

from app.core.config import settings
from app.database.session import get_db
from app.database.models import PredictionRecord
from app.schemas.disease_schemas import DiabetesInput, HeartDiseaseInput, KidneyDiseaseInput
from app.schemas.prediction import (
    PredictionResponse, ExplainRequest, ExplainResponse, FeatureContribution
)
from app.schemas.api_schemas import (
    HealthResponse, DiseaseInfo, DatasetStatusResponse,
    ModelMetricsResponse, GlobalFeatureImportanceResponse, GlobalFeatureImportanceItem,
    DashboardSummaryResponse, PredictionHistoryItem, OllamaStatusResponse,
    OllamaExplainRequest, OllamaExplainResponse
)
from app.ml.metadata import FEATURE_METADATA
from app.explainability.shap_service import shap_service
from app.services.llm_service import ollama_service
from app.services.pdf_service import pdf_generator

router = APIRouter()


# ---------------------------------------------------------
# General Endpoints
# ---------------------------------------------------------

@router.get("/health", response_model=HealthResponse, tags=["General"])
async def get_health(db: Session = Depends(get_db)):
    """Check backend operational status, DB connection, and local Ollama availability."""
    db_ok = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        db_ok = "error"

    ollama_status = await ollama_service.check_status()

    return HealthResponse(
        status="healthy",
        version=settings.APP_VERSION,
        environment=settings.APP_ENV,
        database=db_ok,
        ollama_connected=ollama_status.connected
    )


@router.get("/diseases", response_model=List[DiseaseInfo], tags=["General"])
def list_diseases():
    """List all supported disease prediction modules with feature definitions and thresholds."""
    result = []
    for d_id, meta in FEATURE_METADATA.items():
        features_list = []
        for f_name, f_info in meta["features"].items():
            f_data = {
                "name": f_name,
                "display_name": f_info.get("display_name", f_name),
                "unit": f_info.get("unit", ""),
                "description": f_info.get("description", ""),
                "min": f_info.get("min"),
                "max": f_info.get("max"),
                "default": f_info.get("default"),
                "options": f_info.get("options")
            }
            features_list.append(f_data)

        thresholds = settings.RISK_THRESHOLDS.get(d_id, {"lower_max": 0.35, "higher_min": 0.65})

        result.append(DiseaseInfo(
            id=d_id,
            title=meta["title"],
            description=f"Risk classification using explainable XGBoost and SHAP on the {meta['dataset_name']}.",
            dataset_name=meta["dataset_name"],
            features_count=len(features_list),
            features=features_list,
            risk_thresholds=thresholds
        ))
    return result


@router.get("/datasets/status", response_model=List[DatasetStatusResponse], tags=["General"])
def get_datasets_status():
    """Show raw dataset file availability, sample sizes, and validation state."""
    results = []
    for disease, meta in FEATURE_METADATA.items():
        fname = "diabetes.csv" if disease == "diabetes" else "heart_disease.csv" if disease == "heart_disease" else "kidney_disease.csv"
        file_path = settings.DATA_RAW_DIR / fname
        report_path = settings.REPORTS_DIR / f"{disease}_validation_report.json"

        available = file_path.exists() and file_path.stat().st_size > 100
        size_bytes = file_path.stat().st_size if available else 0
        rows, cols = 0, len(meta["features"])
        dist = {}
        missing_count = 0

        if report_path.exists():
            try:
                with open(report_path, "r", encoding="utf-8") as rf:
                    rep_data = json.load(rf)
                    rows = rep_data.get("total_rows", 0)
                    cols = rep_data.get("total_columns", cols)
                    dist = rep_data.get("target_distribution", {})
                    missing_dict = rep_data.get("total_nan_after_cleaning", {})
                    missing_count = sum(missing_dict.values())
            except Exception:
                pass

        results.append(DatasetStatusResponse(
            disease=disease,
            filename=fname,
            available=available,
            size_bytes=size_bytes,
            rows=rows,
            columns=cols,
            target_distribution=dist,
            missing_values_count=missing_count,
            features=list(meta["features"].keys())
        ))
    return results


# ---------------------------------------------------------
# Machine Learning Endpoints
# ---------------------------------------------------------

@router.get("/models", tags=["Machine Learning"])
def list_models():
    """List all available models, trained versions, and serialization timestamps."""
    models_info = []
    for d_id, meta in FEATURE_METADATA.items():
        meta_file = settings.MODELS_DIR / d_id / "metadata.json"
        if meta_file.exists():
            with open(meta_file, "r", encoding="utf-8") as f:
                d_meta = json.load(f)
            models_info.append({
                "disease": d_id,
                "disease_title": meta["title"],
                "model_version": d_meta.get("model_version", "1.0.0"),
                "model_type": d_meta.get("model_type", "XGBoostClassifier"),
                "training_date": d_meta.get("training_date"),
                "status": "Ready",
                "test_samples": d_meta.get("test_samples"),
                "feature_count": len(d_meta.get("feature_names", []))
            })
        else:
            models_info.append({
                "disease": d_id,
                "disease_title": meta["title"],
                "model_version": "N/A",
                "status": "Untrained",
                "message": "Model not trained yet."
            })
    return models_info


@router.get("/models/{disease}/metrics", response_model=ModelMetricsResponse, tags=["Machine Learning"])
def get_model_metrics(disease: str):
    """Retrieve test-set evaluation metrics, ROC/PR curve points, confusion matrix, and baselines."""
    if disease not in FEATURE_METADATA:
        raise HTTPException(status_code=404, detail=f"Disease '{disease}' not recognized.")

    metrics_file = settings.MODELS_DIR / disease / "metrics.json"
    if not metrics_file.exists():
        raise HTTPException(status_code=404, detail=f"Metrics for '{disease}' not found. Please train models first.")

    with open(metrics_file, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data


@router.get("/models/{disease}/feature-importance", response_model=GlobalFeatureImportanceResponse, tags=["Machine Learning"])
def get_global_feature_importance(disease: str):
    """Retrieve global mean absolute SHAP values for the specified disease."""
    if disease not in FEATURE_METADATA:
        raise HTTPException(status_code=404, detail=f"Disease '{disease}' not recognized.")

    shap_file = settings.MODELS_DIR / disease / "shap_summary.json"
    if not shap_file.exists():
        raise HTTPException(status_code=404, detail=f"SHAP summary for '{disease}' not found.")

    with open(shap_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    items = [
        GlobalFeatureImportanceItem(
            feature=i["feature"],
            display_name=i["display_name"],
            mean_abs_shap=i["mean_abs_shap"],
            description=i.get("description", "")
        )
        for i in data.get("global_importance", [])
    ]
    return GlobalFeatureImportanceResponse(disease=disease, features=items)


@router.post("/predict/{disease}", response_model=PredictionResponse, tags=["Machine Learning"])
def predict_disease(disease: str, payload: Dict[str, Any], db: Session = Depends(get_db)):
    """Validate inputs against disease schema, compute XGBoost probability and local SHAP values, and record history."""
    if disease not in FEATURE_METADATA:
        raise HTTPException(status_code=404, detail=f"Disease '{disease}' not supported.")

    # Strict Schema Validation per disease
    try:
        if disease == "diabetes":
            validated_obj = DiabetesInput(**payload)
        elif disease == "heart_disease":
            validated_obj = HeartDiseaseInput(**payload)
        elif disease == "kidney_disease":
            validated_obj = KidneyDiseaseInput(**payload)
        else:
            raise HTTPException(status_code=400, detail="Unsupported disease module.")
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=e.errors())

    validated_dict = validated_obj.model_dump()

    # Generate prediction and SHAP explanation
    try:
        pred_resp = shap_service.predict_and_explain(disease, validated_dict)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction pipeline error: {str(e)}")

    # Store prediction record in SQLite database
    record = PredictionRecord(
        disease=disease,
        inputs_json=json.dumps(validated_dict),
        probability=pred_resp.probability,
        risk_category=pred_resp.risk_category,
        top_features_json=json.dumps([f.model_dump() for f in pred_resp.top_features]),
        shap_values_json=json.dumps({f.feature: f.shap_value for f in pred_resp.all_features}),
        base_value=pred_resp.base_value,
        model_version=pred_resp.model_version,
        is_demo=False
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    pred_resp.prediction_id = record.id
    return pred_resp


@router.post("/explain/{disease}", response_model=ExplainResponse, tags=["Machine Learning"])
def explain_disease(disease: str, req: ExplainRequest):
    """Generate SHAP local feature attributions for a given set of inputs."""
    if disease not in FEATURE_METADATA:
        raise HTTPException(status_code=404, detail=f"Disease '{disease}' not supported.")

    pred_resp = shap_service.predict_and_explain(disease, req.inputs)
    return ExplainResponse(
        disease=disease,
        base_value=pred_resp.base_value,
        features=pred_resp.all_features,
        summary_text=pred_resp.educational_summary,
        interpretation_note="SHAP values show positive or negative alignment relative to the training baseline."
    )


# ---------------------------------------------------------
# Dashboard & History Endpoints
# ---------------------------------------------------------

@router.get("/dashboard/summary", response_model=DashboardSummaryResponse, tags=["Dashboard"])
def get_dashboard_summary(db: Session = Depends(get_db)):
    """Retrieve aggregate counts, disease distributions, and recent assessment logs."""
    total = db.query(PredictionRecord).count()
    if total == 0:
        # Seed realistic demonstration records if table is brand new
        _seed_demo_records(db)
        total = db.query(PredictionRecord).count()

    records = db.query(PredictionRecord).all()

    disease_counts = {"diabetes": 0, "heart_disease": 0, "kidney_disease": 0}
    risk_dist = {"Lower estimated risk": 0, "Intermediate estimated risk": 0, "Higher estimated risk": 0}

    for r in records:
        if r.disease in disease_counts:
            disease_counts[r.disease] += 1
        if r.risk_category in risk_dist:
            risk_dist[r.risk_category] += 1
        else:
            risk_dist[r.risk_category] = 1

    recent = (
        db.query(PredictionRecord)
        .order_by(desc(PredictionRecord.created_at))
        .limit(8)
        .all()
    )

    recent_list = []
    for rec in recent:
        top_f = []
        try:
            top_f = [f.get("display_name", f.get("feature")) for f in json.loads(rec.top_features_json)[:3]]
        except Exception:
            pass

        recent_list.append({
            "id": rec.id,
            "disease": rec.disease,
            "disease_title": FEATURE_METADATA.get(rec.disease, {}).get("title", rec.disease),
            "probability": rec.probability,
            "risk_category": rec.risk_category,
            "top_features": top_f,
            "created_at": rec.created_at.strftime("%Y-%m-%d %H:%M:%S UTC") if hasattr(rec.created_at, "strftime") else str(rec.created_at),
            "is_demo": rec.is_demo
        })

    model_statuses = {
        d: (settings.MODELS_DIR / d / "model.joblib").exists()
        for d in FEATURE_METADATA.keys()
    }

    return DashboardSummaryResponse(
        total_assessments=total,
        disease_counts=disease_counts,
        risk_distribution=risk_dist,
        recent_assessments=recent_list,
        model_statuses=model_statuses
    )


@router.get("/predictions", response_model=List[PredictionHistoryItem], tags=["Dashboard"])
def get_predictions_history(
    disease: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """Retrieve history of risk assessments with filtering by disease."""
    query = db.query(PredictionRecord)
    if disease:
        query = query.filter(PredictionRecord.disease == disease)

    records = query.order_by(desc(PredictionRecord.created_at)).limit(limit).all()

    items = []
    for r in records:
        top_feats = []
        try:
            top_feats = [f.get("display_name", f.get("feature")) for f in json.loads(r.top_features_json)[:4]]
        except Exception:
            pass

        items.append(PredictionHistoryItem(
            id=r.id,
            disease=r.disease,
            disease_title=FEATURE_METADATA.get(r.disease, {}).get("title", r.disease),
            probability=r.probability,
            risk_category=r.risk_category,
            top_features=top_feats,
            model_version=r.model_version,
            created_at=r.created_at.strftime("%Y-%m-%d %H:%M:%S UTC") if hasattr(r.created_at, "strftime") else str(r.created_at),
            is_demo=r.is_demo
        ))
    return items


@router.get("/predictions/{prediction_id}", response_model=PredictionResponse, tags=["Dashboard"])
def get_prediction_by_id(prediction_id: int, db: Session = Depends(get_db)):
    """Retrieve an individual historical prediction with its full SHAP breakdown and limitations."""
    record = db.query(PredictionRecord).filter(PredictionRecord.id == prediction_id).first()
    if not record:
        raise HTTPException(status_code=404, detail=f"Prediction #{prediction_id} not found.")

    top_features_raw = json.loads(record.top_features_json)
    shap_vals_dict = json.loads(record.shap_values_json)
    inputs_dict = json.loads(record.inputs_json)
    disease_meta = FEATURE_METADATA.get(record.disease, {})

    all_features = []
    for feat_name, shap_val in shap_vals_dict.items():
        raw_val = inputs_dict.get(feat_name, "-")
        f_info = disease_meta.get("features", {}).get(feat_name, {})
        disp_name = f_info.get("display_name", feat_name)
        impact = "increases_risk" if shap_val > 0.01 else "decreases_risk" if shap_val < -0.01 else "neutral"

        all_features.append(FeatureContribution(
            feature=feat_name,
            display_name=disp_name,
            value=raw_val,
            shap_value=round(shap_val, 4),
            impact=impact,
            description=f_info.get("description", "")
        ))

    all_features = sorted(all_features, key=lambda x: abs(x.shap_value), reverse=True)
    top_5 = [FeatureContribution(**f) for f in top_features_raw]

    limitations = [
        f"Trained on historic {disease_meta.get('dataset_name', 'clinical')} dataset.",
        "Model estimates statistical patterns, not biological causality or diagnosis.",
        "Must be reviewed in conjunction with qualified clinical consultation."
    ]

    disclaimer = (
        "IMPORTANT MEDICAL DISCLAIMER: This assessment is for educational and research purposes only. "
        "It does not provide diagnosis, clinical prognosis, or treatment prescriptions."
    )

    return PredictionResponse(
        prediction_id=record.id,
        disease=record.disease,
        disease_title=disease_meta.get("title", record.disease),
        probability=record.probability,
        risk_category=record.risk_category,
        base_value=record.base_value,
        top_features=top_5,
        all_features=all_features,
        model_version=record.model_version,
        timestamp=record.created_at.strftime("%Y-%m-%d %H:%M:%S UTC") if hasattr(record.created_at, "strftime") else str(record.created_at),
        educational_summary=f"Historical evaluation #{record.id} for {disease_meta.get('title', record.disease)} with an estimated probability of {record.probability * 100:.1f}%.",
        limitations=limitations,
        disclaimer=disclaimer
    )


@router.get("/predictions/{prediction_id}/report", tags=["Dashboard"])
def download_prediction_report(prediction_id: int, db: Session = Depends(get_db)):
    """Generate and stream a downloadable medical research PDF report."""
    record = db.query(PredictionRecord).filter(PredictionRecord.id == prediction_id).first()
    if not record:
        raise HTTPException(status_code=404, detail=f"Prediction #{prediction_id} not found.")

    try:
        pdf_bytes = pdf_generator.generate_report(record)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")

    filename = f"Risk_Report_{record.disease}_{record.id:04d}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


# ---------------------------------------------------------
# Local LLM Endpoints
# ---------------------------------------------------------

@router.get("/llm/status", response_model=OllamaStatusResponse, tags=["Local LLM"])
async def get_llm_status():
    """Check connectivity to Ollama on http://localhost:11434 and availability of llama3.2:latest."""
    return await ollama_service.check_status()


@router.post("/llm/explain", response_model=OllamaExplainResponse, tags=["Local LLM"])
async def explain_with_llm(req: OllamaExplainRequest):
    """Generate an educational plain-language explanation of model results using local llama3.2:latest."""
    disease_meta = FEATURE_METADATA.get(req.disease, {})
    title = disease_meta.get("title", req.disease.replace("_", " ").title())

    return await ollama_service.generate_explanation(
        disease_title=title,
        probability=req.probability,
        risk_category=req.risk_category,
        top_features=req.top_features,
        user_query=req.user_query
    )


@router.get("/user-guide/download", tags=["General"])
def download_user_guide_pdf():
    """Download the comprehensive Application User Guide & Workout Manual PDF."""
    pdf_path = settings.BASE_DIR.parent / "Application_User_Guide_and_Workout_Manual.pdf"
    if not pdf_path.exists():
        # Fallback to backend dir or generate
        from scripts.generate_user_guide_pdf import build_pdf
        pdf_path = build_pdf()

    return Response(
        content=pdf_path.read_bytes(),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=Application_User_Guide_and_Workout_Manual.pdf"}
    )


def _seed_demo_records(db: Session):
    """Seed initial demonstration records for dashboard exploration."""
    demo_samples = [
        ("diabetes", {"Pregnancies": 2, "Glucose": 145, "BloodPressure": 80, "SkinThickness": 32, "Insulin": 110, "BMI": 34.2, "DiabetesPedigreeFunction": 0.65, "Age": 48}, 0.72, "Higher estimated risk"),
        ("diabetes", {"Pregnancies": 1, "Glucose": 92, "BloodPressure": 68, "SkinThickness": 22, "Insulin": 75, "BMI": 23.4, "DiabetesPedigreeFunction": 0.28, "Age": 29}, 0.12, "Lower estimated risk"),
        ("heart_disease", {"age": 62, "sex": 1, "cp": 4, "trestbps": 150, "chol": 275, "fbs": 0, "restecg": 2, "thalach": 128, "exang": 1, "oldpeak": 2.6, "slope": 2, "ca": 2, "thal": 7.0}, 0.88, "Higher estimated risk"),
        ("heart_disease", {"age": 44, "sex": 0, "cp": 2, "trestbps": 118, "chol": 190, "fbs": 0, "restecg": 0, "thalach": 168, "exang": 0, "oldpeak": 0.4, "slope": 1, "ca": 0, "thal": 3.0}, 0.18, "Lower estimated risk"),
        ("kidney_disease", {"age": 60, "bp": 90, "sg": 1.010, "al": 3, "su": 0, "rbc": "normal", "pc": "abnormal", "pcc": "present", "ba": "notpresent", "bgr": 150, "bu": 65, "sc": 2.8, "sod": 132, "pot": 4.8, "hemo": 9.8, "pcv": 30, "wc": 9800, "rc": 3.8, "htn": "yes", "dm": "yes", "cad": "no", "appet": "poor", "pe": "yes", "ane": "yes"}, 0.94, "Higher estimated risk"),
        ("kidney_disease", {"age": 36, "bp": 70, "sg": 1.025, "al": 0, "su": 0, "rbc": "normal", "pc": "normal", "pcc": "notpresent", "ba": "notpresent", "bgr": 95, "bu": 26, "sc": 0.8, "sod": 141, "pot": 4.2, "hemo": 15.2, "pcv": 46, "wc": 6400, "rc": 5.4, "htn": "no", "dm": "no", "cad": "no", "appet": "good", "pe": "no", "ane": "no"}, 0.05, "Lower estimated risk"),
        ("diabetes", {"Pregnancies": 3, "Glucose": 122, "BloodPressure": 76, "SkinThickness": 28, "Insulin": 95, "BMI": 29.8, "DiabetesPedigreeFunction": 0.45, "Age": 41}, 0.48, "Intermediate estimated risk"),
        ("heart_disease", {"age": 53, "sex": 1, "cp": 3, "trestbps": 134, "chol": 230, "fbs": 0, "restecg": 0, "thalach": 142, "exang": 0, "oldpeak": 1.1, "slope": 2, "ca": 1, "thal": 3.0}, 0.46, "Intermediate estimated risk")
    ]

    for dis, inp, prob, r_cat in demo_samples:
        top_f = [
            {"feature": list(inp.keys())[i], "display_name": list(inp.keys())[i], "value": list(inp.values())[i], "shap_value": round(0.4 - i * 0.1, 3), "impact": "increases_risk" if i < 2 else "decreases_risk", "description": ""}
            for i in range(min(4, len(inp)))
        ]
        rec = PredictionRecord(
            disease=dis,
            inputs_json=json.dumps(inp),
            probability=prob,
            risk_category=r_cat,
            top_features_json=json.dumps(top_f),
            shap_values_json=json.dumps({k: 0.1 for k in inp.keys()}),
            base_value=0.35,
            model_version="1.0.0",
            is_demo=True
        )
        db.add(rec)
    db.commit()
