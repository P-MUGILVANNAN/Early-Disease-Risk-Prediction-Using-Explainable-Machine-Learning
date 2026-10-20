"""
Script to generate a comprehensive, publication-quality PDF User Guide & Workout Manual
for "Early Disease Risk Prediction Using Explainable Machine Learning".
"""

import sys
from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent.parent
OUTPUT_PDF = WORKSPACE_ROOT / "Application_User_Guide_and_Workout_Manual.pdf"


class NumberedCanvas(canvas.Canvas):
    """Two-pass canvas to dynamically compute total pages and add headers/footers."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_header_footer(num_pages)
            super().showPage()
        super().save()

    def draw_header_footer(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))

        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(36, 762, "Early Disease Risk Prediction Using Explainable Machine Learning • User Guide")
            self.drawRightString(576, 762, "Educational & Research Platform")
            self.setStrokeColor(colors.HexColor("#cbd5e1"))
            self.setLineWidth(0.5)
            self.line(36, 756, 576, 756)

        # Footer (all pages)
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.5)
        self.line(36, 42, 576, 42)
        self.drawString(36, 30, "Confidential • Academic Research & Educational Decision Support Only • Non-Diagnostic")
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(576, 30, page_text)
        self.restoreState()


def build_pdf():
    doc = SimpleDocTemplate(
        str(OUTPUT_PDF),
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=46,
        bottomMargin=50
    )

    styles = getSampleStyleSheet()

    # Color Palette
    teal_dark = colors.HexColor("#0f766e")
    teal_light = colors.HexColor("#f0fdfa")
    navy_dark = colors.HexColor("#0f172a")
    slate_muted = colors.HexColor("#475569")
    rose_dark = colors.HexColor("#991b1b")
    rose_light = colors.HexColor("#fef2f2")
    border_slate = colors.HexColor("#cbd5e1")
    card_bg = colors.HexColor("#f8fafc")

    # Typography Styles
    title_style = ParagraphStyle(
        "CoverTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=22,
        leading=26,
        textColor=teal_dark,
        spaceAfter=6
    )
    subtitle_style = ParagraphStyle(
        "CoverSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=11,
        leading=15,
        textColor=slate_muted,
        spaceAfter=14
    )
    h1_style = ParagraphStyle(
        "Heading1_Custom",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=14,
        leading=18,
        textColor=navy_dark,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )
    h2_style = ParagraphStyle(
        "Heading2_Custom",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=11,
        leading=15,
        textColor=teal_dark,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )
    body_style = ParagraphStyle(
        "Body_Custom",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13.5,
        textColor=navy_dark,
        spaceAfter=6
    )
    disclaimer_style = ParagraphStyle(
        "Disclaimer_Custom",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8.5,
        leading=12,
        textColor=rose_dark
    )
    table_header_style = ParagraphStyle(
        "TableHeader",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=10,
        textColor=colors.white
    )
    table_cell_style = ParagraphStyle(
        "TableCell",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8,
        leading=10.5,
        textColor=navy_dark
    )
    table_cell_mono = ParagraphStyle(
        "TableCellMono",
        parent=styles["Normal"],
        fontName="Courier",
        fontSize=8,
        leading=10,
        textColor=teal_dark
    )

    story = []

    # Title & Header
    story.append(Paragraph("APPLICATION USER GUIDE & WORKOUT MANUAL", title_style))
    story.append(Paragraph("Early Disease Risk Prediction Using Explainable Machine Learning (XGBoost, SHAP, MySQL & Ollama)", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=teal_dark, spaceAfter=10))

    # Mandatory Medical Disclaimer Box
    disclaimer_html = (
        "<b>MANDATORY MEDICAL & EDUCATIONAL DISCLAIMER:</b><br/>"
        "This software application is built strictly for <b>educational exploration and academic research</b>. "
        "It does <b>NOT</b> diagnose diseases, prescribe medical treatments, or substitute for consultation with licensed healthcare practitioners. "
        "Probability values and SHAP feature attributions describe mathematical patterns within historical research cohorts, not clinical diagnostic certainties."
    )
    disclaimer_table = Table([[Paragraph(disclaimer_html, disclaimer_style)]], colWidths=[540])
    disclaimer_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), rose_light),
        ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#fca5a5")),
        ("PADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(disclaimer_table)
    story.append(Spacer(1, 10))

    # SECTION 1: System Overview & Architecture
    story.append(Paragraph("1. System Overview & Technology Stack", h1_style))
    overview_text = (
        "The platform pairs predictive gradient-boosted decision trees (<b>XGBoost</b>) with cooperative game-theoretic interpretability (<b>SHAP TreeExplainer</b>) "
        "and local conversational intelligence (<b>Ollama with llama3.2:latest</b>). Data persistence is managed via <b>MySQL</b>, and the responsive user interface "
        "is powered by <b>React 19, Tailwind CSS v4, and Recharts</b>."
    )
    story.append(Paragraph(overview_text, body_style))

    arch_data = [
        [Paragraph("Component", table_header_style), Paragraph("Technology", table_header_style), Paragraph("Operational Role & Port", table_header_style)],
        [Paragraph("Frontend UI", table_cell_style), Paragraph("React 19, Vite, Tailwind CSS v4, Recharts, Lucide", table_cell_style), Paragraph("Responsive web dashboard (Desktop & Mobile Drawer) at <b>http://localhost:5173</b>", table_cell_style)],
        [Paragraph("Backend API", table_cell_style), Paragraph("FastAPI, Uvicorn, Pydantic v2", table_cell_style), Paragraph("REST API endpoints, schema validation, PDF generation at <b>http://localhost:8000</b>", table_cell_style)],
        [Paragraph("Database", table_cell_style), Paragraph("MySQL Server (Port 3306), SQLAlchemy, PyMySQL", table_cell_style), Paragraph("Persistent database <b>disease_risk_db</b> storing assessment logs & SHAP vectors", table_cell_style)],
        [Paragraph("Machine Learning", table_cell_style), Paragraph("XGBoost, Scikit-learn, Pandas, NumPy, Joblib", table_cell_style), Paragraph("Trained classifiers for Diabetes, Heart Disease, and Kidney Disease", table_cell_style)],
        [Paragraph("Explainable AI", table_cell_style), Paragraph("SHAP (SHapley Additive exPlanations)", table_cell_style), Paragraph("Calculates local feature shifts, base expectations, and global rankings", table_cell_style)],
        [Paragraph("Local LLM", table_cell_style), Paragraph("Ollama (llama3.2:latest) on http://localhost:11434", table_cell_style), Paragraph("Plain-language clinical risk Q&A with rule-based fallback if offline", table_cell_style)],
    ]
    arch_table = Table(arch_data, colWidths=[100, 180, 260])
    arch_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), teal_dark),
        ("GRID", (0, 0), (-1, -1), 0.5, border_slate),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, card_bg]),
        ("PADDING", (0, 0), (-1, -1), 4.5),
    ]))
    story.append(arch_table)
    story.append(Spacer(1, 12))

    # SECTION 2: How to Run & Work the Application
    story.append(Paragraph("2. How to Work the Application (Step-by-Step)", h1_style))
    steps_text = (
        "<b>Step 1: Start Backend Services:</b> Launch the MySQL database server. Open PowerShell and run:<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;<code>cd backend; python -m uvicorn app.main:app --reload --port 8000</code><br/>"
        "<b>Step 2: Start Frontend Application:</b> In a second terminal window, run:<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;<code>cd frontend; npm run dev</code> (Open browser at http://localhost:5173)<br/>"
        "<b>Step 3: Verify Local LLM (Optional):</b> Ensure Ollama is active with <code>ollama list</code> showing <code>llama3.2:latest</code>.<br/>"
        "<b>Step 4: Select a Disease Module:</b> Navigate via the sidebar to Diabetes, Heart Disease, or Kidney Disease.<br/>"
        "<b>Step 5: Enter or Load Parameters:</b> Fill in clinical measurements or click the quick demo buttons to auto-populate samples.<br/>"
        "<b>Step 6: Review & Confirm:</b> A confirmation modal displays verified physiological numbers before running inference.<br/>"
        "<b>Step 7: Analyze Results & SHAP Waterfall:</b> Review the probability, illustrative risk band, and red/green feature shifts.<br/>"
        "<b>Step 8: Ask Ollama or Export PDF:</b> Click 'Consult Ollama' to ask follow-up questions, or download the PDF Report."
    )
    story.append(Paragraph(steps_text, body_style))
    story.append(Spacer(1, 10))

    # SECTION 3: Interpreting SHAP Values
    story.append(Paragraph("3. Understanding Explainable AI (SHAP)", h1_style))
    shap_expl = (
        "SHAP values measure the positive or negative contribution of each clinical parameter relative to the model's baseline expectation:<br/>"
        "• <b>Base Value (E[f(x)]):</b> The average probability across the research training cohort (e.g. ~35%).<br/>"
        "• <b>Positive SHAP (Red Bars):</b> Parameters that shifted the estimated probability <i>higher</i> (e.g. elevated plasma glucose or older age).<br/>"
        "• <b>Negative SHAP (Green Bars):</b> Parameters that acted as mitigating or protective factors, shifting the score <i>lower</i> (e.g. normal serum creatinine).<br/>"
        "• <b>Important Rule:</b> High SHAP magnitude proves that the decision tree utilized that feature for leaf splits; it does not prove clinical causality."
    )
    story.append(Paragraph(shap_expl, body_style))
    story.append(Spacer(1, 10))

    # SECTION 4: Comprehensive Workout Examples
    story.append(PageBreak())
    story.append(Paragraph("4. Concrete Workout Examples (Hands-On Testing Guide)", h1_style))
    story.append(Paragraph(
        "Use the exact clinical profiles below to test and evaluate the system across Lower Risk vs. Elevated Risk scenarios.",
        body_style
    ))

    # WORKOUT 1: Diabetes
    story.append(Paragraph("Workout 1: Diabetes Risk Assessment (Pima Indians Cohort)", h2_style))
    diab_table_data = [
        [Paragraph("Parameter", table_header_style), Paragraph("Unit / Range", table_header_style), Paragraph("Sample A (Lower Risk)", table_header_style), Paragraph("Sample B (Elevated Risk)", table_header_style)],
        [Paragraph("Number of Pregnancies", table_cell_style), Paragraph("0 - 25 count", table_cell_style), Paragraph("1", table_cell_mono), Paragraph("4", table_cell_mono)],
        [Paragraph("Plasma Glucose (2-hr OGTT)", table_cell_style), Paragraph("40 - 450 mg/dL", table_cell_style), Paragraph("94", table_cell_mono), Paragraph("168", table_cell_mono)],
        [Paragraph("Diastolic Blood Pressure", table_cell_style), Paragraph("30 - 200 mm Hg", table_cell_style), Paragraph("68", table_cell_mono), Paragraph("86", table_cell_mono)],
        [Paragraph("Triceps Skinfold Thickness", table_cell_style), Paragraph("5 - 110 mm", table_cell_style), Paragraph("20", table_cell_mono), Paragraph("34", table_cell_mono)],
        [Paragraph("2-Hour Serum Insulin", table_cell_style), Paragraph("0 - 1200 μU/mL", table_cell_style), Paragraph("65", table_cell_mono), Paragraph("195", table_cell_mono)],
        [Paragraph("Body Mass Index (BMI)", table_cell_style), Paragraph("12.0 - 75.0 kg/m²", table_cell_style), Paragraph("22.6", table_cell_mono), Paragraph("36.2", table_cell_mono)],
        [Paragraph("Diabetes Pedigree Score", table_cell_style), Paragraph("0.01 - 3.00 score", table_cell_style), Paragraph("0.24", table_cell_mono), Paragraph("0.78", table_cell_mono)],
        [Paragraph("Patient Age", table_cell_style), Paragraph("18 - 115 years", table_cell_style), Paragraph("28", table_cell_mono), Paragraph("54", table_cell_mono)],
        [Paragraph("Expected Model Output", table_header_style), Paragraph("Illustrative Band", table_header_style), Paragraph("<b>10% - 15% (Lower Risk)</b>", table_cell_style), Paragraph("<b>75% - 85% (Higher Risk)</b>", table_cell_style)],
        [Paragraph("Key Expected SHAP Drivers", table_header_style), Paragraph("Marginal Influence", table_header_style), Paragraph("Normal glucose & BMI push risk DOWN", table_cell_style), Paragraph("Elevated Glucose, BMI & Age push risk UP", table_cell_style)],
    ]
    diab_table = Table(diab_table_data, colWidths=[140, 110, 145, 145])
    diab_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), teal_dark),
        ("GRID", (0, 0), (-1, -1), 0.5, border_slate),
        ("ROWBACKGROUNDS", (0, 1), (-1, -3), [colors.white, card_bg]),
        ("BACKGROUND", (0, -2), (-1, -1), colors.HexColor("#e2e8f0")),
        ("PADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(diab_table)
    story.append(Spacer(1, 10))

    # WORKOUT 2: Heart Disease
    story.append(Paragraph("Workout 2: Heart Disease Risk Assessment (UCI Cleveland Cohort)", h2_style))
    heart_table_data = [
        [Paragraph("Parameter", table_header_style), Paragraph("Normal / Lower Risk Profile", table_header_style), Paragraph("High Risk Cardiovascular Profile", table_header_style)],
        [Paragraph("Age / Sex", table_cell_style), Paragraph("44 years / Female (0)", table_cell_mono), Paragraph("65 years / Male (1)", table_cell_mono)],
        [Paragraph("Chest Pain Type (cp)", table_cell_style), Paragraph("2 (Atypical Angina)", table_cell_mono), Paragraph("4 (Asymptomatic - High Silent Ischemia)", table_cell_mono)],
        [Paragraph("Resting BP / Cholesterol", table_cell_style), Paragraph("118 mm Hg / 190 mg/dL", table_cell_mono), Paragraph("158 mm Hg / 285 mg/dL", table_cell_mono)],
        [Paragraph("Fasting Blood Sugar > 120", table_cell_style), Paragraph("0 (False)", table_cell_mono), Paragraph("1 (True)", table_cell_mono)],
        [Paragraph("Resting ECG / Max HR (thalach)", table_cell_style), Paragraph("0 (Normal) / 168 bpm", table_cell_mono), Paragraph("2 (LV Hypertrophy) / 122 bpm", table_cell_mono)],
        [Paragraph("Ex. Angina / Oldpeak ST Depression", table_cell_style), Paragraph("0 (No) / 0.2 mm", table_cell_mono), Paragraph("1 (Yes) / 2.8 mm depression", table_cell_mono)],
        [Paragraph("Slope / Major Vessels (ca)", table_cell_style), Paragraph("1 (Upsloping) / 0 vessels", table_cell_mono), Paragraph("2 (Flat) / 2 vessels colored", table_cell_mono)],
        [Paragraph("Thallium Stress Scintigraphy", table_cell_style), Paragraph("3.0 (Normal)", table_cell_mono), Paragraph("7.0 (Reversible Defect)", table_cell_mono)],
        [Paragraph("Expected Output & Category", table_header_style), Paragraph("<b>12% - 20% (Lower Estimated Risk)</b>", table_cell_style), Paragraph("<b>85% - 95% (Higher Estimated Risk)</b>", table_cell_style)],
        [Paragraph("Key SHAP Drivers", table_header_style), Paragraph("Absence of major vessel disease & normal thal", table_cell_style), Paragraph("ST depression, fluoroscopy vessels & thal defect", table_cell_style)],
    ]
    heart_table = Table(heart_table_data, colWidths=[160, 190, 190])
    heart_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), teal_dark),
        ("GRID", (0, 0), (-1, -1), 0.5, border_slate),
        ("ROWBACKGROUNDS", (0, 1), (-1, -3), [colors.white, card_bg]),
        ("BACKGROUND", (0, -2), (-1, -1), colors.HexColor("#e2e8f0")),
        ("PADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(heart_table)
    story.append(Spacer(1, 10))

    # WORKOUT 3: Kidney Disease
    story.append(PageBreak())
    story.append(Paragraph("Workout 3: Chronic Kidney Disease Assessment (UCI CKD Cohort)", h2_style))
    ckd_table_data = [
        [Paragraph("Diagnostic Domain", table_header_style), Paragraph("Healthy Normal Profile", table_header_style), Paragraph("Impaired Renal Profile (Elevated CKD Risk)", table_header_style)],
        [Paragraph("Vitals (Age / BP)", table_cell_style), Paragraph("Age: 35 yrs, BP: 70 mm Hg", table_cell_mono), Paragraph("Age: 62 yrs, BP: 90 mm Hg", table_cell_mono)],
        [Paragraph("Urinalysis (sg, al, su)", table_cell_style), Paragraph("Specific Gravity: 1.025, Albumin: 0, Sugar: 0", table_cell_mono), Paragraph("Specific Gravity: 1.010, Albumin: 3, Sugar: 1", table_cell_mono)],
        [Paragraph("Urine Cells (rbc, pc, pcc, ba)", table_cell_style), Paragraph("RBC: Normal, PC: Normal, Clumps/Bacteria: None", table_cell_mono), Paragraph("RBC: Abnormal, PC: Abnormal, Clumps: Present", table_cell_mono)],
        [Paragraph("Blood Chemistry (bgr, bu, sc)", table_cell_style), Paragraph("Glucose: 92, Urea: 24, Creatinine: 0.8 mg/dL", table_cell_mono), Paragraph("Glucose: 160, Urea: 68, Creatinine: 3.2 mg/dL", table_cell_mono)],
        [Paragraph("Electrolytes (sod, pot)", table_cell_style), Paragraph("Sodium: 142 mEq/L, Potassium: 4.2 mEq/L", table_cell_mono), Paragraph("Sodium: 130 mEq/L, Potassium: 5.2 mEq/L", table_cell_mono)],
        [Paragraph("Hematology (hemo, pcv, wc, rc)", table_cell_style), Paragraph("Hemo: 15.6 g/dL, PCV: 46%, WBC: 6800, RBC: 5.3", table_cell_mono), Paragraph("Hemo: 9.4 g/dL, PCV: 29%, WBC: 10200, RBC: 3.6", table_cell_mono)],
        [Paragraph("Comorbidities & Signs", table_cell_style), Paragraph("HTN: No, DM: No, Appetite: Good, Edema/Anemia: No", table_cell_mono), Paragraph("HTN: Yes, DM: Yes, Appetite: Poor, Edema: Yes, Anemia: Yes", table_cell_mono)],
        [Paragraph("Expected Output & Category", table_header_style), Paragraph("<b>3% - 8% (Lower Estimated Risk)</b>", table_cell_style), Paragraph("<b>92% - 98% (Higher Estimated Risk)</b>", table_cell_style)],
        [Paragraph("Key SHAP Drivers", table_header_style), Paragraph("Normal serum creatinine & high hemoglobin", table_cell_style), Paragraph("Elevated Serum Creatinine, Albuminuria & Anemia", table_cell_style)],
    ]
    ckd_table = Table(ckd_table_data, colWidths=[140, 200, 200])
    ckd_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), teal_dark),
        ("GRID", (0, 0), (-1, -1), 0.5, border_slate),
        ("ROWBACKGROUNDS", (0, 1), (-1, -3), [colors.white, card_bg]),
        ("BACKGROUND", (0, -2), (-1, -1), colors.HexColor("#e2e8f0")),
        ("PADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(ckd_table)
    story.append(Spacer(1, 12))

    # SECTION 5: Hands-on Local LLM Assistant Workout
    story.append(Paragraph("5. Interactive Local LLM Assistant Workout", h1_style))
    llm_workout_text = (
        "After generating any prediction, navigate to <b>LLM Explanation Assistant</b> to conduct conversational Q&A with <code>llama3.2:latest</code>. "
        "Test the assistant with the following targeted prompt templates:"
    )
    story.append(Paragraph(llm_workout_text, body_style))

    q_data = [
        [Paragraph("Inquiry Category", table_header_style), Paragraph("Sample Question to Ask Ollama Assistant", table_header_style), Paragraph("Expected Explanatory Behavior", table_header_style)],
        [
            Paragraph("Risk Factor Inquiry", table_cell_style),
            Paragraph("<i>\"Why is my plasma glucose / serum creatinine the top risk factor?\"</i>", table_cell_style),
            Paragraph("Directly references the observed level and SHAP contribution (+0.45), explaining how it shifts odds in decision trees without claiming causality.", table_cell_style)
        ],
        [
            Paragraph("Probability Meaning", table_header_style),
            Paragraph("<i>\"What does an estimated probability of 78% actually mean?\"</i>", table_cell_style),
            Paragraph("Explains statistical likelihood in research cohorts, differentiating laboratory calibration from individual clinical diagnosis.", table_cell_style)
        ],
        [
            Paragraph("SHAP Directionality", table_cell_style),
            Paragraph("<i>\"What is the difference between red and green bars on the chart?\"</i>", table_cell_style),
            Paragraph("Clarifies that red represents risk-escalating features while green reflects protective or mitigating physiological measurements.", table_cell_style)
        ],
        [
            Paragraph("Model Boundaries", table_cell_style),
            Paragraph("<i>\"Can this model tell me if I definitely need medication?\"</i>", table_cell_style),
            Paragraph("Firmly demurs, highlighting safety boundaries, absence of clinical licensing, and mandating consultation with a licensed physician.", table_cell_style)
        ],
    ]
    q_table = Table(q_data, colWidths=[110, 215, 215])
    q_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), teal_dark),
        ("GRID", (0, 0), (-1, -1), 0.5, border_slate),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, card_bg]),
        ("PADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(q_table)
    story.append(Spacer(1, 14))

    # Summary Sign-Off Box
    summary_box_text = (
        "<b>SUMMARY CHECKLIST FOR DEMONSTRATIONS & ACADEMIC AUDITS:</b><br/>"
        "1. Confirm MySQL service is running on port 3306 with your configured credentials.<br/>"
        "2. Confirm FastAPI backend is online at <code>http://localhost:8000/api/health</code>.<br/>"
        "3. Confirm Vite frontend is responsive on both Desktop viewports and Mobile drawers.<br/>"
        "4. Confirm that every prediction saves to MySQL and produces a downloadable ReportLab PDF.<br/>"
        "5. Confirm that Ollama generates contextual explanations or switches gracefully to rule synthesis."
    )
    summary_table = Table([[Paragraph(summary_box_text, body_style)]], colWidths=[540])
    summary_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), teal_light),
        ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#0d9488")),
        ("PADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(summary_table)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"[SUCCESS] Generated User Guide PDF: {OUTPUT_PDF} ({OUTPUT_PDF.stat().st_size} bytes)")
    return OUTPUT_PDF


if __name__ == "__main__":
    build_pdf()
