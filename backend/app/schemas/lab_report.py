from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime


class LabTestResult(BaseModel):
    """A single test result row inside a lab report."""
    test_name: str
    result: str = ""
    unit: str = ""
    reference_range: str = ""
    status: str = "normal"   # normal | abnormal | critical
    remarks: str = ""


class LabReportCreate(BaseModel):
    """Clinic submits a lab report for an accepted quotation request."""
    request_id: int
    results: List[LabTestResult]
    summary: Optional[str] = None
    notes: Optional[str] = None


class LabReportOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    request_id: int
    clinic_id: int
    patient_id: int
    prescription_id: int
    results: Optional[str] = None   # JSON string
    summary: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None

    # Denormalized
    clinic_name: Optional[str] = None
    patient_name: Optional[str] = None
    doctor_name: Optional[str] = None
    diagnosis: Optional[str] = None
