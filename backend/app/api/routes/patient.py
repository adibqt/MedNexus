from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import os
import uuid
from pathlib import Path
from typing import List

from app.db import get_db
from app.models import Patient, Appointment, Doctor, Symptom, Specialization, AIConsultation
from app.schemas import (
    PatientSignUp,
    PatientSignIn,
    Token,
    ProfileComplete,
    ProfileUpdate,
    PatientResponse,
    MessageResponse,
    AppointmentOut,
    AIConsultationRequest,
    AIConsultationResponse,
    AIChatRequest,
    AIChatResponse,
    DoctorSuggestion,
    SymptomInfo,
    AIConsultationHistoryItem,
    AIConsultationHistoryResponse,
)
from app.services import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_patient,
    ai_service,
)
from app.core.config import settings

router = APIRouter(prefix="/api/patients", tags=["patients"])

# Create uploads directory
UPLOAD_DIR = Path("uploads/profile_pictures")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Allowed file extensions
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


# ============ Authentication Routes ============

@router.post("/signup", response_model=Token, status_code=status.HTTP_201_CREATED)
async def signup(patient_data: PatientSignUp, db: Session = Depends(get_db)):
    """Register a new patient"""
    # Check if email already exists
    existing_email = db.query(Patient).filter(Patient.email == patient_data.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if phone already exists
    existing_phone = db.query(Patient).filter(Patient.phone == patient_data.phone).first()
    if existing_phone:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number already registered"
        )
    
    # Create new patient
    hashed_password = get_password_hash(patient_data.password)
    new_patient = Patient(
        name=patient_data.name,
        email=patient_data.email,
        phone=patient_data.phone,
        password_hash=hashed_password,
        is_profile_complete=False,
    )
    
    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)
    
    # Create access token
    access_token = create_access_token(
        data={
            "sub": str(new_patient.id),
            "email": new_patient.email,
            "role": "patient"
        },
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=PatientResponse.model_validate(new_patient)
    )


@router.post("/signin", response_model=Token)
async def signin(credentials: PatientSignIn, db: Session = Depends(get_db)):
    """Sign in a patient"""
    # Find patient by email
    patient = db.query(Patient).filter(Patient.email == credentials.email).first()
    
    if not patient or not verify_password(credentials.password, patient.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not patient.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account is deactivated"
        )
    
    # Update last login
    patient.last_login = datetime.utcnow()
    db.commit()
    db.refresh(patient)
    
    # Create access token
    access_token = create_access_token(
        data={
            "sub": str(patient.id),
            "email": patient.email,
            "role": "patient"
        },
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=PatientResponse.model_validate(patient)
    )


# ============ Profile Routes ============

@router.get("/me", response_model=PatientResponse)
async def get_profile(current_patient: Patient = Depends(get_current_patient)):
    """Get current patient's profile"""
    return PatientResponse.model_validate(current_patient)


@router.post("/complete-profile", response_model=PatientResponse)
async def complete_profile(
    profile_data: ProfileComplete,
    db: Session = Depends(get_db),
    current_patient: Patient = Depends(get_current_patient)
):
    """Complete patient's profile with health information"""
    current_patient.age = profile_data.age
    current_patient.gender = profile_data.gender
    current_patient.weight = profile_data.weight
    current_patient.height = profile_data.height
    current_patient.blood_group = profile_data.blood_group
    current_patient.medical_conditions = profile_data.medical_conditions
    current_patient.is_profile_complete = True
    
    db.commit()
    db.refresh(current_patient)
    
    return PatientResponse.model_validate(current_patient)


@router.put("/profile", response_model=PatientResponse)
async def update_profile(
    profile_data: ProfileUpdate,
    db: Session = Depends(get_db),
    current_patient: Patient = Depends(get_current_patient)
):
    """Update patient's profile"""
    update_data = profile_data.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(current_patient, field, value)
    
    db.commit()
    db.refresh(current_patient)
    
    return PatientResponse.model_validate(current_patient)


# ============ Profile Picture Routes ============

