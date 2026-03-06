"""
Lab Quotation routes – patients request lab-test quotations from clinics.
Mirrors the pharmacy quotation system but for lab tests / investigations.
"""

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
import json

from app.db import get_db
from app.models import Patient, Prescription, Doctor
from app.models.clinic import Clinic
from app.models.lab_quotation import LabQuotationRequest as LQReqModel, LabQuotationResponse as LQResModel
from app.schemas.lab_quotation import (
    LabQuotationRequestCreate,
    LabQuotationRequestOut,
    LabQuotationResponseCreate,
    LabQuotationResponseOut,
    LabQuotationFull,
    ClinicListItem,
)
from app.services import get_current_patient
from app.services.auth import get_current_clinic
from app.services.email_service import send_lab_quotation_email

router = APIRouter(prefix="/api/lab-quotations", tags=["lab-quotations"])


# ── Helpers ─────────────────────────────────────────────────────────

def _enrich_request(qr: LQReqModel, db: Session) -> LabQuotationRequestOut:
    patient = db.query(Patient).filter(Patient.id == qr.patient_id).first()
    clinic = db.query(Clinic).filter(Clinic.id == qr.clinic_id).first()
    rx = db.query(Prescription).filter(Prescription.id == qr.prescription_id).first()
    doctor = db.query(Doctor).filter(Doctor.id == rx.doctor_id).first() if rx else None

    return LabQuotationRequestOut(
        id=qr.id,
        prescription_id=qr.prescription_id,
        patient_id=qr.patient_id,
        clinic_id=qr.clinic_id,
        lab_tests_snapshot=qr.lab_tests_snapshot,
        note=qr.note,
        status=qr.status,
        created_at=qr.created_at,
        updated_at=qr.updated_at,
        patient_name=patient.name if patient else None,
        patient_phone=patient.phone if patient else None,
        clinic_name=clinic.clinic_name if clinic else None,
        doctor_name=doctor.name if doctor else None,
        diagnosis=rx.diagnosis if rx else None,
    )


def _enrich_response(qres: LQResModel, db: Session) -> LabQuotationResponseOut:
    clinic = db.query(Clinic).filter(Clinic.id == qres.clinic_id).first()
    return LabQuotationResponseOut(
        id=qres.id,
        request_id=qres.request_id,
        clinic_id=qres.clinic_id,
        items=qres.items,
        total_amount=float(qres.total_amount),
        home_collection_available=qres.home_collection_available,
        home_collection_fee=float(qres.home_collection_fee),
        notes=qres.notes,
        valid_until=qres.valid_until,
        created_at=qres.created_at,
        clinic_name=clinic.clinic_name if clinic else None,
    )


# ═══════════════════════════════════════════════════════════════════
# PATIENT ENDPOINTS
# ═══════════════════════════════════════════════════════════════════

@router.get("/clinics", response_model=List[ClinicListItem])
async def list_approved_clinics(
    current_patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db),
):
    """Return all approved & active clinics a patient can send requests to."""
    clinics = (
        db.query(Clinic)
        .filter(Clinic.is_approved == True, Clinic.is_active == True)
        .order_by(Clinic.clinic_name)
        .all()
    )
    return [ClinicListItem.model_validate(c) for c in clinics]


@router.post("/request", response_model=LabQuotationRequestOut, status_code=status.HTTP_201_CREATED)
async def create_lab_quotation_request(
    payload: LabQuotationRequestCreate,
    current_patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db),
):
    """Patient sends a lab-test quotation request to a clinic for a prescription."""
    # Validate prescription belongs to patient
    rx = db.query(Prescription).filter(
        Prescription.id == payload.prescription_id,
        Prescription.patient_id == current_patient.id,
        Prescription.is_finalized == True,
    ).first()
    if not rx:
        raise HTTPException(status_code=404, detail="Prescription not found or not finalized")

    # Validate clinic exists and is approved
    clinic = db.query(Clinic).filter(
        Clinic.id == payload.clinic_id,
        Clinic.is_approved == True,
        Clinic.is_active == True,
    ).first()
    if not clinic:
        raise HTTPException(status_code=404, detail="Clinic not found or not available")

    # Prevent duplicate active request to same clinic for same prescription
    existing = db.query(LQReqModel).filter(
        LQReqModel.prescription_id == payload.prescription_id,
        LQReqModel.clinic_id == payload.clinic_id,
        LQReqModel.patient_id == current_patient.id,
        LQReqModel.status.in_(["pending", "quoted"]),
    ).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="You already have an active lab quotation request for this clinic",
        )

    qr = LQReqModel(
        prescription_id=payload.prescription_id,
        patient_id=current_patient.id,
        clinic_id=payload.clinic_id,
        lab_tests_snapshot=rx.lab_tests or "[]",
        note=payload.note,
        status="pending",
    )
    db.add(qr)
    db.commit()
    db.refresh(qr)

    return _enrich_request(qr, db)


