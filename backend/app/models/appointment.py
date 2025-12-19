from sqlalchemy import Column, Integer, String, Text, Date, Time, ForeignKey, DateTime
from sqlalchemy.sql import func

from app.db.database import Base


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), index=True, nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), index=True, nullable=False)

    date = Column(Date, nullable=False)
    time = Column(Time, nullable=False)
    status = Column(String(20), default="Pending", nullable=False)
    reason = Column(String(255), nullable=True)
    symptoms = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


