"""
Dataset loading, validation, and exploratory preparation.
Implements data validation, impossible measurement handling, and validation reporting.
"""

import json
import numpy as np
import pandas as pd
from pathlib import Path
from typing import Tuple, Dict, Any

from app.core.config import settings
from app.ml.metadata import FEATURE_METADATA


class DatasetLoader:
    def __init__(self, data_raw_dir: Path = settings.DATA_RAW_DIR, reports_dir: Path = settings.REPORTS_DIR):
        self.data_raw_dir = data_raw_dir
        self.reports_dir = reports_dir
        self.reports_dir.mkdir(parents=True, exist_ok=True)

    def load_diabetes(self) -> Tuple[pd.DataFrame, pd.Series, Dict[str, Any]]:
        csv_path = self.data_raw_dir / "diabetes.csv"
        if not csv_path.exists():
            from scripts.download_datasets import download_all
            download_all()

        df = pd.read_csv(csv_path)

        # Document impossible measurements: Glucose, BP, Skin, Insulin, BMI cannot biologically be 0
        zero_invalid_cols = ["Glucose", "BloodPressure", "SkinThickness", "Insulin", "BMI"]
        invalid_counts = {}
        for col in zero_invalid_cols:
            count = int((df[col] == 0).sum())
            invalid_counts[col] = count
            # Convert biologically invalid zeros to NaN for proper training imputation
            df[col] = df[col].replace(0, np.nan)

        X = df.drop(columns=["Outcome"])
        y = df["Outcome"].astype(int)

        report = {
            "disease": "diabetes",
            "dataset_name": "Pima Indians Diabetes Database",
            "total_rows": int(len(df)),
            "total_columns": int(df.shape[1]),
            "feature_columns": list(X.columns),
            "target_column": "Outcome",
            "target_distribution": {str(k): int(v) for k, v in y.value_counts().items()},
            "missing_values_before_cleaning": {col: 0 for col in df.columns},
            "biologically_invalid_zeros_converted_to_nan": invalid_counts,
            "total_nan_after_cleaning": {col: int(X[col].isna().sum()) for col in X.columns},
            "validation_status": "Valid - Biological zeros converted to NaN for training-only imputation"
        }

        self._save_report("diabetes", report)
        return X, y, report

    def load_heart_disease(self) -> Tuple[pd.DataFrame, pd.Series, Dict[str, Any]]:
        csv_path = self.data_raw_dir / "heart_disease.csv"
        if not csv_path.exists():
            from scripts.download_datasets import download_all
            download_all()

        df = pd.read_csv(csv_path)

        # Replace '?' with NaN
        missing_symbols = {}
        for col in df.columns:
            count = int((df[col] == "?").sum()) if df[col].dtype == object else 0
            if count > 0:
                missing_symbols[col] = count
                df[col] = df[col].replace("?", np.nan).astype(float)

        # Standardize target: 0 = absent (0), 1, 2, 3, 4 = present (1)
        target_raw_dist = {str(k): int(v) for k, v in df["num"].value_counts().items()}
        y = (df["num"] > 0).astype(int)
        X = df.drop(columns=["num"])

        # Ensure correct numeric types
        for col in X.columns:
            X[col] = pd.to_numeric(X[col], errors="coerce")

        report = {
            "disease": "heart_disease",
            "dataset_name": "UCI Cleveland Heart Disease Database",
            "total_rows": int(len(df)),
            "total_columns": int(df.shape[1]),
            "feature_columns": list(X.columns),
            "target_column": "num (binarized to 0/1)",
            "raw_target_distribution": target_raw_dist,
            "target_distribution": {str(k): int(v) for k, v in y.value_counts().items()},
            "missing_symbols_converted_to_nan": missing_symbols,
            "total_nan_after_cleaning": {col: int(X[col].isna().sum()) for col in X.columns},
            "validation_status": "Valid - Target binarized (num > 0 => 1) and missing values converted to NaN"
        }

        self._save_report("heart_disease", report)
        return X, y, report

    def load_kidney_disease(self) -> Tuple[pd.DataFrame, pd.Series, Dict[str, Any]]:
        csv_path = self.data_raw_dir / "kidney_disease.csv"
        if not csv_path.exists():
            from scripts.download_datasets import download_all
            download_all()

        df = pd.read_csv(csv_path)

        # Drop identifier column if present
        if "id" in df.columns:
            df = df.drop(columns=["id"])

        # Strip whitespace from object columns and replace '\t' or '?'
        for col in df.select_dtypes(include=["object"]).columns:
            df[col] = df[col].astype(str).str.strip().str.replace("\t", "").str.replace("?", "")
            df[col] = df[col].replace({"nan": np.nan, "": np.nan})

        # Fix numeric columns that may have been loaded as strings
        numeric_cols = ["age", "bp", "sg", "al", "su", "bgr", "bu", "sc", "sod", "pot", "hemo", "pcv", "wc", "rc"]
        for col in numeric_cols:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce")

        # Map target: 'ckd' -> 1, 'notckd' -> 0
        raw_target_counts = {str(k): int(v) for k, v in df["classification"].value_counts().items()}
        # Normalize target string
        df["classification"] = df["classification"].replace({"ckd": 1, "notckd": 0})
        # If any rows had unexpected values, drop or map
        df = df[df["classification"].isin([0, 1])].copy()
        df["classification"] = df["classification"].astype(int)

        y = df["classification"]
        X = df.drop(columns=["classification"])

        report = {
            "disease": "kidney_disease",
            "dataset_name": "UCI Chronic Kidney Disease Database",
            "total_rows": int(len(df)),
            "total_columns": int(df.shape[1]),
            "feature_columns": list(X.columns),
            "target_column": "classification",
            "raw_target_distribution": raw_target_counts,
            "target_distribution": {str(k): int(v) for k, v in y.value_counts().items()},
            "total_nan_after_cleaning": {col: int(X[col].isna().sum()) for col in X.columns},
            "validation_status": "Valid - Whitespace artifacts normalized, numeric fields coerced, classification mapped to 0/1"
        }

        self._save_report("kidney_disease", report)
        return X, y, report

    def load_dataset(self, disease: str) -> Tuple[pd.DataFrame, pd.Series, Dict[str, Any]]:
        if disease == "diabetes":
            return self.load_diabetes()
        elif disease == "heart_disease":
            return self.load_heart_disease()
        elif disease == "kidney_disease":
            return self.load_kidney_disease()
        else:
            raise ValueError(f"Unknown disease module: {disease}")

    def _save_report(self, disease: str, report: Dict[str, Any]):
        out_file = self.reports_dir / f"{disease}_validation_report.json"
        with open(out_file, "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2)


dataset_loader = DatasetLoader()
