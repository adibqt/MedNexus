"""
AI Consultation History Model
Stores conversation history between patients and AI Doctor
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base


class AIConsultation(Base):
    """Stores AI consultation history for each patient"""
    __tablename__ = "ai_consultations"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # User's input
    description = Column(Text, nullable=False)
    
    # AI Analysis Results
    detected_symptoms = Column(JSON, default=list)  # List of symptoms
    symptom_analysis = Column(Text, nullable=True)
    recommended_specializations = Column(JSON, default=list)  # List of specialization matches
    severity = Column(String(20), nullable=True)  # low, moderate, high
    confidence = Column(String(20), nullable=True)  # low, medium, high
    additional_notes = Column(Text, nullable=True)
    emergency_warning = Column(Boolean, default=False)
    health_advice = Column(Text, nullable=True)
    
    # Suggested doctors (store IDs and basic info)
    suggested_doctors = Column(JSON, default=list)  # List of doctor suggestions
    has_matching_doctors = Column(Boolean, default=False)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship
    patient = relationship("Patient", backref="ai_consultations")

    def __repr__(self):
        return f"<AIConsultation(id={self.id}, patient_id={self.patient_id}, severity={self.severity})>"
