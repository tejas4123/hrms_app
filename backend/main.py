import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from database import engine, Base
from routers.employees import router as employees_router
from routers.attendance import router as attendance_router

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create database tables on startup."""
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="HRMS Lite API",
    description="Lightweight Human Resource Management System — Employee & Attendance Management",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────
raw_origins = os.getenv("CORS_ORIGINS", "*")
origins = ["*"] if raw_origins.strip() == "*" else [o.strip() for o in raw_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────
app.include_router(employees_router)
app.include_router(attendance_router)


@app.get("/", tags=["Health"])
def health_check():
    return {"status": "healthy", "service": "HRMS Lite API"}
