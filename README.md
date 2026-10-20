# Early Disease Risk Prediction Using Explainable Machine Learning

An advanced, full-stack clinical research platform combining predictive machine learning (**XGBoost**), explainable artificial intelligence (**SHAP**), and local LLM reasoning (**Ollama with `llama3.2:latest`**).

> **IMPORTANT MEDICAL DISCLAIMER:**  
> This software is strictly for **educational and research purposes**. It does not provide medical diagnoses, treatment advice, or replace professional consultation with licensed healthcare practitioners. Model probabilities and SHAP scores represent statistical correlations from historical research cohorts and must not be used as clinical cutoffs.

---

## 1. System Architecture Overview

```text
├── frontend/                     # React (Vite) + Tailwind CSS + Recharts + Lucide
│   ├── src/
│   │   ├── components/           # Sidebar, Header, RiskBadge, ConfirmationModal, etc.
│   │   ├── pages/                # 12 platform views (Dashboard, Assessments, SHAP, etc.)
│   │   ├── services/             # Axios API client
│   │   └── App.jsx               # Application coordinator
├── backend/                      # FastAPI + MySQL + SQLAlchemy
│   ├── app/
│   │   ├── api/                  # REST endpoints (Predict, Explain, Metrics, Ollama)
│   │   ├── core/                 # Configuration & Settings (pydantic-settings)
│   │   ├── database/             # SQLAlchemy engine, session, and models
│   │   ├── explainability/       # SHAP TreeExplainer service & summaries
│   │   ├── ml/                   # Dataset loader, preprocessors, trainers
│   │   ├── schemas/              # Pydantic input/output validation models
│   │   ├── services/             # ReportLab PDF generator & Ollama service
│   │   └── main.py               # FastAPI entrypoint with CORS & middleware
│   ├── data/
│   │   └── raw/                  # Research CSV datasets (Pima, Cleveland, CKD)
│   ├── models/                   # Serialized XGBoost models, pipelines, metrics
│   ├── reports/                  # Data validation JSON reports
│   ├── scripts/                  # download_datasets.py
│   ├── tests/                    # Pytest test suite (14 automated tests)
│   └── requirements.txt
└── README.md
```

---

## 2. Supported Disease Modules

| Disease Module | Research Dataset | Features | XGBoost Test ROC-AUC | Preprocessing & Invalidation Strategy |
| :--- | :--- | :---: | :---: | :--- |
| **Diabetes** | Pima Indians Diabetes Database (NIDDK) | 8 | **0.833** | Biologically invalid 0s in Glucose, BP, Skin, Insulin, and BMI converted to NaN; training-only median imputation. |
| **Heart Disease** | UCI Cleveland Heart Disease Database | 13 | **0.952** | Missing '?' mapped to NaN; target binarized (`num > 0`); standard scaling & categorical handling. |
| **Chronic Kidney Disease** | UCI Chronic Kidney Disease Database | 24 | **1.000** | Sanitization of whitespace artifacts (`\tckd`, `\tno`); patient IDs dropped; numeric scaling & mode imputation. |

---

## 3. Prerequisites (Windows)

