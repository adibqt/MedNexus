from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from typing import Dict, List
import json
import asyncio
from datetime import datetime

from app.db import get_db, SessionLocal
from app.models import Patient, Doctor, Appointment
from app.services import get_current_patient, get_current_doctor
from app.core.config import settings
from app.schemas.video_call import InitiateCallRequest, VideoCallRequest, JoinRoomResponse

try:
    from livekit import api
    LIVEKIT_AVAILABLE = True
except ImportError:
    LIVEKIT_AVAILABLE = False
    api = None

router = APIRouter(prefix="/api/livekit", tags=["livekit"])

# WebSocket connection manager for call notifications
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.user_connections: Dict[int, str] = {}  # user_id -> connection_id
    
    async def connect(self, websocket: WebSocket, user_id: int, user_type: str):
        await websocket.accept()
        connection_id = f"{user_type}_{user_id}_{datetime.now().timestamp()}"
        self.active_connections[connection_id] = websocket
        self.user_connections[user_id] = connection_id
        return connection_id
    
    def disconnect(self, connection_id: str, user_id: int):
        if connection_id in self.active_connections:
            del self.active_connections[connection_id]
        if user_id in self.user_connections:
            del self.user_connections[user_id]
    
    async def send_personal_message(self, message: dict, user_id: int):
        print(f"Attempting to send message to user {user_id}: {message}")
        print(f"Active connections: {list(self.user_connections.keys())}")
        if user_id in self.user_connections:
            connection_id = self.user_connections[user_id]
            if connection_id in self.active_connections:
                websocket = self.active_connections[connection_id]
                try:
                    await websocket.send_json(message)
                    print(f"Successfully sent message to user {user_id}")
                except Exception as e:
                    print(f"Error sending message to user {user_id}: {e}")
            else:
                print(f"Connection ID {connection_id} not found in active_connections")
        else:
            print(f"User {user_id} not found in user_connections")
    
    async def broadcast(self, message: dict):
        for connection in self.active_connections.values():
            try:
                await connection.send_json(message)
            except Exception as e:
                print(f"Error broadcasting message: {e}")

manager = ConnectionManager()


@router.post("/join-appointment", response_model=JoinRoomResponse)
async def join_appointment_call(
    request: VideoCallRequest,
    current_patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db),
):
    """
    Generate LiveKit access token for patient to join appointment video call.
    Follows the guide structure: appointment_{id}_consultation room naming.
    """
    if not settings.LIVEKIT_URL or not settings.LIVEKIT_API_KEY or not settings.LIVEKIT_API_SECRET:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="LiveKit is not configured"
        )
    
    if not LIVEKIT_AVAILABLE:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="LiveKit SDK not available"
        )
    
    # 1. Validate appointment exists
    appointment = db.query(Appointment).filter(
        Appointment.id == request.appointment_id
    ).first()
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    
    # 2. Check authorization (patient of this appointment)
    if appointment.patient_id != current_patient.id:
        print(f"Authorization failed: Current patient ID {current_patient.id} != Appointment patient ID {appointment.patient_id}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Not authorized to join this appointment. You are patient {current_patient.id}, but appointment belongs to patient {appointment.patient_id}"
        )
    
    # 3. Check if appointment is confirmed (optional - allow joining even if pending)
    # if appointment.status != "Confirmed":
    #     raise HTTPException(
    #         status_code=status.HTTP_400_BAD_REQUEST,
    #         detail="Appointment must be confirmed to join video call"
    #     )
    
    # 3. Generate room name (consistent format from guide)
    room_name = f"appointment_{request.appointment_id}_{request.room_type}"
    
    # 4. Create unique participant identity (patient_{id})
    participant_identity = f"patient_{current_patient.id}"
    participant_name = current_patient.name or f"Patient {current_patient.id}"
    
    # 5. Generate and return token
    try:
        token = api.AccessToken(settings.LIVEKIT_API_KEY, settings.LIVEKIT_API_SECRET) \
            .with_identity(participant_identity) \
            .with_name(participant_name) \
            .with_grants(
                api.VideoGrants(
                    room_join=True,
                    room=room_name,
                    can_publish=True,
                    can_subscribe=True,
                    can_publish_data=True,  # Can send chat messages
                )
            )
        
        token_str = token.to_jwt()
        
        # Ensure URL is properly formatted (wss:// or ws://)
        livekit_url = settings.LIVEKIT_URL.strip()
        if not livekit_url.startswith(('wss://', 'ws://')):
            # If URL doesn't have protocol, assume wss:// for production or ws:// for localhost
            if 'localhost' in livekit_url or '127.0.0.1' in livekit_url:
                livekit_url = f"ws://{livekit_url}"
            else:
                livekit_url = f"wss://{livekit_url}"
        
        return JoinRoomResponse(
            token=token_str,
            url=livekit_url,
            room_name=room_name,
            participant_identity=participant_identity,
            participant_name=participant_name
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate token: {str(e)}"
        )


