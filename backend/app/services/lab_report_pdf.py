"""
Generate a professional lab report PDF using ReportLab.
Returns raw PDF bytes.
"""

from io import BytesIO
from datetime import datetime

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_RIGHT, TA_CENTER
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
)


# ── Colour palette (teal/cyan for clinic) ── #
TEAL        = HexColor("#0891b2")
TEAL_DARK   = HexColor("#0e7490")
TEAL_LIGHT  = HexColor("#ecfeff")
DARK        = HexColor("#0f172a")
GREY        = HexColor("#64748b")
LIGHT_GREY  = HexColor("#f1f5f9")
WHITE       = HexColor("#ffffff")
GREEN       = HexColor("#10b981")
GREEN_BG    = HexColor("#f0fdf4")
GREEN_BR    = HexColor("#bbf7d0")
RED         = HexColor("#ef4444")
RED_BG      = HexColor("#fef2f2")
RED_BR      = HexColor("#fecaca")
AMBER       = HexColor("#f59e0b")
AMBER_BG    = HexColor("#fffbeb")
AMBER_BR    = HexColor("#fde68a")
BLUE_BG     = HexColor("#eff6ff")
BLUE_BR     = HexColor("#bfdbfe")


def _fmt_date(d) -> str:
    if not d:
        return "—"
    try:
        if isinstance(d, str):
            dt = datetime.fromisoformat(d)
        else:
            dt = d
        return dt.strftime("%B %d, %Y")
    except Exception:
        return str(d)


