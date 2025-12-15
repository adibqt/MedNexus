from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class DoctorSignUp(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    phone: str = Field(..., min_length=10, max_length=20)
    specialization: str = Field(..., min_length=2, max_length=100)
    bmdc_number: str = Field(..., min_length=2, max_length=50)
    password: str = Field(..., min_length=6)


class DoctorSignIn(BaseModel):
    phone: str = Field(..., min_length=10, max_length=20)
    password: str = Field(..., min_length=6)


class DoctorResponse(BaseModel):
    id: int
    name: str
    phone: str
    specialization: str
    bmdc_number: str
    mbbs_certificate: str
    fcps_certificate: Optional[str] = None
    profile_picture: Optional[str] = None
    is_approved: bool
    is_active: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class DoctorToken(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: DoctorResponse


