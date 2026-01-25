from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import date, time, datetime, timedelta
from typing import List, Optional
import json

from app.db import get_db
from app.models import Appointment, Doctor, Patient
from app.schemas.appointment import (
    AppointmentCreate,
    AppointmentOut,
    AvailableSlot,
    DoctorAppointmentResponse,
)
from app.services import get_current_patient, get_current_doctor

router = APIRouter(prefix="/api/appointments", tags=["appointments"])


def parse_schedule(schedule_json: Optional[str]) -> dict:
    """Parse doctor schedule JSON and return default if None."""
    if not schedule_json:
        # Default schedule: Mon-Fri, 9 AM - 5 PM
        return {
            "Mon": {"enabled": True, "start": "09:00", "end": "17:00"},
            "Tue": {"enabled": True, "start": "09:00", "end": "17:00"},
            "Wed": {"enabled": True, "start": "09:00", "end": "17:00"},
            "Thu": {"enabled": True, "start": "09:00", "end": "17:00"},
            "Fri": {"enabled": True, "start": "09:00", "end": "17:00"},
            "Sat": {"enabled": False, "start": "09:00", "end": "17:00"},
            "Sun": {"enabled": False, "start": "09:00", "end": "17:00"},
        }
    try:
        return json.loads(schedule_json)
    except (json.JSONDecodeError, TypeError):
        # Return default if parsing fails
        return {
            "Mon": {"enabled": True, "start": "09:00", "end": "17:00"},
            "Tue": {"enabled": True, "start": "09:00", "end": "17:00"},
            "Wed": {"enabled": True, "start": "09:00", "end": "17:00"},
            "Thu": {"enabled": True, "start": "09:00", "end": "17:00"},
            "Fri": {"enabled": True, "start": "09:00", "end": "17:00"},
            "Sat": {"enabled": False, "start": "09:00", "end": "17:00"},
            "Sun": {"enabled": False, "start": "09:00", "end": "17:00"},
        }


def get_day_name(date_obj: date) -> str:
    """Get day name abbreviation (Mon, Tue, etc.) - always in English."""
    # Use weekday number to map to day name (most reliable)
    weekday_map = {0: "Mon", 1: "Tue", 2: "Wed", 3: "Thu", 4: "Fri", 5: "Sat", 6: "Sun"}
    return weekday_map[date_obj.weekday()]


def generate_time_slots(start_time: str, end_time: str, slot_duration_minutes: int = 60) -> List[time]:
    """Generate time slots between start and end time. Default is 1 hour slots."""
    slots = []
    start_hour, start_min = map(int, start_time.split(":"))
    end_hour, end_min = map(int, end_time.split(":"))
    
    start_dt = datetime(2000, 1, 1, start_hour, start_min)
    end_dt = datetime(2000, 1, 1, end_hour, end_min)
    
    current = start_dt
    while current < end_dt:
        slots.append(current.time())
        current += timedelta(minutes=slot_duration_minutes)
    
    return slots


