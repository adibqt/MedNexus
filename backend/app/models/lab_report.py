from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func

from app.db.database import Base


class LabReport(Base):
    """A clinic submits a lab report after the quotation has been accepted."""
    __tablename__ = "lab_reports"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("lab_quotation_requests.id"), unique=True, nullable=False, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"), nullable=False, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False, index=True)
    prescription_id = Column(Integer, ForeignKey("prescriptions.id"), nullable=False, index=True)

    # JSON text: [{"test_name": str, "result": str, "unit": str, "reference_range": str, "status": "normal"|"abnormal"|"critical", "remarks": str}]
    results = Column(Text, nullable=False)

    summary = Column(Text, nullable=True)  # overall summary / impression
    notes = Column(Text, nullable=True)    # clinic notes for the patient

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<LabReport(id={self.id}, request_id={self.request_id}, patient_id={self.patient_id})>"
