import { NavLink } from "react-router-dom";

export default function Sidebar() {
    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <h1>HRMS Lite</h1>
                <span>Admin Panel</span>
            </div>

            <nav className="sidebar-nav">
                <NavLink
                    to="/"
                    end
                    className={({ isActive }) =>
                        `sidebar-link${isActive ? " active" : ""}`
                    }
                >
                    <span className="sidebar-icon">📊</span>
                    <span>Dashboard</span>
                </NavLink>

                <NavLink
                    to="/employees"
                    className={({ isActive }) =>
                        `sidebar-link${isActive ? " active" : ""}`
                    }
                >
                    <span className="sidebar-icon">👥</span>
                    <span>Employees</span>
                </NavLink>

                <NavLink
                    to="/attendance"
                    className={({ isActive }) =>
                        `sidebar-link${isActive ? " active" : ""}`
                    }
                >
                    <span className="sidebar-icon">📋</span>
                    <span>Attendance</span>
                </NavLink>
            </nav>
        </aside>
    );
}
