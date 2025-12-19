from datetime import date, time, datetime
from pydantic import BaseModel, ConfigDict
from typing import Optional, List


class AppointmentCreate(BaseModel):
    doctor_id: int
    appointment_date: date
    appointment_time: time
    reason: Optional[str] = None
    symptoms: Optional[str] = None


class AppointmentOut(BaseModel):
    id: int
    appointment_date: date
    appointment_time: time
    status: str
    reason: Optional[str] = None
    symptoms: Optional[str] = None
    doctor_name: str
    doctor_specialization: str
    doctor_id: Optional[int] = None

    model_config = ConfigDict(from_attributes=False)


class AvailableSlot(BaseModel):
    time: str  # Will be serialized as string
    available: bool
    date: Optional[str] = None  # Optional date for frontend filtering


class DoctorAppointmentResponse(BaseModel):
    id: int
    appointment_date: date
    appointment_time: time
    status: str
    reason: Optional[str] = None
    symptoms: Optional[str] = None
    patient_name: str
    patient_email: str
    patient_phone: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


