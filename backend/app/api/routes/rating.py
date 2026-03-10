from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func as sa_func
from typing import List

from app.db import get_db
from app.models import Appointment, Doctor, Patient
from app.models.rating import DoctorRating
from app.schemas.rating import RatingCreate, RatingOut, DoctorRatingSummary
from app.services import get_current_patient

router = APIRouter(prefix="/api/ratings", tags=["ratings"])


@router.post("", response_model=RatingOut, status_code=status.HTTP_201_CREATED)
async def create_rating(
    payload: RatingCreate,
    current_patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db),
):
    """Submit a rating for a completed appointment."""
    # Verify the appointment exists and belongs to this patient
    appointment = (
        db.query(Appointment)
        .filter(
            Appointment.id == payload.appointment_id,
            Appointment.patient_id == current_patient.id,
        )
        .first()
    )
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    if appointment.status != "Completed":
        raise HTTPException(status_code=400, detail="Only completed appointments can be rated")

    # Check if already rated
    existing = (
        db.query(DoctorRating)
        .filter(DoctorRating.appointment_id == payload.appointment_id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="You have already rated this appointment")

    rating = DoctorRating(
        patient_id=current_patient.id,
        doctor_id=appointment.doctor_id,
        appointment_id=payload.appointment_id,
        rating=payload.rating,
        review=payload.review,
    )
    db.add(rating)
    db.commit()
    db.refresh(rating)

    return RatingOut(
        id=rating.id,
        patient_id=rating.patient_id,
        doctor_id=rating.doctor_id,
        appointment_id=rating.appointment_id,
        rating=rating.rating,
        review=rating.review,
        patient_name=current_patient.name,
        created_at=rating.created_at,
    )


@router.get("/doctor/{doctor_id}", response_model=List[RatingOut])
async def get_doctor_ratings(
    doctor_id: int,
    db: Session = Depends(get_db),
):
    """Get all ratings for a specific doctor (public)."""
    rows = (
        db.query(DoctorRating, Patient.name)
        .join(Patient, DoctorRating.patient_id == Patient.id)
        .filter(DoctorRating.doctor_id == doctor_id)
        .order_by(DoctorRating.created_at.desc())
        .all()
    )
    return [
        RatingOut(
            id=r.id,
            patient_id=r.patient_id,
            doctor_id=r.doctor_id,
            appointment_id=r.appointment_id,
            rating=r.rating,
            review=r.review,
            patient_name=name,
            created_at=r.created_at,
        )
        for r, name in rows
    ]


@router.get("/doctor/{doctor_id}/summary", response_model=DoctorRatingSummary)
async def get_doctor_rating_summary(
    doctor_id: int,
    db: Session = Depends(get_db),
):
    """Get average rating and total count for a doctor (public)."""
    result = (
        db.query(
            sa_func.coalesce(sa_func.avg(DoctorRating.rating), 0).label("avg"),
            sa_func.count(DoctorRating.id).label("cnt"),
        )
        .filter(DoctorRating.doctor_id == doctor_id)
        .first()
    )
    return DoctorRatingSummary(
        doctor_id=doctor_id,
        average_rating=round(float(result.avg), 1),
        total_ratings=result.cnt,
    )


@router.get("/my-ratings", response_model=List[RatingOut])
async def get_my_ratings(
    current_patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db),
):
    """Get all ratings submitted by the current patient."""
    ratings = (
        db.query(DoctorRating)
        .filter(DoctorRating.patient_id == current_patient.id)
        .order_by(DoctorRating.created_at.desc())
        .all()
    )
    return [
        RatingOut(
            id=r.id,
            patient_id=r.patient_id,
            doctor_id=r.doctor_id,
            appointment_id=r.appointment_id,
            rating=r.rating,
            review=r.review,
            patient_name=current_patient.name,
            created_at=r.created_at,
        )
        for r in ratings
    ]