def generate_lab_report_pdf(report_data: dict) -> bytes:
    """
    Accept a dict with lab report data and return PDF bytes.

    Expected keys:
        clinic_name, clinic_address, clinic_phone,
        patient_name, patient_age, patient_gender, patient_phone,
        doctor_name, doctor_specialization, diagnosis,
        results: [{"test_name", "result", "unit", "reference_range", "status", "remarks"}],
        summary, notes, created_at, report_id
    """
    buf = BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=A4,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        topMargin=14 * mm,
        bottomMargin=14 * mm,
    )

    styles = getSampleStyleSheet()

    # ─── Custom styles ───
    s_clinic = ParagraphStyle("Clinic", parent=styles["Normal"], fontName="Helvetica-Bold",
                              fontSize=18, textColor=TEAL, leading=22)
    s_tagline = ParagraphStyle("Tagline", parent=styles["Normal"], fontName="Helvetica",
                               fontSize=8, textColor=GREY, leading=12)
    s_label = ParagraphStyle("Label", parent=styles["Normal"], fontName="Helvetica-Bold",
                             fontSize=7, textColor=GREY, leading=10, spaceAfter=1)
    s_value = ParagraphStyle("Value", parent=styles["Normal"], fontName="Helvetica-Bold",
                             fontSize=10, textColor=DARK, leading=13)
    s_heading = ParagraphStyle("SectionHead", parent=styles["Normal"], fontName="Helvetica-Bold",
                               fontSize=9, textColor=TEAL_DARK, leading=12, spaceAfter=4)
    s_body = ParagraphStyle("Body", parent=styles["Normal"], fontName="Helvetica",
                            fontSize=10, textColor=DARK, leading=14)
    s_small = ParagraphStyle("Small", parent=styles["Normal"], fontName="Helvetica",
                             fontSize=8, textColor=GREY, leading=10)
    s_stamp = ParagraphStyle("Stamp", parent=styles["Normal"], fontName="Helvetica-Bold",
                             fontSize=9, textColor=TEAL, alignment=TA_RIGHT, leading=12)
    s_sig_name = ParagraphStyle("SigName", parent=styles["Normal"], fontName="Helvetica-Bold",
                                fontSize=10, textColor=DARK, leading=13)

    s_th = ParagraphStyle("TH", parent=styles["Normal"], fontName="Helvetica-Bold",
                          fontSize=8, textColor=TEAL_DARK, leading=11)
    s_td = ParagraphStyle("TD", parent=styles["Normal"], fontName="Helvetica",
                          fontSize=9, textColor=DARK, leading=12)
    s_td_bold = ParagraphStyle("TDBold", parent=styles["Normal"], fontName="Helvetica-Bold",
                               fontSize=9, textColor=DARK, leading=12)

    elements = []

    # ═══ ACCENT BAR ═══
    accent = Table([[""]],  colWidths=[doc.width], rowHeights=[4 * mm])
    accent.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), TEAL)]))
    elements.append(accent)

    # ═══ HEADER ═══
    clinic_name = report_data.get("clinic_name", "Clinic")
    clinic_addr = report_data.get("clinic_address", "")
    clinic_phone = report_data.get("clinic_phone", "")
    left_header = [
        Paragraph("MedNexus Healthcare", s_clinic),
        Paragraph("Connected Care · Anytime · Anywhere", s_tagline),
    ]
    right_header = [
        Paragraph(clinic_name, ParagraphStyle("ClinicR", parent=styles["Normal"],
                  fontName="Helvetica-Bold", fontSize=13, textColor=DARK, alignment=TA_RIGHT, leading=16)),
    ]
    if clinic_addr:
        right_header.append(Paragraph(clinic_addr, ParagraphStyle("Addr", parent=s_small, alignment=TA_RIGHT)))
    if clinic_phone:
        right_header.append(Paragraph(f"Tel: {clinic_phone}", ParagraphStyle("Phone", parent=s_small, alignment=TA_RIGHT)))

    header_tbl = Table([[left_header, right_header]],
                       colWidths=[doc.width * 0.5, doc.width * 0.5])
    header_tbl.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
    ]))
    elements.append(header_tbl)
    elements.append(HRFlowable(width="100%", thickness=1.5, color=TEAL, spaceAfter=8, spaceBefore=0))

    # Title
    elements.append(Paragraph("LABORATORY TEST REPORT", ParagraphStyle(
        "Title", parent=styles["Normal"], fontName="Helvetica-Bold",
        fontSize=14, textColor=TEAL_DARK, alignment=TA_CENTER, leading=18, spaceAfter=8)))
    elements.append(Spacer(1, 2 * mm))

    # ═══ PATIENT META ═══
    meta_cells = []
    meta_cells.append([Paragraph("PATIENT", s_label), Paragraph(report_data.get("patient_name", "—"), s_value)])

    age_sex = ""
    if report_data.get("patient_age"):
        age_sex = f"{report_data['patient_age']} yrs"
    if report_data.get("patient_gender"):
        age_sex += f" / {report_data['patient_gender']}" if age_sex else report_data['patient_gender']
    if age_sex:
        meta_cells.append([Paragraph("AGE / SEX", s_label), Paragraph(age_sex, s_value)])

    if report_data.get("patient_phone"):
        meta_cells.append([Paragraph("PHONE", s_label), Paragraph(report_data['patient_phone'], s_value)])

    date_str = _fmt_date(report_data.get("created_at"))
    meta_cells.append([Paragraph("REPORT DATE", s_label), Paragraph(date_str, s_value)])

    n = len(meta_cells)
    col_w = doc.width / n if n else doc.width
    meta_tbl = Table([meta_cells], colWidths=[col_w] * n)
    meta_tbl.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("BACKGROUND", (0, 0), (-1, -1), LIGHT_GREY),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
    ]))
    elements.append(meta_tbl)
    elements.append(Spacer(1, 4 * mm))

    # ═══ DOCTOR + DIAGNOSIS ═══
    doctor_name = report_data.get("doctor_name", "")
    diagnosis = report_data.get("diagnosis", "")
    if doctor_name or diagnosis:
        info_rows = []
        if doctor_name:
            info_rows.append([Paragraph(f"<b>Referred by:</b> Dr. {doctor_name}", s_body)])
        if diagnosis:
            info_rows.append([Paragraph(f"<b>Diagnosis:</b> {diagnosis}", s_body)])
        info_tbl = Table(info_rows, colWidths=[doc.width])
        info_tbl.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), GREEN_BG),
            ("BOX", (0, 0), (-1, -1), 0.5, GREEN_BR),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
            ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ]))
        elements.append(info_tbl)
        elements.append(Spacer(1, 5 * mm))

    # ═══ RESULTS TABLE ═══
    results = report_data.get("results") or []
    if results:
        elements.append(Paragraph("TEST RESULTS", s_heading))
        elements.append(Spacer(1, 2 * mm))

        # Table header
        header_row = [
            Paragraph("Test Name", s_th),
            Paragraph("Result", s_th),
            Paragraph("Unit", s_th),
            Paragraph("Reference Range", s_th),
            Paragraph("Status", s_th),
        ]
        data_rows = [header_row]

        for r in results:
            status_str = r.get("status", "normal").capitalize()
            if status_str.lower() == "critical":
                status_style = ParagraphStyle("Crit", parent=s_td_bold, textColor=RED)
            elif status_str.lower() == "abnormal":
                status_style = ParagraphStyle("Abn", parent=s_td_bold, textColor=AMBER)
            else:
                status_style = ParagraphStyle("Norm", parent=s_td, textColor=GREEN)

            row = [
                Paragraph(r.get("test_name", ""), s_td_bold),
                Paragraph(r.get("result", "—"), s_td),
                Paragraph(r.get("unit", ""), s_td),
                Paragraph(r.get("reference_range", ""), s_td),
                Paragraph(status_str, status_style),
            ]
            data_rows.append(row)

            # If there are remarks, add a sub-row
            if r.get("remarks"):
                remark_row = [
                    "",
                    Paragraph(f"<i>Remarks: {r['remarks']}</i>",
                              ParagraphStyle("Rem", parent=s_small, textColor=GREY)),
                    "", "", ""
                ]
                data_rows.append(remark_row)

        col_widths = [
            doc.width * 0.28,
            doc.width * 0.20,
            doc.width * 0.12,
            doc.width * 0.25,
            doc.width * 0.15,
        ]
        results_tbl = Table(data_rows, colWidths=col_widths, repeatRows=1)
        results_tbl.setStyle(TableStyle([
            # Header
            ("BACKGROUND", (0, 0), (-1, 0), HexColor("#e0f7fa")),
            ("TEXTCOLOR", (0, 0), (-1, 0), TEAL_DARK),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, 0), 8),
            # Body
            ("FONTSIZE", (0, 1), (-1, -1), 9),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            # Grid
            ("GRID", (0, 0), (-1, 0), 0.5, TEAL),
            ("LINEBELOW", (0, 0), (-1, -1), 0.3, HexColor("#e2e8f0")),
            # Alternating row bg
            *[("BACKGROUND", (0, i), (-1, i), LIGHT_GREY) for i in range(2, len(data_rows), 2)],
        ]))
        elements.append(results_tbl)
        elements.append(Spacer(1, 5 * mm))

    # ═══ SUMMARY ═══
    summary = report_data.get("summary")
    if summary:
        sum_data = [
            [Paragraph("IMPRESSION / SUMMARY", s_heading)],
            [Paragraph(summary, s_body)],
        ]
        sum_tbl = Table(sum_data, colWidths=[doc.width])
        sum_tbl.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), BLUE_BG),
            ("BOX", (0, 0), (-1, -1), 0.5, BLUE_BR),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
            ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ]))
        elements.append(sum_tbl)
        elements.append(Spacer(1, 4 * mm))

    # ═══ NOTES ═══
    notes = report_data.get("notes")
    if notes:
        n_data = [
            [Paragraph("NOTES", s_heading)],
            [Paragraph(notes, s_body)],
        ]
        n_tbl = Table(n_data, colWidths=[doc.width])
        n_tbl.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), AMBER_BG),
            ("BOX", (0, 0), (-1, -1), 0.5, AMBER_BR),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
            ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ]))
        elements.append(n_tbl)
        elements.append(Spacer(1, 4 * mm))

    # ═══ FOOTER — signature ═══
    elements.append(Spacer(1, 8 * mm))
    elements.append(HRFlowable(width="100%", thickness=0.5, color=HexColor("#f1f5f9"), spaceAfter=6))

    sig_left = [
        HRFlowable(width=45 * mm, thickness=1, color=TEAL, spaceAfter=3),
        Paragraph(clinic_name, s_sig_name),
        Paragraph("Authorized Signatory", s_small),
    ]
    sig_right = [
        Paragraph("✓ LAB REPORT", s_stamp),
        Paragraph(f"Report #{report_data.get('report_id', '')}", ParagraphStyle(
            "RptId", parent=s_small, alignment=TA_RIGHT)),
    ]
    footer_tbl = Table([[sig_left, sig_right]],
                       colWidths=[doc.width * 0.55, doc.width * 0.45])
    footer_tbl.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "BOTTOM")]))
    elements.append(footer_tbl)

    elements.append(Spacer(1, 10 * mm))
    elements.append(Paragraph(
        "This is a computer-generated lab report from MedNexus Healthcare. "
        "No physical signature is required.",
        ParagraphStyle("Disc", parent=s_small, alignment=TA_CENTER, textColor=HexColor("#94a3b8")),
    ))

    doc.build(elements)
    return buf.getvalue()
