from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean
from sqlalchemy.sql import func

from app.db.database import Base


class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)

    # Basic Info
    name = Column(String(100), nullable=False)
    phone = Column(String(20), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    specialization = Column(String(100), nullable=False)

    # Registration Details
    bmdc_number = Column(String(50), unique=True, index=True, nullable=False)
    mbbs_certificate = Column(String(500), nullable=False)  # file path
    fcps_certificate = Column(String(500), nullable=True)   # optional file path

    # Profile
    profile_picture = Column(String(500), nullable=True)    # optional file path

    # Status
    is_approved = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)

    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Doctor(id={self.id}, name={self.name}, specialization={self.specialization})>"


