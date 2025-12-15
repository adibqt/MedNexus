from fastapi import APIRouter

api_router = APIRouter()

# Import and include routers
from app.api.routes import health, patient

api_router.include_router(health.router, tags=["health"])
api_router.include_router(patient.router, tags=["patients"])
