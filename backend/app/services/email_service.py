"""
Async email service for sending prescription emails with PDF attachment.
Uses aiosmtplib + Python email.mime for building MIME messages.
"""

import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from datetime import datetime

import aiosmtplib

from app.core.config import settings
from app.services.pdf_generator import generate_prescription_pdf

logger = logging.getLogger(__name__)


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


def _build_prescription_html(rx: dict) -> str:
    """Return a professional, inline-styled HTML email body."""

    doctor_name = rx.get("doctor_name", "Your Doctor")
    doctor_spec = rx.get("doctor_specialization", "")
    patient_name = rx.get("patient_name", "Patient")
    diagnosis = rx.get("diagnosis", "")
    created = _fmt_date(rx.get("created_at"))
    follow_up = rx.get("follow_up_date")
    rx_id = rx.get("id", "")

    # ── Medicines rows ──
    medicines = rx.get("medicines") or []
    med_rows = ""
    for i, med in enumerate(medicines):
        parts = []
        if med.get("dosage"):
            parts.append(med["dosage"])
        if med.get("frequency"):
            parts.append(med["frequency"])
        if med.get("duration"):
            parts.append(med["duration"])
        detail = " &middot; ".join(parts)
        instr = f'<div style="font-size:12px;color:#64748b;font-style:italic;margin-top:2px;">Sig: {med["instructions"]}</div>' if med.get("instructions") else ""
        med_rows += f"""
        <tr>
          <td style="padding:10px 12px;border-bottom:1px dashed #e2e8f0;vertical-align:top;width:24px;font-weight:700;color:#0d9488;font-size:13px;">{i + 1}.</td>
          <td style="padding:10px 12px;border-bottom:1px dashed #e2e8f0;vertical-align:top;">
            <div style="font-weight:700;font-size:14px;color:#0f172a;font-style:italic;">{med.get("name", "")}</div>
            <div style="font-size:12px;color:#475569;margin-top:2px;">{detail}</div>
            {instr}
          </td>
        </tr>"""

    if not med_rows:
        med_rows = '<tr><td colspan="2" style="padding:12px;color:#94a3b8;font-style:italic;">No medicines prescribed</td></tr>'

    # ── Lab tests ──
    lab_tests = rx.get("lab_tests") or []
    lab_html = ""
    if lab_tests:
        lab_items = ""
        for lab in lab_tests:
            inst = f' — <span style="font-style:italic;color:#6b7280;">{lab["instructions"]}</span>' if lab.get("instructions") else ""
            lab_items += f'<div style="padding:4px 0;font-size:13px;color:#1e3a5f;">▸ <strong>{lab.get("name", "")}</strong>{inst}</div>'
        lab_html = f"""
        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:14px 16px;margin:16px 0;">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#1e40af;margin-bottom:8px;">🔬 Investigations / Lab Tests</div>
          {lab_items}
        </div>"""

    # ── Notes ──
    notes_html = ""
    if rx.get("notes"):
        notes_html = f"""
        <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:12px 16px;margin:12px 0;">
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#64748b;margin-bottom:4px;">Advice / Notes</div>
          <div style="font-size:13px;color:#78350f;line-height:1.5;">{rx["notes"]}</div>
        </div>"""

    # ── Follow-up ──
    followup_html = ""
    if follow_up:
        followup_html = f"""
        <div style="background:#f8fafc;border:1px dashed #cbd5e1;border-radius:8px;padding:10px 14px;margin:12px 0;font-size:13px;color:#374151;">
          📅 Follow-up: <strong>{_fmt_date(follow_up)}</strong>
        </div>"""

    # ── Full email template ──
    html = f"""
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">

<!-- Outer wrapper -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 0;">
<tr><td align="center">

<!-- Card -->
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

  <!-- Teal accent bar -->
  <tr><td style="background:linear-gradient(90deg,#0d9488,#14b8a6,#5eead4,#0d9488);height:6px;line-height:6px;font-size:0;">&nbsp;</td></tr>

  <!-- Letterhead -->
  <tr><td style="padding:24px 32px 16px;border-bottom:2px solid #0d9488;">
    <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td style="vertical-align:top;">
        <div style="font-size:20px;font-weight:900;color:#0d9488;letter-spacing:0.02em;">MedNexus Healthcare</div>
        <div style="font-size:11px;color:#94a3b8;margin-top:3px;letter-spacing:0.04em;">Connected Care &middot; Anytime &middot; Anywhere</div>
      </td>
      <td style="vertical-align:top;text-align:right;">
        <div style="font-size:15px;font-weight:800;color:#0f172a;">Dr. {doctor_name}</div>
        <div style="font-size:11px;color:#0d9488;font-weight:600;margin-top:3px;">{doctor_spec}</div>
      </td>
    </tr>
    </table>
  </td></tr>

  <!-- Greeting -->
  <tr><td style="padding:24px 32px 12px;">
    <div style="font-size:16px;color:#0f172a;">Dear <strong>{patient_name}</strong>,</div>
    <div style="font-size:14px;color:#475569;margin-top:8px;line-height:1.6;">
      Your prescription from <strong>Dr. {doctor_name}</strong> ({doctor_spec}) has been issued on <strong>{created}</strong>.
      Please find the details below and the full prescription attached as a PDF.
    </div>
  </td></tr>

  <!-- Diagnosis -->
  {"" if not diagnosis else f'''
  <tr><td style="padding:0 32px;">
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:12px 16px;margin:8px 0;">
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#64748b;margin-bottom:4px;">Diagnosis / Chief Complaint</div>
      <div style="font-size:13px;color:#0f172a;line-height:1.5;">{diagnosis}</div>
    </div>
  </td></tr>
  '''}

  <!-- Rx Symbol -->
  <tr><td style="padding:12px 32px 4px;">
    <div style="font-size:32px;font-weight:900;color:#0d9488;font-family:'Times New Roman',serif;">℞</div>
  </td></tr>

  <!-- Medicines -->
  <tr><td style="padding:0 32px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      {med_rows}
    </table>
  </td></tr>

  <!-- Lab tests -->
  <tr><td style="padding:0 32px;">{lab_html}</td></tr>

  <!-- Notes -->
  <tr><td style="padding:0 32px;">{notes_html}</td></tr>

  <!-- Follow-up -->
  <tr><td style="padding:0 32px;">{followup_html}</td></tr>

  <!-- Signature / stamp -->
  <tr><td style="padding:20px 32px 8px;border-top:1px solid #f1f5f9;">
    <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td style="vertical-align:bottom;">
        <div style="width:120px;height:1px;background:#0d9488;margin-bottom:6px;"></div>
        <div style="font-size:12px;font-weight:700;color:#0f172a;">Dr. {doctor_name}</div>
        <div style="font-size:10px;color:#64748b;">{doctor_spec}</div>
      </td>
      <td style="vertical-align:bottom;text-align:right;">
        <div style="display:inline-block;padding:5px 14px;border:2px solid #059669;border-radius:8px;font-size:11px;font-weight:800;color:#059669;letter-spacing:0.08em;">✓ ISSUED</div>
        <div style="font-size:10px;color:#94a3b8;margin-top:4px;">Rx #{rx_id}</div>
      </td>
    </tr>
    </table>
  </td></tr>

  <!-- PDF notice -->
  <tr><td style="padding:16px 32px 12px;">
    <div style="background:#f0fdfa;border-radius:8px;padding:12px 16px;text-align:center;">
      <div style="font-size:13px;color:#0d9488;font-weight:600;">📎 Full prescription PDF is attached to this email</div>
      <div style="font-size:11px;color:#64748b;margin-top:4px;">You can also view your prescriptions anytime from <strong>My Activities → Prescriptions</strong> in MedNexus.</div>
    </div>
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:16px 32px 24px;text-align:center;border-top:1px solid #f1f5f9;">
    <div style="font-size:11px;color:#94a3b8;line-height:1.6;">
      This is an automated email from MedNexus Healthcare. Please do not reply to this email.<br>
      &copy; {datetime.now().year} MedNexus Healthcare. All rights reserved.
    </div>
  </td></tr>

</table>
<!-- /Card -->

</td></tr>
</table>
<!-- /Outer wrapper -->

</body>
</html>
"""
    return html


