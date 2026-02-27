from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime


class PharmacySignUp(BaseModel):
    owner_name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., min_length=5, max_length=255)
    phone: str = Field(..., min_length=11, max_length=20)
    password: str = Field(..., min_length=6)
    pharmacy_name: str = Field(..., min_length=2, max_length=200)
    licence_number: str = Field(..., min_length=2, max_length=100)
    street_address: str = Field(..., min_length=2, max_length=300)
    city: str = Field(..., min_length=1, max_length=100)
    state: str = Field(..., min_length=1, max_length=100)
    postal_code: str = Field(..., min_length=1, max_length=20)


class PharmacySignIn(BaseModel):
    email: str = Field(..., min_length=5, max_length=255)
    password: str = Field(..., min_length=6)


class PharmacyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    owner_name: str
    email: str
    phone: str
    pharmacy_name: str
    licence_number: str
    street_address: str
    city: str
    state: str
    postal_code: str
    is_approved: bool
    is_active: bool
    created_at: Optional[datetime] = None


class PharmacyToken(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: PharmacyResponse
