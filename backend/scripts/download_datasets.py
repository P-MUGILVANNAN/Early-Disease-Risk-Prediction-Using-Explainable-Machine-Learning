"""
Script to download research datasets for:
1. Diabetes (Pima Indians Diabetes)
2. Heart Disease (UCI Cleveland Heart Disease)
3. Chronic Kidney Disease (UCI CKD)
"""

import os
import urllib.request
import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_RAW_DIR = BASE_DIR / "data" / "raw"

DATASETS = {
    "diabetes.csv": {
        "url": "https://raw.githubusercontent.com/jbrownlee/Datasets/master/pima-indians-diabetes.data.csv",
        "columns": [
            "Pregnancies", "Glucose", "BloodPressure", "SkinThickness",
            "Insulin", "BMI", "DiabetesPedigreeFunction", "Age", "Outcome"
        ],
        "description": "Pima Indians Diabetes Database (National Institute of Diabetes and Digestive and Kidney Diseases)"
    },
    "heart_disease.csv": {
        "url": "https://archive.ics.uci.edu/ml/machine-learning-databases/heart-disease/processed.cleveland.data",
        "columns": [
            "age", "sex", "cp", "trestbps", "chol", "fbs",
            "restecg", "thalach", "exang", "oldpeak", "slope",
            "ca", "thal", "num"
        ],
        "description": "UCI Cleveland Heart Disease Database"
    },
    "kidney_disease.csv": {
        "url": "https://raw.githubusercontent.com/brarajit18/CKD-Prediction-using-KNN/master/kidney_disease.csv",
        "columns": None,  # already has headers
        "description": "UCI Chronic Kidney Disease Database (Apollo Hospitals)"
    }
}


def download_all():
    DATA_RAW_DIR.mkdir(parents=True, exist_ok=True)
    status = {}

    for filename, meta in DATASETS.items():
        target_path = DATA_RAW_DIR / filename
        if target_path.exists() and target_path.stat().st_size > 100:
            print(f"[OK] {filename} already exists ({target_path.stat().st_size} bytes).")
            status[filename] = True
            continue

        print(f"Downloading {filename} from {meta['url']}...")
        try:
            req = urllib.request.Request(meta["url"], headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=20) as resp:
                content = resp.read()

            if meta["columns"]:
                # If source is raw csv without headers, write with headers
                lines = content.decode("utf-8").strip().splitlines()
                header = ",".join(meta["columns"]) + "\n"
                full_text = header + "\n".join(lines) + "\n"
                target_path.write_text(full_text, encoding="utf-8")
            else:
                target_path.write_bytes(content)

            print(f"[SUCCESS] Downloaded {filename} -> {target_path} ({target_path.stat().st_size} bytes)")
            status[filename] = True
        except Exception as e:
            print(f"[ERROR] Failed to download {filename}: {e}")
            status[filename] = False

    return status


if __name__ == "__main__":
    download_all()
