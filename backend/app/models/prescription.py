from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func

from app.db.database import Base


class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id"), unique=True, nullable=False, index=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False, index=True)

    # Clinical summary
    diagnosis = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)  # Additional notes / advice

    # Medicines stored as JSON text:
    # [{"name": str, "dosage": str, "frequency": str, "duration": str, "instructions": str}]
    medicines = Column(Text, nullable=True)

    # Lab tests stored as JSON text:
    # [{"name": str, "instructions": str}]
    lab_tests = Column(Text, nullable=True)

    # Follow-up
    follow_up_date = Column(String(30), nullable=True)  # stored as ISO date string
    is_finalized = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Prescription(id={self.id}, appointment_id={self.appointment_id})>"
