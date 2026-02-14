from datetime import datetime, date
from sqlalchemy import (
    Column, Integer, String, Date, DateTime, Enum, ForeignKey, UniqueConstraint
)
from sqlalchemy.orm import relationship
import enum
from database import Base


class AttendanceStatus(str, enum.Enum):
    PRESENT = "Present"
    ABSENT = "Absent"


class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, autoincrement=True)
    employee_id = Column(String(50), unique=True, nullable=False, index=True)
    full_name = Column(String(150), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    department = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    attendance_records = relationship(
        "Attendance", back_populates="employee", cascade="all, delete-orphan"
    )


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, autoincrement=True)
    employee_id = Column(
        String(50),
        ForeignKey("employees.employee_id", ondelete="CASCADE"),
        nullable=False,
    )
    date = Column(Date, nullable=False, default=date.today)
    status = Column(String(10), nullable=False)  # "Present" or "Absent"
    created_at = Column(DateTime, default=datetime.utcnow)

    employee = relationship("Employee", back_populates="attendance_records")

    __table_args__ = (
        UniqueConstraint("employee_id", "date", name="uq_employee_date"),
    )
