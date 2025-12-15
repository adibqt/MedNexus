from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List, Literal
from datetime import datetime


BloodGroup = Literal["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
Gender = Literal["Male", "Female", "Other"]


# ============ Auth Schemas ============

class PatientSignUp(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=20)
    password: str = Field(..., min_length=6)


class PatientSignIn(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "PatientResponse"


class TokenData(BaseModel):
    user_id: Optional[int] = None
    email: Optional[str] = None
    role: Optional[str] = None


# ============ Profile Schemas ============

class ProfileComplete(BaseModel):
    age: int = Field(..., ge=1, le=150)
    gender: Gender
    weight: float = Field(..., ge=1, le=500)  # kg
    height: float = Field(..., ge=30, le=300)  # cm
    blood_group: BloodGroup
    medical_conditions: Optional[str] = None


class ProfileUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    phone: Optional[str] = Field(None, min_length=10, max_length=20)
    age: Optional[int] = Field(None, ge=1, le=150)
    gender: Optional[Gender] = None
    weight: Optional[float] = Field(None, ge=1, le=500)
    height: Optional[float] = Field(None, ge=30, le=300)
    blood_group: Optional[BloodGroup] = None
    medical_conditions: Optional[str] = None
    
    @field_validator('gender', 'blood_group', mode='before')
    @classmethod
    def empty_str_to_none(cls, v):
        if v == '' or v == "":
            return None
        return v


# ============ Response Schemas ============

class PatientResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: str
    age: Optional[int] = None
    gender: Optional[Gender] = None
    weight: Optional[float] = None
    height: Optional[float] = None
    blood_group: Optional[BloodGroup] = None
    medical_conditions: Optional[str] = None
    profile_picture: Optional[str] = None
    is_profile_complete: bool
    is_active: bool
    is_verified: Optional[bool] = False
    created_at: Optional[datetime] = None
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True


class MessageResponse(BaseModel):
    message: str
    success: bool = True


# Update forward reference
Token.model_rebuild()
