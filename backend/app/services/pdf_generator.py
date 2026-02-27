"""
Generate a professional prescription PDF using ReportLab.
Returns raw PDF bytes (no temp file needed).
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


# ──────────────────────────────────────────────
# Colour palette (matches the frontend teal theme)
# ──────────────────────────────────────────────
TEAL        = HexColor("#0d9488")
TEAL_LIGHT  = HexColor("#ccfbf1")
DARK        = HexColor("#0f172a")
GREY        = HexColor("#64748b")
LIGHT_GREY  = HexColor("#f1f5f9")
BLUE        = HexColor("#1e40af")
BLUE_BG     = HexColor("#eff6ff")
GREEN_BG    = HexColor("#f0fdf4")
YELLOW_BG   = HexColor("#fffbeb")
GREEN_BR    = HexColor("#bbf7d0")
BLUE_BR     = HexColor("#bfdbfe")
YELLOW_BR   = HexColor("#fde68a")
WHITE       = HexColor("#ffffff")


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


def _fmt_time(t) -> str:
    if not t:
        return ""
    try:
        s = str(t)
        parts = s.split(":")
        h, m = int(parts[0]), parts[1]
        suffix = "AM" if h < 12 else "PM"
        h12 = h % 12 or 12
        return f"{h12}:{m} {suffix}"
    except Exception:
        return str(t)


# ──────────────────────────────────────────────
# Main entry point
# ──────────────────────────────────────────────
def generate_prescription_pdf(rx_data: dict) -> bytes:
    """
    Accept a dict with the full prescription data (matching PrescriptionOut)
    and return PDF content as bytes.
    """
    buf = BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=A4,
        leftMargin=20 * mm,
        rightMargin=20 * mm,
        topMargin=15 * mm,
        bottomMargin=15 * mm,
    )

    styles = getSampleStyleSheet()

    # ─── Custom styles ───
    s_clinic = ParagraphStyle(
        "Clinic",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=18,
        textColor=TEAL,
        leading=22,
    )
    s_tagline = ParagraphStyle(
        "Tagline",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8,
        textColor=GREY,
        leading=12,
    )
    s_doc_name = ParagraphStyle(
        "DocName",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=13,
        textColor=DARK,
        alignment=TA_RIGHT,
        leading=16,
    )
    s_doc_spec = ParagraphStyle(
        "DocSpec",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        textColor=TEAL,
        alignment=TA_RIGHT,
        leading=12,
    )
    s_doc_bmdc = ParagraphStyle(
        "DocBmdc",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8,
        textColor=GREY,
        alignment=TA_RIGHT,
        leading=12,
    )
    s_label = ParagraphStyle(
        "Label",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=7,
        textColor=GREY,
        leading=10,
        spaceAfter=1,
    )
    s_value = ParagraphStyle(
        "Value",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=10,
        textColor=DARK,
        leading=13,
    )
    s_heading = ParagraphStyle(
        "SectionHead",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8,
        textColor=GREY,
        leading=11,
        spaceAfter=4,
    )
    s_body = ParagraphStyle(
        "Body",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        textColor=DARK,
        leading=14,
    )
    s_med_name = ParagraphStyle(
        "MedName",
        parent=styles["Normal"],
        fontName="Helvetica-BoldOblique",
        fontSize=11,
        textColor=DARK,
        leading=14,
    )
    s_med_detail = ParagraphStyle(
        "MedDetail",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        textColor=GREY,
        leading=12,
    )
    s_rx = ParagraphStyle(
        "RxSymbol",
        parent=styles["Normal"],
        fontName="Times-Bold",
        fontSize=30,
        textColor=TEAL,
        leading=34,
    )
    s_sig_name = ParagraphStyle(
        "SigName",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=10,
        textColor=DARK,
        leading=13,
    )
    s_small = ParagraphStyle(
        "Small",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8,
        textColor=GREY,
        leading=10,
    )
    s_stamp = ParagraphStyle(
        "Stamp",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=9,
        textColor=TEAL,
        alignment=TA_RIGHT,
        leading=12,
    )

    elements = []

    # ════════════════════════════════════════════
    # HEADER — accent bar + letterhead
    # ════════════════════════════════════════════
    accent = Table(
        [[""]],
        colWidths=[doc.width],
        rowHeights=[4 * mm],
    )
    accent.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), TEAL),
        ("LINEBELOW", (0, 0), (-1, -1), 0, TEAL),
    ]))
    elements.append(accent)

    # Clinic + Doctor info side-by-side
    left = [
        Paragraph("MedNexus Healthcare", s_clinic),
        Paragraph("Connected Care · Anytime · Anywhere", s_tagline),
    ]
    right = [
        Paragraph(f"Dr. {rx_data.get('doctor_name', '—')}", s_doc_name),
        Paragraph(rx_data.get("doctor_specialization", ""), s_doc_spec),
        Paragraph(f"BMDC Reg. No.: {rx_data.get('doctor_bmdc', '—')}", s_doc_bmdc),
    ]

    header_table = Table(
        [[left, right]],
        colWidths=[doc.width * 0.55, doc.width * 0.45],
    )
    header_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
    ]))
    elements.append(header_table)

    # Teal rule
    elements.append(HRFlowable(width="100%", thickness=1.5, color=TEAL, spaceAfter=8, spaceBefore=0))

    # ════════════════════════════════════════════
    # PATIENT META ROW
    # ════════════════════════════════════════════
    meta_cells = []
    meta_cells.append([Paragraph("PATIENT", s_label), Paragraph(rx_data.get("patient_name", "—"), s_value)])
    if rx_data.get("patient_age"):
        age_sex = f"{rx_data['patient_age']} yrs"
        if rx_data.get("patient_gender"):
            age_sex += f" / {rx_data['patient_gender']}"
        meta_cells.append([Paragraph("AGE / SEX", s_label), Paragraph(age_sex, s_value)])
    if rx_data.get("patient_phone"):
        meta_cells.append([Paragraph("PHONE", s_label), Paragraph(rx_data['patient_phone'], s_value)])

    date_str = _fmt_date(rx_data.get("created_at"))
    meta_cells.append([Paragraph("DATE", s_label), Paragraph(date_str, s_value)])

    n_cols = len(meta_cells)
    col_w = doc.width / n_cols if n_cols else doc.width

    meta_table = Table(
        [meta_cells],
        colWidths=[col_w] * n_cols,
    )
    meta_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("BACKGROUND", (0, 0), (-1, -1), LIGHT_GREY),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
    ]))
    elements.append(meta_table)
    elements.append(Spacer(1, 6 * mm))

    # ════════════════════════════════════════════
    # DIAGNOSIS
    # ════════════════════════════════════════════
    diagnosis = rx_data.get("diagnosis")
    if diagnosis:
        diag_data = [[Paragraph("DIAGNOSIS / CHIEF COMPLAINT", s_heading), Paragraph(diagnosis, s_body)]]
        diag_table = Table(diag_data, colWidths=[doc.width])
        diag_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), GREEN_BG),
            ("BOX", (0, 0), (-1, -1), 0.5, GREEN_BR),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
            ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ]))
        elements.append(diag_table)
        elements.append(Spacer(1, 4 * mm))

    # ════════════════════════════════════════════
    # Rx SYMBOL + MEDICINES
    # ════════════════════════════════════════════
    elements.append(Paragraph("℞", s_rx))
    elements.append(Spacer(1, 2 * mm))

    medicines = rx_data.get("medicines") or []
    if medicines:
        for i, med in enumerate(medicines):
            name = med.get("name", "")
            parts = []
            if med.get("dosage"):
                parts.append(med["dosage"])
            if med.get("frequency"):
                parts.append(med["frequency"])
            if med.get("duration"):
                parts.append(med["duration"])
            detail_text = " · ".join(parts)
            instr = med.get("instructions", "")

            med_rows = [
                [Paragraph(f"{i + 1}.", s_value), Paragraph(name, s_med_name)],
            ]
            if detail_text:
                med_rows.append(["", Paragraph(detail_text, s_med_detail)])
            if instr:
                med_rows.append(["", Paragraph(f"Sig: {instr}", s_med_detail)])

            med_tbl = Table(med_rows, colWidths=[8 * mm, doc.width - 8 * mm])
            med_tbl.setStyle(TableStyle([
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("TOPPADDING", (0, 0), (-1, -1), 2),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
                ("LEFTPADDING", (0, 0), (0, -1), 0),
            ]))
            elements.append(med_tbl)

            if i < len(medicines) - 1:
                elements.append(HRFlowable(width="92%", thickness=0.4, color=HexColor("#e2e8f0"),
                                           spaceAfter=4, spaceBefore=4, dash=[2, 2]))
    else:
        elements.append(Paragraph("<i>No medicines prescribed</i>", s_med_detail))

    elements.append(Spacer(1, 5 * mm))

    # ════════════════════════════════════════════
    # LAB TESTS
    # ════════════════════════════════════════════
    lab_tests = rx_data.get("lab_tests") or []
    if lab_tests:
        lab_heading = Paragraph("INVESTIGATIONS / LAB TESTS", ParagraphStyle(
            "LabHead", parent=s_heading, textColor=BLUE))
        lab_rows = [[lab_heading]]
        for lab in lab_tests:
            line = f"<b>▸ {lab.get('name', '')}</b>"
            if lab.get("instructions"):
                line += f"  <i>— {lab['instructions']}</i>"
            lab_rows.append([Paragraph(line, ParagraphStyle(
                "LabItem", parent=s_body, fontSize=10, textColor=HexColor("#1e3a5f")))])

        lab_table = Table(lab_rows, colWidths=[doc.width])
        lab_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), BLUE_BG),
            ("BOX", (0, 0), (-1, -1), 0.5, BLUE_BR),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
            ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ]))
        elements.append(lab_table)
        elements.append(Spacer(1, 4 * mm))

    # ════════════════════════════════════════════
    # NOTES
    # ════════════════════════════════════════════
    notes = rx_data.get("notes")
    if notes:
        note_data = [[Paragraph("ADVICE / NOTES", s_heading), Paragraph(notes, s_body)]]
        note_table = Table(note_data, colWidths=[doc.width])
        note_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), YELLOW_BG),
            ("BOX", (0, 0), (-1, -1), 0.5, YELLOW_BR),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
            ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ]))
        elements.append(note_table)
        elements.append(Spacer(1, 4 * mm))

    # ════════════════════════════════════════════
    # FOLLOW-UP
    # ════════════════════════════════════════════
    follow_up = rx_data.get("follow_up_date")
    if follow_up:
        fu_text = f"Follow-up: <b>{_fmt_date(follow_up)}</b>"
        fu_para = Paragraph(fu_text, ParagraphStyle(
            "FU", parent=s_body, fontSize=10, textColor=DARK))
        fu_table = Table([[fu_para]], colWidths=[doc.width])
        fu_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), LIGHT_GREY),
            ("BOX", (0, 0), (-1, -1), 0.5, HexColor("#cbd5e1")),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ]))
        elements.append(fu_table)
        elements.append(Spacer(1, 6 * mm))

    # ════════════════════════════════════════════
    # FOOTER — signature + stamp
    # ════════════════════════════════════════════
    elements.append(Spacer(1, 8 * mm))
    elements.append(HRFlowable(width="100%", thickness=0.5, color=HexColor("#f1f5f9"), spaceAfter=6))

    sig_left = [
        HRFlowable(width=45 * mm, thickness=1, color=TEAL, spaceAfter=3),
        Paragraph(f"Dr. {rx_data.get('doctor_name', '—')}", s_sig_name),
        Paragraph(rx_data.get("doctor_specialization", ""), s_small),
    ]
    sig_right = [
        Paragraph("✓ ISSUED", s_stamp),
        Paragraph(f"Rx #{rx_data.get('id', '')}", ParagraphStyle(
            "RxId", parent=s_small, alignment=TA_RIGHT)),
    ]

    footer_table = Table(
        [[sig_left, sig_right]],
        colWidths=[doc.width * 0.55, doc.width * 0.45],
    )
    footer_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "BOTTOM"),
    ]))
    elements.append(footer_table)

    # ─── Watermark-style disclaimer ───
    elements.append(Spacer(1, 10 * mm))
    elements.append(Paragraph(
        "This is a computer-generated prescription from MedNexus Healthcare. "
        "No physical signature is required.",
        ParagraphStyle("Disclaimer", parent=s_small, alignment=TA_CENTER, textColor=HexColor("#94a3b8")),
    ))

    # Build PDF
    doc.build(elements)
    return buf.getvalue()