async def send_prescription_email(
    patient_email: str,
    rx_data: dict,
) -> bool:
    """
    Send a professional prescription email with PDF attachment.
    Returns True on success, False if sending failed (non-blocking).
    """
    # Guard: skip if SMTP is not configured
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        logger.warning("SMTP credentials are not configured — skipping prescription email.")
        return False

    from_email = settings.SMTP_FROM_EMAIL or settings.SMTP_USER
    from_name = settings.SMTP_FROM_NAME
    to_email = patient_email
    doctor_name = rx_data.get("doctor_name", "Your Doctor")
    rx_id = rx_data.get("id", "")

    # ── Build MIME message ──
    msg = MIMEMultipart("mixed")
    msg["From"] = f"{from_name} <{from_email}>"
    msg["To"] = to_email
    msg["Subject"] = f"Your Prescription from Dr. {doctor_name} — MedNexus (Rx #{rx_id})"

    # HTML body
    html_body = _build_prescription_html(rx_data)
    msg.attach(MIMEText(html_body, "html", "utf-8"))

    # PDF attachment
    try:
        pdf_bytes = generate_prescription_pdf(rx_data)
        pdf_part = MIMEApplication(pdf_bytes, _subtype="pdf")
        filename = f"Prescription_Rx{rx_id}_{doctor_name.replace(' ', '_')}.pdf"
        pdf_part.add_header("Content-Disposition", "attachment", filename=filename)
        msg.attach(pdf_part)
    except Exception as e:
        logger.error(f"Failed to generate prescription PDF: {e}", exc_info=True)
        # Still send the email even without the PDF
        pass

    # ── Send via SMTP ──
    try:
        await aiosmtplib.send(
            msg,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            start_tls=settings.SMTP_USE_TLS,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASSWORD,
        )
        logger.info(f"Prescription email sent to {to_email} (Rx #{rx_id})")
        return True
    except Exception as e:
        logger.error(f"Failed to send prescription email to {to_email}: {e}", exc_info=True)
        return False


