from sqlalchemy import Column, Integer, String, Float, Text, DateTime, Boolean, Enum as SQLEnum
from sqlalchemy.sql import func
from app.db.database import Base
import enum


class UserRole(str, enum.Enum):
    PATIENT = "patient"
    DOCTOR = "doctor"
    PHARMACY = "pharmacy"
    CLINIC = "clinic"


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    
    # Basic Info (from sign-up)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(20), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    
    # Profile Info (from profile completion)
    age = Column(Integer, nullable=True)
    gender = Column(String(10), nullable=True)  # Male, Female, Other
    weight = Column(Float, nullable=True)  # in kg
    height = Column(Float, nullable=True)  # in cm
    blood_group = Column(String(3), nullable=True)  # e.g. A+, AB-, O+
    medical_conditions = Column(Text, nullable=True)  # comma-separated or JSON
    profile_picture = Column(String(500), nullable=True)  # URL/path to profile picture
    
    # Profile status
    is_profile_complete = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)

    def __repr__(self):
        return f"<Patient(id={self.id}, name={self.name}, email={self.email})>"
