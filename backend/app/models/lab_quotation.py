from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Numeric
from sqlalchemy.sql import func

from app.db.database import Base


class LabQuotationRequest(Base):
    """A patient requests a lab-test quotation from a clinic for a specific prescription."""
    __tablename__ = "lab_quotation_requests"

    id = Column(Integer, primary_key=True, index=True)
    prescription_id = Column(Integer, ForeignKey("prescriptions.id"), nullable=False, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"), nullable=False, index=True)

    # Snapshot of lab tests requested (JSON text) so clinic sees them even if rx changes
    lab_tests_snapshot = Column(Text, nullable=False)

    note = Column(Text, nullable=True)  # optional patient note

    # Status: pending | quoted | accepted | rejected | expired
    status = Column(String(20), default="pending", nullable=False, index=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<LabQuotationRequest(id={self.id}, patient={self.patient_id}, clinic={self.clinic_id}, status={self.status})>"


class LabQuotationResponse(Base):
    """A clinic responds to a lab quotation request with itemised pricing."""
    __tablename__ = "lab_quotation_responses"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("lab_quotation_requests.id"), unique=True, nullable=False, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"), nullable=False, index=True)

    # Itemised pricing as JSON text:
    # [{"test_name": str, "available": bool, "price": float, "turnaround": str, "note": str}]
    items = Column(Text, nullable=False)

    total_amount = Column(Numeric(10, 2), nullable=False, default=0)
    home_collection_available = Column(Boolean, default=False)
    home_collection_fee = Column(Numeric(10, 2), default=0)
    notes = Column(Text, nullable=True)  # clinic notes/comments
    valid_until = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<LabQuotationResponse(id={self.id}, request_id={self.request_id}, total={self.total_amount})>"