def _build_quotation_html(data: dict) -> str:
    """Build a professional HTML email for quotation notification."""

    patient_name = data.get("patient_name", "Patient")
    pharmacy_name = data.get("pharmacy_name", "Pharmacy")
    pharmacy_phone = data.get("pharmacy_phone", "")
    pharmacy_address = data.get("pharmacy_address", "")
    diagnosis = data.get("diagnosis", "")
    doctor_name = data.get("doctor_name", "")
    total_amount = data.get("total_amount", 0)
    delivery_available = data.get("delivery_available", False)
    delivery_fee = data.get("delivery_fee", 0)
    notes = data.get("notes", "")
    items = data.get("items", [])

    # Medicine rows
    med_rows = ""
    for item in items:
        avail = "✓" if item.get("available") else "✗"
        avail_color = "#10b981" if item.get("available") else "#ef4444"
        price = f"৳{item.get('unit_price', 0):.2f}" if item.get("available") else "—"
        qty = item.get("quantity", 1) if item.get("available") else "—"
        sub = f"৳{item.get('subtotal', 0):.2f}" if item.get("available") else "—"
        note_text = f'<div style="font-size:11px;color:#6b7280;margin-top:2px;">{item["note"]}</div>' if item.get("note") else ""
        med_rows += f"""
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #f3f0ff;font-size:13px;color:#1f2937;">{item.get('medicine_name','')}{note_text}</td>
          <td style="padding:10px 8px;border-bottom:1px solid #f3f0ff;text-align:center;font-weight:700;color:{avail_color};">{avail}</td>
          <td style="padding:10px 8px;border-bottom:1px solid #f3f0ff;text-align:right;font-size:13px;color:#374151;">{price}</td>
          <td style="padding:10px 8px;border-bottom:1px solid #f3f0ff;text-align:center;font-size:13px;color:#374151;">{qty}</td>
          <td style="padding:10px 8px;border-bottom:1px solid #f3f0ff;text-align:right;font-size:13px;font-weight:600;color:#1f2937;">{sub}</td>
        </tr>"""

    delivery_html = ""
    if delivery_available:
        delivery_html = f"""
        <tr>
          <td colspan="4" style="padding:8px 12px;text-align:right;font-size:13px;color:#6b7280;">Delivery Fee</td>
          <td style="padding:8px 12px;text-align:right;font-size:13px;color:#374151;">৳{delivery_fee:.2f}</td>
        </tr>"""

    grand_total = total_amount + (delivery_fee if delivery_available else 0)

    diagnosis_html = f'<div style="font-size:13px;color:#475569;margin-bottom:4px;"><strong>Diagnosis:</strong> {diagnosis}</div>' if diagnosis else ""
    doctor_html = f'<div style="font-size:13px;color:#475569;margin-bottom:4px;"><strong>Prescribed by:</strong> Dr. {doctor_name}</div>' if doctor_name else ""
    notes_html = f"""
    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin-top:16px;">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;color:#6b7280;margin-bottom:4px;">Pharmacy Notes</div>
      <div style="font-size:13px;color:#374151;">{notes}</div>
    </div>""" if notes else ""

    address_html = f'<div style="font-size:12px;color:#6b7280;">{pharmacy_address}</div>' if pharmacy_address else ""

    html = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background:#f3f0ff;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f0ff;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(109,40,217,.08);">

  <!-- Header -->
  <tr><td style="background:linear-gradient(135deg,#7c3aed,#6d28d9);padding:28px 32px;">
    <table cellpadding="0" cellspacing="0"><tr>
      <td style="vertical-align:middle;padding-right:12px;">
        <div style="width:40px;height:40px;border-radius:14px;background:linear-gradient(135deg,#10b981,#059669);text-align:center;line-height:42px;">
          <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z'/%3E%3C/svg%3E" width="22" height="22" style="vertical-align:middle;" alt="♥">
        </div>
      </td>
      <td style="vertical-align:middle;">
        <div style="font-size:22px;font-weight:900;color:#ffffff;letter-spacing:0.01em;">Med<span style="color:#a7f3d0;">Nexus</span></div>
      </td>
    </tr></table>
    <div style="font-size:13px;color:#e9d5ff;margin-top:8px;">Pharmacy Quotation Received</div>
  </td></tr>

  <!-- Body -->
  <tr><td style="padding:28px 32px;">

    <div style="font-size:15px;color:#1f2937;margin-bottom:20px;">
      Hi <strong>{patient_name}</strong>,<br><br>
      Great news! <strong>{pharmacy_name}</strong> has sent you a quotation for your prescription medicines.
    </div>

    {diagnosis_html}
    {doctor_html}

    <!-- Pricing table -->
    <div style="margin-top:20px;border:1px solid #e5e1fc;border-radius:12px;overflow:hidden;">
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <thead>
          <tr style="background:#f8f7ff;">
            <th style="padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.04em;color:#7c3aed;font-weight:700;">Medicine</th>
            <th style="padding:10px 8px;text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:0.04em;color:#7c3aed;font-weight:700;">Avail.</th>
            <th style="padding:10px 8px;text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:0.04em;color:#7c3aed;font-weight:700;">Unit ৳</th>
            <th style="padding:10px 8px;text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:0.04em;color:#7c3aed;font-weight:700;">Qty</th>
            <th style="padding:10px 8px;text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:0.04em;color:#7c3aed;font-weight:700;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {med_rows}
          {delivery_html}
          <tr style="background:#f8f7ff;">
            <td colspan="4" style="padding:12px;text-align:right;font-size:15px;font-weight:800;color:#1f2937;">Grand Total</td>
            <td style="padding:12px;text-align:right;font-size:16px;font-weight:800;color:#7c3aed;">৳{grand_total:.2f}</td>
          </tr>
        </tbody>
      </table>
    </div>

    {notes_html}

    <!-- CTA -->
    <div style="text-align:center;margin-top:28px;">
      <a href="http://localhost:5173/view-prescription" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#7c3aed,#6d28d9);color:#ffffff;text-decoration:none;border-radius:10px;font-weight:700;font-size:14px;">
        View &amp; Accept Quotation
      </a>
    </div>

    <!-- Pharmacy info -->
    <div style="margin-top:24px;padding:14px 16px;background:#f9fafb;border-radius:10px;border:1px solid #e5e7eb;">
      <div style="font-size:14px;font-weight:700;color:#1f2937;">{pharmacy_name}</div>
      {address_html}
      {"<div style='font-size:12px;color:#6b7280;'>📞 " + pharmacy_phone + "</div>" if pharmacy_phone else ""}
    </div>

  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:16px 32px 24px;text-align:center;border-top:1px solid #f1f5f9;">
    <div style="font-size:11px;color:#94a3b8;line-height:1.6;">
      This is an automated email from MedNexus Healthcare. Please do not reply.<br>
      &copy; {datetime.now().year} MedNexus Healthcare. All rights reserved.
    </div>
  </td></tr>

