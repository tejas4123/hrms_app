# HRMS Lite

A lightweight, professional Human Resource Management System built as a full-stack web application.

![Tech Stack](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-blue)
![Tech Stack](https://img.shields.io/badge/Backend-FastAPI-green)
![Tech Stack](https://img.shields.io/badge/Database-PostgreSQL-blue)

## Features

- **Employee Management** — Add, view, and delete employee records  
- **Attendance Tracking** — Mark daily attendance (Present / Absent) per employee  
- **Dashboard** — Summary cards showing total employees, today's attendance, and attendance rate  
- **Date Filters** — Filter attendance records by date range  
- **Per-Employee Stats** — Total present/absent days and attendance percentage  
- **Validation** — Both client-side and server-side validation with meaningful error messages  
- **Professional UI** — Dark theme, glassmorphism cards, smooth animations, responsive layout  

## Tech Stack

| Layer      | Technology                              |
|------------|------------------------------------------|
| Frontend   | React 18 + Vite, Vanilla CSS             |
| Backend    | Python FastAPI                            |
| Database   | PostgreSQL via SQLAlchemy + psycopg2     |
| Deployment | Render (backend + DB), Vercel (frontend)  |

## Project Structure

```
hrms/
├── backend/
│   ├── main.py              # FastAPI entry point
│   ├── database.py           # SQLAlchemy engine & session
│   ├── models.py             # Employee & Attendance tables
│   ├── schemas.py            # Pydantic validation schemas
│   ├── requirements.txt      # Python dependencies
│   ├── .env.example          # Environment config template
│   └── routers/
│       ├── employees.py      # Employee CRUD endpoints
│       └── attendance.py     # Attendance endpoints + dashboard
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Root component with routing
│   │   ├── api.js            # API client
│   │   ├── index.css         # Design system & styles
│   │   ├── components/       # Reusable UI components
│   │   └── pages/            # Dashboard, Employees, Attendance
│   └── index.html
├── docker-compose.yml       # Docker stack (PostgreSQL + Backend + Frontend)
└── README.md
```

## Running Locally

### Prerequisites

- **Docker** (recommended) or:
  - **Node.js** ≥ 18  
  - **Python** ≥ 3.9  
  - **PostgreSQL** instance

### Option A: Docker (Recommended)

```bash
docker-compose up --build
```

This starts PostgreSQL, backend (`http://localhost:8000`), and frontend (`http://localhost:5173`) automatically.

### Option B: Manual Setup

#### 1. Database

Create a PostgreSQL database called `hrms_db`. Tables auto-create on first backend start.

#### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env with your PostgreSQL connection string

uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.  
Interactive docs at `http://localhost:8000/docs`.

#### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.

| Variable       | Description                          | Default                                  |
|----------------|--------------------------------------|------------------------------------------|
| `DATABASE_URL`  | PostgreSQL connection string         | `postgresql://postgres:postgres@localhost:5432/hrms_db` |
| `CORS_ORIGINS`  | Allowed frontend origins (comma-sep) | `http://localhost:5173`                  |
| `VITE_API_URL`  | Backend API URL (frontend)           | `http://localhost:8000`                  |

Tables are auto-created on first startup — no manual migration needed.

## API Endpoints

| Method | Endpoint                    | Description                        |
|--------|-----------------------------|------------------------------------|
| GET    | `/`                         | Health check                       |
| POST   | `/api/employees`            | Add a new employee                 |
| GET    | `/api/employees`            | List all employees                 |
| GET    | `/api/employees/{id}`       | Get employee by ID                 |
| DELETE | `/api/employees/{id}`       | Delete employee + attendance       |
| POST   | `/api/attendance`           | Mark attendance                    |
| GET    | `/api/attendance/summary`   | Dashboard summary                  |
| GET    | `/api/attendance/{emp_id}`  | Employee attendance (filterable)   |

## Assumptions & Limitations

- Single admin user — no authentication required  
- Leave management, payroll, and advanced HR features are out of scope  
- SQLAlchemy auto-creates tables on startup; no separate migration tool required  
- Database: PostgreSQL (can use Render, Railway, Supabase, or Neon for free hosted instances)
