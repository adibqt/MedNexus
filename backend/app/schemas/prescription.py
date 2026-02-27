from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class MedicineItem(BaseModel):
    name: str
    dosage: str = ""
    frequency: str = ""
    duration: str = ""
    instructions: str = ""


class LabTestItem(BaseModel):
    name: str
    instructions: str = ""


class PrescriptionCreate(BaseModel):
    appointment_id: int
    diagnosis: Optional[str] = None
    notes: Optional[str] = None
    medicines: List[MedicineItem] = Field(default_factory=list)
    lab_tests: List[LabTestItem] = Field(default_factory=list)
    follow_up_date: Optional[str] = None
    is_finalized: bool = False


class PrescriptionUpdate(BaseModel):
    diagnosis: Optional[str] = None
    notes: Optional[str] = None
    medicines: Optional[List[MedicineItem]] = None
    lab_tests: Optional[List[LabTestItem]] = None
    follow_up_date: Optional[str] = None
    is_finalized: Optional[bool] = None


class PrescriptionOut(BaseModel):
    id: int
    appointment_id: int
    doctor_id: int
    patient_id: int
    diagnosis: Optional[str]
    notes: Optional[str]
    medicines: List[MedicineItem]
    lab_tests: List[LabTestItem]
    follow_up_date: Optional[str]
    is_finalized: bool
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    # Denormalized info for the prescription print view
    doctor_name: Optional[str] = None
    doctor_specialization: Optional[str] = None
    doctor_bmdc: Optional[str] = None
    patient_name: Optional[str] = None
    patient_age: Optional[int] = None
    patient_gender: Optional[str] = None
    patient_phone: Optional[str] = None
    appointment_date: Optional[str] = None
    appointment_time: Optional[str] = None

    class Config:
        from_attributes = True
