from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import os
import uuid
from pathlib import Path

from app.db import get_db
from app.models import Patient, Appointment, Doctor
from app.schemas import (
    PatientSignUp,
    PatientSignIn,
    Token,
    ProfileComplete,
    ProfileUpdate,
    PatientResponse,
    MessageResponse,
    AppointmentOut,
)
from app.services import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_patient,
)
from app.core.config import settings

router = APIRouter(prefix="/api/patients", tags=["patients"])

# Create uploads directory
UPLOAD_DIR = Path("uploads/profile_pictures")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Allowed file extensions
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


# ============ Authentication Routes ============

@router.post("/signup", response_model=Token, status_code=status.HTTP_201_CREATED)
async def signup(patient_data: PatientSignUp, db: Session = Depends(get_db)):
    """Register a new patient"""
    # Check if email already exists
    existing_email = db.query(Patient).filter(Patient.email == patient_data.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if phone already exists
    existing_phone = db.query(Patient).filter(Patient.phone == patient_data.phone).first()
    if existing_phone:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number already registered"
        )
    
    # Create new patient
    hashed_password = get_password_hash(patient_data.password)
    new_patient = Patient(
        name=patient_data.name,
        email=patient_data.email,
        phone=patient_data.phone,
        password_hash=hashed_password,
        is_profile_complete=False,
    )
    
    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)
    
    # Create access token
    access_token = create_access_token(
        data={
            "sub": str(new_patient.id),
            "email": new_patient.email,
            "role": "patient"
        },
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=PatientResponse.model_validate(new_patient)
    )


@router.post("/signin", response_model=Token)
async def signin(credentials: PatientSignIn, db: Session = Depends(get_db)):
    """Sign in a patient"""
    # Find patient by email
    patient = db.query(Patient).filter(Patient.email == credentials.email).first()
    
    if not patient or not verify_password(credentials.password, patient.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not patient.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account is deactivated"
        )
    
    # Update last login
    patient.last_login = datetime.utcnow()
    db.commit()
    db.refresh(patient)
    
    # Create access token
    access_token = create_access_token(
        data={
            "sub": str(patient.id),
            "email": patient.email,
            "role": "patient"
        },
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=PatientResponse.model_validate(patient)
    )


# ============ Profile Routes ============

@router.get("/me", response_model=PatientResponse)
async def get_profile(current_patient: Patient = Depends(get_current_patient)):
    """Get current patient's profile"""
    return PatientResponse.model_validate(current_patient)


@router.post("/complete-profile", response_model=PatientResponse)
async def complete_profile(
    profile_data: ProfileComplete,
    db: Session = Depends(get_db),
    current_patient: Patient = Depends(get_current_patient)
):
    """Complete patient's profile with health information"""
    current_patient.age = profile_data.age
    current_patient.gender = profile_data.gender
    current_patient.weight = profile_data.weight
    current_patient.height = profile_data.height
    current_patient.blood_group = profile_data.blood_group
    current_patient.medical_conditions = profile_data.medical_conditions
    current_patient.is_profile_complete = True
    
    db.commit()
    db.refresh(current_patient)
    
    return PatientResponse.model_validate(current_patient)


@router.put("/profile", response_model=PatientResponse)
async def update_profile(
    profile_data: ProfileUpdate,
    db: Session = Depends(get_db),
    current_patient: Patient = Depends(get_current_patient)
):
    """Update patient's profile"""
    update_data = profile_data.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(current_patient, field, value)
    
    db.commit()
    db.refresh(current_patient)
    
    return PatientResponse.model_validate(current_patient)


# ============ Profile Picture Routes ============

@router.post("/profile-picture", response_model=PatientResponse)
async def upload_profile_picture(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_patient: Patient = Depends(get_current_patient)
):
    """Upload or update patient's profile picture"""
    # Validate file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Read file content and check size
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds 5MB limit"
        )
    
    # Delete old profile picture if exists
    if current_patient.profile_picture:
        old_file_path = Path(current_patient.profile_picture.lstrip("/"))
        if old_file_path.exists():
            try:
                old_file_path.unlink()
            except Exception:
                pass  # Ignore deletion errors
    
    # Generate unique filename
    unique_filename = f"{current_patient.id}_{uuid.uuid4().hex}{file_ext}"
    file_path = UPLOAD_DIR / unique_filename
    
    # Save file
    with open(file_path, "wb") as f:
        f.write(content)
    
    # Update database
    current_patient.profile_picture = f"/uploads/profile_pictures/{unique_filename}"
    db.commit()
    db.refresh(current_patient)
    
    return PatientResponse.model_validate(current_patient)


@router.delete("/profile-picture", response_model=PatientResponse)
async def delete_profile_picture(
    db: Session = Depends(get_db),
    current_patient: Patient = Depends(get_current_patient)
):
    """Delete patient's profile picture"""
    if current_patient.profile_picture:
        # Delete file from filesystem
        file_path = Path(current_patient.profile_picture.lstrip("/"))
        if file_path.exists():
            try:
                file_path.unlink()
            except Exception:
                pass  # Ignore deletion errors
        
        # Update database
        current_patient.profile_picture = None
        db.commit()
        db.refresh(current_patient)
    
    return PatientResponse.model_validate(current_patient)


# ============ Dashboard Data Routes ============

@router.get("/dashboard")
async def get_dashboard_data(current_patient: Patient = Depends(get_current_patient)):
    """Get patient dashboard data"""
    # Calculate BMI if height and weight are available
    bmi = None
    bmi_status = None
    if current_patient.height and current_patient.weight:
        height_m = current_patient.height / 100
        bmi = round(current_patient.weight / (height_m ** 2), 1)
        if bmi < 18.5:
            bmi_status = "Underweight"
        elif bmi < 25:
            bmi_status = "Normal"
        elif bmi < 30:
            bmi_status = "Overweight"
        else:
            bmi_status = "Obese"
    
    return {
        "patient": PatientResponse.model_validate(current_patient),
        "stats": {
            "bmi": bmi,
            "bmi_status": bmi_status,
            "upcoming_appointments": 0,  # Placeholder
            "prescriptions": 0,  # Placeholder
            "health_score": 85,  # Placeholder
        },
        "recent_activity": [],  # Placeholder
    }


@router.get("/appointments", response_model=list[AppointmentOut])
async def get_patient_appointments(
    current_patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db),
):
    """Return all appointments for the current patient (if any)."""
    rows = (
        db.query(Appointment, Doctor)
        .join(Doctor, Appointment.doctor_id == Doctor.id)
        .filter(Appointment.patient_id == current_patient.id)
        .order_by(Appointment.date.desc(), Appointment.time.desc())
        .all()
    )

    results: list[AppointmentOut] = []
    for appt, doc in rows:
        results.append(
            AppointmentOut(
                id=appt.id,
                appointment_date=appt.date,
                appointment_time=appt.time,
                status=appt.status,
                reason=appt.reason,
                symptoms=appt.symptoms,
                doctor_name=doc.name,
                doctor_specialization=doc.specialization,
                doctor_id=appt.doctor_id,
            )
        )
    return results
