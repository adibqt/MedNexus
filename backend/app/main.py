from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
from pathlib import Path
import uvicorn

from app.core.config import settings
from app.api.routes import health, patient, admin, doctor, appointment
from app.db import Base, engine

# Create database tables
Base.metadata.create_all(bind=engine)

# Create uploads directory
UPLOAD_DIR = Path("uploads/profile_pictures")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Lightweight dev migration: add newly introduced columns for existing DBs
# and seed core lookup data such as doctor specializations.
try:
    with engine.begin() as conn:
        # Patients
        conn.execute(
            text("ALTER TABLE patients ADD COLUMN IF NOT EXISTS blood_group VARCHAR(3)")
        )
        conn.execute(
            text(
                "ALTER TABLE patients ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(500)"
            )
        )
        conn.execute(
            text("ALTER TABLE patients ADD COLUMN IF NOT EXISTS gender VARCHAR(10)")
        )
        # Doctors
        conn.execute(
            text(
                "ALTER TABLE doctors ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)"
            )
        )
        conn.execute(text("ALTER TABLE doctors ADD COLUMN IF NOT EXISTS schedule TEXT"))

        # Appointments: update status default if table exists
        try:
            conn.execute(text("ALTER TABLE appointments ALTER COLUMN status SET DEFAULT 'Pending'"))
        except Exception:
            # Table might not exist yet, SQLAlchemy will create it with correct default
            pass

        # Core lookup: doctor specializations (from doctor sign-up page)
        conn.execute(
            text(
                """
                INSERT INTO specializations (name, description, is_active)
                VALUES
                  ('General Physician', 'General Physician – Fever, Fatigue, Weakness', TRUE),
                  ('Cardiologist', 'Cardiologist – Chest Pain, Shortness of Breath', TRUE),
                  ('Pulmonologist', 'Pulmonologist – Cough, Breathing Issues', TRUE),
                  ('Neurologist', 'Neurologist – Headache, Dizziness', TRUE),
                  ('Gastroenterologist', 'Gastroenterologist – Abdominal Pain, Nausea', TRUE),
                  ('Dermatologist', 'Dermatologist – Rash, Skin Problems', TRUE)
                ON CONFLICT (name) DO NOTHING;
                """
            )
        )

        # Core lookup: symptoms used in patient dashboard, mapped to specializations
        conn.execute(
            text(
                """
                INSERT INTO symptoms (name, description, specialization, is_active)
                VALUES
                  ('Abdominal pain', 'Lower or upper abdominal pain', 'Gastroenterologist', TRUE),
                  ('Adenoviruses', 'Common viral respiratory infections', 'Pulmonologist', TRUE),
                  ('Anxiety', 'Persistent worry or nervousness', 'Neurologist', TRUE),
                  ('Back pain', 'Lower or upper back pain', 'General Physician', TRUE),
                  ('Chest pain', 'Pain or pressure in the chest area', 'Cardiologist', TRUE),
                  ('Chest Pain', 'Pain or pressure in the chest area', 'Cardiologist', TRUE),
                  ('Cough', 'Dry or productive cough', 'Pulmonologist', TRUE),
                  ('Depression', 'Low mood and loss of interest', 'Neurologist', TRUE),
                  ('Diarrhea', 'Loose or watery stools', 'Gastroenterologist', TRUE),
                  ('Dizziness', 'Feeling light‑headed or unsteady', 'Neurologist', TRUE),
                  ('Fatigue', 'Tiredness or lack of energy', 'General Physician', TRUE),
                  ('Fever', 'Raised body temperature', 'General Physician', TRUE),
                  ('Headache', 'Mild to severe head pain', 'Neurologist', TRUE),
                  ('Infection', 'General signs of infection', 'General Physician', TRUE),
                  ('Insomnia', 'Difficulty falling or staying asleep', 'Neurologist', TRUE),
                  ('Joint pain', 'Pain or stiffness in joints', 'General Physician', TRUE),
                  ('Muscle pain', 'Muscular aches and soreness', 'General Physician', TRUE),
                  ('Nausea', 'Feeling sick or urge to vomit', 'Gastroenterologist', TRUE),
                  ('Rash', 'Skin rash or irritation', 'Dermatologist', TRUE),
                  ('Rhinoviruses', 'Common cold / nasal infection', 'Pulmonologist', TRUE),
                  ('Temperature', 'High body temperature / feverish', 'General Physician', TRUE),
                  ('Weakness', 'Generalized weakness', 'General Physician', TRUE)
                ON CONFLICT (name) DO NOTHING;
                """
            )
        )
except Exception as _e:
    # Don't block app startup if migration isn't supported (or DB is read-only).
    pass

# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="MedNexus - Healthcare Management System API",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, tags=["health"])
app.include_router(patient.router)
app.include_router(doctor.router)
app.include_router(admin.router)
app.include_router(appointment.router)

# Mount static files for uploads
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={
            "message": "Internal server error",
            "detail": str(exc) if settings.DEBUG else "An error occurred"
        }
    )

# Startup event
@app.on_event("startup")
async def startup_event():
    print(f"🚀 {settings.APP_NAME} v{settings.APP_VERSION} starting...")
    print(f"📝 API Documentation: http://localhost:{settings.PORT}/docs")
    print(f"🔧 Debug Mode: {settings.DEBUG}")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    print(f"👋 {settings.APP_NAME} shutting down...")


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
