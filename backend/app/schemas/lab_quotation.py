from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime


# ── Lab test item (from prescription) ───────────────────────

class LabTestItem(BaseModel):
    name: str
    instructions: str = ""


class LabTestPricing(BaseModel):
    test_name: str
    available: bool = True
    price: float = 0
    turnaround: str = ""  # e.g. "2-3 hours", "Next day"
    note: str = ""


# ── Request schemas ─────────────────────────────────────────

class LabQuotationRequestCreate(BaseModel):
    prescription_id: int
    clinic_id: int
    note: Optional[str] = None


class LabQuotationRequestOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    prescription_id: int
    patient_id: int
    clinic_id: int
    lab_tests_snapshot: Optional[str] = None  # JSON string
    note: Optional[str] = None
    status: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    # Denormalized info
    patient_name: Optional[str] = None
    patient_phone: Optional[str] = None
    clinic_name: Optional[str] = None
    doctor_name: Optional[str] = None
    diagnosis: Optional[str] = None


# ── Response schemas (clinic submits a quotation) ───────────

class LabQuotationResponseCreate(BaseModel):
    request_id: int
    items: List[LabTestPricing]
    total_amount: float
    home_collection_available: bool = False
    home_collection_fee: float = 0
    notes: Optional[str] = None
    valid_until: Optional[datetime] = None


class LabQuotationResponseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    request_id: int
    clinic_id: int
    items: Optional[str] = None  # JSON string
    total_amount: float
    home_collection_available: bool
    home_collection_fee: float
    notes: Optional[str] = None
    valid_until: Optional[datetime] = None
    created_at: Optional[datetime] = None

    # Denormalized
    clinic_name: Optional[str] = None


# ── Clinic listing for patients ─────────────────────────────

class ClinicListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    clinic_name: str
    street_address: str
    city: str
    state: str
    postal_code: str
    phone: str


# ── Full quotation (request + optional response) ───────────

class LabQuotationFull(BaseModel):
    request: LabQuotationRequestOut
    response: Optional[LabQuotationResponseOut] = None
