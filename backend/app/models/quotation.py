from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Numeric
from sqlalchemy.sql import func

from app.db.database import Base


class QuotationRequest(Base):
    """A patient requests a quotation from a pharmacy for a specific prescription."""
    __tablename__ = "quotation_requests"

    id = Column(Integer, primary_key=True, index=True)
    prescription_id = Column(Integer, ForeignKey("prescriptions.id"), nullable=False, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False, index=True)
    pharmacy_id = Column(Integer, ForeignKey("pharmacies.id"), nullable=False, index=True)

    # Snapshot of medicines requested (JSON text) so pharmacy sees them even if rx changes
    medicines_snapshot = Column(Text, nullable=False)

    note = Column(Text, nullable=True)  # optional patient note

    # Status: pending | quoted | accepted | rejected | expired
    status = Column(String(20), default="pending", nullable=False, index=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<QuotationRequest(id={self.id}, patient={self.patient_id}, pharmacy={self.pharmacy_id}, status={self.status})>"


class QuotationResponse(Base):
    """A pharmacy responds to a quotation request with itemised pricing."""
    __tablename__ = "quotation_responses"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("quotation_requests.id"), unique=True, nullable=False, index=True)
    pharmacy_id = Column(Integer, ForeignKey("pharmacies.id"), nullable=False, index=True)

    # Itemised pricing as JSON text:
    # [{"medicine_name": str, "available": bool, "unit_price": float, "quantity": int, "subtotal": float, "note": str}]
    items = Column(Text, nullable=False)

    total_amount = Column(Numeric(10, 2), nullable=False, default=0)
    delivery_available = Column(Boolean, default=False)
    delivery_fee = Column(Numeric(10, 2), default=0)
    notes = Column(Text, nullable=True)  # pharmacy notes/comments
    valid_until = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<QuotationResponse(id={self.id}, request_id={self.request_id}, total={self.total_amount})>"
