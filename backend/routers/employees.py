from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List

from database import get_db
from models import Employee
from schemas import EmployeeCreate, EmployeeResponse, EmployeeListResponse

router = APIRouter(prefix="/api/employees", tags=["Employees"])


@router.post(
    "",
    response_model=EmployeeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a new employee",
)
def create_employee(payload: EmployeeCreate, db: Session = Depends(get_db)):
    # Check for duplicate employee_id
    existing = (
        db.query(Employee)
        .filter(Employee.employee_id == payload.employee_id)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Employee with ID '{payload.employee_id}' already exists.",
        )

    # Check for duplicate email
    existing_email = (
        db.query(Employee).filter(Employee.email == payload.email).first()
    )
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"An employee with email '{payload.email}' already exists.",
        )

    employee = Employee(
        employee_id=payload.employee_id,
        full_name=payload.full_name,
        email=payload.email,
        department=payload.department,
    )

    try:
        db.add(employee)
        db.commit()
        db.refresh(employee)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Duplicate employee ID or email.",
        )

    return employee


@router.get(
    "",
    response_model=EmployeeListResponse,
    summary="List all employees",
)
def list_employees(db: Session = Depends(get_db)):
    employees = db.query(Employee).order_by(Employee.created_at.desc()).all()
    return EmployeeListResponse(employees=employees, total=len(employees))


@router.get(
    "/{employee_id}",
    response_model=EmployeeResponse,
    summary="Get a single employee by employee_id",
)
def get_employee(employee_id: str, db: Session = Depends(get_db)):
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
    return employee


@router.delete(
    "/{employee_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete an employee and their attendance records",
)
def delete_employee(employee_id: str, db: Session = Depends(get_db)):
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

    db.delete(employee)
    db.commit()
    return {"message": f"Employee '{employee_id}' deleted successfully."}
