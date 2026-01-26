from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.orm import Session
from pathlib import Path
import uuid
from datetime import timedelta

from app.db import get_db
from app.models import Doctor
from app.schemas import DoctorSignUp, DoctorSignIn, DoctorResponse, DoctorToken
from app.services import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_doctor,
)
from app.core.config import settings

router = APIRouter(prefix="/api/doctors", tags=["doctors"])

DOCS_UPLOAD_DIR = Path("uploads/doctor_documents")
DOCS_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_DOC_EXT = {".pdf", ".jpg", ".jpeg", ".png", ".webp"}
MAX_DOC_SIZE = 10 * 1024 * 1024  # 10MB


def _save_upload(file: UploadFile, subdir: str) -> str:
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_DOC_EXT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_DOC_EXT)}",
        )

    content = file.file.read()
    if len(content) > MAX_DOC_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds 10MB limit",
        )

    subdir_path = DOCS_UPLOAD_DIR / subdir
    subdir_path.mkdir(parents=True, exist_ok=True)

    filename = f"{uuid.uuid4().hex}{ext}"
    final_path = subdir_path / filename
    with open(final_path, "wb") as f:
        f.write(content)

    return f"/uploads/doctor_documents/{subdir}/{filename}"


@router.post("/signup", response_model=DoctorResponse, status_code=status.HTTP_201_CREATED)
async def doctor_signup(
    name: str = Form(...),
    phone: str = Form(...),
    specialization: str = Form(...),
    bmdc_number: str = Form(...),
    password: str = Form(...),
    mbbs_certificate: UploadFile = File(...),
    fcps_certificate: UploadFile | None = File(None),
    profile_picture: UploadFile | None = File(None),
    db: Session = Depends(get_db),
):
    """Register a new doctor. Account must be approved by admin before activation."""

    # Uniqueness checks
    existing_phone = db.query(Doctor).filter(Doctor.phone == phone).first()
    if existing_phone:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number already registered for a doctor",
        )

    existing_bmdc = db.query(Doctor).filter(Doctor.bmdc_number == bmdc_number).first()
    if existing_bmdc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="BMDC number already used",
        )

    # Persist files
    mbbs_path = _save_upload(mbbs_certificate, "mbbs")
    fcps_path = _save_upload(fcps_certificate, "fcps") if fcps_certificate else None
    profile_path = _save_upload(profile_picture, "profile") if profile_picture else None

    hashed_password = get_password_hash(password)

    doctor = Doctor(
        name=name,
        phone=phone,
        specialization=specialization,
        bmdc_number=bmdc_number,
        password_hash=hashed_password,
        mbbs_certificate=mbbs_path,
        fcps_certificate=fcps_path,
        profile_picture=profile_path,
        is_approved=False,
        is_active=True,
    )

    db.add(doctor)
    db.commit()
    db.refresh(doctor)

    return DoctorResponse.model_validate(doctor)


@router.post("/signin", response_model=DoctorToken)
async def doctor_signin(credentials: DoctorSignIn, db: Session = Depends(get_db)):
    """Sign in a doctor using phone and password"""
    doctor = db.query(Doctor).filter(Doctor.phone == credentials.phone).first()

    if not doctor or not verify_password(credentials.password, doctor.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect phone or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not doctor.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Doctor account is deactivated",
        )

    if not doctor.is_approved:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Doctor account is not yet approved by admin",
        )

    access_token = create_access_token(
        data={
            "sub": str(doctor.id),
            "email": None,
            "role": "doctor",
        },
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    return DoctorToken(
        access_token=access_token,
        user=DoctorResponse.model_validate(doctor),
    )


@router.get("/me", response_model=DoctorResponse)
async def get_me(current_doctor: Doctor = Depends(get_current_doctor)):
  """Return the current authenticated doctor profile."""
  return DoctorResponse.model_validate(current_doctor)


@router.get("", response_model=list[DoctorResponse])
async def list_public_doctors(db: Session = Depends(get_db)):
    """List doctors visible to patients (approved and active)."""
    docs = (
        db.query(Doctor)
        .filter(Doctor.is_approved == True, Doctor.is_active == True)
        .order_by(Doctor.created_at.desc())
        .all()
    )
    return [DoctorResponse.model_validate(d) for d in docs]


@router.get("/{doctor_id}", response_model=DoctorResponse)
async def get_doctor_by_id(doctor_id: int, db: Session = Depends(get_db)):
    """Get a single doctor's public profile by ID."""
    doctor = (
        db.query(Doctor)
        .filter(
            Doctor.id == doctor_id,
            Doctor.is_approved == True,
            Doctor.is_active == True,
        )
        .first()
    )
    
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found or not available",
        )
    
    return DoctorResponse.model_validate(doctor)


@router.put("/schedule", response_model=DoctorResponse)
async def update_schedule(
    schedule: dict,
    current_doctor: Doctor = Depends(get_current_doctor),
    db: Session = Depends(get_db),
):
    """
    Update the current doctor's schedule.

    The `schedule` dict is stored as JSON in the `schedule` column and can contain
    days and time ranges (e.g. { "Mon": { "enabled": true, "start": "09:00", "end": "13:00" }, ... }).
    """
    import json

    current_doctor.schedule = json.dumps(schedule)
    db.add(current_doctor)
    db.commit()
    db.refresh(current_doctor)

    return DoctorResponse.model_validate(current_doctor)


@router.put("/me", response_model=DoctorResponse)
async def update_me(
    name: str | None = Form(None),
    specialization: str | None = Form(None),
    phone: str | None = Form(None),
    profile_picture: UploadFile | None = File(None),
    current_doctor: Doctor = Depends(get_current_doctor),
    db: Session = Depends(get_db),
):
    """Update basic doctor profile information."""
    # Handle phone uniqueness if changed
    if phone and phone != current_doctor.phone:
        existing = db.query(Doctor).filter(Doctor.phone == phone).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Phone number already registered for another doctor",
            )
        current_doctor.phone = phone

    if name:
        current_doctor.name = name

    if specialization:
        current_doctor.specialization = specialization

    if profile_picture:
        # Save new profile picture
        profile_path = _save_upload(profile_picture, "profile")
        current_doctor.profile_picture = profile_path

    db.add(current_doctor)
    db.commit()
    db.refresh(current_doctor)

    return DoctorResponse.model_validate(current_doctor)


