from fastapi import APIRouter, status
from datetime import datetime

router = APIRouter()


@router.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    """
    Health check endpoint to verify API is running
    """
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "MedNexus API"
    }


@router.get("/", status_code=status.HTTP_200_OK)
async def root():
    """
    Root endpoint
    """
    return {
        "message": "Welcome to MedNexus API",
        "version": "1.0.0",
        "docs": "/docs"
    }
