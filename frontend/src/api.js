const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request(url, options = {}) {
    const res = await fetch(`${API_BASE}${url}`, {
        headers: { "Content-Type": "application/json", ...options.headers },
        ...options,
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const message = body.detail || `Request failed (${res.status})`;
        throw new Error(message);
    }

    return res.json();
}

// ── Employees ────────────────────────────────
export const getEmployees = () => request("/api/employees");

export const getEmployee = (id) => request(`/api/employees/${id}`);

export const createEmployee = (data) =>
    request("/api/employees", {
        method: "POST",
        body: JSON.stringify(data),
    });

export const deleteEmployee = (id) =>
    request(`/api/employees/${id}`, { method: "DELETE" });

// ── Attendance ───────────────────────────────
export const markAttendance = (data) =>
    request("/api/attendance", {
        method: "POST",
        body: JSON.stringify(data),
    });

export const getAttendance = (employeeId, dateFrom, dateTo) => {
    const params = new URLSearchParams();
    if (dateFrom) params.set("date_from", dateFrom);
    if (dateTo) params.set("date_to", dateTo);
    const qs = params.toString();
    return request(`/api/attendance/${employeeId}${qs ? `?${qs}` : ""}`);
};

export const getDashboardSummary = () => request("/api/attendance/summary");
