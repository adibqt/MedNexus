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