</table>
</td></tr>
</table>

</body></html>"""
    return html


async def send_quotation_email(
    patient_email: str,
    data: dict,
) -> bool:
    """
    Send a quotation notification email to the patient.
    `data` should contain: patient_name, pharmacy_name, pharmacy_phone,
    pharmacy_address, diagnosis, doctor_name, total_amount,
    delivery_available, delivery_fee, notes, items.
    """
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        logger.warning("SMTP not configured — skipping quotation email.")
        return False

    from_email = settings.SMTP_FROM_EMAIL or settings.SMTP_USER
    from_name = settings.SMTP_FROM_NAME
    to_email = patient_email
    pharmacy_name = data.get("pharmacy_name", "A pharmacy")

    msg = MIMEMultipart("mixed")
    msg["From"] = f"{from_name} <{from_email}>"
    msg["To"] = to_email
    msg["Subject"] = f"Quotation from {pharmacy_name} — MedNexus"

    html_body = _build_quotation_html(data)
    msg.attach(MIMEText(html_body, "html", "utf-8"))

    try:
        await aiosmtplib.send(
            msg,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            start_tls=settings.SMTP_USE_TLS,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASSWORD,
        )
        logger.info(f"Quotation email sent to {to_email} from {pharmacy_name}")
        return True
    except Exception as e:
        logger.error(f"Failed to send quotation email to {to_email}: {e}", exc_info=True)
        return False
