from datetime import datetime, timedelta
from typing import Optional
import secrets
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db import get_db
from app.models import Patient, Doctor, RefreshToken
from app.models.pharmacy import Pharmacy
from app.schemas import TokenData

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Bearer
security = HTTPBearer()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password"""
    # Truncate to 72 bytes (bcrypt limit) to match hashing
    plain_password = plain_password[:72]
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password"""
    # Truncate to 72 bytes (bcrypt limit) to avoid ValueError with newer versions
    password = password[:72]
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def create_refresh_token(user_id: int, user_type: str, db: Session) -> str:
    """Create a refresh token and store it in the database"""
    # Generate a secure random token
    token = secrets.token_urlsafe(32)
    
    # Calculate expiration
    expires_at = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    # Store in database
    db_token = RefreshToken(
        token=token,
        user_id=user_id,
        user_type=user_type,
        expires_at=expires_at
    )
    db.add(db_token)
    db.commit()
    
    return token


def validate_refresh_token(token: str, db: Session) -> Optional[RefreshToken]:
    """Validate a refresh token and return the token record if valid"""
    db_token = db.query(RefreshToken).filter(RefreshToken.token == token).first()
    
    if not db_token:
        return None
    
    if not db_token.is_valid():
        return None
    
    return db_token


def revoke_refresh_token(token: str, db: Session) -> bool:
    """Revoke a refresh token"""
    db_token = db.query(RefreshToken).filter(RefreshToken.token == token).first()
    if db_token:
        db_token.is_revoked = True
        db.commit()
        return True
    return False


def revoke_all_user_tokens(user_id: int, user_type: str, db: Session) -> None:
    """Revoke all refresh tokens for a user (useful for logout all devices)"""
    db.query(RefreshToken).filter(
        RefreshToken.user_id == user_id,
        RefreshToken.user_type == user_type,
        RefreshToken.is_revoked == False
    ).update({"is_revoked": True})
    db.commit()


def decode_token(token: str) -> TokenData:
    """Decode and validate a JWT token"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id_str: str = payload.get("sub")
        email: str = payload.get("email")
        role: str = payload.get("role")
        if user_id_str is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials - missing user ID",
                headers={"WWW-Authenticate": "Bearer"},
            )
        # Convert string ID back to integer
        user_id: int = int(user_id_str)
        return TokenData(user_id=user_id, email=email, role=role)
    except (JWTError, ValueError) as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_patient(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> Patient:
    """Get current authenticated patient from JWT token"""
    token = credentials.credentials
    token_data = decode_token(token)
    
    if token_data.role != "patient":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access patient resources"
        )
    
    patient = db.query(Patient).filter(Patient.id == token_data.user_id).first()
    if patient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    if not patient.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive account"
        )
    return patient


async def get_current_doctor(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> Doctor:
    """Get current authenticated doctor from JWT token"""
    token = credentials.credentials
    token_data = decode_token(token)

    if token_data.role != "doctor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access doctor resources",
        )

    doctor = db.query(Doctor).filter(Doctor.id == token_data.user_id).first()
    if doctor is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found"
        )
    if not doctor.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Doctor account is deactivated",
        )

    return doctor


async def get_current_pharmacy(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> Pharmacy:
    """Get current authenticated pharmacy from JWT token"""
    token = credentials.credentials
    token_data = decode_token(token)

    if token_data.role != "pharmacy":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access pharmacy resources",
        )

    pharmacy = db.query(Pharmacy).filter(Pharmacy.id == token_data.user_id).first()
    if pharmacy is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Pharmacy not found"
        )
    if not pharmacy.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Pharmacy account is deactivated",
        )
    if not pharmacy.is_approved:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Pharmacy account is not yet approved",
        )

    return pharmacy
