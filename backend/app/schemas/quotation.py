from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime


# ── Medicine item (reused from prescription but with pricing) ───────

class QuotationMedicineItem(BaseModel):
    name: str
    dosage: str = ""
    frequency: str = ""
    duration: str = ""
    instructions: str = ""


class QuotationItemPricing(BaseModel):
    medicine_name: str
    available: bool = True
    unit_price: float = 0
    quantity: int = 1
    subtotal: float = 0
    note: str = ""


# ── Request schemas ─────────────────────────────────────────────────

class QuotationRequestCreate(BaseModel):
    prescription_id: int
    pharmacy_id: int
    note: Optional[str] = None


class QuotationRequestOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    prescription_id: int
    patient_id: int
    pharmacy_id: int
    medicines_snapshot: Optional[str] = None  # JSON string, parsed on frontend
    note: Optional[str] = None
    status: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    # Denormalized info
    patient_name: Optional[str] = None
    patient_phone: Optional[str] = None
    pharmacy_name: Optional[str] = None
    doctor_name: Optional[str] = None
    diagnosis: Optional[str] = None


# ── Response schemas (pharmacy submits a quotation) ─────────────────

class QuotationResponseCreate(BaseModel):
    request_id: int
    items: List[QuotationItemPricing]
    total_amount: float
    delivery_available: bool = False
    delivery_fee: float = 0
    notes: Optional[str] = None
    valid_until: Optional[datetime] = None


class QuotationResponseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    request_id: int
    pharmacy_id: int
    items: Optional[str] = None  # JSON string
    total_amount: float
    delivery_available: bool
    delivery_fee: float
    notes: Optional[str] = None
    valid_until: Optional[datetime] = None
    created_at: Optional[datetime] = None

    # Denormalized
    pharmacy_name: Optional[str] = None


# ── Pharmacy listing for patients ───────────────────────────────────

class PharmacyListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    pharmacy_name: str
    owner_name: str
    phone: str
    street_address: str
    city: str
    state: str
    postal_code: str


# ── Combined view: request + response for patient viewing ───────────

class QuotationFull(BaseModel):
    request: QuotationRequestOut
    response: Optional[QuotationResponseOut] = None
