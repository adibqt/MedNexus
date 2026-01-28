from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db import get_db
from app.services import revoke_refresh_token, get_current_patient
from app.schemas import MessageResponse, RefreshTokenRequest

router = APIRouter(prefix="/api/patients", tags=["patients"])

@router.post("/logout", response_model=MessageResponse)
async def logout(
    request: RefreshTokenRequest,
    db: Session = Depends(get_db),
    current_patient=Depends(get_current_patient)
):
    """Logout patient by revoking the refresh token"""
    success = revoke_refresh_token(request.refresh_token, db)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid refresh token or already revoked"
        )
    return MessageResponse(message="Logged out successfully.")
