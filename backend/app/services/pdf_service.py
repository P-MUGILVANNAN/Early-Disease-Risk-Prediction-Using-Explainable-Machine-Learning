"""
PDF Generation Service using ReportLab.
Produces a clean, professional clinical research assessment report with disclaimers and SHAP contributions.
"""

import io
import json
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, HRFlowable
)

from app.database.models import PredictionRecord
from app.ml.metadata import FEATURE_METADATA


class PDFReportGenerator:
    def generate_report(self, record: PredictionRecord) -> bytes:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()
        primary_color = colors.HexColor("#0f766e")    # Teal-700
        dark_navy = colors.HexColor("#0f172a")        # Slate-900
        light_bg = colors.HexColor("#f8fafc")         # Slate-50
        border_color = colors.HexColor("#cbd5e1")     # Slate-300
        accent_blue = colors.HexColor("#0284c7")      # Sky-600
        danger_red = colors.HexColor("#b91c1c")       # Red-700
        warning_amber = colors.HexColor("#b45309")    # Amber-700
        success_green = colors.HexColor("#15803d")    # Green-700

        # Custom typography styles
        title_style = ParagraphStyle(
            "DocTitle",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=18,
            leading=22,
            textColor=primary_color,
            spaceAfter=4
        )
        subtitle_style = ParagraphStyle(
            "DocSubtitle",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=10,
            leading=14,
            textColor=colors.HexColor("#64748b")
        )
        h2_style = ParagraphStyle(
            "SectionH2",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=12,
            leading=16,
            textColor=dark_navy,
            spaceBefore=10,
            spaceAfter=4
        )
        body_style = ParagraphStyle(
            "DocBody",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=9,
            leading=13,
            textColor=dark_navy
        )
        disclaimer_style = ParagraphStyle(
            "DisclaimerText",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=8,
            leading=11,
            textColor=danger_red
        )
        table_header_style = ParagraphStyle(
            "TableHeader",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=8.5,
            leading=11,
            textColor=colors.white
        )
        table_cell_style = ParagraphStyle(
            "TableCell",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=8,
            leading=11,
            textColor=dark_navy
        )

        elements = []

        # Header Title
        disease_info = FEATURE_METADATA.get(record.disease, {})
        disease_title = disease_info.get("title", record.disease.replace("_", " ").title())
        elements.append(Paragraph("EARLY DISEASE RISK PREDICTION REPORT", title_style))
        elements.append(Paragraph("Explainable Machine Learning Research Platform — Academic Decision Support", subtitle_style))
        elements.append(Spacer(1, 8))
        elements.append(HRFlowable(width="100%", thickness=1.5, color=primary_color, spaceAfter=8))

        # Medical Disclaimer Box
        disclaimer_text = (
            "<b>IMPORTANT EDUCATIONAL & CLINICAL DISCLAIMER:</b> This assessment is generated purely by an experimental machine learning "
            "model for educational and research exploration. It does <b>NOT</b> constitute a medical diagnosis, clinical evaluation, or prescription. "
            "Never use this report as a substitute for professional healthcare advice, diagnosis, or clinical decisions."
        )
        disclaimer_table = Table(
            [[Paragraph(disclaimer_text, disclaimer_style)]],
            colWidths=[540]
        )
        disclaimer_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#fef2f2")),
            ("BORDER", (0, 0), (-1, -1), 1, colors.HexColor("#fca5a5")),
            ("PADDING", (0, 0), (-1, -1), 8),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE")
        ]))
        elements.append(disclaimer_table)
        elements.append(Spacer(1, 10))

        # Assessment Overview & Probability Band
        risk_color = (
            danger_red if "Higher" in record.risk_category
            else warning_amber if "Intermediate" in record.risk_category
            else success_green
        )

        created_str = record.created_at.strftime("%Y-%m-%d %H:%M:%S UTC") if hasattr(record.created_at, "strftime") else str(record.created_at)

        overview_data = [
            [
                Paragraph(f"<b>Target Condition:</b> {disease_title}", body_style),
                Paragraph(f"<b>Assessment ID:</b> #{record.id:05d}", body_style)
            ],
            [
                Paragraph(f"<b>Analysis Date:</b> {created_str}", body_style),
                Paragraph(f"<b>Model Engine:</b> XGBoost v{record.model_version}", body_style)
            ],
            [
                Paragraph(f"<b>Estimated Probability:</b> <font size='12' color='{primary_color.hexval()}'><b>{record.probability * 100:.1f}%</b></font>", body_style),
                Paragraph(f"<b>Illustrative Risk Category:</b> <font size='11' color='{risk_color.hexval()}'><b>{record.risk_category}</b></font>", body_style)
            ]
        ]
        overview_table = Table(overview_data, colWidths=[270, 270])
        overview_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), light_bg),
            ("BOX", (0, 0), (-1, -1), 0.5, border_color),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ("PADDING", (0, 0), (-1, -1), 6)
        ]))
        elements.append(overview_table)
        elements.append(Spacer(1, 10))

        # Patient Inputs Table
        elements.append(Paragraph("Evaluated Input Parameters", h2_style))
        inputs_dict = json.loads(record.inputs_json)
        input_rows = [[Paragraph("Feature Name", table_header_style), Paragraph("Entered Value", table_header_style), Paragraph("Feature Name", table_header_style), Paragraph("Entered Value", table_header_style)]]

        keys = list(inputs_dict.keys())
        for i in range(0, len(keys), 2):
            k1 = keys[i]
            v1 = inputs_dict[k1]
            f_meta1 = disease_info.get("features", {}).get(k1, {})
            name1 = f_meta1.get("display_name", k1)
            unit1 = f_meta1.get("unit", "")
            val_str1 = f"{v1} {unit1}" if unit1 and unit1 not in ["type", "code", "flag", "state", "category"] else str(v1)

            if i + 1 < len(keys):
                k2 = keys[i + 1]
                v2 = inputs_dict[k2]
                f_meta2 = disease_info.get("features", {}).get(k2, {})
                name2 = f_meta2.get("display_name", k2)
                unit2 = f_meta2.get("unit", "")
                val_str2 = f"{v2} {unit2}" if unit2 and unit2 not in ["type", "code", "flag", "state", "category"] else str(v2)
            else:
                name2, val_str2 = "-", "-"

            input_rows.append([
                Paragraph(name1, table_cell_style),
                Paragraph(val_str1, table_cell_style),
                Paragraph(name2, table_cell_style),
                Paragraph(val_str2, table_cell_style)
            ])

        inp_table = Table(input_rows, colWidths=[160, 110, 160, 110])
        inp_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), primary_color),
            ("GRID", (0, 0), (-1, -1), 0.5, border_color),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, light_bg]),
            ("PADDING", (0, 0), (-1, -1), 4)
        ]))
        elements.append(inp_table)
        elements.append(Spacer(1, 10))

        # Top Contributing Factors (SHAP Local Explanation)
        elements.append(Paragraph("Key Explainable AI Factors (SHAP Values)", h2_style))
        top_features = json.loads(record.top_features_json)
        shap_rows = [[
            Paragraph("Rank", table_header_style),
            Paragraph("Feature Attribution", table_header_style),
            Paragraph("Observed Value", table_header_style),
            Paragraph("SHAP Impact", table_header_style),
            Paragraph("Risk Shift", table_header_style)
        ]]

        for idx, feat in enumerate(top_features[:5], 1):
            impact_text = feat.get("impact", "neutral").replace("_", " ").title()
            impact_color = danger_red if "Increases" in impact_text else success_green if "Decreases" in impact_text else dark_navy
            shap_val = feat.get("shap_value", 0.0)

            shap_rows.append([
                Paragraph(f"#{idx}", table_cell_style),
                Paragraph(feat.get("display_name", feat.get("feature")), table_cell_style),
                Paragraph(str(feat.get("value", "-")), table_cell_style),
                Paragraph(f"<font color='{impact_color.hexval()}'><b>{impact_text}</b></font>", table_cell_style),
                Paragraph(f"{shap_val:+.4f}", table_cell_style)
            ])

        shap_table = Table(shap_rows, colWidths=[40, 200, 100, 110, 90])
        shap_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), primary_color),
            ("GRID", (0, 0), (-1, -1), 0.5, border_color),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, light_bg]),
            ("PADDING", (0, 0), (-1, -1), 4)
        ]))
        elements.append(shap_table)
        elements.append(Spacer(1, 10))

        # Model Limitations & Educational Summary
        elements.append(Paragraph("Model Limitations & Interpretation Notes", h2_style))
        notes = (
            "1. <b>Baseline Shift:</b> The XGBoost model calculates each patient's output by shifting from an expected baseline ("
            f"{record.base_value:.3f}) based on individual feature contributions.<br/>"
            "2. <b>Statistical Association vs Causality:</b> A high positive SHAP value signifies mathematical feature weighting in the "
            "model, not proven clinical causality.<br/>"
            "3. <b>Dataset Boundaries:</b> Evaluated using retrospective cohorts. Demographics, unmeasured biomarkers, and environmental "
            "determinants may significantly alter individual prognosis."
        )
        elements.append(Paragraph(notes, body_style))
        elements.append(Spacer(1, 12))

        # Footer
        elements.append(HRFlowable(width="100%", thickness=0.5, color=border_color, spaceAfter=6))
        elements.append(Paragraph(
            "Report generated by Early Disease Risk Prediction System • Educational Machine Learning Platform • Confidential",
            subtitle_style
        ))

        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()


pdf_generator = PDFReportGenerator()