- **Python 3.10+** (Tested on Python 3.12 / 3.14 64-bit)
- **Node.js v18+ & npm** (Tested on Node v24 & npm 11)
- **Ollama** (for optional local LLM explanation assistant):
  Download from [ollama.com](https://ollama.com/)

---

## 4. Quickstart Guide (Step-by-Step for Windows)

### Step 4.1: Backend Virtual Environment & Dependencies

Open PowerShell and navigate to the project root:

```powershell
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
.venv\Scripts\activate

# Install backend dependencies
pip install -r requirements.txt
```

### Step 4.2: Research Datasets Download & Model Training

Execute the automated dataset downloader and model training pipeline:

```powershell
# 1. Download official research datasets
python scripts/download_datasets.py

# 2. Train and evaluate all 3 XGBoost models, generate SHAP summaries and metrics
python -m app.ml.train_all
```

*This trains XGBoost alongside baseline comparisons (Logistic Regression, Decision Tree, Random Forest), calculates calibration (Brier score), ROC-AUC, Precision, Recall, and extracts SHAP TreeExplainer attributions.*

### Step 4.3: Local Ollama Verification (Optional)

In a separate PowerShell window, verify that Ollama is running and that `llama3.2:latest` is installed:

```powershell
ollama list
```

If `llama3.2:latest` is not present, pull it:

```powershell
ollama pull llama3.2:latest
```

> **Note:** The application operates completely even if Ollama is offline. When offline, the backend seamlessly switches to its built-in rule-based SHAP explanation engine.

### Step 4.4: Start the FastAPI Backend Server

With your virtual environment activated in `backend/`:

```powershell
uvicorn app.main:app --reload --port 8000
```

Verify backend health at: [http://localhost:8000/api/health](http://localhost:8000/api/health)  
Interactive API Docs (Swagger): [http://localhost:8000/docs](http://localhost:8000/docs)

### Step 4.5: Start the React Frontend

Open a new PowerShell terminal and navigate to the `frontend/` directory:

```powershell
cd frontend

# Install dependencies (only required on first setup)
npm install

# Start Vite development server
npm run dev
```

Open your browser to: [http://localhost:5173](http://localhost:5173)

---

## 5. Running Automated Backend Tests

With your backend environment active:

```powershell
cd backend
python -m pytest tests/ -v
```

The test suite validates:
1. Health endpoint & DB connection
2. Disease module schemas & metadata
3. Dataset file presence & row integrity
4. Trained model artifact availability
5. Test-set evaluation metrics endpoint
6. Global SHAP feature importance endpoint
7. Diabetes prediction & SHAP attribution
8. Heart disease prediction & SHAP attribution
9. Kidney disease prediction & SHAP attribution
10. Strict Pydantic input validation & rejection of invalid ranges
11. Dashboard aggregate summary calculations
12. SQLite prediction history retrieval & individual lookups
13. ReportLab PDF report generation & byte streaming
14. Local Ollama LLM assistant connectivity & deterministic fallback

---

## 6. Key Application Features & Navigation

The platform provides 12 dedicated, clean views:

1. **Dashboard:** Summary metrics (total assessments, disease breakdown, risk band distribution), active model badges, and recent assessment history.
2. **Disease Modules:** Overview cards for Diabetes, Heart Disease, and Chronic Kidney Disease with sample sizes, ROC-AUC benchmarks, and entry points.
3. **Diabetes Assessment:** Form validating 8 clinical parameters (OGTT Glucose, Insulin, BMI, Diastolic BP, Pedigree score, Age) with confirmation modal.
4. **Heart Disease Assessment:** Form validating 13 cardiovascular stress test parameters (Chest pain type, Resting BP, Max heart rate, ST depression, Fluoroscopy vessels, Thal scintigraphy).
5. **Kidney Disease Assessment:** Form grouping 24 clinical parameters into Vitals, Urinalysis, Serum Chemistry, Hematology, and Systemic Comorbidities.
6. **Prediction Results:** Dedicated result summary showing model-estimated probability, illustrative risk band badge, interactive SHAP factor waterfall chart, top 5 drivers table, plain-language educational summary, limitations, and PDF download button.
7. **SHAP Explainability:** Global feature importance ranking (mean \|SHAP\|) and variable dictionary for each disease.
8. **Model Performance:** Test-set metrics (ROC-AUC, Precision, Recall/Sensitivity, Specificity, F1, Brier score), ROC curves, 2x2 confusion matrices, and baseline comparison table (Logistic Regression, Decision Tree, Random Forest vs Proposed XGBoost).
9. **Assessment History:** Local MySQL database log with search, disease filtering, view results, and PDF download.
10. **Dataset Information:** Cohort demographics, missing value handling strategy, biological zero conversions, and academic citations.
11. **LLM Explanation Assistant:** Interactive chat powered by local `llama3.2:latest` through Ollama (with automatic deterministic fallback when Ollama is offline).
12. **About & Disclaimer:** Architectural design, data leakage prevention, ethical AI principles, and comprehensive medical disclaimers.

---

## 7. Security and Privacy

- **100% Local Inference:** No data is transmitted to external cloud APIs or paid services.
- **No Identifiers:** Patient names, identification numbers, and contact details are excluded by design.
- **No Data Leakage:** Preprocessing transformations (imputation medians, scaling) are fitted strictly on training splits.
- **Parameterized SQL:** All database transactions use SQLAlchemy ORM with MySQL parameterized queries.
- **CORS Protection:** Configured to accept traffic only from authorized frontend origins.
- **Request Size Limiting:** Middleware enforces a 2MB maximum payload limit.

---

## 8. Troubleshooting

| Issue | Resolution |
| :--- | :--- |
| **`ModuleNotFoundError: No module named 'pydantic_settings'`** | Run `pip install -r requirements.txt` or `pip install pydantic-settings`. |
| **`No such table: prediction_records`** | Ensure the MySQL service is running and `disease_risk_db` exists (`mysql+pymysql://root:<your_password>@localhost:3306/disease_risk_db`). Run `python -c "from app.database.session import init_db; init_db()"`. |
| **`Model artifacts not found`** | Run `python -m app.ml.train_all` from the `backend/` directory to train and serialize models. |
| **`Ollama is offline`** | The app runs seamlessly without Ollama using its built-in SHAP synthesis engine. To enable Ollama, start the Ollama desktop app or run `ollama serve`, and ensure `ollama list` shows `llama3.2:latest`. |
| **`CORS Error in Browser`** | Verify that `FRONTEND_URL` in `backend/.env` matches your browser URL (default: `http://localhost:5173`). |