@router.post("/profile-picture", response_model=PatientResponse)
async def upload_profile_picture(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_patient: Patient = Depends(get_current_patient)
):
    """Upload or update patient's profile picture"""
    # Validate file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Read file content and check size
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds 5MB limit"
        )
    
    # Delete old profile picture if exists
    if current_patient.profile_picture:
        old_file_path = Path(current_patient.profile_picture.lstrip("/"))
        if old_file_path.exists():
            try:
                old_file_path.unlink()
            except Exception:
                pass  # Ignore deletion errors
    
    # Generate unique filename
    unique_filename = f"{current_patient.id}_{uuid.uuid4().hex}{file_ext}"
    file_path = UPLOAD_DIR / unique_filename
    
    # Save file
    with open(file_path, "wb") as f:
        f.write(content)
    
    # Update database
    current_patient.profile_picture = f"/uploads/profile_pictures/{unique_filename}"
    db.commit()
    db.refresh(current_patient)
    
    return PatientResponse.model_validate(current_patient)


@router.delete("/profile-picture", response_model=PatientResponse)
async def delete_profile_picture(
    db: Session = Depends(get_db),
    current_patient: Patient = Depends(get_current_patient)
):
    """Delete patient's profile picture"""
    if current_patient.profile_picture:
        # Delete file from filesystem
        file_path = Path(current_patient.profile_picture.lstrip("/"))
        if file_path.exists():
            try:
                file_path.unlink()
            except Exception:
                pass  # Ignore deletion errors
        
        # Update database
        current_patient.profile_picture = None
        db.commit()
        db.refresh(current_patient)
    
    return PatientResponse.model_validate(current_patient)


# ============ Dashboard Data Routes ============

@router.get("/dashboard")
async def get_dashboard_data(current_patient: Patient = Depends(get_current_patient)):
    """Get patient dashboard data"""
    # Calculate BMI if height and weight are available
    bmi = None
    bmi_status = None
    if current_patient.height and current_patient.weight:
        height_m = current_patient.height / 100
        bmi = round(current_patient.weight / (height_m ** 2), 1)
        if bmi < 18.5:
            bmi_status = "Underweight"
        elif bmi < 25:
            bmi_status = "Normal"
        elif bmi < 30:
            bmi_status = "Overweight"
        else:
            bmi_status = "Obese"
    
    return {
        "patient": PatientResponse.model_validate(current_patient),
        "stats": {
            "bmi": bmi,
            "bmi_status": bmi_status,
            "upcoming_appointments": 0,  # Placeholder
            "prescriptions": 0,  # Placeholder
            "health_score": 85,  # Placeholder
        },
        "recent_activity": [],  # Placeholder
    }


@router.get("/appointments", response_model=list[AppointmentOut])
async def get_patient_appointments(
    current_patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db),
):
    """Return all appointments for the current patient (if any)."""
    rows = (
        db.query(Appointment, Doctor)
        .join(Doctor, Appointment.doctor_id == Doctor.id)
        .filter(Appointment.patient_id == current_patient.id)
        .order_by(Appointment.date.desc(), Appointment.time.desc())
        .all()
    )

    results: list[AppointmentOut] = []
    for appt, doc in rows:
        results.append(
            AppointmentOut(
                id=appt.id,
                appointment_date=appt.date,
                appointment_time=appt.time,
                status=appt.status,
                reason=appt.reason,
                symptoms=appt.symptoms,
                doctor_name=doc.name,
                doctor_specialization=doc.specialization,
                doctor_id=appt.doctor_id,
            )
        )
    return results


# ============ AI Doctor Consultation ============