@router.post("/join-appointment/doctor", response_model=JoinRoomResponse)
async def join_appointment_call_doctor(
    request: VideoCallRequest,
    current_doctor: Doctor = Depends(get_current_doctor),
    db: Session = Depends(get_db),
):
    """
    Generate LiveKit access token for doctor to join appointment video call.
    Follows the guide structure: appointment_{id}_consultation room naming.
    """
    if not settings.LIVEKIT_URL or not settings.LIVEKIT_API_KEY or not settings.LIVEKIT_API_SECRET:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="LiveKit is not configured"
        )
    
    if not LIVEKIT_AVAILABLE:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="LiveKit SDK not available"
        )
    
    # 1. Validate appointment exists
    appointment = db.query(Appointment).filter(
        Appointment.id == request.appointment_id
    ).first()
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    
    # 2. Check authorization (doctor of this appointment)
    if appointment.doctor_id != current_doctor.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to join this appointment"
        )
    
    # 3. Generate room name (consistent format from guide)
    room_name = f"appointment_{request.appointment_id}_{request.room_type}"
    
    # 4. Create unique participant identity (doctor_{id})
    participant_identity = f"doctor_{current_doctor.id}"
    participant_name = f"Dr. {current_doctor.name}" if current_doctor.name else f"Doctor {current_doctor.id}"
    
    # 5. Generate and return token
    try:
        token = api.AccessToken(settings.LIVEKIT_API_KEY, settings.LIVEKIT_API_SECRET) \
            .with_identity(participant_identity) \
            .with_name(participant_name) \
            .with_grants(
                api.VideoGrants(
                    room_join=True,
                    room=room_name,
                    can_publish=True,
                    can_subscribe=True,
                    can_publish_data=True,  # Can send chat messages
                )
            )
        
        token_str = token.to_jwt()
        
        # Ensure URL is properly formatted (wss:// or ws://)
        livekit_url = settings.LIVEKIT_URL.strip()
        if not livekit_url.startswith(('wss://', 'ws://')):
            # If URL doesn't have protocol, assume wss:// for production or ws:// for localhost
            if 'localhost' in livekit_url or '127.0.0.1' in livekit_url:
                livekit_url = f"ws://{livekit_url}"
            else:
                livekit_url = f"wss://{livekit_url}"
        
        return JoinRoomResponse(
            token=token_str,
            url=livekit_url,
            room_name=room_name,
            participant_identity=participant_identity,
            participant_name=participant_name
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate token: {str(e)}"
        )


@router.post("/initiate")
async def initiate_call(
    request: InitiateCallRequest,
    current_patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db),
):
    """
    Patient initiates a video call for a confirmed appointment.
    """
    appointment = db.query(Appointment).filter(
        Appointment.id == request.appointment_id,
        Appointment.patient_id == current_patient.id,
        Appointment.status == "Confirmed"
    ).first()
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found or not confirmed"
        )
    
    # Create room name from appointment (following guide convention)
    room_name = f"appointment_{request.appointment_id}_consultation"
    
    # Send notification to doctor
    await manager.send_personal_message({
        "type": "incoming_call",
        "appointment_id": request.appointment_id,
        "patient_name": current_patient.name,
        "patient_id": current_patient.id,
        "room_name": room_name,
        "timestamp": datetime.utcnow().isoformat()
    }, appointment.doctor_id)
    
    return {
        "room_name": room_name,
        "message": "Call initiated successfully"
    }


