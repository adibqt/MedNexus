from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

from app.db import get_db
from app.models.pharmacy import Pharmacy
from app.schemas.pharmacy import (
    PharmacySignUp,
    PharmacySignIn,
    PharmacyResponse,
    PharmacyToken,
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

router = APIRouter(prefix="/api/pharmacies", tags=["pharmacies"])


@router.post("/signup", response_model=PharmacyResponse, status_code=status.HTTP_201_CREATED)
async def pharmacy_signup(payload: PharmacySignUp, db: Session = Depends(get_db)):
    """Register a new pharmacy. Account must be approved by admin before login."""

    # Uniqueness checks
    if db.query(Pharmacy).filter(Pharmacy.email == payload.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered for a pharmacy",
        )

    if db.query(Pharmacy).filter(Pharmacy.phone == payload.phone).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number already registered for a pharmacy",
        )

    if db.query(Pharmacy).filter(Pharmacy.licence_number == payload.licence_number).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Licence number already used",
        )

    pharmacy = Pharmacy(
        owner_name=payload.owner_name,
        email=payload.email,
        phone=payload.phone,
        password_hash=get_password_hash(payload.password),
        pharmacy_name=payload.pharmacy_name,
        licence_number=payload.licence_number,
        street_address=payload.street_address,
        city=payload.city,
        state=payload.state,
        postal_code=payload.postal_code,
        is_approved=False,
        is_active=True,
    )

    db.add(pharmacy)
    db.commit()
    db.refresh(pharmacy)

    return PharmacyResponse.model_validate(pharmacy)


@router.post("/signin", response_model=PharmacyToken)
async def pharmacy_signin(credentials: PharmacySignIn, db: Session = Depends(get_db)):
    """Sign in a pharmacy owner using email and password."""

    pharmacy = db.query(Pharmacy).filter(Pharmacy.email == credentials.email).first()

    if not pharmacy or not verify_password(credentials.password, pharmacy.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not pharmacy.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Pharmacy account is deactivated",
        )

    if not pharmacy.is_approved:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Pharmacy account is not yet approved by admin",
        )

    access_token = create_access_token(
        data={
            "sub": str(pharmacy.id),
            "email": pharmacy.email,
            "role": "pharmacy",
        },
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    refresh_token = create_refresh_token(pharmacy.id, "pharmacy", db)

    return PharmacyToken(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=PharmacyResponse.model_validate(pharmacy),
    )


@router.post("/refresh", response_model=PharmacyToken)
async def refresh_pharmacy_token(
    request: RefreshTokenRequest,
    db: Session = Depends(get_db),
):
    """Refresh access token using refresh token."""
    token_obj = validate_refresh_token(request.refresh_token, db)
    if not token_obj:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    pharmacy = db.query(Pharmacy).filter(Pharmacy.id == token_obj.user_id).first()
    if not pharmacy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pharmacy not found",
        )

    access_token = create_access_token(
        data={
            "sub": str(pharmacy.id),
            "email": pharmacy.email,
            "role": "pharmacy",
        },
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    return PharmacyToken(
        access_token=access_token,
        refresh_token=request.refresh_token,
        token_type="bearer",
        user=PharmacyResponse.model_validate(pharmacy),
    )
