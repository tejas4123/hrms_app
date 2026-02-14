import datetime as dt
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import func

from database import get_db
from models import Employee, Attendance
from schemas import (
    AttendanceCreate,
    AttendanceResponse,
    AttendanceListResponse,
    DashboardSummary,
)

router = APIRouter(prefix="/api/attendance", tags=["Attendance"])


@router.post(
    "",
    response_model=AttendanceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Mark attendance for an employee",
)
def mark_attendance(payload: AttendanceCreate, db: Session = Depends(get_db)):
    # Verify employee exists
    employee = (
        db.query(Employee)
        .filter(Employee.employee_id == payload.employee_id)
        .first()
    )
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee '{payload.employee_id}' not found.",
        )

    # Check for duplicate attendance on the same date
    existing = (
        db.query(Attendance)
        .filter(
            Attendance.employee_id == payload.employee_id,
            Attendance.date == payload.date,
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Attendance for '{payload.employee_id}' on {payload.date} already recorded.",
        )

    record = Attendance(
        employee_id=payload.employee_id,
        date=payload.date,
        status=payload.status.value,
    )

    try:
        db.add(record)
        db.commit()
        db.refresh(record)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Attendance record already exists for this date.",
        )

    return record


@router.get(
    "/summary",
    response_model=DashboardSummary,
    summary="Dashboard summary — employee counts and today's attendance",
)
def get_summary(db: Session = Depends(get_db)):
    total_employees = db.query(func.count(Employee.id)).scalar() or 0
    today = dt.date.today()

    present_today = (
        db.query(func.count(Attendance.id))
        .filter(Attendance.date == today, Attendance.status == "Present")
        .scalar()
        or 0
    )
    absent_today = (
        db.query(func.count(Attendance.id))
        .filter(Attendance.date == today, Attendance.status == "Absent")
        .scalar()
        or 0
    )

    attendance_rate = 0.0
    if total_employees > 0:
        attendance_rate = round((present_today / total_employees) * 100, 1)

    return DashboardSummary(
        total_employees=total_employees,
        present_today=present_today,
        absent_today=absent_today,
        attendance_rate=attendance_rate,
    )


@router.get(
    "/{employee_id}",
    response_model=AttendanceListResponse,
    summary="Get attendance records for an employee (with optional date range filter)",
)
def get_attendance(
    employee_id: str,
    date_from: Optional[dt.date] = Query(None, description="Start date filter"),
    date_to: Optional[dt.date] = Query(None, description="End date filter"),
    db: Session = Depends(get_db),
):
    # Verify employee exists
    employee = (
        db.query(Employee)
        .filter(Employee.employee_id == employee_id)
        .first()
    )
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee '{employee_id}' not found.",
        )

    query = db.query(Attendance).filter(Attendance.employee_id == employee_id)

    if date_from:
        query = query.filter(Attendance.date >= date_from)
    if date_to:
        query = query.filter(Attendance.date <= date_to)

    records = query.order_by(Attendance.date.desc()).all()
    return AttendanceListResponse(records=records, total=len(records))
