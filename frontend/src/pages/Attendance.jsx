import { useState, useEffect } from "react";
import TopBar from "../components/TopBar";
import { LoadingSpinner, EmptyState, ErrorState } from "../components/UIStates";
import Toast from "../components/Toast";
import {
    getEmployees,
    getAttendance,
    markAttendance,
} from "../api";

export default function Attendance() {
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState("");
    const [records, setRecords] = useState([]);
    const [loadingEmp, setLoadingEmp] = useState(true);
    const [loadingRec, setLoadingRec] = useState(false);
    const [error, setError] = useState(null);
    const [showMarkModal, setShowMarkModal] = useState(false);
    const [toast, setToast] = useState(null);

    // Filters
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    // Stats
    const [presentCount, setPresentCount] = useState(0);
    const [absentCount, setAbsentCount] = useState(0);

    const fetchEmployees = async () => {
        setLoadingEmp(true);
        try {
            const data = await getEmployees();
            setEmployees(data.employees);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoadingEmp(false);
        }
    };

    const fetchAttendance = async (empId, from, to) => {
        if (!empId) return;
        setLoadingRec(true);
        setError(null);
        try {
            const data = await getAttendance(empId, from || undefined, to || undefined);
            setRecords(data.records);
            const p = data.records.filter((r) => r.status === "Present").length;
            setPresentCount(p);
            setAbsentCount(data.records.length - p);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoadingRec(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    useEffect(() => {
        if (selectedEmployee) {
            fetchAttendance(selectedEmployee, dateFrom, dateTo);
        } else {
            setRecords([]);
            setPresentCount(0);
            setAbsentCount(0);
        }
    }, [selectedEmployee, dateFrom, dateTo]);

    const handleMark = async (formData) => {
        try {
            await markAttendance(formData);
            setShowMarkModal(false);
            setToast({ type: "success", message: "Attendance marked successfully!" });
            fetchAttendance(selectedEmployee, dateFrom, dateTo);
        } catch (err) {
            throw err;
        }
    };

    const selectedEmpData = employees.find(
        (e) => e.employee_id === selectedEmployee
    );

    return (
        <>
            <TopBar title="Attendance Management">
                {selectedEmployee && (
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowMarkModal(true)}
                    >
                        + Mark Attendance
                    </button>
                )}
            </TopBar>

            <div className="page-container">
                {loadingEmp && <LoadingSpinner text="Loading employees..." />}
                {!loadingEmp && employees.length === 0 && (
                    <EmptyState
                        icon="👥"
                        title="No employees found"
                        message="Add employees first before managing attendance."
                    />
                )}

                {!loadingEmp && employees.length > 0 && (
                    <>
                        {/* Employee selector */}
                        <div className="employee-selector">
                            <label
                                style={{
                                    display: "block",
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: "var(--text-secondary)",
                                    marginBottom: 8,
                                }}
                            >
                                Select Employee
                            </label>
                            <select
                                className="form-select"
                                value={selectedEmployee}
                                onChange={(e) => setSelectedEmployee(e.target.value)}
                            >
                                <option value="">-- Choose an employee --</option>
                                {employees.map((emp) => (
                                    <option key={emp.employee_id} value={emp.employee_id}>
                                        {emp.full_name} ({emp.employee_id})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedEmployee && (
                            <>
                                {/* Stats row */}
                                <div className="summary-grid" style={{ marginBottom: 20 }}>
                                    <div className="summary-card success">
                                        <div className="summary-card-icon">✅</div>
                                        <div className="summary-card-value">{presentCount}</div>
                                        <div className="summary-card-label">Present Days</div>
                                    </div>
                                    <div className="summary-card danger">
                                        <div className="summary-card-icon">❌</div>
                                        <div className="summary-card-value">{absentCount}</div>
                                        <div className="summary-card-label">Absent Days</div>
                                    </div>
                                    <div className="summary-card info">
                                        <div className="summary-card-icon">📊</div>
                                        <div className="summary-card-value">
                                            {records.length > 0
                                                ? Math.round((presentCount / records.length) * 100)
                                                : 0}
                                            %
                                        </div>
                                        <div className="summary-card-label">Attendance Rate</div>
                                    </div>
                                </div>

                                {/* Filters */}
                                <div className="filter-bar">
                                    <div>
                                        <label
                                            style={{
                                                fontSize: 12,
                                                color: "var(--text-muted)",
                                                display: "block",
                                                marginBottom: 4,
                                            }}
                                        >
                                            From
                                        </label>
                                        <input
                                            type="date"
                                            className="form-input"
                                            value={dateFrom}
                                            onChange={(e) => setDateFrom(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label
                                            style={{
                                                fontSize: 12,
                                                color: "var(--text-muted)",
                                                display: "block",
                                                marginBottom: 4,
                                            }}
                                        >
                                            To
                                        </label>
                                        <input
                                            type="date"
                                            className="form-input"
                                            value={dateTo}
                                            onChange={(e) => setDateTo(e.target.value)}
                                        />
                                    </div>
                                    {(dateFrom || dateTo) && (
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            style={{ alignSelf: "flex-end", marginBottom: 2 }}
                                            onClick={() => {
                                                setDateFrom("");
                                                setDateTo("");
                                            }}
                                        >
                                            Clear Filters
                                        </button>
                                    )}
                                </div>

                                {loadingRec && <LoadingSpinner text="Loading records..." />}
                                {error && (
                                    <ErrorState
                                        message={error}
                                        onRetry={() =>
                                            fetchAttendance(selectedEmployee, dateFrom, dateTo)
                                        }
                                    />
                                )}

                                {!loadingRec && !error && records.length === 0 && (
                                    <EmptyState
                                        icon="📋"
                                        title="No attendance records"
                                        message={`No records found for ${selectedEmpData?.full_name || "this employee"}. Click "Mark Attendance" to add one.`}
                                    />
                                )}

                                {!loadingRec && !error && records.length > 0 && (
                                    <div className="table-container">
                                        <div className="table-header">
                                            <h3>
                                                Attendance — {selectedEmpData?.full_name}
                                            </h3>
                                            <span className="table-header-badge">
                                                {records.length} records
                                            </span>
                                        </div>
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Date</th>
                                                    <th>Status</th>
                                                    <th>Recorded At</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {records.map((r) => (
                                                    <tr key={r.id}>
                                                        <td>
                                                            {new Date(r.date).toLocaleDateString("en-US", {
                                                                weekday: "short",
                                                                year: "numeric",
                                                                month: "short",
                                                                day: "numeric",
                                                            })}
                                                        </td>
                                                        <td>
                                                            <span
                                                                className={`badge badge-${r.status.toLowerCase()}`}
                                                            >
                                                                {r.status === "Present" ? "✅" : "❌"}{" "}
                                                                {r.status}
                                                            </span>
                                                        </td>
                                                        <td style={{ color: "var(--text-muted)", fontSize: 13 }}>
                                                            {new Date(r.created_at).toLocaleString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </>
                        )}

                        {!selectedEmployee && (
                            <EmptyState
                                icon="👆"
                                title="Select an employee"
                                message="Choose an employee from the dropdown above to view or mark their attendance."
                            />
                        )}
                    </>
                )}
            </div>

            {showMarkModal && (
                <MarkAttendanceModal
                    employee={selectedEmpData}
                    onClose={() => setShowMarkModal(false)}
                    onSubmit={handleMark}
                />
            )}

            {toast && (
                <Toast
                    type={toast.type}
                    message={toast.message}
                    onClose={() => setToast(null)}
                />
            )}
        </>
    );
}

/* ── Mark Attendance Modal ───────────────────────── */
function MarkAttendanceModal({ employee, onClose, onSubmit }) {
    const today = new Date().toISOString().split("T")[0];
    const [date, setDate] = useState(today);
    const [status, setStatus] = useState("Present");
    const [submitting, setSubmitting] = useState(false);
    const [apiError, setApiError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!date) return;
        setSubmitting(true);
        setApiError(null);
        try {
            await onSubmit({
                employee_id: employee.employee_id,
                date,
                status,
            });
        } catch (err) {
            setApiError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h3 className="modal-title">Mark Attendance</h3>
                <p
                    style={{
                        color: "var(--text-secondary)",
                        fontSize: 14,
                        marginBottom: 20,
                    }}
                >
                    Recording attendance for{" "}
                    <strong style={{ color: "var(--text-primary)" }}>
                        {employee.full_name}
                    </strong>{" "}
                    ({employee.employee_id})
                </p>

                {apiError && (
                    <div className="error-state" style={{ marginBottom: 20, padding: 14 }}>
                        <p style={{ margin: 0, fontSize: 13 }}>❌ {apiError}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Date</label>
                            <input
                                type="date"
                                className="form-input"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Status</label>
                            <select
                                className="form-select"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                            >
                                <option value="Present">✅ Present</option>
                                <option value="Absent">❌ Absent</option>
                            </select>
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={submitting}
                        >
                            {submitting ? "Saving..." : "Mark Attendance"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
