"""
Lab Report routes – clinics submit lab test reports for accepted quotation requests.
Reports are emailed to patients with a PDF attachment.
"""

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
from io import BytesIO
import json

from app.db import get_db
from app.models import Patient, Prescription, Doctor
from app.models.clinic import Clinic
from app.models.lab_quotation import LabQuotationRequest as LQReqModel
from app.models.lab_report import LabReport
from app.schemas.lab_report import LabReportCreate, LabReportOut
from app.services import get_current_patient
from app.services.auth import get_current_clinic
from app.services.lab_report_pdf import generate_lab_report_pdf
from app.services.email_service import send_lab_report_email

router = APIRouter(prefix="/api/lab-reports", tags=["lab-reports"])


# ── Helpers ─────────────────────────────────────────────────

def _enrich_report(report: LabReport, db: Session) -> LabReportOut:
    clinic = db.query(Clinic).filter(Clinic.id == report.clinic_id).first()
    patient = db.query(Patient).filter(Patient.id == report.patient_id).first()
    rx = db.query(Prescription).filter(Prescription.id == report.prescription_id).first()
    doctor = db.query(Doctor).filter(Doctor.id == rx.doctor_id).first() if rx else None

    return LabReportOut(
        id=report.id,
        request_id=report.request_id,
        clinic_id=report.clinic_id,
        patient_id=report.patient_id,
        prescription_id=report.prescription_id,
        results=report.results,
        summary=report.summary,
        notes=report.notes,
        created_at=report.created_at,
        clinic_name=clinic.clinic_name if clinic else None,
        patient_name=patient.name if patient else None,
        doctor_name=doctor.name if doctor else None,
        diagnosis=rx.diagnosis if rx else None,
    )


def _build_pdf_data(report: LabReport, db: Session) -> dict:
    """Build the dict expected by generate_lab_report_pdf."""
    clinic = db.query(Clinic).filter(Clinic.id == report.clinic_id).first()
    patient = db.query(Patient).filter(Patient.id == report.patient_id).first()
    rx = db.query(Prescription).filter(Prescription.id == report.prescription_id).first()
    doctor = db.query(Doctor).filter(Doctor.id == rx.doctor_id).first() if rx else None

    address_parts = [clinic.street_address, clinic.city, clinic.state, clinic.postal_code] if clinic else []
    clinic_address = ", ".join([p for p in address_parts if p])

    results = []
    try:
        results = json.loads(report.results or "[]")
    except Exception:
        pass

    return {
        "report_id": report.id,
        "clinic_name": clinic.clinic_name if clinic else "",
        "clinic_address": clinic_address,
        "clinic_phone": clinic.phone if clinic else "",
        "patient_name": patient.name if patient else "",
        "patient_age": getattr(patient, "age", None),
        "patient_gender": getattr(patient, "gender", None),
        "patient_phone": patient.phone if patient else "",
        "doctor_name": doctor.name if doctor else "",
        "doctor_specialization": getattr(doctor, "specialization", "") if doctor else "",
        "diagnosis": rx.diagnosis if rx else "",
        "results": results,
        "summary": report.summary or "",
        "notes": report.notes or "",
        "created_at": report.created_at,
    }


# ═══════════════════════════════════════════════════════════
# CLINIC ENDPOINTS
# ═══════════════════════════════════════════════════════════

