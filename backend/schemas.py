import datetime as dt
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field
from enum import Enum


# ---------- Enums ----------

class AttendanceStatusEnum(str, Enum):
    PRESENT = "Present"
    ABSENT = "Absent"


# ---------- Employee Schemas ----------

class EmployeeCreate(BaseModel):
    employee_id: str = Field(
        ..., min_length=1, max_length=50, description="Unique employee identifier"
    )
    full_name: str = Field(
        ..., min_length=1, max_length=150, description="Employee full name"
    )
    email: EmailStr = Field(..., description="Employee email address")
    department: str = Field(
        ..., min_length=1, max_length=100, description="Department name"
    )


class EmployeeResponse(BaseModel):
    id: int
    employee_id: str
    full_name: str
    email: str
    department: str
    created_at: dt.datetime

    model_config = {"from_attributes": True}


class EmployeeListResponse(BaseModel):
    employees: List[EmployeeResponse]
    total: int


# ---------- Attendance Schemas ----------

class AttendanceCreate(BaseModel):
    employee_id: str = Field(..., min_length=1, description="Employee ID")
    date: dt.date = Field(..., description="Attendance date")
    status: AttendanceStatusEnum = Field(..., description="Present or Absent")


class AttendanceResponse(BaseModel):
    id: int
    employee_id: str
    date: dt.date
    status: str
    created_at: dt.datetime

    model_config = {"from_attributes": True}


class AttendanceListResponse(BaseModel):
    records: List[AttendanceResponse]
    total: int


# ---------- Dashboard Summary ----------

class DashboardSummary(BaseModel):
    total_employees: int
    present_today: int
    absent_today: int
    attendance_rate: float  # percentage