@router.post("/initiate/doctor")
async def initiate_call_doctor(
    request: InitiateCallRequest,
    current_doctor: Doctor = Depends(get_current_doctor),
    db: Session = Depends(get_db),
):
    """
    Doctor initiates a video call for a confirmed appointment.
    """
    appointment = db.query(Appointment).filter(
        Appointment.id == request.appointment_id,
        Appointment.doctor_id == current_doctor.id,
        Appointment.status == "Confirmed"
    ).first()
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found or not confirmed"
        )
    
    # Create room name from appointment (following guide convention)
    room_name = f"appointment_{request.appointment_id}_consultation"
    
    # Send notification to patient
    await manager.send_personal_message({
        "type": "incoming_call",
        "appointment_id": request.appointment_id,
        "doctor_name": current_doctor.name,
        "doctor_id": current_doctor.id,
        "room_name": room_name,
        "timestamp": datetime.utcnow().isoformat()
    }, appointment.patient_id)
    
    return {
        "room_name": room_name,
        "message": "Call initiated successfully"
    }


@router.websocket("/notifications/patient/{patient_id}")
async def patient_notifications(websocket: WebSocket, patient_id: int):
    """
    WebSocket endpoint for patient call notifications.
    Requires authentication via token in query params or headers.
    """
    # Get token from query params or headers
    token = None
    if "token" in websocket.query_params:
        token = websocket.query_params.get("token")
    elif "authorization" in websocket.headers:
        auth_header = websocket.headers.get("authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    
    # Validate token and user before accepting connection
    if not token:
        try:
            await websocket.close(code=1008, reason="Authentication required")
        except:
            pass
        return
    
    # Verify token and get patient
    db = None
    try:
        from app.services.auth import decode_token
        
        token_data = decode_token(token)
        
        if token_data.role != "patient":
            try:
                await websocket.close(code=1008, reason="Invalid role")
            except:
                pass
            return
        
        # Verify patient_id matches token
        if token_data.user_id != patient_id:
            try:
                await websocket.close(code=1008, reason="User ID mismatch")
            except:
                pass
            return
        
        # Verify patient exists and is active
        db = SessionLocal()
        patient = db.query(Patient).filter(Patient.id == patient_id).first()
        if not patient or not patient.is_active:
            try:
                await websocket.close(code=1008, reason="Patient not found or inactive")
            except:
                pass
            return
        
    except Exception as e:
        print(f"WebSocket auth error for patient {patient_id}: {e}")
        try:
            await websocket.close(code=1008, reason="Authentication failed")
        except:
            pass
        return
    finally:
        if db:
            db.close()
    
    # Accept connection and proceed
    connection_id = None
    try:
        connection_id = await manager.connect(websocket, patient_id, "patient")
        while True:
            # Keep connection alive and handle incoming messages
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "ping":
                await websocket.send_json({"type": "pong"})
    except WebSocketDisconnect:
        if connection_id:
            manager.disconnect(connection_id, patient_id)
    except Exception as e:
        print(f"WebSocket error for patient {patient_id}: {e}")
        if connection_id:
            manager.disconnect(connection_id, patient_id)


@router.websocket("/notifications/doctor/{doctor_id}")
async def doctor_notifications(websocket: WebSocket, doctor_id: int):
    """
    WebSocket endpoint for doctor call notifications.
    Requires authentication via token in query params or headers.
    """
    # Get token from query params or headers
    token = None
    if "token" in websocket.query_params:
        token = websocket.query_params.get("token")
    elif "authorization" in websocket.headers:
        auth_header = websocket.headers.get("authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    
    # Validate token and user before accepting connection
    if not token:
        try:
            await websocket.close(code=1008, reason="Authentication required")
        except:
            pass
        return
    
    # Verify token and get doctor
    db = None
    try:
        from app.services.auth import decode_token
        
        token_data = decode_token(token)
        
        if token_data.role != "doctor":
            try:
                await websocket.close(code=1008, reason="Invalid role")
            except:
                pass
            return
        
        # Verify doctor_id matches token
        if token_data.user_id != doctor_id:
            try:
                await websocket.close(code=1008, reason="User ID mismatch")
            except:
                pass
            return
        
        # Verify doctor exists and is active
        db = SessionLocal()
        doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
        if not doctor or not doctor.is_active:
            try:
                await websocket.close(code=1008, reason="Doctor not found or inactive")
            except:
                pass
            return
        
    except Exception as e:
        print(f"WebSocket auth error for doctor {doctor_id}: {e}")
        try:
            await websocket.close(code=1008, reason="Authentication failed")
        except:
            pass
        return
    finally:
        if db:
            db.close()
    
    # Accept connection and proceed
    connection_id = None
    try:
        connection_id = await manager.connect(websocket, doctor_id, "doctor")
        while True:
            # Keep connection alive and handle incoming messages
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "ping":
                await websocket.send_json({"type": "pong"})
    except WebSocketDisconnect:
        if connection_id:
            manager.disconnect(connection_id, doctor_id)
    except Exception as e:
        print(f"WebSocket error for doctor {doctor_id}: {e}")
        if connection_id:
            manager.disconnect(connection_id, doctor_id)


@router.get("/room-status/{appointment_id}")
async def get_room_status(
    appointment_id: int,
    current_patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db),
):
    """
    Check if room is active and how many participants are in it.
    Used for polling-based notifications.
    """
    # Verify appointment exists and user is authorized
    appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id,
        Appointment.patient_id == current_patient.id
    ).first()
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    
    room_name = f"appointment_{appointment_id}_consultation"
    
    # Check LiveKit room status
    is_active = False
    participant_count = 0
    
    if settings.LIVEKIT_URL and settings.LIVEKIT_API_KEY and settings.LIVEKIT_API_SECRET and LIVEKIT_AVAILABLE:
        try:
            # Use LiveKit SDK to list rooms
            livekit_api = api.LiveKitAPI(
                settings.LIVEKIT_URL,
                settings.LIVEKIT_API_KEY,
                settings.LIVEKIT_API_SECRET
            )
            
            # List rooms and check if our room exists
            rooms = await livekit_api.room.list_rooms(api.ListRoomsRequest(names=[room_name]))
            
            print(f"[room-status] Patient checking room {room_name}, found {len(rooms.rooms)} rooms")
            
            if len(rooms.rooms) > 0:
                room = rooms.rooms[0]
                is_active = True
                participant_count = room.num_participants
                print(f"[room-status] Room {room_name} is active with {participant_count} participants")
            else:
                print(f"[room-status] Room {room_name} not found or empty")
                
        except Exception as e:
            print(f"Error checking LiveKit room status: {e}")
            import traceback
            traceback.print_exc()
            # Return default values if check fails
    
    return {
        "is_active": is_active,
        "participant_count": participant_count,
        "room_name": room_name
    }


