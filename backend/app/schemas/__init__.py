from app.schemas.patient import (
    PatientSignUp,
    PatientSignIn,
    Token,
    TokenData,
    ProfileComplete,
    ProfileUpdate,
    PatientResponse,
    MessageResponse,
)
from app.schemas.doctor import DoctorSignUp, DoctorSignIn, DoctorResponse, DoctorToken
from app.schemas.appointment import AppointmentOut
from app.schemas.ai_doctor import (
    AIConsultationRequest,
    AIConsultationResponse,
    DoctorSuggestion,
    SymptomInfo,
    SpecializationMatch,
    AIConsultationHistoryItem,
    AIConsultationHistoryResponse,
)

__all__ = [
    "PatientSignUp",
    "PatientSignIn",
    "Token",
    "TokenData",
    "ProfileComplete",
    "ProfileUpdate",
    "PatientResponse",
    "MessageResponse",
    "DoctorSignUp",
    "DoctorSignIn",
    "DoctorResponse",
    "DoctorToken",
    "AppointmentOut",
    "AIConsultationRequest",
    "AIConsultationResponse",
    "DoctorSuggestion",
    "SymptomInfo",
    "SpecializationMatch",
    "AIConsultationHistoryItem",
    "AIConsultationHistoryResponse",
]
