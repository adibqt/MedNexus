"""
Quotation routes – patients request quotations, pharmacies respond with pricing.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import json

from app.db import get_db
from app.models import Patient, Pharmacy, Prescription, Doctor, Appointment
from app.models.quotation import QuotationRequest as QReqModel, QuotationResponse as QResModel
from app.schemas.quotation import (
    QuotationRequestCreate,
    QuotationRequestOut,
    QuotationResponseCreate,
    QuotationResponseOut,
    QuotationFull,
    PharmacyListItem,
)
from app.services import get_current_patient, get_current_pharmacy

router = APIRouter(prefix="/api/quotations", tags=["quotations"])


# ── Helpers ─────────────────────────────────────────────────────────

def _enrich_request(qr: QReqModel, db: Session) -> QuotationRequestOut:
    patient = db.query(Patient).filter(Patient.id == qr.patient_id).first()
    pharmacy = db.query(Pharmacy).filter(Pharmacy.id == qr.pharmacy_id).first()
    rx = db.query(Prescription).filter(Prescription.id == qr.prescription_id).first()
    doctor = db.query(Doctor).filter(Doctor.id == rx.doctor_id).first() if rx else None

    return QuotationRequestOut(
        id=qr.id,
        prescription_id=qr.prescription_id,
        patient_id=qr.patient_id,
        pharmacy_id=qr.pharmacy_id,
        medicines_snapshot=qr.medicines_snapshot,
        note=qr.note,
        status=qr.status,
        created_at=qr.created_at,
        updated_at=qr.updated_at,
        patient_name=patient.name if patient else None,
        patient_phone=patient.phone if patient else None,
        pharmacy_name=pharmacy.pharmacy_name if pharmacy else None,
        doctor_name=doctor.name if doctor else None,
        diagnosis=rx.diagnosis if rx else None,
    )


def _enrich_response(qres: QResModel, db: Session) -> QuotationResponseOut:
    pharmacy = db.query(Pharmacy).filter(Pharmacy.id == qres.pharmacy_id).first()
    return QuotationResponseOut(
        id=qres.id,
        request_id=qres.request_id,
        pharmacy_id=qres.pharmacy_id,
        items=qres.items,
        total_amount=float(qres.total_amount),
        delivery_available=qres.delivery_available,
        delivery_fee=float(qres.delivery_fee),
        notes=qres.notes,
        valid_until=qres.valid_until,
        created_at=qres.created_at,
        pharmacy_name=pharmacy.pharmacy_name if pharmacy else None,
    )


# ═══════════════════════════════════════════════════════════════════
# PATIENT ENDPOINTS
# ═══════════════════════════════════════════════════════════════════

@router.get("/pharmacies", response_model=List[PharmacyListItem])
async def list_approved_pharmacies(
    current_patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db),
):
    """Return all approved & active pharmacies a patient can send requests to."""
    pharmacies = (
        db.query(Pharmacy)
        .filter(Pharmacy.is_approved == True, Pharmacy.is_active == True)
        .order_by(Pharmacy.pharmacy_name)
        .all()
    )
    return [PharmacyListItem.model_validate(p) for p in pharmacies]


@router.post("/request", response_model=QuotationRequestOut, status_code=status.HTTP_201_CREATED)
async def create_quotation_request(
    payload: QuotationRequestCreate,
    current_patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db),
):
    """Patient sends a quotation request to a pharmacy for a prescription."""
    # Validate prescription belongs to patient
    rx = db.query(Prescription).filter(
        Prescription.id == payload.prescription_id,
        Prescription.patient_id == current_patient.id,
        Prescription.is_finalized == True,
    ).first()
    if not rx:
        raise HTTPException(status_code=404, detail="Prescription not found or not finalized")

    # Validate pharmacy exists and is approved
    pharmacy = db.query(Pharmacy).filter(
        Pharmacy.id == payload.pharmacy_id,
        Pharmacy.is_approved == True,
        Pharmacy.is_active == True,
    ).first()
    if not pharmacy:
        raise HTTPException(status_code=404, detail="Pharmacy not found or not available")

    # Prevent duplicate request to same pharmacy for same prescription
    existing = db.query(QReqModel).filter(
        QReqModel.prescription_id == payload.prescription_id,
        QReqModel.pharmacy_id == payload.pharmacy_id,
        QReqModel.patient_id == current_patient.id,
        QReqModel.status.in_(["pending", "quoted"]),
    ).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="You already have an active quotation request for this pharmacy",
        )

    qr = QReqModel(
        prescription_id=payload.prescription_id,
        patient_id=current_patient.id,
        pharmacy_id=payload.pharmacy_id,
        medicines_snapshot=rx.medicines or "[]",
        note=payload.note,
        status="pending",
    )
    db.add(qr)
    db.commit()
    db.refresh(qr)

    return _enrich_request(qr, db)


@router.get("/patient/my-requests", response_model=List[QuotationFull])
async def get_my_quotation_requests(
    current_patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db),
):
    """Get all quotation requests made by the current patient."""
    requests = (
        db.query(QReqModel)
        .filter(QReqModel.patient_id == current_patient.id)
        .order_by(QReqModel.created_at.desc())
        .all()
    )

    results = []
    for qr in requests:
        enriched_req = _enrich_request(qr, db)
        # Check for response
        qres = db.query(QResModel).filter(QResModel.request_id == qr.id).first()
        enriched_res = _enrich_response(qres, db) if qres else None
        results.append(QuotationFull(request=enriched_req, response=enriched_res))

    return results


@router.get("/patient/prescription/{prescription_id}", response_model=List[QuotationFull])
async def get_quotations_for_prescription(
    prescription_id: int,
    current_patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db),
):
    """Get all quotation requests + responses for a specific prescription."""
    requests = (
        db.query(QReqModel)
        .filter(
            QReqModel.prescription_id == prescription_id,
            QReqModel.patient_id == current_patient.id,
        )
        .order_by(QReqModel.created_at.desc())
        .all()
    )

    results = []
    for qr in requests:
        enriched_req = _enrich_request(qr, db)
        qres = db.query(QResModel).filter(QResModel.request_id == qr.id).first()
        enriched_res = _enrich_response(qres, db) if qres else None
        results.append(QuotationFull(request=enriched_req, response=enriched_res))

    return results


@router.patch("/patient/{request_id}/accept", response_model=QuotationRequestOut)
async def accept_quotation(
    request_id: int,
    current_patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db),
):
    """Patient accepts a pharmacy quotation."""
    qr = db.query(QReqModel).filter(
        QReqModel.id == request_id,
        QReqModel.patient_id == current_patient.id,
    ).first()
    if not qr:
        raise HTTPException(status_code=404, detail="Quotation request not found")
    if qr.status != "quoted":
        raise HTTPException(status_code=400, detail="Can only accept a quoted request")

    qr.status = "accepted"
    db.commit()
    db.refresh(qr)
    return _enrich_request(qr, db)


@router.patch("/patient/{request_id}/reject", response_model=QuotationRequestOut)
async def reject_quotation(
    request_id: int,
    current_patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db),
):
    """Patient rejects a pharmacy quotation."""
    qr = db.query(QReqModel).filter(
        QReqModel.id == request_id,
        QReqModel.patient_id == current_patient.id,
    ).first()
    if not qr:
        raise HTTPException(status_code=404, detail="Quotation request not found")
    if qr.status not in ("pending", "quoted"):
        raise HTTPException(status_code=400, detail="Cannot reject this request")

    qr.status = "rejected"
    db.commit()
    db.refresh(qr)
    return _enrich_request(qr, db)


# ═══════════════════════════════════════════════════════════════════
# PHARMACY ENDPOINTS
# ═══════════════════════════════════════════════════════════════════

@router.get("/pharmacy/requests", response_model=List[QuotationRequestOut])
async def get_pharmacy_requests(
    status_filter: str = None,
    current_pharmacy: Pharmacy = Depends(get_current_pharmacy),
    db: Session = Depends(get_db),
):
    """Get all quotation requests sent to the current pharmacy."""
    q = db.query(QReqModel).filter(QReqModel.pharmacy_id == current_pharmacy.id)
    if status_filter:
        q = q.filter(QReqModel.status == status_filter)
    requests = q.order_by(QReqModel.created_at.desc()).all()
    return [_enrich_request(qr, db) for qr in requests]


@router.get("/pharmacy/request/{request_id}", response_model=QuotationFull)
async def get_pharmacy_request_detail(
    request_id: int,
    current_pharmacy: Pharmacy = Depends(get_current_pharmacy),
    db: Session = Depends(get_db),
):
    """Get a single quotation request detail (for the pharmacy to view/respond)."""
    qr = db.query(QReqModel).filter(
        QReqModel.id == request_id,
        QReqModel.pharmacy_id == current_pharmacy.id,
    ).first()
    if not qr:
        raise HTTPException(status_code=404, detail="Request not found")

    enriched_req = _enrich_request(qr, db)
    qres = db.query(QResModel).filter(QResModel.request_id == qr.id).first()
    enriched_res = _enrich_response(qres, db) if qres else None
    return QuotationFull(request=enriched_req, response=enriched_res)


@router.post("/pharmacy/respond", response_model=QuotationResponseOut, status_code=status.HTTP_201_CREATED)
async def submit_quotation_response(
    payload: QuotationResponseCreate,
    current_pharmacy: Pharmacy = Depends(get_current_pharmacy),
    db: Session = Depends(get_db),
):
    """Pharmacy submits a quotation (pricing) for a request."""
    qr = db.query(QReqModel).filter(
        QReqModel.id == payload.request_id,
        QReqModel.pharmacy_id == current_pharmacy.id,
    ).first()
    if not qr:
        raise HTTPException(status_code=404, detail="Request not found or not assigned to your pharmacy")
    if qr.status != "pending":
        raise HTTPException(status_code=400, detail=f"Cannot quote a request with status '{qr.status}'")

    # Check not already responded
    existing = db.query(QResModel).filter(QResModel.request_id == payload.request_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already responded to this request")

    qres = QResModel(
        request_id=payload.request_id,
        pharmacy_id=current_pharmacy.id,
        items=json.dumps([item.model_dump() for item in payload.items]),
        total_amount=payload.total_amount,
        delivery_available=payload.delivery_available,
        delivery_fee=payload.delivery_fee,
        notes=payload.notes,
        valid_until=payload.valid_until,
    )
    db.add(qres)

    # Update request status
    qr.status = "quoted"
    db.commit()
    db.refresh(qres)

    return _enrich_response(qres, db)


@router.get("/pharmacy/stats")
async def get_pharmacy_stats(
    current_pharmacy: Pharmacy = Depends(get_current_pharmacy),
    db: Session = Depends(get_db),
):
    """Dashboard stats for the pharmacy."""
    total = db.query(QReqModel).filter(QReqModel.pharmacy_id == current_pharmacy.id).count()
    pending = db.query(QReqModel).filter(
        QReqModel.pharmacy_id == current_pharmacy.id, QReqModel.status == "pending"
    ).count()
    quoted = db.query(QReqModel).filter(
        QReqModel.pharmacy_id == current_pharmacy.id, QReqModel.status == "quoted"
    ).count()
    accepted = db.query(QReqModel).filter(
        QReqModel.pharmacy_id == current_pharmacy.id, QReqModel.status == "accepted"
    ).count()

    return {
        "total_requests": total,
        "pending_requests": pending,
        "quoted_requests": quoted,
        "accepted_requests": accepted,
    }
