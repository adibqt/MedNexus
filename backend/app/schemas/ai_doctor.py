"""
Schemas for AI Doctor Consultation
"""
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class ChatMessage(BaseModel):
    """A single chat message"""
    role: str = Field(..., description="Message role: 'user' or 'assistant'")
    content: str = Field(..., description="Message content")


class AIChatRequest(BaseModel):
    """Request schema for AI chat"""
    message: str = Field(..., min_length=1, max_length=2000, description="User's message")
    conversation_history: List[ChatMessage] = Field(default_factory=list, description="Previous messages in conversation")


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


class AIChatResponse(BaseModel):
    """Response schema for AI chat"""
    response_type: str = Field(..., description="Type of response: 'symptom_analysis', 'conversation', 'follow_up'")
    message: str = Field(..., description="AI's response message")
    detected_symptoms: List[str] = Field(default_factory=list, description="List of detected symptoms")
    symptom_analysis: Optional[str] = Field(None, description="AI analysis of the symptoms")
    recommended_specializations: List[SpecializationMatch] = Field(default_factory=list, description="Recommended specializations")
    severity: Optional[str] = Field(None, description="Severity level: low, moderate, or high")
    confidence: Optional[str] = Field(None, description="AI confidence level")
    additional_notes: Optional[str] = Field(None, description="Additional notes or warnings")
    emergency_warning: bool = Field(default=False, description="Whether immediate medical attention is needed")
    suggested_doctors: List[DoctorSuggestion] = Field(default_factory=list, description="List of suggested doctors")
    health_advice: Optional[str] = Field(None, description="General health advice")
    should_show_doctors: bool = Field(default=False, description="Whether to show doctor recommendations")
    has_matching_doctors: bool = Field(default=False, description="Whether matching doctors were found")


class AIConsultationRequest(BaseModel):
    """Request schema for AI doctor consultation (legacy)"""
    description: str = Field(..., min_length=10, max_length=2000, description="Patient's description of their health concerns")


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


class AIConsultationHistoryItem(BaseModel):
    """Schema for a single consultation history item"""
    id: int
    description: str
    detected_symptoms: List[str] = Field(default_factory=list)
    symptom_analysis: Optional[str] = None
    recommended_specializations: List[SpecializationMatch] = Field(default_factory=list)
    severity: Optional[str] = None
    confidence: Optional[str] = None
    additional_notes: Optional[str] = None
    emergency_warning: bool = False
    health_advice: Optional[str] = None
    suggested_doctors: List[DoctorSuggestion] = Field(default_factory=list)
    has_matching_doctors: bool = False
    created_at: datetime
    
    class Config:
        from_attributes = True


class AIConsultationHistoryResponse(BaseModel):
    """Response schema for consultation history"""
    total: int
    consultations: List[AIConsultationHistoryItem] = Field(default_factory=list)
