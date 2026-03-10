from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class RatingCreate(BaseModel):
    appointment_id: int
    rating: int = Field(..., ge=1, le=5)
    review: Optional[str] = Field(None, max_length=1000)


class RatingOut(BaseModel):
    id: int
    patient_id: int
    doctor_id: int
    appointment_id: int
    rating: int
    review: Optional[str] = None
    patient_name: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class DoctorRatingSummary(BaseModel):
    doctor_id: int
    average_rating: float
    total_ratings: int