@router.post("/ai-chat", response_model=AIChatResponse)
async def ai_chat(
    request: AIChatRequest,
    current_patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db),
):
    """
    Conversational AI chat for health assistance.
    Supports continuous conversation with context awareness.
    """
    try:
        # Get all active specializations
        specializations = db.query(Specialization).filter(
            Specialization.is_active == True
        ).all()
        available_specs = [s.name for s in specializations]
        
        # Get all active symptoms with their specializations
        symptoms = db.query(Symptom).filter(Symptom.is_active == True).all()
        symptom_data = [
            {
                "name": s.name,
                "description": s.description or "",
                "specialization": s.specialization or "General"
            }
            for s in symptoms
        ]
        
        # Convert conversation history to the format expected by AI service
        conversation_history = [
            {"role": msg.role, "content": msg.content}
            for msg in request.conversation_history
        ]
        
        # Get AI response
        ai_result = ai_service.chat_response(
            user_message=request.message,
            conversation_history=conversation_history,
            available_specializations=available_specs,
            available_symptoms=symptom_data
        )
        
        # Find matching doctors if symptom analysis was performed
        suggested_doctors = []
        spec_match_map = {}
        
        if ai_result.get("should_show_doctors") and ai_result.get("recommended_specializations"):
            # Build specialization match map
            for spec_info in ai_result.get("recommended_specializations", []):
                if isinstance(spec_info, dict):
                    spec_match_map[spec_info["name"]] = {
                        "percentage": spec_info.get("match_percentage", 75),
                        "reason": spec_info.get("reason", "Based on symptom analysis")
                    }
            
            spec_names = list(spec_match_map.keys())
            
            if spec_names:
                doctors = db.query(Doctor).filter(
                    Doctor.specialization.in_(spec_names),
                    Doctor.is_approved == True,
                    Doctor.is_active == True
                ).limit(10).all()
                
                suggested_doctors = [
                    DoctorSuggestion(
                        id=doc.id,
                        name=doc.name,
                        specialization=doc.specialization,
                        phone=doc.phone,
                        profile_picture=doc.profile_picture,
                        schedule=doc.schedule,
                        match_percentage=spec_match_map.get(doc.specialization, {}).get("percentage", 75),
                        match_reason=spec_match_map.get(doc.specialization, {}).get("reason", "Based on symptom analysis")
                    )
                    for doc in doctors
                ]
                
                suggested_doctors.sort(key=lambda x: x.match_percentage, reverse=True)
        
        # Generate health advice if symptoms detected and not emergency
        health_advice = None
        if ai_result.get("detected_symptoms") and not ai_result.get("emergency_warning", False):
            health_advice = ai_service.generate_health_advice(
                symptoms=ai_result.get("detected_symptoms", []),
                severity=ai_result.get("severity", "moderate")
            )
        
        # Build response
        response = AIChatResponse(
            response_type=ai_result.get("response_type", "conversation"),
            message=ai_result.get("message", "I'm here to help. Could you tell me more?"),
            detected_symptoms=ai_result.get("detected_symptoms", []),
            symptom_analysis=ai_result.get("symptom_analysis"),
            recommended_specializations=[
                {"name": k, "match_percentage": v["percentage"], "reason": v["reason"]}
                for k, v in spec_match_map.items()
            ] if spec_match_map else [],
            severity=ai_result.get("severity"),
            confidence=ai_result.get("confidence"),
            additional_notes=ai_result.get("additional_notes"),
            emergency_warning=ai_result.get("emergency_warning", False),
            suggested_doctors=suggested_doctors,
            health_advice=health_advice,
            should_show_doctors=ai_result.get("should_show_doctors", False) and len(suggested_doctors) > 0,
            has_matching_doctors=len(suggested_doctors) > 0
        )
        
        return response
        
    except Exception as e:
        print(f"AI chat error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process AI chat: {str(e)}"
        )


