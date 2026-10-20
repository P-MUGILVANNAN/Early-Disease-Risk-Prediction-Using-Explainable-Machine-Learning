"""
Main training script to train and evaluate all three disease prediction models:
1. Diabetes
2. Heart Disease
3. Chronic Kidney Disease

Usage:
  python -m app.ml.train_all
"""

import sys
from pathlib import Path

# Ensure backend root is in sys.path
backend_root = Path(__file__).resolve().parent.parent.parent
if str(backend_root) not in sys.path:
    sys.path.insert(0, str(backend_root))

from app.ml.trainers import DiseaseModelTrainer


def train_all_models():
    diseases = ["diabetes", "heart_disease", "kidney_disease"]
    results = {}

    print("================================================================")
    print("STARTING TRAINING PIPELINE FOR ALL 3 RESEARCH DISEASE MODULES")
    print("================================================================")

    for disease in diseases:
        trainer = DiseaseModelTrainer(disease)
        metrics = trainer.train_and_evaluate()
        results[disease] = {
            "accuracy": metrics["accuracy"],
            "roc_auc": metrics["roc_auc"],
            "f1_score": metrics["f1_score"],
            "recall": metrics["recall"],
            "precision": metrics["precision"]
        }

    print("\n================================================================")
    print("ALL MODELS TRAINED AND SERIALIZED SUCCESSFULLY!")
    print("SUMMARY RESULTS ON HELD-OUT TEST DATA:")
    for d, m in results.items():
        print(f" - {d.upper()}: ROC-AUC={m['roc_auc']}, ACC={m['accuracy']}, RECALL={m['recall']}, F1={m['f1_score']}")
    print("================================================================")
    return results


if __name__ == "__main__":
    train_all_models()
