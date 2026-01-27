from pydantic import BaseModel
from .patient import PatientResponse
from .doctor import DoctorResponse


class Token(BaseModel):
    access_token: str
    token_type: str
    user: PatientResponse | DoctorResponse


class TokenWithRefresh(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    user: PatientResponse | DoctorResponse


class RefreshTokenRequest(BaseModel):
    refresh_token: str
