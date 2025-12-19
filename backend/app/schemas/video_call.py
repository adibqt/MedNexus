from pydantic import BaseModel
from typing import Optional

class VideoCallRequest(BaseModel):
    appointment_id: int
    room_type: str = "consultation"

class InitiateCallRequest(BaseModel):
    appointment_id: int

class JoinRoomResponse(BaseModel):
    token: str
    url: str
    room_name: str
    participant_identity: str
    participant_name: str
