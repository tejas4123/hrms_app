import { useState, useEffect } from "react";
import TopBar from "../components/TopBar";
import { LoadingSpinner, EmptyState, ErrorState } from "../components/UIStates";
import Toast from "../components/Toast";
import { getEmployees, createEmployee, deleteEmployee } from "../api";

export default function Employees() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(null);
    const [toast, setToast] = useState(null);

    const fetchEmployees = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getEmployees();
            setEmployees(data.employees);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleAdd = async (formData) => {
        try {
            await createEmployee(formData);
            setShowAddModal(false);
            setToast({ type: "success", message: "Employee added successfully!" });
            fetchEmployees();
        } catch (err) {
            throw err; // let the modal handle it
        }
    };

    const handleDelete = async (empId) => {
        try {
            await deleteEmployee(empId);
            setShowDeleteModal(null);
            setToast({ type: "success", message: "Employee deleted successfully." });
            fetchEmployees();
        } catch (err) {
            setToast({ type: "error", message: err.message });
            setShowDeleteModal(null);
        }
    };

    return (
        <>
            <TopBar title="Employee Management">
                <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                    + Add Employee
                </button>
            </TopBar>

            <div className="page-container">
                {loading && <LoadingSpinner text="Loading employees..." />}
                {error && <ErrorState message={error} onRetry={fetchEmployees} />}

                {!loading && !error && employees.length === 0 && (
                    <EmptyState
                        icon="👤"
                        title="No employees yet"
                        message="Add your first employee to get started with the HRMS."
                    />
                )}

                {!loading && !error && employees.length > 0 && (
                    <div className="table-container">
                        <div className="table-header">
                            <h3>All Employees</h3>
                            <span className="table-header-badge">{employees.length} total</span>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Employee ID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Department</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.map((emp) => (
                                    <tr key={emp.employee_id}>
                                        <td>
                                            <span style={{ fontFamily: "monospace", fontSize: 13, color: "var(--accent-hover)" }}>
                                                {emp.employee_id}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="employee-name">{emp.full_name}</div>
                                        </td>
                                        <td>
                                            <span className="employee-email">{emp.email}</span>
                                        </td>
                                        <td>
                                            <span className="badge badge-dept">{emp.department}</span>
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => setShowDeleteModal(emp)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add Employee Modal */}
            {showAddModal && (
                <AddEmployeeModal
                    onClose={() => setShowAddModal(false)}
                    onSubmit={handleAdd}
                />
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <DeleteConfirmModal
                    employee={showDeleteModal}
                    onClose={() => setShowDeleteModal(null)}
                    onConfirm={() => handleDelete(showDeleteModal.employee_id)}
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

/* ── Add Employee Modal ──────────────────────────── */
function AddEmployeeModal({ onClose, onSubmit }) {
    const [form, setForm] = useState({
        employee_id: "",
        full_name: "",
        email: "",
        department: "",
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [apiError, setApiError] = useState(null);

    const validate = () => {
        const errs = {};
        if (!form.employee_id.trim()) errs.employee_id = "Employee ID is required";
        if (!form.full_name.trim()) errs.full_name = "Full name is required";
        if (!form.email.trim()) errs.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
            errs.email = "Invalid email format";
        if (!form.department.trim()) errs.department = "Department is required";
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        setErrors(errs);
        if (Object.keys(errs).length > 0) return;

        setSubmitting(true);
        setApiError(null);
        try {
            await onSubmit(form);
        } catch (err) {
            setApiError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const update = (field, val) =>
        setForm((prev) => ({ ...prev, [field]: val }));

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h3 className="modal-title">Add New Employee</h3>

                {apiError && (
                    <div className="error-state" style={{ marginBottom: 20, padding: 14 }}>
                        <p style={{ margin: 0, fontSize: 13 }}>❌ {apiError}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Employee ID</label>
                            <input
                                className={`form-input${errors.employee_id ? " error" : ""}`}
                                placeholder="e.g. EMP001"
                                value={form.employee_id}
                                onChange={(e) => update("employee_id", e.target.value)}
                            />
                            {errors.employee_id && (
                                <p className="form-error">{errors.employee_id}</p>
                            )}
                        </div>
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                className={`form-input${errors.full_name ? " error" : ""}`}
                                placeholder="e.g. John Doe"
                                value={form.full_name}
                                onChange={(e) => update("full_name", e.target.value)}
                            />
                            {errors.full_name && (
                                <p className="form-error">{errors.full_name}</p>
                            )}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                className={`form-input${errors.email ? " error" : ""}`}
                                placeholder="e.g. john@company.com"
                                type="email"
                                value={form.email}
                                onChange={(e) => update("email", e.target.value)}
                            />
                            {errors.email && <p className="form-error">{errors.email}</p>}
                        </div>
                        <div className="form-group">
                            <label>Department</label>
                            <input
                                className={`form-input${errors.department ? " error" : ""}`}
                                placeholder="e.g. Engineering"
                                value={form.department}
                                onChange={(e) => update("department", e.target.value)}
                            />
                            {errors.department && (
                                <p className="form-error">{errors.department}</p>
                            )}
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
                            {submitting ? "Adding..." : "Add Employee"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ── Delete Confirmation Modal ───────────────────── */
function DeleteConfirmModal({ employee, onClose, onConfirm }) {
    const [deleting, setDeleting] = useState(false);

    const handleConfirm = async () => {
        setDeleting(true);
        await onConfirm();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h3 className="modal-title">Confirm Deletion</h3>
                <p className="confirm-text">
                    Are you sure you want to delete{" "}
                    <span className="confirm-highlight">{employee.full_name}</span> (
                    {employee.employee_id})?
                </p>
                <p className="confirm-text" style={{ fontSize: 13, color: "var(--danger)" }}>
                    This will also remove all their attendance records.
                </p>
                <div className="modal-actions">
                    <button className="btn btn-secondary" onClick={onClose} disabled={deleting}>
                        Cancel
                    </button>
                    <button className="btn btn-danger" onClick={handleConfirm} disabled={deleting}>
                        {deleting ? "Deleting..." : "Delete Employee"}
                    </button>
                </div>
            </div>
        </div>
    );
}