@router.post("/ai-consultation")
async def ai_doctor_consultation(
    request: AIConsultationRequest,
    current_patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db),
):
    """
    AI-powered doctor consultation based on patient's symptom description.
    Analyzes symptoms and suggests appropriate doctors from the database.
    """
    try:
        # Get all active specializations
        specializations = db.query(Specialization).filter(
            Specialization.is_active == True
        ).all()
        available_specs = [s.name for s in specializations]
        
        # Get all active symptoms with their specializations
        symptoms = db.query(Symptom).filter(Symptom.is_active == True).all()
        symptom_data = [
            {
                "name": s.name,
                "description": s.description or "",
                "specialization": s.specialization or "General"
            }
            for s in symptoms
        ]
        
        # Analyze patient's description using AI
        analysis = ai_service.analyze_symptoms(
            patient_description=request.description,
            available_specializations=available_specs,
            available_symptoms=symptom_data
        )
        
        # Create a mapping of specialization to match info
        spec_match_map = {}
        for spec_info in analysis["recommended_specializations"]:
            if isinstance(spec_info, dict):
                spec_match_map[spec_info["name"]] = {
                    "percentage": spec_info.get("match_percentage", 75),
                    "reason": spec_info.get("reason", "Based on symptom analysis")
                }
            else:
                spec_match_map[spec_info] = {"percentage": 75, "reason": "Based on symptom analysis"}
        
        # Get list of specialization names for querying
        spec_names = list(spec_match_map.keys())
        
        # Find matching doctors based on recommended specializations
        suggested_doctors = []
        if spec_names:
            # Query doctors with matching specializations who are approved and active
            doctors = db.query(Doctor).filter(
                Doctor.specialization.in_(spec_names),
                Doctor.is_approved == True,
                Doctor.is_active == True
            ).limit(10).all()
            
            suggested_doctors = [
                DoctorSuggestion(
                    id=doc.id,
                    name=doc.name,
                    specialization=doc.specialization,
                    phone=doc.phone,
                    profile_picture=doc.profile_picture,
                    schedule=doc.schedule,
                    match_percentage=spec_match_map.get(doc.specialization, {}).get("percentage", 75),
                    match_reason=spec_match_map.get(doc.specialization, {}).get("reason", "Based on symptom analysis")
                )
                for doc in doctors
            ]
            
            # Sort doctors by match percentage (highest first)
            suggested_doctors.sort(key=lambda x: x.match_percentage, reverse=True)
        
        # Generate health advice if symptoms detected and not emergency
        health_advice = None
        if analysis["detected_symptoms"] and not analysis["emergency_warning"]:
            health_advice = ai_service.generate_health_advice(
                symptoms=analysis["detected_symptoms"],
                severity=analysis["severity"]
            )
        
        # Build response
        response = AIConsultationResponse(
            detected_symptoms=analysis["detected_symptoms"],
            symptom_analysis=analysis["symptom_analysis"],
            recommended_specializations=[
                {"name": k, "match_percentage": v["percentage"], "reason": v["reason"]}
                for k, v in spec_match_map.items()
            ],
            severity=analysis["severity"],
            confidence=analysis["confidence"],
            additional_notes=analysis["additional_notes"],
            emergency_warning=analysis["emergency_warning"],
            suggested_doctors=suggested_doctors,
            health_advice=health_advice,
            has_matching_doctors=len(suggested_doctors) > 0
        )
        
        # Save consultation to history
        try:
            consultation_record = AIConsultation(
                patient_id=current_patient.id,
                description=request.description,
                detected_symptoms=analysis["detected_symptoms"],
                symptom_analysis=analysis["symptom_analysis"],
                recommended_specializations=[
                    {"name": k, "match_percentage": v["percentage"], "reason": v["reason"]}
                    for k, v in spec_match_map.items()
                ],
                severity=analysis["severity"],
                confidence=analysis["confidence"],
                additional_notes=analysis["additional_notes"],
                emergency_warning=analysis["emergency_warning"],
                health_advice=health_advice,
                suggested_doctors=[
                    {
                        "id": doc.id,
                        "name": doc.name,
                        "specialization": doc.specialization,
                        "phone": doc.phone,
                        "profile_picture": doc.profile_picture,
                        "match_percentage": doc.match_percentage,
                        "match_reason": doc.match_reason,
                    }
                    for doc in suggested_doctors
                ],
                has_matching_doctors=len(suggested_doctors) > 0,
            )
            db.add(consultation_record)
            db.commit()
        except Exception as save_error:
            print(f"Failed to save consultation history: {save_error}")
            # Don't fail the request if saving history fails
        
        return response
        
    except Exception as e:
        print(f"AI consultation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process AI consultation: {str(e)}"
        )