@router.get("/patient/my-requests", response_model=List[LabQuotationFull])
async def get_my_lab_quotation_requests(
    current_patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db),
):
    """Get all lab quotation requests made by the current patient."""
    requests = (
        db.query(LQReqModel)
        .filter(LQReqModel.patient_id == current_patient.id)
        .order_by(LQReqModel.created_at.desc())
        .all()
    )

    results = []
    for qr in requests:
        enriched_req = _enrich_request(qr, db)
        qres = db.query(LQResModel).filter(LQResModel.request_id == qr.id).first()
        enriched_res = _enrich_response(qres, db) if qres else None
        results.append(LabQuotationFull(request=enriched_req, response=enriched_res))

    return results


@router.get("/patient/prescription/{prescription_id}", response_model=List[LabQuotationFull])
async def get_lab_quotations_for_prescription(
    prescription_id: int,
    current_patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db),
):
    """Get all lab quotation requests + responses for a specific prescription."""
    requests = (
        db.query(LQReqModel)
        .filter(
            LQReqModel.prescription_id == prescription_id,
            LQReqModel.patient_id == current_patient.id,
        )
        .order_by(LQReqModel.created_at.desc())
        .all()
    )

    results = []
    for qr in requests:
        enriched_req = _enrich_request(qr, db)
        qres = db.query(LQResModel).filter(LQResModel.request_id == qr.id).first()
        enriched_res = _enrich_response(qres, db) if qres else None
        results.append(LabQuotationFull(request=enriched_req, response=enriched_res))

    return results


@router.patch("/patient/{request_id}/accept", response_model=LabQuotationRequestOut)
async def accept_lab_quotation(
    request_id: int,
    current_patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db),
):
    """Patient accepts a clinic lab quotation."""
    qr = db.query(LQReqModel).filter(
        LQReqModel.id == request_id,
        LQReqModel.patient_id == current_patient.id,
    ).first()
    if not qr:
        raise HTTPException(status_code=404, detail="Lab quotation request not found")
    if qr.status != "quoted":
        raise HTTPException(status_code=400, detail="Can only accept a quoted request")

    qr.status = "accepted"
    db.commit()
    db.refresh(qr)
    return _enrich_request(qr, db)


@router.patch("/patient/{request_id}/reject", response_model=LabQuotationRequestOut)
async def reject_lab_quotation(
    request_id: int,
    current_patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db),
):
    """Patient rejects a clinic lab quotation."""
    qr = db.query(LQReqModel).filter(
        LQReqModel.id == request_id,
        LQReqModel.patient_id == current_patient.id,
    ).first()
    if not qr:
        raise HTTPException(status_code=404, detail="Lab quotation request not found")
    if qr.status not in ("pending", "quoted"):
        raise HTTPException(status_code=400, detail="Cannot reject this request")

    qr.status = "rejected"
    db.commit()
    db.refresh(qr)
    return _enrich_request(qr, db)


# ═══════════════════════════════════════════════════════════════════
# CLINIC ENDPOINTS
# ═══════════════════════════════════════════════════════════════════

@router.get("/clinic/requests", response_model=List[LabQuotationFull])
async def get_clinic_requests(
    status_filter: str = None,
    current_clinic: Clinic = Depends(get_current_clinic),
    db: Session = Depends(get_db),
):
    """Get all lab quotation requests sent to the current clinic, with responses."""
    q = db.query(LQReqModel).filter(LQReqModel.clinic_id == current_clinic.id)
    if status_filter:
        q = q.filter(LQReqModel.status == status_filter)
    requests = q.order_by(LQReqModel.created_at.desc()).all()

    results = []
    for qr in requests:
        enriched_req = _enrich_request(qr, db)
        qres = db.query(LQResModel).filter(LQResModel.request_id == qr.id).first()
        enriched_res = _enrich_response(qres, db) if qres else None
        results.append(LabQuotationFull(request=enriched_req, response=enriched_res))
    return results


