from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
import json

from app.db import get_db
from app.models import Appointment, Doctor, Patient, Prescription
from app.schemas.prescription import PrescriptionCreate, PrescriptionUpdate, PrescriptionOut, MedicineItem, LabTestItem
from app.services import get_current_doctor, get_current_patient
from app.services.email_service import send_prescription_email

router = APIRouter(prefix="/api/prescriptions", tags=["prescriptions"])


def _parse_medicines(raw: str | None) -> List[MedicineItem]:
    if not raw:
        return []
    try:
        return [MedicineItem(**m) for m in json.loads(raw)]
    except Exception:
        return []


def _parse_lab_tests(raw: str | None) -> List[LabTestItem]:
    if not raw:
        return []
    try:
        return [LabTestItem(**t) for t in json.loads(raw)]
    except Exception:
        return []


def _build_out(prescription: Prescription, doctor: Doctor, patient: Patient, appointment: Appointment) -> PrescriptionOut:
    return PrescriptionOut(
        id=prescription.id,
        appointment_id=prescription.appointment_id,
        doctor_id=prescription.doctor_id,
        patient_id=prescription.patient_id,
        diagnosis=prescription.diagnosis,
        notes=prescription.notes,
        medicines=_parse_medicines(prescription.medicines),
        lab_tests=_parse_lab_tests(prescription.lab_tests),
        follow_up_date=prescription.follow_up_date,
        is_finalized=prescription.is_finalized,
        created_at=prescription.created_at,
        updated_at=prescription.updated_at,
        doctor_name=doctor.name if doctor else None,
        doctor_specialization=doctor.specialization if doctor else None,
        doctor_bmdc=doctor.bmdc_number if doctor else None,
        patient_name=patient.name if patient else None,
        patient_age=patient.age if patient else None,
        patient_gender=patient.gender if patient else None,
        patient_phone=patient.phone if patient else None,
        appointment_date=str(appointment.date) if appointment else None,
        appointment_time=str(appointment.time) if appointment else None,
    )


# ──────────────────────────────────────────────
# DOCTOR ENDPOINTS
# ──────────────────────────────────────────────

@router.get("/doctor/completed-appointments", response_model=List[dict])
async def get_completed_appointments(
    current_doctor: Doctor = Depends(get_current_doctor),
    db: Session = Depends(get_db),
):
    """Return all completed appointments for the current doctor, with prescription status."""
    appointments = db.query(Appointment).filter(
        Appointment.doctor_id == current_doctor.id,
        Appointment.status == "Completed",
    ).order_by(Appointment.date.desc(), Appointment.time.desc()).all()

    results = []
    for apt in appointments:
        patient = db.query(Patient).filter(Patient.id == apt.patient_id).first()
        existing_rx = db.query(Prescription).filter(
            Prescription.appointment_id == apt.id
        ).first()
        results.append({
            "id": apt.id,
            "appointment_date": str(apt.date),
            "appointment_time": str(apt.time),
            "patient_name": patient.name if patient else "Unknown",
            "patient_id": apt.patient_id,
            "reason": apt.reason,
            "symptoms": apt.symptoms,
            "has_prescription": existing_rx is not None,
            "prescription_id": existing_rx.id if existing_rx else None,
            "prescription_finalized": existing_rx.is_finalized if existing_rx else False,
        })
    return results


@router.post("", response_model=PrescriptionOut, status_code=status.HTTP_201_CREATED)
async def create_prescription(
    payload: PrescriptionCreate,
    background_tasks: BackgroundTasks,
    current_doctor: Doctor = Depends(get_current_doctor),
    db: Session = Depends(get_db),
):
    """Create a new prescription for a completed appointment."""
    appointment = db.query(Appointment).filter(
        Appointment.id == payload.appointment_id,
        Appointment.doctor_id == current_doctor.id,
    ).first()
    if not appointment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    if appointment.status != "Completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Prescriptions can only be written for completed appointments",
        )

    existing = db.query(Prescription).filter(Prescription.appointment_id == payload.appointment_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A prescription already exists for this appointment. Use PATCH to update it.",
        )

    patient = db.query(Patient).filter(Patient.id == appointment.patient_id).first()

    rx = Prescription(
        appointment_id=payload.appointment_id,
        doctor_id=current_doctor.id,
        patient_id=appointment.patient_id,
        diagnosis=payload.diagnosis,
        notes=payload.notes,
        medicines=json.dumps([m.model_dump() for m in payload.medicines]),
        lab_tests=json.dumps([t.model_dump() for t in payload.lab_tests]),
        follow_up_date=payload.follow_up_date,
        is_finalized=payload.is_finalized,
    )
    db.add(rx)
    db.commit()
    db.refresh(rx)

    result = _build_out(rx, current_doctor, patient, appointment)

    # Send email with PDF when finalized
    if rx.is_finalized and patient and patient.email:
        background_tasks.add_task(
            send_prescription_email,
            patient.email,
            result.model_dump(),
        )

    return result


