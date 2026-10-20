"""
Feature metadata, display names, units, and educational descriptions
for the supported disease modules.
"""

FEATURE_METADATA = {
    "diabetes": {
        "title": "Diabetes Risk Assessment",
        "dataset_name": "Pima Indians Diabetes Database",
        "target_name": "Outcome",
        "positive_label": "Elevated Risk",
        "negative_label": "Lower Risk",
        "features": {
            "Pregnancies": {
                "display_name": "Pregnancies",
                "unit": "count",
                "description": "Number of times pregnant",
                "min": 0, "max": 25, "default": 1
            },
            "Glucose": {
                "display_name": "Plasma Glucose",
                "unit": "mg/dL",
                "description": "2-hour oral glucose tolerance test concentration",
                "min": 40, "max": 350, "default": 120
            },
            "BloodPressure": {
                "display_name": "Diastolic Blood Pressure",
                "unit": "mm Hg",
                "description": "Diastolic blood pressure",
                "min": 30, "max": 200, "default": 72
            },
            "SkinThickness": {
                "display_name": "Triceps Skin Fold",
                "unit": "mm",
                "description": "Triceps skin fold thickness",
                "min": 5, "max": 100, "default": 25
            },
            "Insulin": {
                "display_name": "Serum Insulin",
                "unit": "μU/mL",
                "description": "2-Hour post-load serum insulin",
                "min": 5, "max": 900, "default": 85
            },
            "BMI": {
                "display_name": "Body Mass Index (BMI)",
                "unit": "kg/m²",
                "description": "Weight in kg divided by height in meters squared",
                "min": 15.0, "max": 65.0, "default": 28.5
            },
            "DiabetesPedigreeFunction": {
                "display_name": "Diabetes Pedigree Score",
                "unit": "score",
                "description": "Genetic risk score based on family history",
                "min": 0.05, "max": 2.5, "default": 0.47
            },
            "Age": {
                "display_name": "Age",
                "unit": "years",
                "description": "Age of individual in years",
                "min": 18, "max": 100, "default": 45
            }
        }
    },
    "heart_disease": {
        "title": "Heart Disease Risk Assessment",
        "dataset_name": "UCI Cleveland Heart Disease Database",
        "target_name": "num",
        "positive_label": "Heart Disease Present",
        "negative_label": "Heart Disease Absent",
        "features": {
            "age": {
                "display_name": "Age",
                "unit": "years",
                "description": "Age of the patient",
                "min": 20, "max": 100, "default": 55
            },
            "sex": {
                "display_name": "Sex",
                "unit": "category",
                "description": "Biological sex (1 = Male, 0 = Female)",
                "options": [{"value": 1, "label": "Male"}, {"value": 0, "label": "Female"}],
                "default": 1
            },
            "cp": {
                "display_name": "Chest Pain Type",
                "unit": "type",
                "description": "1 = Typical Angina, 2 = Atypical Angina, 3 = Non-anginal, 4 = Asymptomatic",
                "options": [
                    {"value": 1, "label": "Typical Angina"},
                    {"value": 2, "label": "Atypical Angina"},
                    {"value": 3, "label": "Non-anginal Pain"},
                    {"value": 4, "label": "Asymptomatic"}
                ],
                "default": 3
            },
            "trestbps": {
                "display_name": "Resting Blood Pressure",
                "unit": "mm Hg",
                "description": "Resting blood pressure on hospital admission",
                "min": 80, "max": 220, "default": 130
            },
            "chol": {
                "display_name": "Serum Cholesterol",
                "unit": "mg/dL",
                "description": "Serum cholesterol measurement",
                "min": 100, "max": 600, "default": 240
            },
            "fbs": {
                "display_name": "Fasting Blood Sugar > 120 mg/dL",
                "unit": "flag",
                "description": "Fasting blood sugar exceeding 120 mg/dL",
                "options": [{"value": 1, "label": "True (> 120 mg/dL)"}, {"value": 0, "label": "False (≤ 120 mg/dL)"}],
                "default": 0
            },
            "restecg": {
                "display_name": "Resting ECG Results",
                "unit": "type",
                "description": "0 = Normal, 1 = ST-T Abnormality, 2 = LV Hypertrophy",
                "options": [
                    {"value": 0, "label": "Normal"},
                    {"value": 1, "label": "ST-T Wave Abnormality"},
                    {"value": 2, "label": "Left Ventricular Hypertrophy"}
                ],
                "default": 0
            },
            "thalach": {
                "display_name": "Maximum Heart Rate Achieved",
                "unit": "bpm",
                "description": "Peak heart rate during stress testing",
                "min": 60, "max": 220, "default": 150
            },
            "exang": {
                "display_name": "Exercise Induced Angina",
                "unit": "flag",
                "description": "Angina induced by exercise (1 = Yes, 0 = No)",
                "options": [{"value": 1, "label": "Yes"}, {"value": 0, "label": "No"}],
                "default": 0
            },
            "oldpeak": {
                "display_name": "ST Depression (Oldpeak)",
                "unit": "mm",
                "description": "ST depression induced by exercise relative to rest",
                "min": 0.0, "max": 7.0, "default": 1.0
            },
            "slope": {
                "display_name": "Slope of Peak Exercise ST",
                "unit": "type",
                "description": "1 = Upsloping, 2 = Flat, 3 = Downsloping",
                "options": [
                    {"value": 1, "label": "Upsloping"},
                    {"value": 2, "label": "Flat"},
                    {"value": 3, "label": "Downsloping"}
                ],
                "default": 1
            },
            "ca": {
                "display_name": "Major Vessels Colored by Fluoroscopy",
                "unit": "count",
                "description": "Number of major vessels (0-3) colored",
                "min": 0, "max": 3, "default": 0
            },
            "thal": {
                "display_name": "Thallium Stress Scintigraphy",
                "unit": "code",
                "description": "3 = Normal, 6 = Fixed Defect, 7 = Reversible Defect",
                "options": [
                    {"value": 3.0, "label": "Normal (3)"},
                    {"value": 6.0, "label": "Fixed Defect (6)"},
                    {"value": 7.0, "label": "Reversible Defect (7)"}
                ],
                "default": 3.0
            }
        }
    },
    "kidney_disease": {
        "title": "Chronic Kidney Disease Risk Assessment",
        "dataset_name": "UCI Chronic Kidney Disease Database",
        "target_name": "classification",
        "positive_label": "CKD Present",
        "negative_label": "CKD Absent",
        "features": {
            "age": {"display_name": "Age", "unit": "years", "description": "Patient age", "min": 1, "max": 100, "default": 50},
            "bp": {"display_name": "Blood Pressure", "unit": "mm Hg", "description": "Blood pressure", "min": 50, "max": 180, "default": 80},
            "sg": {"display_name": "Specific Gravity", "unit": "ratio", "description": "Urine specific gravity", "min": 1.005, "max": 1.025, "default": 1.020},
            "al": {"display_name": "Albumin", "unit": "level (0-5)", "description": "Albumin levels in urine", "min": 0, "max": 5, "default": 0},
            "su": {"display_name": "Sugar", "unit": "level (0-5)", "description": "Sugar levels in urine", "min": 0, "max": 5, "default": 0},
            "rbc": {"display_name": "Red Blood Cells", "unit": "type", "description": "Red blood cells in urine", "options": [{"value": "normal", "label": "Normal"}, {"value": "abnormal", "label": "Abnormal"}], "default": "normal"},
            "pc": {"display_name": "Pus Cell", "unit": "type", "description": "Pus cells in urine", "options": [{"value": "normal", "label": "Normal"}, {"value": "abnormal", "label": "Abnormal"}], "default": "normal"},
            "pcc": {"display_name": "Pus Cell Clumps", "unit": "flag", "description": "Presence of pus cell clumps", "options": [{"value": "present", "label": "Present"}, {"value": "notpresent", "label": "Not Present"}], "default": "notpresent"},
            "ba": {"display_name": "Bacteria", "unit": "flag", "description": "Presence of bacteria", "options": [{"value": "present", "label": "Present"}, {"value": "notpresent", "label": "Not Present"}], "default": "notpresent"},
            "bgr": {"display_name": "Blood Glucose Random", "unit": "mg/dL", "description": "Random blood glucose measurement", "min": 60, "max": 500, "default": 120},
            "bu": {"display_name": "Blood Urea", "unit": "mg/dL", "description": "Blood urea nitrogen level", "min": 10, "max": 300, "default": 35},
            "sc": {"display_name": "Serum Creatinine", "unit": "mg/dL", "description": "Serum creatinine measurement", "min": 0.4, "max": 15.0, "default": 1.1},
            "sod": {"display_name": "Sodium", "unit": "mEq/L", "description": "Blood sodium level", "min": 100, "max": 160, "default": 138},
            "pot": {"display_name": "Potassium", "unit": "mEq/L", "description": "Blood potassium level", "min": 2.5, "max": 8.0, "default": 4.4},
            "hemo": {"display_name": "Hemoglobin", "unit": "g/dL", "description": "Hemoglobin concentration", "min": 5.0, "max": 18.0, "default": 14.5},
            "pcv": {"display_name": "Packed Cell Volume (Hematocrit)", "unit": "%", "description": "Packed cell volume percentage", "min": 15, "max": 55, "default": 42},
            "wc": {"display_name": "White Blood Cell Count", "unit": "cells/μL", "description": "White blood cell count", "min": 2000, "max": 25000, "default": 7500},
            "rc": {"display_name": "Red Blood Cell Count", "unit": "million/μL", "description": "Red blood cell count", "min": 2.0, "max": 7.0, "default": 5.0},
            "htn": {"display_name": "Hypertension", "unit": "flag", "description": "History of hypertension", "options": [{"value": "yes", "label": "Yes"}, {"value": "no", "label": "No"}], "default": "no"},
            "dm": {"display_name": "Diabetes Mellitus", "unit": "flag", "description": "History of diabetes mellitus", "options": [{"value": "yes", "label": "Yes"}, {"value": "no", "label": "No"}], "default": "no"},
            "cad": {"display_name": "Coronary Artery Disease", "unit": "flag", "description": "History of coronary artery disease", "options": [{"value": "yes", "label": "Yes"}, {"value": "no", "label": "No"}], "default": "no"},
            "appet": {"display_name": "Appetite", "unit": "state", "description": "Patient appetite state", "options": [{"value": "good", "label": "Good"}, {"value": "poor", "label": "Poor"}], "default": "good"},
            "pe": {"display_name": "Pedal Edema", "unit": "flag", "description": "Swelling in feet or legs", "options": [{"value": "yes", "label": "Yes"}, {"value": "no", "label": "No"}], "default": "no"},
            "ane": {"display_name": "Anemia", "unit": "flag", "description": "Anemia condition present", "options": [{"value": "yes", "label": "Yes"}, {"value": "no", "label": "No"}], "default": "no"}
        }
    }
}
