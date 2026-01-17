"""
Schemas for AI Doctor Consultation
"""
from pydantic import BaseModel, Field
from typing import List, Optional


class AIConsultationRequest(BaseModel):
    """Request schema for AI doctor consultation"""
    description: str = Field(..., min_length=10, max_length=2000, description="Patient's description of their health concerns")


class SpecializationMatch(BaseModel):
    """Specialization with match percentage"""
    name: str
    match_percentage: int = Field(..., ge=0, le=100, description="Match percentage 0-100")
    reason: str = Field(default="", description="Reason for the match")


class DoctorSuggestion(BaseModel):
    """Doctor suggestion with details"""
    id: int
    name: str
    specialization: str
    phone: str
    profile_picture: Optional[str] = None
    schedule: Optional[str] = None
    match_percentage: int = Field(default=0, ge=0, le=100, description="Match percentage based on specialization")
    match_reason: str = Field(default="", description="Reason for the match")
    
    class Config:
        from_attributes = True


class AIConsultationResponse(BaseModel):
    """Response schema for AI doctor consultation"""
    detected_symptoms: List[str] = Field(default_factory=list, description="List of detected symptoms")
    symptom_analysis: str = Field(..., description="AI analysis of the symptoms")
    recommended_specializations: List[SpecializationMatch] = Field(default_factory=list, description="Recommended medical specializations with match percentages")
    severity: str = Field(..., description="Severity level: low, moderate, or high")
    confidence: str = Field(..., description="AI confidence level: low, medium, or high")
    additional_notes: str = Field(default="", description="Additional notes or warnings")
    emergency_warning: bool = Field(default=False, description="Whether immediate medical attention is needed")
    suggested_doctors: List[DoctorSuggestion] = Field(default_factory=list, description="List of suggested doctors")
    health_advice: Optional[str] = Field(None, description="General health advice")
    has_matching_doctors: bool = Field(..., description="Whether matching doctors were found")


class SymptomInfo(BaseModel):
    """Symptom information for AI context"""
    name: str
    description: Optional[str] = None
    specialization: Optional[str] = None
    
    class Config:
        from_attributes = True