@router.get("/{prescription_id}", response_model=PrescriptionOut)
async def get_prescription(
    prescription_id: int,
    current_doctor: Doctor = Depends(get_current_doctor),
    db: Session = Depends(get_db),
):
    rx = db.query(Prescription).filter(
        Prescription.id == prescription_id,
        Prescription.doctor_id == current_doctor.id,
    ).first()
    if not rx:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prescription not found")

    appointment = db.query(Appointment).filter(Appointment.id == rx.appointment_id).first()
    patient = db.query(Patient).filter(Patient.id == rx.patient_id).first()
    return _build_out(rx, current_doctor, patient, appointment)


@router.get("/by-appointment/{appointment_id}", response_model=PrescriptionOut)
async def get_prescription_by_appointment(
    appointment_id: int,
    current_doctor: Doctor = Depends(get_current_doctor),
    db: Session = Depends(get_db),
):
    rx = db.query(Prescription).filter(
        Prescription.appointment_id == appointment_id,
        Prescription.doctor_id == current_doctor.id,
    ).first()
    if not rx:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prescription not found")

    appointment = db.query(Appointment).filter(Appointment.id == rx.appointment_id).first()
    patient = db.query(Patient).filter(Patient.id == rx.patient_id).first()
    return _build_out(rx, current_doctor, patient, appointment)


@router.patch("/{prescription_id}", response_model=PrescriptionOut)
async def update_prescription(
    prescription_id: int,
    payload: PrescriptionUpdate,
    background_tasks: BackgroundTasks,
    current_doctor: Doctor = Depends(get_current_doctor),
    db: Session = Depends(get_db),
):
    rx = db.query(Prescription).filter(
        Prescription.id == prescription_id,
        Prescription.doctor_id == current_doctor.id,
    ).first()
    if not rx:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prescription not found")
    if rx.is_finalized:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Finalized prescriptions cannot be edited")

    was_finalized_before = rx.is_finalized

    if payload.diagnosis is not None:
        rx.diagnosis = payload.diagnosis
    if payload.notes is not None:
        rx.notes = payload.notes
    if payload.medicines is not None:
        rx.medicines = json.dumps([m.model_dump() for m in payload.medicines])
    if payload.lab_tests is not None:
        rx.lab_tests = json.dumps([t.model_dump() for t in payload.lab_tests])
    if payload.follow_up_date is not None:
        rx.follow_up_date = payload.follow_up_date
    if payload.is_finalized is not None:
        rx.is_finalized = payload.is_finalized

    db.commit()
    db.refresh(rx)

    appointment = db.query(Appointment).filter(Appointment.id == rx.appointment_id).first()
    patient = db.query(Patient).filter(Patient.id == rx.patient_id).first()
    result = _build_out(rx, current_doctor, patient, appointment)

    # Send email when prescription is newly finalized
    if rx.is_finalized and not was_finalized_before and patient and patient.email:
        background_tasks.add_task(
            send_prescription_email,
            patient.email,
            result.model_dump(),
        )

    return result


# ──────────────────────────────────────────────
# PATIENT ENDPOINT (view own prescriptions)
# ──────────────────────────────────────────────

@router.get("/patient/my-prescriptions", response_model=List[PrescriptionOut])
async def get_patient_prescriptions(
    current_patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db),
):
    prescriptions = db.query(Prescription).filter(
        Prescription.patient_id == current_patient.id,
        Prescription.is_finalized == True,
    ).order_by(Prescription.created_at.desc()).all()

    results = []
    for rx in prescriptions:
        doctor = db.query(Doctor).filter(Doctor.id == rx.doctor_id).first()
        appointment = db.query(Appointment).filter(Appointment.id == rx.appointment_id).first()
        results.append(_build_out(rx, doctor, current_patient, appointment))
    return results


@router.get("/patient/prescription/{prescription_id}", response_model=PrescriptionOut)
async def get_patient_prescription_detail(
    prescription_id: int,
    current_patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db),
):
    rx = db.query(Prescription).filter(
        Prescription.id == prescription_id,
        Prescription.patient_id == current_patient.id,
    ).first()
    if not rx:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prescription not found")

    doctor = db.query(Doctor).filter(Doctor.id == rx.doctor_id).first()
    appointment = db.query(Appointment).filter(Appointment.id == rx.appointment_id).first()
    return _build_out(rx, doctor, current_patient, appointment)