@router.get("/clinic/request/{request_id}", response_model=LabQuotationFull)
async def get_clinic_request_detail(
    request_id: int,
    current_clinic: Clinic = Depends(get_current_clinic),
    db: Session = Depends(get_db),
):
    """Get a single lab quotation request detail."""
    qr = db.query(LQReqModel).filter(
        LQReqModel.id == request_id,
        LQReqModel.clinic_id == current_clinic.id,
    ).first()
    if not qr:
        raise HTTPException(status_code=404, detail="Request not found")

    enriched_req = _enrich_request(qr, db)
    qres = db.query(LQResModel).filter(LQResModel.request_id == qr.id).first()
    enriched_res = _enrich_response(qres, db) if qres else None
    return LabQuotationFull(request=enriched_req, response=enriched_res)


@router.post("/clinic/respond", response_model=LabQuotationResponseOut, status_code=status.HTTP_201_CREATED)
async def submit_lab_quotation_response(
    payload: LabQuotationResponseCreate,
    background_tasks: BackgroundTasks,
    current_clinic: Clinic = Depends(get_current_clinic),
    db: Session = Depends(get_db),
):
    """Clinic submits a quotation (pricing) for a lab test request."""
    qr = db.query(LQReqModel).filter(
        LQReqModel.id == payload.request_id,
        LQReqModel.clinic_id == current_clinic.id,
    ).first()
    if not qr:
        raise HTTPException(status_code=404, detail="Request not found or not assigned to your clinic")
    if qr.status != "pending":
        raise HTTPException(status_code=400, detail=f"Cannot quote a request with status '{qr.status}'")

    # Check not already responded
    existing = db.query(LQResModel).filter(LQResModel.request_id == payload.request_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already responded to this request")

    qres = LQResModel(
        request_id=payload.request_id,
        clinic_id=current_clinic.id,
        items=json.dumps([item.model_dump() for item in payload.items]),
        total_amount=payload.total_amount,
        home_collection_available=payload.home_collection_available,
        home_collection_fee=payload.home_collection_fee,
        notes=payload.notes,
        valid_until=payload.valid_until,
    )
    db.add(qres)

    # Update request status
    qr.status = "quoted"
    db.commit()
    db.refresh(qres)

    # Send email notification to patient
    patient = db.query(Patient).filter(Patient.id == qr.patient_id).first()
    rx = db.query(Prescription).filter(Prescription.id == qr.prescription_id).first()
    doctor = db.query(Doctor).filter(Doctor.id == rx.doctor_id).first() if rx else None
    if patient and patient.email:
        address_parts = [current_clinic.street_address, current_clinic.city, current_clinic.state, current_clinic.postal_code]
        email_data = {
            "patient_name": patient.name,
            "clinic_name": current_clinic.clinic_name,
            "clinic_phone": current_clinic.phone,
            "clinic_address": ", ".join([p for p in address_parts if p]),
            "diagnosis": rx.diagnosis if rx else "",
            "doctor_name": doctor.name if doctor else "",
            "total_amount": float(payload.total_amount),
            "home_collection_available": payload.home_collection_available,
            "home_collection_fee": float(payload.home_collection_fee),
            "notes": payload.notes or "",
            "items": [item.model_dump() for item in payload.items],
        }
        background_tasks.add_task(send_lab_quotation_email, patient.email, email_data)

    return _enrich_response(qres, db)


@router.get("/clinic/stats")
async def get_clinic_stats(
    current_clinic: Clinic = Depends(get_current_clinic),
    db: Session = Depends(get_db),
):
    """Dashboard stats for the clinic."""
    total = db.query(LQReqModel).filter(LQReqModel.clinic_id == current_clinic.id).count()
    pending = db.query(LQReqModel).filter(
        LQReqModel.clinic_id == current_clinic.id, LQReqModel.status == "pending"
    ).count()
    quoted = db.query(LQReqModel).filter(
        LQReqModel.clinic_id == current_clinic.id, LQReqModel.status == "quoted"
    ).count()
    accepted = db.query(LQReqModel).filter(
        LQReqModel.clinic_id == current_clinic.id, LQReqModel.status == "accepted"
    ).count()
    completed = db.query(LQReqModel).filter(
        LQReqModel.clinic_id == current_clinic.id, LQReqModel.status == "completed"
    ).count()

    return {
        "total_requests": total,
        "pending_requests": pending,
        "quoted_requests": quoted,
        "accepted_requests": accepted,
        "completed_requests": completed,
    }
