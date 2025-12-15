from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime, timedelta
from typing import Optional

from app.db import get_db
from app.models import Patient, Doctor, Specialization, Symptom
from app.schemas import PatientResponse, DoctorResponse
from pydantic import BaseModel, ConfigDict

router = APIRouter(prefix="/api/admin", tags=["admin"])


class PatientStatusUpdate(BaseModel):
    is_active: bool


class PatientsListResponse(BaseModel):
    patients: list[PatientResponse]
    total: int
    active: int
    inactive: int
    new_this_month: int


class DoctorsListResponse(BaseModel):
    doctors: list[DoctorResponse]
    total: int
    approved: int
    pending: int


class DoctorStatusUpdate(BaseModel):
    is_active: bool


class SpecializationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    description: str | None = None
    is_active: bool


class SpecializationCreate(BaseModel):
    name: str
    description: str | None = None
    is_active: bool = True


class SymptomOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    description: str | None = None
    specialization: str | None = None
    is_active: bool


class SymptomCreate(BaseModel):
    name: str
    description: str | None = None
    specialization: str | None = None
    is_active: bool = True


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

    total_doctors = db.query(Doctor).count()
    approved_doctors = db.query(Doctor).filter(Doctor.is_approved == True).count()
    pending_doctors = db.query(Doctor).filter(Doctor.is_approved == False).count()

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
        "total_doctors": total_doctors,
        "approved_doctors": approved_doctors,
        "pending_doctors": pending_doctors,
    }


@router.get("/doctors", response_model=DoctorsListResponse)
async def get_all_doctors(
    skip: int = 0,
    limit: int = 100,
    status_filter: Optional[str] = None,  # 'approved', 'pending'
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Get all doctors with optional filters."""
    query = db.query(Doctor)

    if status_filter == "approved":
        query = query.filter(Doctor.is_approved == True)
    elif status_filter == "pending":
        query = query.filter(Doctor.is_approved == False)

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Doctor.name.ilike(search_pattern))
            | (Doctor.phone.ilike(search_pattern))
            | (Doctor.specialization.ilike(search_pattern))
            | (Doctor.bmdc_number.ilike(search_pattern))
        )

    total = query.count()
    doctors = (
        query.order_by(Doctor.created_at.desc()).offset(skip).limit(limit).all()
    )

    approved = db.query(Doctor).filter(Doctor.is_approved == True).count()
    pending = db.query(Doctor).filter(Doctor.is_approved == False).count()

    return DoctorsListResponse(
        doctors=[DoctorResponse.model_validate(d) for d in doctors],
        total=total,
        approved=approved,
        pending=pending,
    )


@router.patch("/doctors/{doctor_id}/approval", response_model=DoctorResponse)
async def update_doctor_approval(
    doctor_id: int,
    approve: bool,
    db: Session = Depends(get_db),
):
    """Approve or deny a doctor signup."""
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()

    if not doctor:
       raise HTTPException(
           status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found"
       )

    doctor.is_approved = approve
    if not approve:
        doctor.is_active = False

    doctor.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(doctor)

    return DoctorResponse.model_validate(doctor)


@router.patch("/doctors/{doctor_id}/status", response_model=DoctorResponse)
async def update_doctor_status(
    doctor_id: int,
    status_update: DoctorStatusUpdate,
    db: Session = Depends(get_db),
):
    """Activate or deactivate a doctor account (after signup decision)."""
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()

    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found"
        )

    doctor.is_active = status_update.is_active
    doctor.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(doctor)

    return DoctorResponse.model_validate(doctor)


@router.get("/specializations", response_model=list[SpecializationOut])
async def list_specializations(db: Session = Depends(get_db)):
    specs = db.query(Specialization).order_by(Specialization.name.asc()).all()
    return [SpecializationOut.model_validate(s) for s in specs]


@router.post("/specializations", response_model=SpecializationOut, status_code=status.HTTP_201_CREATED)
async def create_specialization(data: SpecializationCreate, db: Session = Depends(get_db)):
    existing = db.query(Specialization).filter(Specialization.name == data.name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Specialization with this name already exists",
        )
    spec = Specialization(
        name=data.name,
        description=data.description,
        is_active=data.is_active,
    )
    db.add(spec)
    db.commit()
    db.refresh(spec)
    return SpecializationOut.model_validate(spec)


@router.put("/specializations/{spec_id}", response_model=SpecializationOut)
async def update_specialization(
    spec_id: int,
    data: SpecializationCreate,
    db: Session = Depends(get_db),
):
    spec = db.query(Specialization).filter(Specialization.id == spec_id).first()
    if not spec:
        raise HTTPException(status_code=404, detail="Specialization not found")

    # Check for name conflict
    if data.name != spec.name:
        conflict = db.query(Specialization).filter(Specialization.name == data.name).first()
        if conflict:
            raise HTTPException(
                status_code=400,
                detail="Another specialization with this name already exists",
            )

    spec.name = data.name
    spec.description = data.description
    spec.is_active = data.is_active

    db.commit()
    db.refresh(spec)
    return SpecializationOut.model_validate(spec)


@router.delete("/specializations/{spec_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_specialization(spec_id: int, db: Session = Depends(get_db)):
    spec = db.query(Specialization).filter(Specialization.id == spec_id).first()
    if not spec:
        raise HTTPException(status_code=404, detail="Specialization not found")
    db.delete(spec)
    db.commit()
    return


@router.get("/symptoms", response_model=list[SymptomOut])
async def list_symptoms(db: Session = Depends(get_db)):
    items = db.query(Symptom).order_by(Symptom.name.asc()).all()
    return [SymptomOut.model_validate(s) for s in items]


@router.post("/symptoms", response_model=SymptomOut, status_code=status.HTTP_201_CREATED)
async def create_symptom(data: SymptomCreate, db: Session = Depends(get_db)):
    existing = db.query(Symptom).filter(Symptom.name == data.name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Symptom with this name already exists",
        )
    item = Symptom(
        name=data.name,
        description=data.description,
        specialization=data.specialization,
        is_active=data.is_active,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return SymptomOut.model_validate(item)


@router.put("/symptoms/{symptom_id}", response_model=SymptomOut)
async def update_symptom(
    symptom_id: int,
    data: SymptomCreate,
    db: Session = Depends(get_db),
):
    item = db.query(Symptom).filter(Symptom.id == symptom_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Symptom not found")

    if data.name != item.name:
        conflict = db.query(Symptom).filter(Symptom.name == data.name).first()
        if conflict:
            raise HTTPException(
                status_code=400,
                detail="Another symptom with this name already exists",
            )

    item.name = data.name
    item.description = data.description
    item.specialization = data.specialization
    item.is_active = data.is_active

    db.commit()
    db.refresh(item)
    return SymptomOut.model_validate(item)


@router.delete("/symptoms/{symptom_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_symptom(symptom_id: int, db: Session = Depends(get_db)):
    item = db.query(Symptom).filter(Symptom.id == symptom_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Symptom not found")
    db.delete(item)
    db.commit()
    return