@router.post("/clinic/submit", response_model=LabReportOut, status_code=status.HTTP_201_CREATED)
async def submit_lab_report(
    payload: LabReportCreate,
    background_tasks: BackgroundTasks,
    current_clinic: Clinic = Depends(get_current_clinic),
    db: Session = Depends(get_db),
):
    """Clinic submits a lab report for an accepted quotation request. Emails patient with PDF."""
    # Validate request
    qr = db.query(LQReqModel).filter(
        LQReqModel.id == payload.request_id,
        LQReqModel.clinic_id == current_clinic.id,
    ).first()
    if not qr:
        raise HTTPException(status_code=404, detail="Quotation request not found or not assigned to your clinic")
    if qr.status != "accepted":
        raise HTTPException(status_code=400, detail=f"Can only submit a report for an accepted request (current: '{qr.status}')")

    # Prevent duplicate
    existing = db.query(LabReport).filter(LabReport.request_id == payload.request_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="A report has already been submitted for this request")

    report = LabReport(
        request_id=payload.request_id,
        clinic_id=current_clinic.id,
        patient_id=qr.patient_id,
        prescription_id=qr.prescription_id,
        results=json.dumps([r.model_dump() for r in payload.results]),
        summary=payload.summary,
        notes=payload.notes,
    )
    db.add(report)

    # Update request status to "completed"
    qr.status = "completed"
    db.commit()
    db.refresh(report)

    # Build email data and send
    patient = db.query(Patient).filter(Patient.id == qr.patient_id).first()
    if patient and patient.email:
        pdf_data = _build_pdf_data(report, db)
        background_tasks.add_task(send_lab_report_email, patient.email, pdf_data)

    return _enrich_report(report, db)


@router.get("/clinic/request/{request_id}", response_model=LabReportOut)
async def get_clinic_report_for_request(
    request_id: int,
    current_clinic: Clinic = Depends(get_current_clinic),
    db: Session = Depends(get_db),
):
    """Get the lab report submitted by this clinic for a given request."""
    report = db.query(LabReport).filter(
        LabReport.request_id == request_id,
        LabReport.clinic_id == current_clinic.id,
    ).first()
    if not report:
        raise HTTPException(status_code=404, detail="No report found for this request")
    return _enrich_report(report, db)


# ═══════════════════════════════════════════════════════════
# PATIENT ENDPOINTS
# ═══════════════════════════════════════════════════════════

@router.get("/patient/prescription/{prescription_id}", response_model=List[LabReportOut])
async def get_patient_reports_for_prescription(
    prescription_id: int,
    current_patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db),
):
    """Get all lab reports for a prescription belonging to the current patient."""
    reports = (
        db.query(LabReport)
        .filter(
            LabReport.prescription_id == prescription_id,
            LabReport.patient_id == current_patient.id,
        )
        .order_by(LabReport.created_at.desc())
        .all()
    )
    return [_enrich_report(r, db) for r in reports]


@router.get("/patient/request/{request_id}", response_model=LabReportOut)
async def get_patient_report_for_request(
    request_id: int,
    current_patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db),
):
    """Get the lab report for a specific quotation request."""
    report = db.query(LabReport).filter(
        LabReport.request_id == request_id,
        LabReport.patient_id == current_patient.id,
    ).first()
    if not report:
        raise HTTPException(status_code=404, detail="No report found for this request")
    return _enrich_report(report, db)


@router.get("/patient/request/{request_id}/pdf")
async def download_lab_report_pdf(
    request_id: int,
    current_patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db),
):
    """Download the lab report as a PDF for a given request."""
    report = db.query(LabReport).filter(
        LabReport.request_id == request_id,
        LabReport.patient_id == current_patient.id,
    ).first()
    if not report:
        raise HTTPException(status_code=404, detail="No report found for this request")

    pdf_data = _build_pdf_data(report, db)
    pdf_bytes = generate_lab_report_pdf(pdf_data)

    return StreamingResponse(
        BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="LabReport_{report.id}.pdf"',
        },
    )


@router.get("/clinic/request/{request_id}/pdf")
async def clinic_download_lab_report_pdf(
    request_id: int,
    current_clinic: Clinic = Depends(get_current_clinic),
    db: Session = Depends(get_db),
):
    """Clinic downloads the lab report PDF for a given request."""
    report = db.query(LabReport).filter(
        LabReport.request_id == request_id,
        LabReport.clinic_id == current_clinic.id,
    ).first()
    if not report:
        raise HTTPException(status_code=404, detail="No report found for this request")

    pdf_data = _build_pdf_data(report, db)
    pdf_bytes = generate_lab_report_pdf(pdf_data)

    return StreamingResponse(
        BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="LabReport_{report.id}.pdf"',
        },
    )
