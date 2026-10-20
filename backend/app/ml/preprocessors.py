"""
Preprocessing pipelines for Diabetes, Heart Disease, and Chronic Kidney Disease.
Fitted ONLY on training splits to prevent data leakage, preserving feature names for SHAP.
"""

from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OrdinalEncoder
import pandas as pd


def get_diabetes_preprocessor(feature_names: list) -> Pipeline:
    """
    Diabetes: all 8 features are continuous/numeric.
    Median imputation followed by standard scaling.
    """
    pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ])
    pipeline.set_output(transform="pandas")
    return pipeline


def get_heart_disease_preprocessor() -> ColumnTransformer:
    """
    Heart Disease: numeric and categorical/discrete features.
    Numeric: age, trestbps, chol, thalach, oldpeak
    Categorical/ordinal: sex, cp, fbs, restecg, exang, slope, ca, thal
    """
    numeric_features = ["age", "trestbps", "chol", "thalach", "oldpeak"]
    categorical_features = ["sex", "cp", "fbs", "restecg", "exang", "slope", "ca", "thal"]

    num_pipe = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ])

    cat_pipe = Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent"))
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", num_pipe, numeric_features),
            ("cat", cat_pipe, categorical_features)
        ],
        remainder="drop",
        verbose_feature_names_out=False
    )
    preprocessor.set_output(transform="pandas")
    return preprocessor


def get_kidney_disease_preprocessor() -> ColumnTransformer:
    """
    Kidney Disease: 14 numeric features and 10 categorical features.
    """
    numeric_features = [
        "age", "bp", "sg", "al", "su", "bgr", "bu", "sc",
        "sod", "pot", "hemo", "pcv", "wc", "rc"
    ]
    categorical_features = [
        "rbc", "pc", "pcc", "ba", "htn", "dm", "cad", "appet", "pe", "ane"
    ]

    num_pipe = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ])

    cat_pipe = Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("encoder", OrdinalEncoder(handle_unknown="use_encoded_value", unknown_value=-1))
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", num_pipe, numeric_features),
            ("cat", cat_pipe, categorical_features)
        ],
        remainder="drop",
        verbose_feature_names_out=False
    )
    preprocessor.set_output(transform="pandas")
    return preprocessor


def get_preprocessor(disease: str, feature_names: list = None):
    if disease == "diabetes":
        return get_diabetes_preprocessor(feature_names)
    elif disease == "heart_disease":
        return get_heart_disease_preprocessor()
    elif disease == "kidney_disease":
        return get_kidney_disease_preprocessor()
    else:
        raise ValueError(f"Unknown disease: {disease}")
