from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

from app.db import get_db
from app.models.clinic import Clinic
from app.schemas.clinic import (
    ClinicSignUp,
    ClinicSignIn,
    ClinicResponse,
    ClinicToken,
)
from app.services import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    validate_refresh_token,
)
from app.schemas.refresh_token import TokenWithRefresh, RefreshTokenRequest
from app.core.config import settings

router = APIRouter(prefix="/api/clinics", tags=["clinics"])


@router.post("/signup", response_model=ClinicResponse, status_code=status.HTTP_201_CREATED)
async def clinic_signup(payload: ClinicSignUp, db: Session = Depends(get_db)):
    """Register a new clinic. Account must be approved by admin before login."""

    # Uniqueness checks
    if db.query(Clinic).filter(Clinic.email == payload.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered for a clinic",
        )

    if db.query(Clinic).filter(Clinic.phone == payload.phone).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number already registered for a clinic",
        )

    if db.query(Clinic).filter(Clinic.licence_number == payload.licence_number).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Licence number already used",
        )

    clinic = Clinic(
        owner_name=payload.owner_name,
        email=payload.email,
        phone=payload.phone,
        password_hash=get_password_hash(payload.password),
        clinic_name=payload.clinic_name,
        licence_number=payload.licence_number,
        street_address=payload.street_address,
        city=payload.city,
        state=payload.state,
        postal_code=payload.postal_code,
        is_approved=False,
        is_active=True,
    )

    db.add(clinic)
    db.commit()
    db.refresh(clinic)

    return ClinicResponse.model_validate(clinic)


@router.post("/signin", response_model=ClinicToken)
async def clinic_signin(credentials: ClinicSignIn, db: Session = Depends(get_db)):
    """Sign in a clinic owner using email and password."""

    clinic = db.query(Clinic).filter(Clinic.email == credentials.email).first()

    if not clinic or not verify_password(credentials.password, clinic.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not clinic.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Clinic account is deactivated",
        )

    if not clinic.is_approved:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Clinic account is not yet approved by admin",
        )

    access_token = create_access_token(
        data={
            "sub": str(clinic.id),
            "email": clinic.email,
            "role": "clinic",
        },
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    refresh_token = create_refresh_token(clinic.id, "clinic", db)

    return ClinicToken(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=ClinicResponse.model_validate(clinic),
    )


@router.post("/refresh", response_model=ClinicToken)
async def refresh_clinic_token(
    request: RefreshTokenRequest,
    db: Session = Depends(get_db),
):
    """Refresh access token using refresh token."""
    token_record = validate_refresh_token(request.refresh_token, db)
    if not token_record or token_record.user_role != "clinic":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    clinic = db.query(Clinic).filter(Clinic.id == token_record.user_id).first()
    if not clinic:
        raise HTTPException(status_code=404, detail="Clinic not found")

    access_token = create_access_token(
        data={
            "sub": str(clinic.id),
            "email": clinic.email,
            "role": "clinic",
        },
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    new_refresh_token = create_refresh_token(clinic.id, "clinic", db)

    return ClinicToken(
        access_token=access_token,
        refresh_token=new_refresh_token,
        token_type="bearer",
        user=ClinicResponse.model_validate(clinic),
    )
