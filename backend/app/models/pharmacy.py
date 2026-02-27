from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.sql import func

from app.db.database import Base


class Pharmacy(Base):
    __tablename__ = "pharmacies"

    id = Column(Integer, primary_key=True, index=True)

    # Owner Info
    owner_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(20), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)

    # Pharmacy Info
    pharmacy_name = Column(String(200), nullable=False)
    licence_number = Column(String(100), unique=True, index=True, nullable=False)

    # Address
    street_address = Column(String(300), nullable=False)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    postal_code = Column(String(20), nullable=False)

    # Status
    is_approved = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)

    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Pharmacy(id={self.id}, pharmacy_name={self.pharmacy_name}, owner={self.owner_name})>"