@router.get("/room-status/{appointment_id}/doctor")
async def get_room_status_doctor(
    appointment_id: int,
    current_doctor: Doctor = Depends(get_current_doctor),
    db: Session = Depends(get_db),
):
    """
    Check if room is active and how many participants are in it (doctor version).
    Used for polling-based notifications.
    """
    # Verify appointment exists and user is authorized
    appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id,
        Appointment.doctor_id == current_doctor.id
    ).first()
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    
    room_name = f"appointment_{appointment_id}_consultation"
    
    # Check LiveKit room status
    is_active = False
    participant_count = 0
    
    if settings.LIVEKIT_URL and settings.LIVEKIT_API_KEY and settings.LIVEKIT_API_SECRET and LIVEKIT_AVAILABLE:
        try:
            # Use LiveKit SDK to list rooms
            livekit_api = api.LiveKitAPI(
                settings.LIVEKIT_URL,
                settings.LIVEKIT_API_KEY,
                settings.LIVEKIT_API_SECRET
            )
            
            # List rooms and check if our room exists
            rooms = await livekit_api.room.list_rooms(api.ListRoomsRequest(names=[room_name]))
            
            print(f"[room-status] Doctor checking room {room_name}, found {len(rooms.rooms)} rooms")
            
            if len(rooms.rooms) > 0:
                room = rooms.rooms[0]
                is_active = True
                participant_count = room.num_participants
                print(f"[room-status] Room {room_name} is active with {participant_count} participants")
            else:
                print(f"[room-status] Room {room_name} not found or empty")
                
        except Exception as e:
            print(f"Error checking LiveKit room status: {e}")
            import traceback
            traceback.print_exc()
            # Return default values if check fails
    
    return {
        "is_active": is_active,
        "participant_count": participant_count,
        "room_name": room_name
    }