@router.get("/ai-consultation/history", response_model=AIConsultationHistoryResponse)
async def get_ai_consultation_history(
    limit: int = Query(default=20, ge=1, le=100, description="Number of consultations to retrieve"),
    offset: int = Query(default=0, ge=0, description="Number of consultations to skip"),
    current_patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db),
):
    """
    Get the patient's AI consultation history.
    Returns a list of previous consultations ordered by date (newest first).
    """
    try:
        # Get total count
        total = db.query(AIConsultation).filter(
            AIConsultation.patient_id == current_patient.id
        ).count()
        
        # Get consultations with pagination
        consultations = db.query(AIConsultation).filter(
            AIConsultation.patient_id == current_patient.id
        ).order_by(
            AIConsultation.created_at.desc()
        ).offset(offset).limit(limit).all()
        
        # Transform to response format
        history_items = []
        for c in consultations:
            # Parse recommended_specializations from JSON
            specs = []
            if c.recommended_specializations:
                for spec in c.recommended_specializations:
                    specs.append({
                        "name": spec.get("name", ""),
                        "match_percentage": spec.get("match_percentage", 0),
                        "reason": spec.get("reason", ""),
                    })
            
            # Parse suggested_doctors from JSON
            doctors = []
            if c.suggested_doctors:
                for doc in c.suggested_doctors:
                    doctors.append(DoctorSuggestion(
                        id=doc.get("id", 0),
                        name=doc.get("name", ""),
                        specialization=doc.get("specialization", ""),
                        phone=doc.get("phone", ""),
                        profile_picture=doc.get("profile_picture"),
                        match_percentage=doc.get("match_percentage", 0),
                        match_reason=doc.get("match_reason", ""),
                    ))
            
            history_items.append(AIConsultationHistoryItem(
                id=c.id,
                description=c.description,
                detected_symptoms=c.detected_symptoms or [],
                symptom_analysis=c.symptom_analysis,
                recommended_specializations=specs,
                severity=c.severity,
                confidence=c.confidence,
                additional_notes=c.additional_notes,
                emergency_warning=c.emergency_warning or False,
                health_advice=c.health_advice,
                suggested_doctors=doctors,
                has_matching_doctors=c.has_matching_doctors or False,
                created_at=c.created_at,
            ))
        
        return AIConsultationHistoryResponse(
            total=total,
            consultations=history_items
        )
        
    except Exception as e:
        print(f"Error fetching consultation history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve consultation history: {str(e)}"
        )


@router.get("/ai-consultation/history/{consultation_id}", response_model=AIConsultationHistoryItem)
async def get_ai_consultation_detail(
    consultation_id: int,
    current_patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db),
):
    """
    Get a specific AI consultation by ID.
    """
    consultation = db.query(AIConsultation).filter(
        AIConsultation.id == consultation_id,
        AIConsultation.patient_id == current_patient.id
    ).first()
    
    if not consultation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consultation not found"
        )
    
    # Parse recommended_specializations from JSON
    specs = []
    if consultation.recommended_specializations:
        for spec in consultation.recommended_specializations:
            specs.append({
                "name": spec.get("name", ""),
                "match_percentage": spec.get("match_percentage", 0),
                "reason": spec.get("reason", ""),
            })
    
    # Parse suggested_doctors from JSON
    doctors = []
    if consultation.suggested_doctors:
        for doc in consultation.suggested_doctors:
            doctors.append(DoctorSuggestion(
                id=doc.get("id", 0),
                name=doc.get("name", ""),
                specialization=doc.get("specialization", ""),
                phone=doc.get("phone", ""),
                profile_picture=doc.get("profile_picture"),
                match_percentage=doc.get("match_percentage", 0),
                match_reason=doc.get("match_reason", ""),
            ))
    
    return AIConsultationHistoryItem(
        id=consultation.id,
        description=consultation.description,
        detected_symptoms=consultation.detected_symptoms or [],
        symptom_analysis=consultation.symptom_analysis,
        recommended_specializations=specs,
        severity=consultation.severity,
        confidence=consultation.confidence,
        additional_notes=consultation.additional_notes,
        emergency_warning=consultation.emergency_warning or False,
        health_advice=consultation.health_advice,
        suggested_doctors=doctors,
        has_matching_doctors=consultation.has_matching_doctors or False,
        created_at=consultation.created_at,
    )


@router.delete("/ai-consultation/history/{consultation_id}", response_model=MessageResponse)
async def delete_ai_consultation(
    consultation_id: int,
    current_patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db),
):
    """
    Delete a specific AI consultation from history.
    """
    consultation = db.query(AIConsultation).filter(
        AIConsultation.id == consultation_id,
        AIConsultation.patient_id == current_patient.id
    ).first()
    
    if not consultation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consultation not found"
        )
    
    db.delete(consultation)
    db.commit()
    
    return MessageResponse(message="Consultation deleted successfully")
