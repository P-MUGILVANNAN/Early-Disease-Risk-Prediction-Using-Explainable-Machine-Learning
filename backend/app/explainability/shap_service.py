"""
SHAP Explainability Service for local and global model explanations.
Computes TreeExplainer SHAP values, feature attributions, and plain-language summaries.
"""

import json
import joblib
from pathlib import Path
from typing import Dict, Any, List, Tuple
import numpy as np
import pandas as pd
import shap

from app.core.config import settings
from app.ml.metadata import FEATURE_METADATA
from app.schemas.prediction import FeatureContribution, PredictionResponse, ExplainResponse


class ShapService:
    def __init__(self, models_dir: Path = settings.MODELS_DIR):
        self.models_dir = models_dir
        self._cache = {}

    def _get_artifacts(self, disease: str):
        if disease not in self._cache:
            disease_dir = self.models_dir / disease
            if not (disease_dir / "model.joblib").exists():
                raise FileNotFoundError(f"Model artifacts for '{disease}' not found in {disease_dir}. Please train models first.")

            model = joblib.load(disease_dir / "model.joblib")
            preprocessor = joblib.load(disease_dir / "preprocessor.joblib")

            with open(disease_dir / "metadata.json", "r", encoding="utf-8") as f:
                metadata = json.load(f)

            with open(disease_dir / "shap_summary.json", "r", encoding="utf-8") as f:
                shap_summary = json.load(f)

            explainer = shap.TreeExplainer(model)

            self._cache[disease] = {
                "model": model,
                "preprocessor": preprocessor,
                "metadata": metadata,
                "shap_summary": shap_summary,
                "explainer": explainer
            }
        return self._cache[disease]

    def predict_and_explain(self, disease: str, inputs_dict: Dict[str, Any]) -> PredictionResponse:
        artifacts = self._get_artifacts(disease)
        model = artifacts["model"]
        preprocessor = artifacts["preprocessor"]
        explainer = artifacts["explainer"]
        metadata = artifacts["metadata"]
        disease_meta = FEATURE_METADATA[disease]

        # Prepare DataFrame
        raw_df = pd.DataFrame([inputs_dict])

        # Preprocess input (imputer + scaler using train-fitted parameters)
        trans_df = preprocessor.transform(raw_df)

        # Predict probability
        prob = float(model.predict_proba(trans_df)[0, 1])

        # Determine illustrative risk category based on documented thresholds
        thresholds = settings.RISK_THRESHOLDS.get(disease, {"lower_max": 0.35, "higher_min": 0.65})
        if prob < thresholds["lower_max"]:
            risk_category = "Lower estimated risk"
        elif prob >= thresholds["higher_min"]:
            risk_category = "Higher estimated risk"
        else:
            risk_category = "Intermediate estimated risk"

        # Calculate SHAP values
        shap_vals = explainer.shap_values(trans_df)
        if isinstance(shap_vals, list):
            # For some tree models, binary returns [neg_shap, pos_shap]
            shap_vals_row = shap_vals[1][0]
        elif shap_vals.ndim == 2:
            shap_vals_row = shap_vals[0]
        else:
            shap_vals_row = shap_vals

        base_val = float(explainer.expected_value) if np.isscalar(explainer.expected_value) else float(explainer.expected_value[1] if len(explainer.expected_value) > 1 else explainer.expected_value[0])

        # Map contributions
        features_list: List[FeatureContribution] = []
        feature_names = list(trans_df.columns)

        for idx, feat_name in enumerate(feature_names):
            shap_v = float(shap_vals_row[idx])
            raw_val = inputs_dict.get(feat_name, trans_df.iloc[0, idx])
            feat_info = disease_meta["features"].get(feat_name, {})
            display_name = feat_info.get("display_name", feat_name)
            unit = feat_info.get("unit", "")
            description = feat_info.get("description", "")

            if shap_v > 0.01:
                impact = "increases_risk"
            elif shap_v < -0.01:
                impact = "decreases_risk"
            else:
                impact = "neutral"

            features_list.append(FeatureContribution(
                feature=feat_name,
                display_name=f"{display_name} ({unit})" if unit and unit not in ["type", "code", "flag", "state", "category"] else display_name,
                value=raw_val,
                shap_value=round(shap_v, 4),
                impact=impact,
                description=description
            ))

        # Sort by absolute SHAP value descending
        sorted_features = sorted(features_list, key=lambda x: abs(x.shap_value), reverse=True)
        top_5 = sorted_features[:5]

        # Plain language educational summary
        top_pushing_higher = [f.display_name for f in top_5 if f.impact == "increases_risk"]
        top_pushing_lower = [f.display_name for f in top_5 if f.impact == "decreases_risk"]

        summary_parts = [
            f"The model estimated a risk probability of {prob * 100:.1f}%, placing this evaluation in the '{risk_category}' band."
        ]
        if top_pushing_higher:
            summary_parts.append(
                f"The primary factors shifting the model's estimate higher than its baseline of {base_val:.2f} were: {', '.join(top_pushing_higher[:3])}."
            )
        if top_pushing_lower:
            summary_parts.append(
                f"Factors that contributed toward lowering the estimated risk were: {', '.join(top_pushing_lower[:2])}."
            )
        summary_parts.append(
            "Note: SHAP values describe internal algorithmic feature attribution and reflect statistical correlation in the research dataset, not biological causality."
        )

        educational_summary = " ".join(summary_parts)

        limitations = [
            f"Trained on the historic {disease_meta['dataset_name']} research cohort; may not represent broader clinical populations.",
            "Predictions reflect statistical pattern recognition and must never be interpreted as clinical diagnoses.",
            "Factors not included in the dataset schema (e.g. detailed lifestyle, genetics, medication adherence) are not accounted for.",
            "Threshold bands are illustrative model-output partitions and do not represent clinically validated diagnostic cutoffs."
        ]

        disclaimer = (
            "IMPORTANT MEDICAL DISCLAIMER: This software is developed strictly for educational and research exploration of "
            "explainable machine learning. It does NOT provide clinical diagnosis, medical treatment, or replace professional "
            "medical consultation. If you have concerns about your health, consult a qualified physician or healthcare provider."
        )

        from datetime import datetime, timezone
        return PredictionResponse(
            prediction_id=None,
            disease=disease,
            disease_title=disease_meta["title"],
            probability=round(prob, 4),
            risk_category=risk_category,
            base_value=round(base_val, 4),
            top_features=top_5,
            all_features=sorted_features,
            model_version=metadata.get("model_version", "1.0.0"),
            timestamp=datetime.now(timezone.utc).isoformat(),
            educational_summary=educational_summary,
            limitations=limitations,
            disclaimer=disclaimer
        )

    def get_global_importance(self, disease: str) -> List[Dict[str, Any]]:
        artifacts = self._get_artifacts(disease)
        return artifacts["shap_summary"]["global_importance"]


shap_service = ShapService()
