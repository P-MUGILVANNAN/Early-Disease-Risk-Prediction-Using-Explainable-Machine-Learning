"""
Model training, evaluation, SHAP explainer generation, and baseline comparison.
"""

import json
import joblib
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, Tuple

import numpy as np
import pandas as pd
import shap
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, average_precision_score, confusion_matrix,
    roc_curve, precision_recall_curve, brier_score_loss
)
from xgboost import XGBClassifier

from app.core.config import settings
from app.ml.dataset_loader import dataset_loader
from app.ml.preprocessors import get_preprocessor
from app.ml.metadata import FEATURE_METADATA


class DiseaseModelTrainer:
    def __init__(self, disease: str, models_dir: Path = settings.MODELS_DIR):
        self.disease = disease
        self.models_dir = models_dir / disease
        self.models_dir.mkdir(parents=True, exist_ok=True)
        self.metadata = FEATURE_METADATA[disease]
        self.random_state = 42

    def train_and_evaluate(self) -> Dict[str, Any]:
        print(f"\n=======================================================")
        print(f"Training Model Pipeline for: {self.metadata['title']}")
        print(f"=======================================================")

        # 1. Load data
        X, y, data_report = dataset_loader.load_dataset(self.disease)

        # 2. Stratified train/test split (80/20)
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.20, random_state=self.random_state, stratify=y
        )

        # 3. Fit preprocessor ONLY on training set
        preprocessor = get_preprocessor(self.disease, list(X.columns))
        X_train_trans = preprocessor.fit_transform(X_train)
        X_test_trans = preprocessor.transform(X_test)

        feature_names = list(X_train_trans.columns)
        print(f"Dataset shape: Train={X_train_trans.shape}, Test={X_test_trans.shape}")
        print(f"Feature names ({len(feature_names)}): {feature_names}")

        # 4. Class imbalance assessment
        neg_count = int((y_train == 0).sum())
        pos_count = int((y_train == 1).sum())
        scale_pos_weight = neg_count / max(pos_count, 1)
        print(f"Class distribution: 0={neg_count}, 1={pos_count}. scale_pos_weight={scale_pos_weight:.2f}")

        # 5. Baseline models comparison
        baselines = {
            "Logistic Regression": LogisticRegression(random_state=self.random_state, max_iter=1000),
            "Decision Tree": DecisionTreeClassifier(random_state=self.random_state, max_depth=5),
            "Random Forest": RandomForestClassifier(random_state=self.random_state, n_estimators=100, max_depth=6)
        }

        cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=self.random_state)
        baseline_comparison = []

        for name, clf in baselines.items():
            clf.fit(X_train_trans, y_train)
            preds = clf.predict(X_test_trans)
            probs = clf.predict_proba(X_test_trans)[:, 1] if hasattr(clf, "predict_proba") else preds
            cv_scores = cross_val_score(clf, X_train_trans, y_train, cv=cv, scoring="roc_auc")

            acc = float(accuracy_score(y_test, preds))
            rec = float(recall_score(y_test, preds, zero_division=0))
            prec = float(precision_score(y_test, preds, zero_division=0))
            f1 = float(f1_score(y_test, preds, zero_division=0))
            auc = float(roc_auc_score(y_test, probs))

            baseline_comparison.append({
                "model_name": name,
                "accuracy": round(acc, 4),
                "precision": round(prec, 4),
                "recall": round(rec, 4),
                "f1_score": round(f1, 4),
                "roc_auc": round(auc, 4),
                "cv_roc_auc_mean": round(float(cv_scores.mean()), 4),
                "cv_roc_auc_std": round(float(cv_scores.std()), 4)
            })

        # 6. XGBoost Classifier Training
        # Tailored hyperparameters per disease characteristics
        xgb_params = {
            "n_estimators": 120,
            "max_depth": 4,
            "learning_rate": 0.05,
            "subsample": 0.85,
            "colsample_bytree": 0.85,
            "scale_pos_weight": scale_pos_weight,
            "eval_metric": "logloss",
            "random_state": self.random_state
        }

        xgb_model = XGBClassifier(**xgb_params)
        xgb_model.fit(X_train_trans, y_train)

        # 7. Model Evaluation on held-out Test Set
        y_pred = xgb_model.predict(X_test_trans)
        y_prob = xgb_model.predict_proba(X_test_trans)[:, 1]

        acc = float(accuracy_score(y_test, y_pred))
        prec = float(precision_score(y_test, y_pred, zero_division=0))
        rec = float(recall_score(y_test, y_pred, zero_division=0))
        f1 = float(f1_score(y_test, y_pred, zero_division=0))
        roc_auc = float(roc_auc_score(y_test, y_prob))
        pr_auc = float(average_precision_score(y_test, y_prob))
        brier = float(brier_score_loss(y_test, y_prob))

        # Specificity = TN / (TN + FP)
        tn, fp, fn, tp = confusion_matrix(y_test, y_pred).ravel()
        specificity = float(tn / (tn + fp)) if (tn + fp) > 0 else 0.0

        # Curves
        fpr_arr, tpr_arr, _ = roc_curve(y_test, y_prob)
        roc_curve_data = [{"fpr": round(float(f), 4), "tpr": round(float(t), 4)} for f, t in zip(fpr_arr, tpr_arr)]

        p_arr, r_arr, _ = precision_recall_curve(y_test, y_prob)
        pr_curve_data = [{"recall": round(float(r), 4), "precision": round(float(p), 4)} for r, p in zip(r_arr, p_arr)]

        xgb_cv_scores = cross_val_score(xgb_model, X_train_trans, y_train, cv=cv, scoring="roc_auc")
        baseline_comparison.append({
            "model_name": "XGBoost (Proposed)",
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1_score": round(f1, 4),
            "roc_auc": round(roc_auc, 4),
            "cv_roc_auc_mean": round(float(xgb_cv_scores.mean()), 4),
            "cv_roc_auc_std": round(float(xgb_cv_scores.std()), 4)
        })

        metrics = {
            "disease": self.disease,
            "model_name": "XGBoost Classifier",
            "model_version": "1.0.0",
            "training_date": datetime.now(timezone.utc).isoformat(),
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "specificity": round(specificity, 4),
            "f1_score": round(f1, 4),
            "roc_auc": round(roc_auc, 4),
            "pr_auc": round(pr_auc, 4),
            "brier_score": round(brier, 4),
            "confusion_matrix": {
                "tp": int(tp), "fp": int(fp),
                "tn": int(tn), "fn": int(fn)
            },
            "roc_curve": roc_curve_data,
            "pr_curve": pr_curve_data,
            "baseline_comparison": baseline_comparison
        }

        print(f"XGBoost Test Performance: ACC={acc:.4f}, ROC-AUC={roc_auc:.4f}, RECALL={rec:.4f}, PREC={prec:.4f}, F1={f1:.4f}")

        # 8. SHAP Explainability & Global Importance
        print("Computing SHAP TreeExplainer and global feature importance...")
        explainer = shap.TreeExplainer(xgb_model)
        shap_values_test = explainer.shap_values(X_test_trans)

        # Mean absolute SHAP per feature
        mean_abs_shap = np.abs(shap_values_test).mean(axis=0)
        sorted_indices = np.argsort(mean_abs_shap)[::-1]

        global_importance = []
        for idx in sorted_indices:
            feat = feature_names[idx]
            feat_meta = self.metadata["features"].get(feat, {})
            display_name = feat_meta.get("display_name", feat)
            description = feat_meta.get("description", "")
            global_importance.append({
                "feature": feat,
                "display_name": display_name,
                "mean_abs_shap": round(float(mean_abs_shap[idx]), 5),
                "description": description
            })

        shap_summary = {
            "disease": self.disease,
            "base_value": float(explainer.expected_value) if np.isscalar(explainer.expected_value) else float(explainer.expected_value[0]),
            "feature_names": feature_names,
            "global_importance": global_importance
        }

        # 9. Model and Artifact Serialization
        training_metadata = {
            "disease": self.disease,
            "model_version": "1.0.0",
            "model_type": "XGBoostClassifier",
            "training_date": datetime.now(timezone.utc).isoformat(),
            "random_seed": self.random_state,
            "hyperparameters": xgb_params,
            "dataset_rows": int(len(X)),
            "train_samples": int(len(X_train)),
            "test_samples": int(len(X_test)),
            "feature_names": feature_names,
            "base_value": shap_summary["base_value"]
        }

        # Save artifacts
        joblib.dump(preprocessor, self.models_dir / "preprocessor.joblib")
        joblib.dump(xgb_model, self.models_dir / "model.joblib")

        with open(self.models_dir / "metadata.json", "w", encoding="utf-8") as f:
            json.dump(training_metadata, f, indent=2)

        with open(self.models_dir / "metrics.json", "w", encoding="utf-8") as f:
            json.dump(metrics, f, indent=2)

        with open(self.models_dir / "baseline_comparison.json", "w", encoding="utf-8") as f:
            json.dump(baseline_comparison, f, indent=2)

        with open(self.models_dir / "shap_summary.json", "w", encoding="utf-8") as f:
            json.dump(shap_summary, f, indent=2)

        print(f"[OK] Successfully trained and saved artifacts in: {self.models_dir}")
        return metrics
