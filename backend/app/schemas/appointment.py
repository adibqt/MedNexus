from datetime import date, time
from pydantic import BaseModel, ConfigDict
from typing import Optional


class AppointmentOut(BaseModel):
    id: int
    appointment_date: date
    appointment_time: time
    status: str
    reason: Optional[str] = None
    symptoms: Optional[str] = None
    doctor_name: str
    doctor_specialization: str

    model_config = ConfigDict(from_attributes=False)


