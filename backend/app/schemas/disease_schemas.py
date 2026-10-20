from pydantic import BaseModel, Field
from typing import Optional, Literal


class DiabetesInput(BaseModel):
    Pregnancies: int = Field(..., ge=0, le=25, description="Number of times pregnant")
    Glucose: float = Field(..., ge=1, le=500, description="Plasma glucose concentration (mg/dL) after 2 hours in OGTT")
    BloodPressure: float = Field(..., ge=20, le=260, description="Diastolic blood pressure (mm Hg)")
    SkinThickness: float = Field(..., ge=1, le=120, description="Triceps skin fold thickness (mm)")
    Insulin: float = Field(..., ge=0, le=1200, description="2-Hour serum insulin (mu U/ml)")
    BMI: float = Field(..., ge=10.0, le=80.0, description="Body mass index (weight in kg/(height in m)^2)")
    DiabetesPedigreeFunction: float = Field(..., ge=0.01, le=3.5, description="Diabetes pedigree function (family history score)")
    Age: float = Field(..., ge=1.0, le=125.0, description="Age in years")


class HeartDiseaseInput(BaseModel):
    age: float = Field(..., ge=1.0, le=120.0, description="Age in years")
    sex: int = Field(..., ge=0, le=1, description="Sex (1 = male, 0 = female)")
    cp: int = Field(..., ge=1, le=4, description="Chest pain type (1 = typical angina, 2 = atypical angina, 3 = non-anginal pain, 4 = asymptomatic)")
    trestbps: float = Field(..., ge=50.0, le=260.0, description="Resting blood pressure (mm Hg on admission)")
    chol: float = Field(..., ge=80.0, le=700.0, description="Serum cholestoral in mg/dl")
    fbs: int = Field(..., ge=0, le=1, description="Fasting blood sugar > 120 mg/dl (1 = true, 0 = false)")
    restecg: int = Field(..., ge=0, le=2, description="Resting ECG results (0 = normal, 1 = ST-T wave abnormality, 2 = LV hypertrophy)")
    thalach: float = Field(..., ge=50.0, le=250.0, description="Maximum heart rate achieved")
    exang: int = Field(..., ge=0, le=1, description="Exercise induced angina (1 = yes, 0 = no)")
    oldpeak: float = Field(..., ge=0.0, le=10.0, description="ST depression induced by exercise relative to rest")
    slope: int = Field(..., ge=1, le=3, description="Slope of peak exercise ST segment (1 = upsloping, 2 = flat, 3 = downsloping)")
    ca: float = Field(..., ge=0.0, le=3.0, description="Number of major vessels (0-3) colored by flourosopy")
    thal: float = Field(..., description="Thal defect code: 3.0 (normal), 6.0 (fixed defect), 7.0 (reversable defect)")


class KidneyDiseaseInput(BaseModel):
    age: float = Field(..., ge=1.0, le=120.0, description="Age in years")
    bp: float = Field(..., ge=40.0, le=240.0, description="Blood pressure in mm/Hg")
    sg: float = Field(..., ge=1.000, le=1.035, description="Specific gravity (e.g. 1.005, 1.010, 1.015, 1.020, 1.025)")
    al: float = Field(..., ge=0.0, le=5.0, description="Albumin (0 to 5)")
    su: float = Field(..., ge=0.0, le=5.0, description="Sugar (0 to 5)")
    rbc: Literal["normal", "abnormal"] = Field(..., description="Red blood cells")
    pc: Literal["normal", "abnormal"] = Field(..., description="Pus cells")
    pcc: Literal["present", "notpresent"] = Field(..., description="Pus cell clumps")
    ba: Literal["present", "notpresent"] = Field(..., description="Bacteria")
    bgr: float = Field(..., ge=30.0, le=600.0, description="Blood glucose random (mg/dl)")
    bu: float = Field(..., ge=1.0, le=400.0, description="Blood urea (mg/dl)")
    sc: float = Field(..., ge=0.1, le=80.0, description="Serum creatinine (mg/dl)")
    sod: float = Field(..., ge=50.0, le=200.0, description="Sodium (mEq/L)")
    pot: float = Field(..., ge=1.0, le=15.0, description="Potassium (mEq/L)")
    hemo: float = Field(..., ge=2.0, le=25.0, description="Hemoglobin (gms)")
    pcv: float = Field(..., ge=5.0, le=70.0, description="Packed cell volume (%)")
    wc: float = Field(..., ge=1000.0, le=40000.0, description="White blood cell count (cells/cumm)")
    rc: float = Field(..., ge=1.0, le=10.0, description="Red blood cell count (millions/cmm)")
    htn: Literal["yes", "no"] = Field(..., description="Hypertension")
    dm: Literal["yes", "no"] = Field(..., description="Diabetes mellitus")
    cad: Literal["yes", "no"] = Field(..., description="Coronary artery disease")
    appet: Literal["good", "poor"] = Field(..., description="Appetite")
    pe: Literal["yes", "no"] = Field(..., description="Pedal edema")
    ane: Literal["yes", "no"] = Field(..., description="Anemia")