@router.get("/doctors/{doctor_id}/available-slots", response_model=List[AvailableSlot])
async def get_available_slots(
    doctor_id: int,
    selected_date: date = Query(..., alias="selected_date"),
    db: Session = Depends(get_db),
):
    """
    Get available time slots for a doctor on a specific date.
    """
    # Check if doctor exists
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found"
        )
    
    if not doctor.is_approved or not doctor.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Doctor is not available for appointments"
        )
    
    # Parse schedule
    schedule = parse_schedule(doctor.schedule)
    day_name = get_day_name(selected_date)
    
    # Debug logging (can be removed in production)
    print(f"DEBUG: Doctor {doctor_id}, Date: {selected_date}, Day: {day_name}")
    print(f"DEBUG: Schedule keys: {list(schedule.keys())}")
    print(f"DEBUG: Schedule: {schedule}")
    
    # Check if doctor works on this day
    # Try both abbreviated and full day names
    day_schedule = schedule.get(day_name, {})
    
    # If not found with abbreviation, try full day name
    if not day_schedule:
        full_day_map = {
            "Mon": "Monday", "Tue": "Tuesday", "Wed": "Wednesday",
            "Thu": "Thursday", "Fri": "Friday", "Sat": "Saturday", "Sun": "Sunday"
        }
        full_day_name = full_day_map.get(day_name)
        if full_day_name:
            day_schedule = schedule.get(full_day_name, {})
    
    print(f"DEBUG: Day schedule: {day_schedule}")
    
    # If still not found or not enabled, return empty
    if not day_schedule or not day_schedule.get("enabled", False):
        print(f"DEBUG: Day not enabled or not found. Returning empty slots.")
        return []  # Doctor doesn't work on this day
    
    # Generate time slots for this day
    start_time = day_schedule.get("start", "09:00")
    end_time = day_schedule.get("end", "17:00")
    
    # Ensure we have valid times
    if not start_time or not end_time:
        start_time = "09:00"
        end_time = "17:00"
    
    all_slots = generate_time_slots(start_time, end_time)
    
    # If no slots generated, something went wrong
    if not all_slots:
        # Return default slots as fallback
        all_slots = generate_time_slots("09:00", "17:00")
    
    # Get booked appointments for this doctor on this date
    booked_appointments = db.query(Appointment).filter(
        Appointment.doctor_id == doctor_id,
        Appointment.date == selected_date,
        Appointment.status.in_(["Pending", "Confirmed", "Scheduled"])
    ).all()
    
    booked_times = {apt.time for apt in booked_appointments}
    
    # Create available slots response
    available_slots = []
    date_str = selected_date.isoformat()
    for slot_time in all_slots:
        is_available = slot_time not in booked_times
        available_slots.append(AvailableSlot(
            time=slot_time.strftime("%H:%M:%S"),
            available=is_available,
            date=date_str
        ))
    
    return available_slots


@router.post("", response_model=AppointmentOut, status_code=status.HTTP_201_CREATED)
async def book_appointment(
    appointment_data: AppointmentCreate,
    current_patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db),
):
    """
    Book an appointment with a doctor.
    """
    # Check if doctor exists
    doctor = db.query(Doctor).filter(Doctor.id == appointment_data.doctor_id).first()
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found"
        )
    
    if not doctor.is_approved or not doctor.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Doctor is not available for appointments"
        )
    
    # Check if slot is still available
    existing_appointment = db.query(Appointment).filter(
        Appointment.doctor_id == appointment_data.doctor_id,
        Appointment.date == appointment_data.appointment_date,
        Appointment.time == appointment_data.appointment_time,
        Appointment.status.in_(["Pending", "Confirmed", "Scheduled"])
    ).first()
    
    if existing_appointment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This time slot is already booked"
        )
    
    # Create appointment
    appointment = Appointment(
        patient_id=current_patient.id,
        doctor_id=appointment_data.doctor_id,
        date=appointment_data.appointment_date,
        time=appointment_data.appointment_time,
        status="Pending",
        reason=appointment_data.reason,
        symptoms=appointment_data.symptoms,
    )
    
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    
    # Return appointment with doctor info
    return AppointmentOut(
        id=appointment.id,
        appointment_date=appointment.date,
        appointment_time=appointment.time,
        status=appointment.status,
        reason=appointment.reason,
        symptoms=appointment.symptoms,
        doctor_name=doctor.name,
        doctor_specialization=doctor.specialization,
    )


@router.get("/doctors/my-appointments", response_model=List[DoctorAppointmentResponse])
async def get_doctor_appointments(
    status_filter: Optional[str] = Query(None, alias="status_filter"),
    current_doctor: Doctor = Depends(get_current_doctor),
    db: Session = Depends(get_db),
):
    """
    Get all appointments for the current doctor, optionally filtered by status.
    """
    query = db.query(Appointment).filter(Appointment.doctor_id == current_doctor.id)
    
    if status_filter:
        query = query.filter(Appointment.status == status_filter)
    
    appointments = query.order_by(Appointment.date.desc(), Appointment.time.desc()).all()
    
    results = []
    for apt in appointments:
        patient = db.query(Patient).filter(Patient.id == apt.patient_id).first()
        if patient:
            results.append(DoctorAppointmentResponse(
                id=apt.id,
                appointment_date=apt.date,
                appointment_time=apt.time,
                status=apt.status,
                reason=apt.reason,
                symptoms=apt.symptoms,
                patient_name=patient.name,
                patient_email=patient.email,
                patient_phone=patient.phone,
                created_at=apt.created_at,
                updated_at=apt.updated_at,
            ))
    
    return results


