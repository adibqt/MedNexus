from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime, timedelta
from typing import Optional

from app.db import get_db
from app.models import Patient
from app.schemas import PatientResponse
from pydantic import BaseModel

router = APIRouter(prefix="/api/admin", tags=["admin"])


class PatientStatusUpdate(BaseModel):
    is_active: bool


class PatientsListResponse(BaseModel):
    patients: list[PatientResponse]
    total: int
    active: int
    inactive: int
    new_this_month: int


# Temporary admin authentication - should be replaced with proper auth
def verify_admin_token(authorization: str = None):
    """Simple admin verification - in production, use proper JWT verification"""
    # For now, we'll skip auth and just return True
    # In production, verify JWT token with admin role
    return True


@router.get("/patients", response_model=PatientsListResponse)
async def get_all_patients(
    skip: int = 0,
    limit: int = 100,
    status_filter: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    # authorized: bool = Depends(verify_admin_token)
):
    """Get all patients with optional filters"""
    query = db.query(Patient)
    
    # Apply status filter
    if status_filter == "active":
        query = query.filter(Patient.is_active == True)
    elif status_filter == "inactive":
        query = query.filter(Patient.is_active == False)
    
    # Apply search filter
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Patient.name.ilike(search_pattern)) |
            (Patient.email.ilike(search_pattern)) |
            (Patient.phone.ilike(search_pattern))
        )
    
    # Get total count
    total = query.count()
    
    # Get patients with pagination
    patients = query.order_by(Patient.created_at.desc()).offset(skip).limit(limit).all()
    
    # Calculate stats
    active_count = db.query(Patient).filter(Patient.is_active == True).count()
    inactive_count = db.query(Patient).filter(Patient.is_active == False).count()
    
    # Get new patients this month
    current_month = datetime.now().month
    current_year = datetime.now().year
    new_this_month = db.query(Patient).filter(
        extract('month', Patient.created_at) == current_month,
        extract('year', Patient.created_at) == current_year
    ).count()
    
    return PatientsListResponse(
        patients=[PatientResponse.model_validate(p) for p in patients],
        total=total,
        active=active_count,
        inactive=inactive_count,
        new_this_month=new_this_month
    )


@router.get("/patients/{patient_id}", response_model=PatientResponse)
async def get_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    # authorized: bool = Depends(verify_admin_token)
):
    """Get a specific patient by ID"""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    return PatientResponse.model_validate(patient)


@router.patch("/patients/{patient_id}/status", response_model=PatientResponse)
async def update_patient_status(
    patient_id: int,
    status_update: PatientStatusUpdate,
    db: Session = Depends(get_db),
    # authorized: bool = Depends(verify_admin_token)
):
    """Activate or deactivate a patient account"""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    patient.is_active = status_update.is_active
    patient.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(patient)
    
    return PatientResponse.model_validate(patient)


@router.get("/stats")
async def get_admin_stats(
    db: Session = Depends(get_db),
    # authorized: bool = Depends(verify_admin_token)
):
    """Get admin dashboard statistics"""
    total_patients = db.query(Patient).count()
    active_patients = db.query(Patient).filter(Patient.is_active == True).count()
    inactive_patients = db.query(Patient).filter(Patient.is_active == False).count()
    
    # New patients this month
    current_month = datetime.now().month
    current_year = datetime.now().year
    new_this_month = db.query(Patient).filter(
        extract('month', Patient.created_at) == current_month,
        extract('year', Patient.created_at) == current_year
    ).count()
    
    return {
        "total_patients": total_patients,
        "active_patients": active_patients,
        "inactive_patients": inactive_patients,
        "new_this_month": new_this_month,
    }