@router.patch("/{appointment_id}/confirm", response_model=DoctorAppointmentResponse)
async def confirm_appointment(
    appointment_id: int,
    current_doctor: Doctor = Depends(get_current_doctor),
    db: Session = Depends(get_db),
):
    """
    Confirm an appointment (doctor action).
    """
    appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id,
        Appointment.doctor_id == current_doctor.id
    ).first()
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    
    if appointment.status == "Cancelled":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot confirm a cancelled appointment"
        )
    
    appointment.status = "Confirmed"
    db.commit()
    db.refresh(appointment)
    
    patient = db.query(Patient).filter(Patient.id == appointment.patient_id).first()
    return DoctorAppointmentResponse(
        id=appointment.id,
        appointment_date=appointment.date,
        appointment_time=appointment.time,
        status=appointment.status,
        reason=appointment.reason,
        symptoms=appointment.symptoms,
        patient_name=patient.name if patient else "Unknown",
        patient_email=patient.email if patient else "",
        patient_phone=patient.phone if patient else "",
        created_at=appointment.created_at,
        updated_at=appointment.updated_at,
    )


@router.patch("/{appointment_id}/cancel", response_model=DoctorAppointmentResponse)
async def cancel_appointment(
    appointment_id: int,
    current_doctor: Doctor = Depends(get_current_doctor),
    db: Session = Depends(get_db),
):
    """
    Cancel an appointment (doctor action).
    """
    appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id,
        Appointment.doctor_id == current_doctor.id
    ).first()
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    
    appointment.status = "Cancelled"
    db.commit()
    db.refresh(appointment)
    
    patient = db.query(Patient).filter(Patient.id == appointment.patient_id).first()
    return DoctorAppointmentResponse(
        id=appointment.id,
        appointment_date=appointment.date,
        appointment_time=appointment.time,
        status=appointment.status,
        reason=appointment.reason,
        symptoms=appointment.symptoms,
        patient_name=patient.name if patient else "Unknown",
        patient_email=patient.email if patient else "",
        patient_phone=patient.phone if patient else "",
        created_at=appointment.created_at,
        updated_at=appointment.updated_at,
    )


@router.patch("/{appointment_id}/complete", response_model=DoctorAppointmentResponse)
async def complete_appointment(
    appointment_id: int,
    current_doctor: Doctor = Depends(get_current_doctor),
    db: Session = Depends(get_db),
):
    """
    Mark an appointment as completed (doctor action).
    Also closes the associated LiveKit room if configured.
    """
    appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id,
        Appointment.doctor_id == current_doctor.id
    ).first()
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    
    if appointment.status != "Confirmed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only confirmed appointments can be marked as completed"
        )
    
    appointment.status = "Completed"
    db.commit()
    db.refresh(appointment)
    
    # Close LiveKit room if configured
    try:
        from app.core.config import settings
        if settings.LIVEKIT_URL and settings.LIVEKIT_API_KEY and settings.LIVEKIT_API_SECRET:
            try:
                from livekit import api
                
                # Create LiveKit API client
                lk_api = api.LiveKitAPI(
                    settings.LIVEKIT_URL,
                    settings.LIVEKIT_API_KEY,
                    settings.LIVEKIT_API_SECRET
                )
                
                room_name = f"appointment_{appointment_id}_consultation"
                
                # Delete the room (this will end the call and remove all participants)
                import asyncio
                asyncio.create_task(
                    lk_api.room.delete_room(api.DeleteRoomRequest(room=room_name))
                )
                print(f"LiveKit room {room_name} deletion initiated")
            except ImportError as ie:
                print(f"LiveKit SDK not available: {ie}")
            except Exception as lk_error:
                print(f"Failed to delete LiveKit room: {lk_error}")
    except Exception as e:
        print(f"Error during LiveKit room cleanup: {e}")
        # Don't fail the appointment completion if room deletion fails
    
    patient = db.query(Patient).filter(Patient.id == appointment.patient_id).first()
    return DoctorAppointmentResponse(
        id=appointment.id,
        appointment_date=appointment.date,
        appointment_time=appointment.time,
        status=appointment.status,
        reason=appointment.reason,
        symptoms=appointment.symptoms,
        patient_name=patient.name if patient else "Unknown",
        patient_email=patient.email if patient else "",
        patient_phone=patient.phone if patient else "",
        created_at=appointment.created_at,
        updated_at=appointment.updated_at,
    )

